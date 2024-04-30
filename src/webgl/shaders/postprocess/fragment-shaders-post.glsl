  precision highp float;
  varying vec2 v_texCoord;
  uniform sampler2D u_texture;

  void main() {
    // Sample the texture at the given coordinates
    vec4 texColor = texture2D(u_texture, v_texCoord);
    // Convert the color to grayscale using luminance
    float gray = dot(texColor.rgb, vec3(0.2126, 0.7152, 0.0722));
    // Set the output color to grayscale
    gl_FragColor = vec4(gray, gray, gray, texColor.a);
  }
