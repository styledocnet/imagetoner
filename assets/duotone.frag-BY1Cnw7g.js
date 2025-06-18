const o=`
precision mediump float;
varying vec2 vUV;
uniform sampler2D u_image;
uniform vec3 u_color1;
uniform vec3 u_color2;
void main() {
  vec4 color = texture2D(u_image, vUV);
  float average = (color.r + color.g + color.b) / 3.0;
  gl_FragColor = vec4(mix(u_color1, u_color2, average), 1.0);
}
`;export{o as default};
