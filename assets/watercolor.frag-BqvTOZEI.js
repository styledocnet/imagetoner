const e=`
precision mediump float;

uniform sampler2D u_image;
uniform sampler2D u_paperTexture;
uniform vec2 u_resolution;
uniform float u_bleedRadius;
uniform float u_transparency;
uniform float u_paperIntensity;
uniform float u_colorSeparation;
uniform float u_edgePreservation;
uniform float u_wetness;
uniform float u_fade;

varying vec2 vUV;

// Noise function for organic bleeding effects
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

// Edge detection for preserving important details
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

// Watercolor bleeding effect
vec4 watercolorBleed(sampler2D tex, vec2 uv, vec2 resolution, float radius, float wetness) {
    vec2 texel = 1.0 / resolution;
    vec4 result = vec4(0.0);
    float totalWeight = 0.0;

    // Create organic bleeding pattern
    float bleedNoise = noise(uv * 50.0) * 0.5 + noise(uv * 100.0) * 0.3 + noise(uv * 200.0) * 0.2;
    float bleedRadius = radius * (0.5 + bleedNoise * wetness);

    // Sample in irregular pattern for organic look
    for (int angle = 0; angle < 16; angle++) {
        float angleRad = float(angle) * 0.39269908; // 2*PI/16

        for (int dist = 1; dist <= 4; dist++) {
            float dist_f = float(dist) * bleedRadius;

            // Add noise to sampling position for organic bleeding
            vec2 noiseOffset = vec2(
                noise(uv * 30.0 + float(angle)) - 0.5,
                noise(uv * 30.0 + float(angle) + 100.0) - 0.5
            ) * texel * wetness * 2.0;

            vec2 offset = vec2(cos(angleRad), sin(angleRad)) * dist_f * texel + noiseOffset;
            vec2 samplePos = uv + offset;

            if (samplePos.x >= 0.0 && samplePos.x <= 1.0 &&
                samplePos.y >= 0.0 && samplePos.y <= 1.0) {

                vec4 sampleColor = texture2D(tex, samplePos);

                // Weight based on distance and color similarity
                float weight = 1.0 / (1.0 + dist_f * dist_f);

                // Enhance bleeding for similar colors
                vec4 centerColor = texture2D(tex, uv);
                float colorSimilarity = 1.0 - length(sampleColor.rgb - centerColor.rgb);
                weight *= (0.5 + colorSimilarity * 0.5);

                result += sampleColor * weight;
                totalWeight += weight;
            }
        }
    }

    return totalWeight > 0.0 ? result / totalWeight : texture2D(tex, uv);
}

// Color separation effect (simulating different pigment behaviors)
vec3 separateColors(vec3 color, float separation) {
    // Separate into warm and cool components
    float warmth = dot(color, vec3(1.0, 0.5, 0.0));
    float coolness = dot(color, vec3(0.0, 0.5, 1.0));

    vec3 warm = color * vec3(1.2, 1.0, 0.8);
    vec3 cool = color * vec3(0.8, 1.0, 1.2);

    return mix(color, mix(warm, cool, warmth - coolness), separation);
}

// Paper texture application
vec3 applyPaperTexture(vec3 color, vec2 uv, float intensity) {
    // Use built-in paper texture or generate procedural one
    float paper = texture2D(u_paperTexture, uv * 4.0).r;

    // If no paper texture provided, generate procedural one
    if (paper == 0.0) {
        paper = noise(uv * 200.0) * 0.3 + noise(uv * 400.0) * 0.2 + noise(uv * 800.0) * 0.1;
        paper = 0.7 + paper * 0.3;
    }

    // Apply paper texture as multiply blend
    return color * mix(vec3(1.0), vec3(paper), intensity);
}

void main() {
    vec4 originalColor = texture2D(u_image, vUV);

    // Apply watercolor bleeding
    vec4 bledColor = watercolorBleed(u_image, vUV, u_resolution, u_bleedRadius, u_wetness);

    // Detect edges for preservation
    float edge = detectEdge(u_image, vUV, u_resolution);

    // Preserve edges by mixing less bleeding on edge areas
    vec4 watercolorBase = mix(bledColor, originalColor, edge * u_edgePreservation);

    // Apply color separation
    watercolorBase.rgb = separateColors(watercolorBase.rgb, u_colorSeparation);

    // Apply transparency effect (watercolors are often translucent)
    watercolorBase.rgb = mix(vec3(1.0), watercolorBase.rgb, 1.0 - u_transparency * 0.3);

    // Apply paper texture
    watercolorBase.rgb = applyPaperTexture(watercolorBase.rgb, vUV, u_paperIntensity);

    // Enhance saturation slightly for watercolor vibrancy
    vec3 gray = vec3(dot(watercolorBase.rgb, vec3(0.299, 0.587, 0.114)));
    watercolorBase.rgb = mix(gray, watercolorBase.rgb, 1.1);

    // Clamp values
    watercolorBase.rgb = clamp(watercolorBase.rgb, 0.0, 1.0);

    // Mix with original image based on fade parameter
    gl_FragColor = mix(originalColor, watercolorBase, u_fade);
}
`;export{e as default};
