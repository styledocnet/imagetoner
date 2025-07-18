export default `
precision mediump float;

uniform sampler2D u_image;
uniform float u_levels;
uniform float u_fade;

varying vec2 vUV;

void main() {
  vec4 color = texture2D(u_image, vUV);
  color.rgb = floor(color.rgb * u_levels) / u_levels;
  vec4 originalColor = texture2D(u_image, vUV);
  gl_FragColor = mix(originalColor, color, u_fade);
}
`;
