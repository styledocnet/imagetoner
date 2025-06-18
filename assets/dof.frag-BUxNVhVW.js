const e=`
precision mediump float;
varying vec2 vUV;
uniform sampler2D u_image;
uniform sampler2D u_depthMap; // Depth texture
uniform float u_focusDepth;  // Depth value in range [0,1] (what should be in focus)
uniform float u_threshold;  // How sharp/soft the transition is
uniform float u_blurRadius; // Blur intensity for out-of-focus areas

void main() {
    vec4 color = texture2D(u_image, vUV);
    float depth = texture2D(u_depthMap, vUV).r; // Sample depth texture

    float blurFactor = smoothstep(u_focusDepth - u_threshold, u_focusDepth + u_threshold, depth);
    float blurAmount = mix(u_blurRadius, 0.0, blurFactor); // Objects near the focus depth stay sharp

    vec3 blurredColor = vec3(0.0);
    for (float x = -2.0; x <= 2.0; x++) {
        for (float y = -2.0; y <= 2.0; y++) {
            vec2 offset = vec2(x, y) * blurAmount / 512.0; // Scale blur by texture size
            blurredColor += texture2D(u_image, vUV + offset).rgb;
        }
    }
    blurredColor /= 25.0; // Average blur samples

    gl_FragColor = vec4(mix(blurredColor, color.rgb, blurFactor), color.a);
}
`;export{e as default};
