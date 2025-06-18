const o=`
precision mediump float;

uniform sampler2D u_image;
uniform float u_strength;
uniform float u_sizeFactor;
uniform vec3 u_color;

varying vec2 vUV;

void main() {
  vec4 color = texture2D(u_image, vUV);
  float dist = distance(vUV, vec2(0.5, 0.5));
  float vignette = smoothstep(0.0, 1.0, dist * (u_strength + 0.1) / u_sizeFactor);
  color.rgb = mix(color.rgb, u_color, vignette);
  gl_FragColor = color;
}
`;export{o as default};
