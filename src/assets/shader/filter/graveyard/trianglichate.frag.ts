export default `
precision mediump float;

uniform sampler2D u_image;
uniform float u_points;  // Grid density
uniform float u_variation; // Random offset variation
uniform float u_cutoff;  // Color matching threshold

varying vec2 vUV;

float random(vec2 st) {
    return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 getAverageColor(vec2 uv, float gridSize) {
    vec3 color = vec3(0.0);
    float count = 0.0;

    for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
            vec2 sampleUV = uv + vec2(float(x), float(y)) / gridSize;
            color += texture2D(u_image, sampleUV).rgb;
            count += 1.0;
        }
    }
    return color / count;
}

vec3 matchColor(vec3 color, float cutoff) {
    float factor = cutoff / 255.0;
    return floor(color / factor + 0.5) * factor;
}

void main() {
    vec2 uv = vUV;
    float gridSize = 1.0 / u_points;  // Scale grid by points

    vec2 gridUV = floor(uv / gridSize) * gridSize;
    vec2 offset = vec2(0.5) * (1.0 - u_variation) + u_variation * vec2(random(gridUV), random(gridUV + 1.0));

    vec2 triangleUV = fract(uv / gridSize) - offset;

    if (triangleUV.x + triangleUV.y > 1.0) {
        triangleUV = 1.0 - triangleUV;
    }

    vec3 baseColor = texture2D(u_image, uv).rgb;
    vec3 averageColor = getAverageColor(uv, gridSize);
    vec3 matchedColor = matchColor(averageColor, u_cutoff);

    gl_FragColor = vec4(mix(baseColor, matchedColor, triangleUV.x + triangleUV.y), 1.0);
}
`;
