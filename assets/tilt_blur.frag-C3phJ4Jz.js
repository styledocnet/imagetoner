const o=`
precision mediump float;

uniform sampler2D u_image;
uniform float u_radius;
uniform float u_fade;

varying vec2 vUV;

void main() {
  vec4 color = vec4(0.0);
  for (float x = -4.0; x <= 4.0; x++) {
    for (float y = -4.0; y <= 4.0; y++) {
      float weight = exp(-(x*x + y*y) / (2.0 * u_radius * u_radius));
      color += texture2D(u_image, vUV + vec2(x, y) * u_radius) * weight;
    }
  }
  color /= (2.0 * 3.14159265 * u_radius * u_radius);
  vec4 originalColor = texture2D(u_image, vUV);
  gl_FragColor = mix(originalColor, color, u_fade);
}
`;export{o as default};
