attribute vec4 a_position;
// attribute vec4 a_color;
attribute vec3 a_normal;
attribute vec2 a_textureCoord;

// uniform mat4 u_matrix;
uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;
// uniform mat4 u_world;
uniform vec4 u_color;

varying vec4 v_color;
varying vec3 v_normal;
varying vec3 v_position;
varying vec2 v_textureCoord;

void main() {
  // Multiply the position by the matrix.
  gl_Position = u_worldViewProjection  * a_position;

  // Pass the color to the fragment shader.
  v_color = u_color;

  // Orient the normals and pass to the fragment shader
  v_normal = mat3(u_worldInverseTranspose) * a_normal;

  v_position = (u_worldViewProjection * a_position).xyz;

  // v_textureCoord = a_textureCoord;
}