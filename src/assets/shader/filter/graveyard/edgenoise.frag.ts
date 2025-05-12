// Boosted edge detection contrast (doubled Sobel output)
export default `
precision mediump float;

uniform sampler2D u_image;
uniform float u_points;     // Triangle density
uniform float u_variation;  // Random placement variation
uniform float u_cutoff;     // Color cutoff threshold

varying vec2 vUV;

float random(vec2 st) {
    return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
}

// Edge Detection (Sobel)
float edgeDetection(vec2 uv, float stepSize) {
    vec3 TL = texture2D(u_image, uv + vec2(-stepSize, -stepSize)).rgb;
    vec3 TC = texture2D(u_image, uv + vec2( 0.0,   -stepSize)).rgb;
    vec3 TR = texture2D(u_image, uv + vec2( stepSize, -stepSize)).rgb;
    vec3 ML = texture2D(u_image, uv + vec2(-stepSize,  0.0)).rgb;
    vec3 MC = texture2D(u_image, uv).rgb;
    vec3 MR = texture2D(u_image, uv + vec2( stepSize,  0.0)).rgb;
    vec3 BL = texture2D(u_image, uv + vec2(-stepSize,  stepSize)).rgb;
    vec3 BC = texture2D(u_image, uv + vec2( 0.0,   stepSize)).rgb;
    vec3 BR = texture2D(u_image, uv + vec2( stepSize,  stepSize)).rgb;

    float TLv = dot(TL, vec3(0.299, 0.587, 0.114));
    float TCv = dot(TC, vec3(0.299, 0.587, 0.114));
    float TRv = dot(TR, vec3(0.299, 0.587, 0.114));
    float MLv = dot(ML, vec3(0.299, 0.587, 0.114));
    float MCv = dot(MC, vec3(0.299, 0.587, 0.114));
    float MRv = dot(MR, vec3(0.299, 0.587, 0.114));
    float BLv = dot(BL, vec3(0.299, 0.587, 0.114));
    float BCv = dot(BC, vec3(0.299, 0.587, 0.114));
    float BRv = dot(BR, vec3(0.299, 0.587, 0.114));

    float edgeX = (-1.0 * TLv) + (0.0 * TCv) + (1.0 * TRv)
                + (-2.0 * MLv) + (0.0 * MCv) + (2.0 * MRv)
                + (-1.0 * BLv) + (0.0 * BCv) + (1.0 * BRv);

    float edgeY = (-1.0 * TLv) + (-2.0 * TCv) + (-1.0 * TRv)
                + ( 0.0 * MLv) + ( 0.0 * MCv) + ( 0.0 * MRv)
                + ( 1.0 * BLv) + ( 2.0 * BCv) + ( 1.0 * BRv);

    float edgeStrength = sqrt(edgeX * edgeX + edgeY * edgeY);
    return pow(edgeStrength, 2.0); // Boost contrast
}

// Adaptive Grid
float adaptiveGridSize(vec2 uv) {
    float edgeStrength = edgeDetection(uv, 1.0 / u_points);
    return mix(1.0 / u_points, 1.0 / (u_points * 3.0), edgeStrength);
}

// Color Matching
vec3 matchColor(vec3 color, float cutoff) {
    float factor = 1.0 / (u_cutoff + 1.0);
    return floor(color * factor + 0.5) / factor;
}

void main() {
    vec2 uv = vUV;
    float gridSize = adaptiveGridSize(uv);

    vec2 gridUV = floor(uv / gridSize) * gridSize;
    float randOffset = (random(gridUV) - 0.5) * u_variation * 2.0;
    vec2 offset = vec2(randOffset, randOffset);

    vec2 triangleUV = fract(uv / gridSize) - offset;
    if (triangleUV.x + triangleUV.y > 1.0) {
        triangleUV = 1.0 - triangleUV;
    }

    vec3 baseColor = texture2D(u_image, uv).rgb;
    vec3 matchedColor = matchColor(baseColor, u_cutoff);

    float blendFactor = smoothstep(0.2, 0.8, triangleUV.x + triangleUV.y);
    gl_FragColor = vec4(mix(baseColor, matchedColor, blendFactor), 1.0);
}
`;
