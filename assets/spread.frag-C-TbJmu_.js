const e=`
precision mediump float;

uniform sampler2D u_image;
uniform float u_distance;
uniform float u_fade;

varying vec2 vUV;

void main() {
  vec2 spreadUV = vUV + vec2(
    (fract(sin(dot(vUV.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * u_distance,
    (fract(sin(dot(vUV.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * u_distance
  );
  vec4 spreadColor = texture2D(u_image, spreadUV);
  vec4 originalColor = texture2D(u_image, vUV);
  gl_FragColor = mix(originalColor, spreadColor, u_fade);
}
`;export{e as default};
