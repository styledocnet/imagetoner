export default `
precision mediump float;
varying vec2 vUV;
uniform sampler2D u_image;
uniform bool u_flipX; // Flip along x-axis
uniform bool u_flipY; // Flip along y-axis
uniform float u_fade; // Controls the blending of the original and mirrored image

void main() {
    vec2 uv = vUV;
    if (u_flipX) {
        uv.x = 1.0 - uv.x;
    }
    if (u_flipY) {
        uv.y = 1.0 - uv.y;
    }
    vec4 originalColor = texture2D(u_image, vUV);
    vec4 mirrorColor = texture2D(u_image, uv);
    gl_FragColor = mix(originalColor, mirrorColor, u_fade); // Blend with original
}
`;
