const o=`
precision mediump float;

uniform sampler2D u_image;
uniform float u_threshold;
uniform float u_fade;

varying vec2 vUV;

void main() {
  vec4 color = texture2D(u_image, vUV);
  color.rgb = step(u_threshold, color.rgb) * (1.0 - color.rgb) + (1.0 - step(u_threshold, color.rgb)) * color.rgb;
  vec4 originalColor = texture2D(u_image, vUV);
  gl_FragColor = mix(originalColor, color, u_fade);
}
`;export{o as default};
