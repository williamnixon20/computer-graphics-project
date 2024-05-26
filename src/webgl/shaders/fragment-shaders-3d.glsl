precision mediump float;

// Passed in from the vertex shader.
varying vec4 v_color;
varying vec3 v_normal;
varying vec3 v_position;
varying vec2 v_texcoord;
varying mat3 v_tbn;
varying vec3 v_worldPosition;

uniform int mode;
uniform vec3 u_reverseLightDirection;
uniform int type;
uniform vec3 u_cameraPosition;

uniform float u_shininess;
uniform vec3 u_diffuseColor;
uniform vec3 u_specularColor;

uniform sampler2D u_texture;
uniform sampler2D u_specularMap;
uniform sampler2D u_normalMap;

uniform int material;
uniform int specularMap;
uniform int normalMap;

void main() {

     vec4 color = v_color;

     if (mode == 0) {
          gl_FragColor = color;

     } else {

          vec3 albedo = u_diffuseColor;
          vec3 normal = normalize(v_normal);
          vec3 lightDirection = normalize(u_reverseLightDirection);

          if (material != 0) {
               albedo = texture2D(u_texture, v_texcoord).rgb * u_diffuseColor;
               color = vec4(albedo, 1.0) * v_color;
          }

          if (normalMap != 0) {
               vec3 normalMap = texture2D(u_normalMap, v_texcoord).rgb;
               normalMap = normalize(normalMap * 2.0 - 1.0);
               vec3 normalTangentSpace = normalize(v_tbn * normalMap);
               normal = normalTangentSpace;
               lightDirection = normalize(v_tbn * lightDirection);
          }

          vec3 ambient = color.rgb;

          float diffuseStrength = max(dot(normal, lightDirection), 0.0);
          vec3 diffuse = albedo * diffuseStrength;

          vec3 viewDirection = normalize(u_cameraPosition - v_position);
          vec3 reflectionDirection = reflect(-lightDirection, normal);

          // if(type == 1){
          //      viewDirection = normalize(u_cameraPosition - v_worldPosition);
          //      reflectionDirection = reflect(lightDirection, normalize(v_worldNormal));
          // }

          float specularStrength = pow(max(dot(reflectionDirection, viewDirection), 0.0), u_shininess);

          if (specularMap != 0) {
              float specularMapColor = texture2D(u_specularMap, v_texcoord).r;
          //     float specularMapStrength = dot(specularMapColor, vec3(0.299, 0.587, 0.114));
              specularStrength *= specularMapColor;
          }

          vec3 specular = u_specularColor * specularStrength;

          vec3 finalColor = (ambient + diffuse + specular);

          gl_FragColor = vec4(finalColor, color.a);
     }
}