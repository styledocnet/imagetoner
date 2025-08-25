const e=`
precision mediump float;

uniform sampler2D u_image;
uniform sampler2D u_depthMap;
uniform vec2 u_resolution;
uniform float u_hexSize;
uniform float u_borderWidth;
uniform vec3 u_borderColor;
uniform bool u_useEdges;
uniform bool u_useDepth;
uniform bool u_usePalette;
uniform vec3 u_palette[8];
uniform int u_paletteSize;
uniform int u_fillMode; // 0: flat, 1: shaded, 2: blurred
uniform float u_depthIntensity;
uniform float u_fade;

varying vec2 vUV;

// Function to get the center of a hexagonal cell
vec2 hexCenter(vec2 uv, float size) {
    // Hexagonal grid constants
    vec2 s = vec2(1.0, 1.732050808); // 1, sqrt(3)

    // Scale the grid based on size
    vec2 scaledUV = uv / (size * 0.01); // Adjust scaling factor

    // Create hexagonal grid
    vec2 r = s * 0.5;
    vec2 a = mod(scaledUV, s) - r;
    vec2 b = mod(scaledUV - r, s) - r;

    vec2 gv = length(a) < length(b) ? a : b;
    vec2 center = scaledUV - gv;

    return center * size * 0.01;
}

// Function to get distorted hexagonal position based on depth
vec2 hexCenterWithDepth(vec2 uv, float size, float depth) {
    // Apply perspective distortion based on depth
    float distortion = 1.0 + depth * u_depthIntensity * 0.5;
    float adjustedSize = size * distortion;

    return hexCenter(uv * u_resolution, adjustedSize);
}

// Function to check if we're near the edge of a hexagon
float hexEdge(vec2 uv, float size) {
    // Hexagonal grid constants
    vec2 s = vec2(1.0, 1.732050808); // 1, sqrt(3)

    // Scale the grid based on size
    vec2 scaledUV = uv / (size * 0.01);

    // Create hexagonal grid
    vec2 r = s * 0.5;
    vec2 a = mod(scaledUV, s) - r;
    vec2 b = mod(scaledUV - r, s) - r;

    vec2 gv = length(a) < length(b) ? a : b;
    float d = length(gv);

    return 1.0 - smoothstep(0.35, 0.45, d);
}

// Edge detection using Sobel operator
float detectEdge(sampler2D tex, vec2 uv, vec2 resolution) {
    vec2 texel = 1.0 / resolution;

    float sobelX =
        texture2D(tex, uv + vec2(-texel.x, -texel.y)).r * -1.0 +
        texture2D(tex, uv + vec2(-texel.x, 0.0)).r * -2.0 +
        texture2D(tex, uv + vec2(-texel.x, texel.y)).r * -1.0 +
        texture2D(tex, uv + vec2(texel.x, -texel.y)).r * 1.0 +
        texture2D(tex, uv + vec2(texel.x, 0.0)).r * 2.0 +
        texture2D(tex, uv + vec2(texel.x, texel.y)).r * 1.0;

    float sobelY =
        texture2D(tex, uv + vec2(-texel.x, -texel.y)).r * -1.0 +
        texture2D(tex, uv + vec2(0.0, -texel.y)).r * -2.0 +
        texture2D(tex, uv + vec2(texel.x, -texel.y)).r * -1.0 +
        texture2D(tex, uv + vec2(-texel.x, texel.y)).r * 1.0 +
        texture2D(tex, uv + vec2(0.0, texel.y)).r * 2.0 +
        texture2D(tex, uv + vec2(texel.x, texel.y)).r * 1.0;

    return sqrt(sobelX * sobelX + sobelY * sobelY);
}

// Find closest color in palette
vec3 findClosestPaletteColor(vec3 color) {
    if (!u_usePalette || u_paletteSize == 0) return color;

    vec3 closest = u_palette[0];
    float minDist = length(color - closest);

    for (int i = 1; i < 8; i++) {
        if (i >= u_paletteSize) break;
        float dist = length(color - u_palette[i]);
        if (dist < minDist) {
            minDist = dist;
            closest = u_palette[i];
        }
    }

    return closest;
}

// Box blur for blurred fill mode
vec4 boxBlur(sampler2D tex, vec2 uv, vec2 resolution, float radius) {
    vec4 color = vec4(0.0);
    vec2 texel = 1.0 / resolution;
    int samples = 0;

    for (int x = -3; x <= 3; x++) {
        for (int y = -3; y <= 3; y++) {
            vec2 offset = vec2(float(x), float(y)) * texel * radius;
            color += texture2D(tex, uv + offset);
            samples++;
        }
    }

    return color / float(samples);
}

void main() {
    vec2 uv = vUV * u_resolution;

    // Get depth value if depth mapping is enabled
    float depth = 0.0;
    if (u_useDepth) {
        depth = texture2D(u_depthMap, vUV).r;
    }

    // Get hexagon center with or without depth distortion
    vec2 hexCenterPos;
    if (u_useDepth) {
        hexCenterPos = hexCenterWithDepth(vUV, u_hexSize, depth);
    } else {
        hexCenterPos = hexCenter(uv, u_hexSize);
    }

    vec2 hexCenterUV = hexCenterPos / u_resolution;

    // Ensure UV coordinates are within bounds
    hexCenterUV = clamp(hexCenterUV, 0.0, 1.0);

    // Sample color based on fill mode
    vec4 hexColor;
    if (u_fillMode == 0) {
        // Flat: Sample single color at center
        hexColor = texture2D(u_image, hexCenterUV);
    } else if (u_fillMode == 1) {
        // Shaded: Create gradient effect within hexagon
        vec2 hexOffset = (vUV - hexCenterUV) * 2.0;
        float gradientFactor = 1.0 - length(hexOffset) * 0.5;
        vec4 centerColor = texture2D(u_image, hexCenterUV);
        vec4 edgeColor = texture2D(u_image, vUV);
        hexColor = mix(edgeColor, centerColor, gradientFactor);
    } else {
        // Blurred: Apply blur effect
        float blurRadius = u_hexSize / u_resolution.x * 2.0;
        hexColor = boxBlur(u_image, hexCenterUV, u_resolution, blurRadius);
    }

    // Apply palette constraint if enabled
    if (u_usePalette) {
        hexColor.rgb = findClosestPaletteColor(hexColor.rgb);
    }

    // Apply depth-based lighting if depth is enabled
    if (u_useDepth) {
        float lighting = 0.7 + 0.3 * depth; // Closer objects are brighter
        hexColor.rgb *= lighting;
    }

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
        finalColor.rgb += edge * 0.3;
    }

    // Mix with original image based on fade parameter
    vec4 originalColor = texture2D(u_image, vUV);
    gl_FragColor = mix(originalColor, finalColor, u_fade);
}
`;export{e as default};
