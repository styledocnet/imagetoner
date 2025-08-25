export default `
precision mediump float;

uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform float u_hexSize;
uniform float u_borderWidth;
uniform vec3 u_borderColor;
uniform bool u_useEdges;
uniform float u_fade;

varying vec2 vUV;

// Function to convert from UV coordinates to hexagonal grid coordinates
vec2 hexGrid(vec2 uv, float size) {
    vec2 r = vec2(1.0, 1.732050808); // 1.0, sqrt(3)
    vec2 h = r * size;
    vec2 a = mod(uv, h) - h * 0.5;
    vec2 b = mod(uv - h * 0.5, h) - h * 0.5;
    vec2 gv = length(a) < length(b) ? a : b;

    float x = atan(gv.x, gv.y);
    float y = 0.5 - length(gv);
    vec2 id = uv - gv;

    return id;
}

// Function to get the center of a hexagonal cell
vec2 hexCenter(vec2 uv, float size) {
    vec2 r = vec2(1.0, 1.732050808);
    vec2 h = r * size;
    vec2 a = mod(uv, h) - h * 0.5;
    vec2 b = mod(uv - h * 0.5, h) - h * 0.5;
    vec2 gv = length(a) < length(b) ? a : b;
    return uv - gv;
}

// Function to check if we're near the edge of a hexagon
float hexEdge(vec2 uv, float size) {
    vec2 r = vec2(1.0, 1.732050808);
    vec2 h = r * size;
    vec2 a = mod(uv, h) - h * 0.5;
    vec2 b = mod(uv - h * 0.5, h) - h * 0.5;
    vec2 gv = length(a) < length(b) ? a : b;

    float d = length(gv);
    return 1.0 - smoothstep(size * 0.4, size * 0.5, d);
}

// Simple edge detection using Sobel operator
float detectEdge(sampler2D tex, vec2 uv, vec2 resolution) {
    vec2 texel = 1.0 / resolution;

    // Sobel X
    float sobelX =
        texture2D(tex, uv + vec2(-texel.x, -texel.y)).r * -1.0 +
        texture2D(tex, uv + vec2(-texel.x, 0.0)).r * -2.0 +
        texture2D(tex, uv + vec2(-texel.x, texel.y)).r * -1.0 +
        texture2D(tex, uv + vec2(texel.x, -texel.y)).r * 1.0 +
        texture2D(tex, uv + vec2(texel.x, 0.0)).r * 2.0 +
        texture2D(tex, uv + vec2(texel.x, texel.y)).r * 1.0;

    // Sobel Y
    float sobelY =
        texture2D(tex, uv + vec2(-texel.x, -texel.y)).r * -1.0 +
        texture2D(tex, uv + vec2(0.0, -texel.y)).r * -2.0 +
        texture2D(tex, uv + vec2(texel.x, -texel.y)).r * -1.0 +
        texture2D(tex, uv + vec2(-texel.x, texel.y)).r * 1.0 +
        texture2D(tex, uv + vec2(0.0, texel.y)).r * 2.0 +
        texture2D(tex, uv + vec2(texel.x, texel.y)).r * 1.0;

    return sqrt(sobelX * sobelX + sobelY * sobelY);
}

void main() {
    vec2 uv = vUV * u_resolution;

    // Get hexagon center for current pixel
    vec2 hexCenterPos = hexCenter(uv, u_hexSize);
    vec2 hexCenterUV = hexCenterPos / u_resolution;

    // Sample color at hexagon center
    vec4 hexColor = texture2D(u_image, hexCenterUV);

    // Calculate distance from hexagon edge for border effect
    float edgeFactor = hexEdge(uv, u_hexSize);

    // Apply border if enabled
    vec4 finalColor = hexColor;
    if (u_borderWidth > 0.0) {
        float borderMask = smoothstep(0.0, u_borderWidth, edgeFactor);
        finalColor = mix(vec4(u_borderColor, 1.0), hexColor, borderMask);
    }

    // Apply edge enhancement if enabled
    if (u_useEdges) {
        float edge = detectEdge(u_image, hexCenterUV, u_resolution);
        finalColor.rgb += edge * 0.5;
    }

    // Mix with original image based on fade parameter
    vec4 originalColor = texture2D(u_image, vUV);
    gl_FragColor = mix(originalColor, finalColor, u_fade);
}
`;
