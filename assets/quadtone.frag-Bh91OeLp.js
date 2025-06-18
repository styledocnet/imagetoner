const o=`
precision mediump float;

uniform sampler2D u_image;
uniform vec3 u_shadowColor;
uniform vec3 u_midShadowColor;
uniform vec3 u_midHighlightColor;
uniform vec3 u_highColor;
uniform float u_fade;

varying vec2 vUV;

void main() {
  vec4 color = texture2D(u_image, vUV);
  float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  vec3 quadtoneColor = mix(u_shadowColor, u_midShadowColor, smoothstep(0.0, 0.33, luminance));
  quadtoneColor = mix(quadtoneColor, u_midHighlightColor, smoothstep(0.33, 0.66, luminance));
  quadtoneColor = mix(quadtoneColor, u_highColor, smoothstep(0.66, 1.0, luminance));
  vec4 finalColor = vec4(quadtoneColor, color.a);
  gl_FragColor = mix(color, finalColor, u_fade);
}
`;export{o as default};
