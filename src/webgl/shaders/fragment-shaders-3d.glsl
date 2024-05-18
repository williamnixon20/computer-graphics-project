precision mediump float;

// Passed in from the vertex shader.
varying vec4 v_color;
varying vec3 v_normal;
varying vec3 v_position;
varying vec2 v_texcoord;

uniform int mode;
uniform vec3 u_reverseLightDirection;

uniform float u_shininess;
uniform vec3 u_diffuseColor;
uniform vec3 u_specularColor;

uniform sampler2D u_texture;
uniform sampler2D u_specularMap;
uniform sampler2D u_displacementMap;
uniform sampler2D u_normalMap;

uniform int material;
uniform int specularMap;
uniform int displacementMap;
uniform int normalMap;

void main() {

     vec4 color = v_color;
     vec3 albedo = u_diffuseColor;

     if (material == 1) {
          albedo = texture2D(u_texture, v_texcoord).rgb * u_diffuseColor;
          color = vec4(albedo, 1.0) * v_color;
     }

     if (mode == 0) {
          gl_FragColor = color;

     } else {
          vec3 normal = normalize(v_normal);
          vec3 lightDirection = normalize(u_reverseLightDirection);

          vec3 ambient = color.rgb;

          float diffuseStrength = max(dot(normal, lightDirection), 0.0);
          vec3 diffuse = albedo * diffuseStrength;

          vec3 viewDirection = normalize(-v_position);
          vec3 reflectionDirection = reflect(-lightDirection, normal);
          float specularStrength = pow(max(dot(reflectionDirection, viewDirection), 0.0), u_shininess);

          if (specularMap == 1) {
              float specularMapColor = texture2D(u_specularMap, v_texcoord).r;
          //     float specularMapStrength = dot(specularMapColor, vec3(0.299, 0.587, 0.114));
              specularStrength *= specularMapColor;
          }

          vec3 specular = u_specularColor * specularStrength;

          vec3 finalColor = (ambient + diffuse + specular);

          gl_FragColor = vec4(finalColor, color.a);
     }
}