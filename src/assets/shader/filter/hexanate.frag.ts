export default `
precision mediump float;

uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform float u_points;
uniform float u_mutations;
uniform float u_variation;
uniform float u_population;
uniform float u_cutoff;
uniform float u_block;

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

// Noise function for variation
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Color quantization based on cutoff parameter
vec3 quantizeColor(vec3 color, float levels) {
    return floor(color * levels) / levels;
}

void main() {
    vec4 originalColor = texture2D(u_image, vUV);

    // Calculate hexagon size based on points parameter
    float hexSize = mix(20.0, 80.0, u_points / 1000.0);

    // Convert screen coordinates to hexagon grid
    vec2 uv = vUV * u_resolution;
    vec2 hexCenterPos = hexCenter(uv, hexSize);
    vec2 hexCenterUV = hexCenterPos / u_resolution;

    // Clamp UV coordinates to valid range
    hexCenterUV = clamp(hexCenterUV, 0.0, 1.0);

    // Sample color at hexagon center
    vec4 hexColor = texture2D(u_image, hexCenterUV);

    // Apply variation using noise
    if (u_variation > 0.0) {
        vec2 noiseCoord = hexCenterPos * 0.01;
        vec2 offset = vec2(
            noise(noiseCoord) - 0.5,
            noise(noiseCoord + vec2(100.0)) - 0.5
        ) * u_variation * 0.02;

        vec2 variedUV = clamp(hexCenterUV + offset, 0.0, 1.0);
        hexColor = texture2D(u_image, variedUV);
    }

    // Apply mutations (color shifts)
    if (u_mutations > 0.0) {
        vec2 mutationSeed = hexCenterPos * 0.001;
        float mutationAmount = u_mutations * 0.1;

        // Randomly shift colors
        hexColor.r += (noise(mutationSeed) - 0.5) * mutationAmount;
        hexColor.g += (noise(mutationSeed + vec2(50.0)) - 0.5) * mutationAmount;
        hexColor.b += (noise(mutationSeed + vec2(100.0)) - 0.5) * mutationAmount;
    }

    // Apply population density effect (affects hexagon size variation)
    if (u_population != 400.0) { // 400 is default
        float populationFactor = u_population / 400.0;
        float sizeVariation = noise(hexCenterPos * 0.005) * (2.0 - populationFactor);
        float adjustedSize = hexSize * (1.0 + sizeVariation * 0.3);

        vec2 adjustedCenter = hexCenter(uv, adjustedSize);
        vec2 adjustedCenterUV = clamp(adjustedCenter / u_resolution, 0.0, 1.0);
        hexColor = mix(hexColor, texture2D(u_image, adjustedCenterUV), 0.3);
    }

    // Apply color quantization based on cutoff
    if (u_cutoff > 1.0) {
        hexColor.rgb = quantizeColor(hexColor.rgb, u_cutoff);
    }

    // Apply block effect (creates more angular, geometric look)
    if (u_block > 1.0) {
        vec2 blockCoord = floor(hexCenterUV * u_resolution / u_block) * u_block;
        vec2 blockUV = blockCoord / u_resolution;
        blockUV = clamp(blockUV, 0.0, 1.0);

        vec4 blockColor = texture2D(u_image, blockUV);
        hexColor = mix(hexColor, blockColor, 0.4);
    }

    // Ensure alpha is preserved
    hexColor.a = originalColor.a;

    // Output the final hexagonated color
    gl_FragColor = hexColor;
}
`;
