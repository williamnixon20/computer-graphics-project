attribute vec4 a_position;
attribute vec4 a_color;

uniform mat4 u_matrix;
uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;

varying vec4 v_color;

void main() {
  // Multiply the position by the matrix.
  gl_Position = u_matrix * a_position;

  // Pass the color to the fragment shader.
  v_color = a_color;

  // Orient the normals and pass to the fragment shader
  // v_normal = mat3(u_worldInverseTranspose) * a_normal;
}