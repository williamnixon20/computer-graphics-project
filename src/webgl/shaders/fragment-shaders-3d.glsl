precision mediump float;

// Passed in from the vertex shader.
varying vec4 v_color;
varying vec3 v_normal;

// uniform vec4 u_colorMult;
// uniform vec4 u_colorOffset;

uniform vec3 u_reverseLightDirection;
uniform vec4 u_color;

void main() {
   // vec3 normal = normalize(v_normal);

   // float light = dot(normal, u_reverseLightDirection);

   gl_FragColor = v_color;

   // gl_FragColor.rgb *= light;
}