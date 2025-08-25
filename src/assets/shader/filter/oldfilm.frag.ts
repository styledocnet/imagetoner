export default `
precision mediump float;

uniform sampler2D u_image;
uniform sampler2D u_noiseTexture;
uniform vec2 u_resolution;
uniform float u_sepiaIntensity;
uniform float u_noiseIntensity;
uniform float u_scratchIntensity;
uniform float u_vignetteStrength;
uniform float u_flickerAmount;
uniform float u_grainSize;
uniform float u_dustIntensity;
uniform float u_time;
uniform float u_fade;

varying vec2 vUV;

// Noise function for film grain and effects
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

// Sepia tone conversion
vec3 sepia(vec3 color, float intensity) {
    vec3 sepiaColor = vec3(
        dot(color, vec3(0.393, 0.769, 0.189)),
        dot(color, vec3(0.349, 0.686, 0.168)),
        dot(color, vec3(0.272, 0.534, 0.131))
    );

    // Classic sepia tint
    sepiaColor *= vec3(1.2, 1.0, 0.8);

    return mix(color, sepiaColor, intensity);
}

// Vignette effect
float vignette(vec2 uv, float strength) {
    vec2 center = vec2(0.5, 0.5);
    float dist = distance(uv, center);
    return 1.0 - smoothstep(0.0, 0.8, dist * strength);
}

// Film scratches
float scratches(vec2 uv, float time, float intensity) {
    float scratch = 0.0;

    // Vertical scratches
    for (int i = 0; i < 5; i++) {
        float x = float(i) * 0.2 + time * 0.1;
        float scratchPos = fract(x);
        float scratchWidth = 0.001 + noise(vec2(x * 10.0, 0.0)) * 0.002;

        if (abs(uv.x - scratchPos) < scratchWidth) {
            scratch += (1.0 - abs(uv.x - scratchPos) / scratchWidth) * intensity;
        }
    }

    // Random horizontal scratches
    float horizontalScratch = step(0.98, noise(vec2(uv.y * 100.0, time * 0.5)));
    scratch += horizontalScratch * intensity * 0.5;

    return scratch;
}

// Dust and particles
float dust(vec2 uv, float time, float intensity) {
    vec2 dustCoord = uv * 20.0 + time * 0.1;
    float dustNoise = noise(dustCoord) * noise(dustCoord * 2.0);

    // Create dust spots
    float dustSpots = step(0.95, dustNoise) * intensity;

    // Add moving dust particles
    vec2 particleCoord = uv * 15.0 + vec2(time * 0.05, time * 0.02);
    float particles = step(0.97, noise(particleCoord)) * intensity * 0.5;

    return dustSpots + particles;
}

// Flickering effect
float flicker(float time, float amount) {
    float flick = sin(time * 60.0) * 0.1 + sin(time * 13.0) * 0.05 + sin(time * 7.0) * 0.02;
    return 1.0 + flick * amount;
}

// Film grain
float filmGrain(vec2 uv, float time, float grainSize, float intensity) {
    vec2 grainCoord = uv * vec2(u_resolution.x / grainSize, u_resolution.y / grainSize);
    grainCoord += time * 0.1; // Animate grain

    float grain = noise(grainCoord) - 0.5;
    return grain * intensity;
}

// Color adjustment for old film look
vec3 adjustOldFilmColor(vec3 color) {
    // Reduce color saturation
    vec3 gray = vec3(dot(color, vec3(0.299, 0.587, 0.114)));
    color = mix(gray, color, 0.7);

    // Adjust contrast (slightly faded look)
    color = (color - 0.5) * 0.9 + 0.5;

    // Add slight yellow/brown tint
    color *= vec3(1.1, 1.05, 0.95);

    return color;
}

// Simulate light leaks
float lightLeak(vec2 uv, float time) {
    vec2 center = vec2(0.7, 0.3);
    float dist = distance(uv, center);
    float leak = exp(-dist * 3.0) * (sin(time * 0.5) * 0.5 + 0.5);

    // Additional corner leak
    vec2 corner = vec2(0.1, 0.9);
    float cornerDist = distance(uv, corner);
    leak += exp(-cornerDist * 5.0) * (sin(time * 0.7 + 1.0) * 0.3 + 0.3);

    return leak * 0.2;
}

void main() {
    vec4 originalColor = texture2D(u_image, vUV);
    vec3 color = originalColor.rgb;

    // Apply old film color adjustments
    color = adjustOldFilmColor(color);

    // Apply sepia tone
    color = sepia(color, u_sepiaIntensity);

    // Add film grain
    float grain = filmGrain(vUV, u_time, u_grainSize, u_noiseIntensity);
    color += grain;

    // Add scratches
    float scratchEffect = scratches(vUV, u_time, u_scratchIntensity);
    color = mix(color, vec3(1.0), scratchEffect);

    // Add dust and particles
    float dustEffect = dust(vUV, u_time, u_dustIntensity);
    color = mix(color, vec3(0.8), dustEffect);

    // Apply vignette
    float vignetteEffect = vignette(vUV, u_vignetteStrength);
    color *= vignetteEffect;

    // Add light leaks
    float leak = lightLeak(vUV, u_time);
    color += vec3(leak * 0.8, leak * 0.6, leak * 0.4);

    // Apply flickering
    float flickerEffect = flicker(u_time, u_flickerAmount);
    color *= flickerEffect;

    // Clamp values to prevent over-exposure
    color = clamp(color, 0.0, 1.0);

    // Mix with original image based on fade parameter
    vec4 oldFilmColor = vec4(color, originalColor.a);
    gl_FragColor = mix(originalColor, oldFilmColor, u_fade);
}
`;
