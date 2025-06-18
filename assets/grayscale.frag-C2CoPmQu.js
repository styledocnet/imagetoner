const o=`
precision mediump float;

uniform sampler2D u_image;
uniform float u_intensity; // Controls effect strength (0 = no change, 1 = full grayscale)

varying vec2 vUV;

void main() {
    vec4 color = texture2D(u_image, vUV);
    float luminance = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722)); // More accurate grayscale
    vec3 grayColor = vec3(luminance);
    vec3 finalColor = mix(color.rgb, grayColor, u_intensity); // Blend with original
    gl_FragColor = vec4(finalColor, color.a);
}
`;export{o as default};
