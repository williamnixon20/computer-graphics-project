precision mediump float;

// Passed in from the vertex shader.
varying vec4 v_color;
varying vec3 v_normal;
varying vec3 v_position;
varying vec2 v_texcoord;

// uniform vec4 u_colorMult;
// uniform vec4 u_colorOffset;

uniform int mode;
uniform vec3 u_reverseLightDirection;

uniform float u_shininess;
uniform vec3 u_diffuseColor;
uniform vec3 u_specularColor;

uniform sampler2D u_texture;

void main() {
     if (mode == 0) {

          gl_FragColor = v_color;

     } else if (mode == 1) {

          gl_FragColor = texture2D(u_texture, v_texcoord);      

     } else {
          vec3 normal = normalize(v_normal);
          vec3 lightDirection = normalize(u_reverseLightDirection);

          vec3 ambient = v_color.rgb;

          float diffuseStrength = max(dot(normal, lightDirection), 0.0);
          vec3 diffuse = u_diffuseColor * diffuseStrength;

          vec3 viewDirection = normalize(-v_position);
          vec3 reflectionDirection = reflect(-lightDirection, normal);
          float specularStrength = pow(max(dot(reflectionDirection, viewDirection), 0.0), u_shininess);
          vec3 specular = u_specularColor * specularStrength;

          vec3 finalColor = (ambient + diffuse + specular);

          gl_FragColor = vec4(finalColor, v_color.a);
     }
}