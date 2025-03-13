export default `
precision mediump float;

uniform sampler2D u_image;
uniform float u_radius;
uniform float u_fade;

varying vec2 vUV;

void main() {
  vec4 color = vec4(0.0);
  for (float x = -4.0; x <= 4.0; x++) {
    for (float y = -4.0; y <= 4.0; y++) {
      color += texture2D(u_image, vUV + vec2(x, y) * u_radius) / 81.0;
    }
  }
  vec4 originalColor = texture2D(u_image, vUV);
  gl_FragColor = mix(originalColor, color, u_fade);
}
`;
