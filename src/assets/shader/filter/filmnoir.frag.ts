export default `
precision mediump float;

uniform sampler2D u_image;
uniform sampler2D u_noiseTexture;
uniform vec2 u_resolution;
uniform float u_contrast;
uniform float u_brightness;
uniform float u_noiseIntensity;
uniform float u_vignetteStrength;
uniform float u_grainSize;
uniform float u_fade;

varying vec2 vUV;

// Noise function for film grain
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

// Desaturation function
vec3 desaturate(vec3 color, float amount) {
    vec3 gray = vec3(dot(color, vec3(0.299, 0.587, 0.114)));
    return mix(color, gray, amount);
}

// Vignette effect
float vignette(vec2 uv, float strength) {
    vec2 center = vec2(0.5, 0.5);
    float dist = distance(uv, center);
    return 1.0 - smoothstep(0.0, 0.7, dist * strength);
}

// Contrast adjustment
vec3 adjustContrast(vec3 color, float contrast) {
    return (color - 0.5) * contrast + 0.5;
}

void main() {
    vec4 originalColor = texture2D(u_image, vUV);
    vec3 color = originalColor.rgb;

    // Desaturate to black and white with slight warm tint
    color = desaturate(color, 0.9);

    // Add slight sepia warmth typical of film noir
    color *= vec3(1.1, 1.05, 0.9);

    // Apply contrast boost for dramatic effect
    color = adjustContrast(color, u_contrast);

    // Apply brightness adjustment
    color += u_brightness - 0.5;

    // Add film grain noise
    vec2 noiseCoord = vUV * u_resolution / u_grainSize;
    float grain = noise(noiseCoord) * u_noiseIntensity;
    color += grain * 0.1 - 0.05;

    // Apply vignette for dramatic lighting
    float vignetteEffect = vignette(vUV, u_vignetteStrength);
    color *= vignetteEffect;

    // Clamp values
    color = clamp(color, 0.0, 1.0);

    // Mix with original image based on fade parameter
    vec4 filmNoirColor = vec4(color, originalColor.a);
    gl_FragColor = mix(originalColor, filmNoirColor, u_fade);
}
`;
