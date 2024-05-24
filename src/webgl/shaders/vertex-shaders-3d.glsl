attribute vec4 a_position;
// attribute vec4 a_color;
attribute vec3 a_normal;
attribute vec2 a_texcoord;
attribute vec3 a_tangent;
attribute vec3 a_bitangent;

uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;
uniform vec4 u_color;

uniform sampler2D u_displacementMap;
uniform float u_displacementScale;
uniform float u_displacementBias;
uniform int displacementMap;

varying vec4 v_color;
varying vec3 v_normal;
varying vec3 v_position;
varying vec2 v_texcoord;
varying mat3 v_tbn;

mat3 transposeMat3(mat3 mat) {
    return mat3(
        vec3(mat[0][0], mat[1][0], mat[2][0]),
        vec3(mat[0][1], mat[1][1], mat[2][1]),
        vec3(mat[0][2], mat[1][2], mat[2][2])
    );
}

void main() {

  vec4 position = a_position;

  if (displacementMap != 0){
    float displacement = texture2D(u_displacementMap, a_texcoord).r;

    position = a_position + vec4(a_normal * (displacement * u_displacementScale + u_displacementBias), 0.0);
  } 

  // Multiply the position by the matrix.
  gl_Position = u_worldViewProjection * position;

  // Pass the color to the fragment shader.
  v_color = u_color;

  // Orient the normals and pass to the fragment shader
  v_normal = mat3(u_worldInverseTranspose) * a_normal;

  v_position = (u_worldViewProjection * position).xyz;

  v_texcoord = a_texcoord;

  // Calculate the TBN matrix
  vec3 T = normalize(mat3(u_worldInverseTranspose) * a_tangent);
  vec3 B = normalize(mat3(u_worldInverseTranspose) * a_bitangent);
  vec3 N = normalize(mat3(u_worldInverseTranspose) * a_normal);
  v_tbn = transposeMat3(mat3(T, B, N));
}