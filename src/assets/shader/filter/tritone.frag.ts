export default `
precision mediump float;

uniform sampler2D u_image;
uniform vec3 u_shadowColor;
uniform vec3 u_midColor;
uniform vec3 u_highColor;
uniform float u_fade;

varying vec2 vUV;

void main() {
  vec4 color = texture2D(u_image, vUV);
  float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  vec3 tritoneColor = mix(u_shadowColor, u_midColor, smoothstep(0.0, 0.5, luminance));
  tritoneColor = mix(tritoneColor, u_highColor, smoothstep(0.5, 1.0, luminance));
  vec4 finalColor = vec4(tritoneColor, color.a);
  gl_FragColor = mix(color, finalColor, u_fade);
}
`;
