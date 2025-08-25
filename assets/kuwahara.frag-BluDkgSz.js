const e=`
precision mediump float;

uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform float u_radius;
uniform float u_kernelSize;
uniform float u_sharpness;
uniform float u_fade;

varying vec2 vUV;

// Kuwahara filter creates a painterly effect by analyzing local regions
// and choosing the region with minimum variance (most uniform color)
void main() {
    vec2 texel = 1.0 / u_resolution;
    vec4 originalColor = texture2D(u_image, vUV);

    // Define the four quadrants around the current pixel
    float radius = u_radius;
    int kernelSize = int(max(1.0, u_kernelSize));

    // Initialize variables for the four regions
    vec3 mean[4];
    vec3 variance[4];
    float minVariance = 1000000.0;
    int selectedRegion = 0;

    // Calculate mean and variance for each quadrant
    for (int region = 0; region < 4; region++) {
        vec3 sum = vec3(0.0);
        vec3 sumSquares = vec3(0.0);
        float count = 0.0;

        // Define offset direction for each quadrant
        vec2 regionOffset = vec2(0.0);
        if (region == 0) regionOffset = vec2(-1.0, -1.0); // Top-left
        else if (region == 1) regionOffset = vec2(1.0, -1.0);  // Top-right
        else if (region == 2) regionOffset = vec2(-1.0, 1.0);  // Bottom-left
        else regionOffset = vec2(1.0, 1.0);   // Bottom-right

        // Sample pixels in the current quadrant
        for (int x = 0; x < 8; x++) {
            if (x >= kernelSize) break;
            for (int y = 0; y < 8; y++) {
                if (y >= kernelSize) break;

                vec2 offset = regionOffset * vec2(float(x), float(y)) * texel * radius;
                vec2 samplePos = vUV + offset;

                // Ensure we're within texture bounds
                if (samplePos.x >= 0.0 && samplePos.x <= 1.0 &&
                    samplePos.y >= 0.0 && samplePos.y <= 1.0) {

                    vec3 sampleColor = texture2D(u_image, samplePos).rgb;
                    sum += sampleColor;
                    sumSquares += sampleColor * sampleColor;
                    count += 1.0;
                }
            }
        }

        if (count > 0.0) {
            // Calculate mean
            mean[region] = sum / count;

            // Calculate variance (σ² = E[X²] - E[X]²)
            vec3 meanSquared = mean[region] * mean[region];
            variance[region] = (sumSquares / count) - meanSquared;

            // Use luminance-weighted variance for comparison
            float totalVariance = dot(variance[region], vec3(0.299, 0.587, 0.114));

            // Select region with minimum variance
            if (totalVariance < minVariance) {
                minVariance = totalVariance;
                selectedRegion = region;
            }
        }
    }

    // Use the color from the region with minimum variance
    vec3 kuwaharaColor = mean[selectedRegion];

    // Apply sharpness enhancement
    vec3 diff = kuwaharaColor - originalColor.rgb;
    kuwaharaColor = originalColor.rgb + diff * u_sharpness;

    // Enhance the painterly effect by slightly increasing saturation
    vec3 gray = vec3(dot(kuwaharaColor, vec3(0.299, 0.587, 0.114)));
    kuwaharaColor = mix(gray, kuwaharaColor, 1.2);

    // Clamp values
    kuwaharaColor = clamp(kuwaharaColor, 0.0, 1.0);

    // Mix with original image based on fade parameter
    vec4 finalColor = vec4(kuwaharaColor, originalColor.a);
    gl_FragColor = mix(originalColor, finalColor, u_fade);
}
`;export{e as default};
