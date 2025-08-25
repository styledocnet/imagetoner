export const shaderAllowList = [
  "duotone",
  "vignette",
  "spread",
  "quantize",
  "mirror",
  "solarize",
  "posterize",
  "blur",
  "tilt_blur",
  "grayscale",
  "tritone",
  "quadtone",
  "dof",
  "triangulate",
  "hexanate",
  "hexanate_depth",
  "hexanate_flat",
  "polygonate",
  "oldfilm",
  "watercolor",
  "kuwahara",
  "filmnoir",
];

export const initGL = (gl: WebGLRenderingContext) => {
  const vertexShaderSource = `
    attribute vec2 position;
    varying vec2 vUV;
    void main() {
      vUV = position * 0.5 + 0.5;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);

  return vertexShader;
};

export const loadShaderSource = async (shaderName: string): Promise<string> => {
  if (!shaderAllowList.includes(shaderName)) {
    throw new Error(`Shader ${shaderName} is not allowed`);
  }

  const shaderModule = await import(`../assets/shader/filter/${shaderName}.frag.ts`);
  return shaderModule.default;
};

export const applyShaderFilter = async (gl: WebGLRenderingContext, image: HTMLImageElement, shaderName: string, params: any) => {
  const strippedShaderName = shaderName.replace(/^shader_/, "");

  // Load the fragment shader source dynamically
  const shaderSource = await loadShaderSource(strippedShaderName);

  // Create and compile a vertex shader
  const vertexShaderSource = `
    attribute vec2 position;
    varying vec2 vUV;
    void main() {
      vUV = position * 0.5 + 0.5;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;
  const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);

  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error("Vertex shader compilation failed:", gl.getShaderInfoLog(vertexShader));
    return;
  }

  // Create and compile the fragment shader
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
  gl.shaderSource(fragmentShader, shaderSource);
  gl.compileShader(fragmentShader);

  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error("Fragment shader compilation failed:", gl.getShaderInfoLog(fragmentShader));
    return;
  }

  // Create and link the program
  const program = gl.createProgram()!;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Shader program linking failed:", gl.getProgramInfoLog(program));
    return;
  }

  gl.useProgram(program);

  // Set up the position buffer
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]); // Full screen quad
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  // Create and bind the texture
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // Flip the image vertically
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  // Set standard uniforms
  const imageLocation = gl.getUniformLocation(program, "u_image");
  if (imageLocation !== null) {
    gl.uniform1i(imageLocation, 0); // Use texture unit 0
  }

  const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  if (resolutionLocation !== null) {
    gl.uniform2f(resolutionLocation, image.width, image.height);
  }

  // Create paper texture for watercolor shader
  if (strippedShaderName === "watercolor") {
    const paperTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, paperTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Generate procedural paper texture
    const paperSize = 256;
    const paperData = new Uint8Array(paperSize * paperSize * 4);

    for (let y = 0; y < paperSize; y++) {
      for (let x = 0; x < paperSize; x++) {
        const i = (y * paperSize + x) * 4;

        // Generate paper-like noise
        const noise1 = Math.sin(x * 0.02) * Math.sin(y * 0.03) * 0.3;
        const noise2 = Math.sin(x * 0.05) * Math.sin(y * 0.04) * 0.2;
        const noise3 = Math.sin(x * 0.1) * Math.sin(y * 0.11) * 0.1;
        const paper = 0.9 + noise1 + noise2 + noise3;

        const value = Math.floor(Math.max(0, Math.min(255, paper * 255)));
        paperData[i] = value; // R
        paperData[i + 1] = value; // G
        paperData[i + 2] = value; // B
        paperData[i + 3] = 255; // A
      }
    }

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, paperSize, paperSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, paperData);

    const paperTextureLocation = gl.getUniformLocation(program, "u_paperTexture");
    if (paperTextureLocation !== null) {
      gl.uniform1i(paperTextureLocation, 1); // Use texture unit 1
    }

    // Reset to texture unit 0
    gl.activeTexture(gl.TEXTURE0);
  }

  // Create depth texture for depth-based shaders
  if (strippedShaderName.includes("depth")) {
    const depthTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, depthTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Create a simple depth map (darker = closer, lighter = further)
    const depthData = new Uint8Array(image.width * image.height * 4);
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);

    for (let i = 0; i < imageData.data.length; i += 4) {
      // Simple depth calculation based on luminance
      const luma = 0.299 * imageData.data[i] + 0.587 * imageData.data[i + 1] + 0.114 * imageData.data[i + 2];
      const depth = Math.floor(255 - luma); // Invert so dark areas are close
      depthData[i] = depth; // R
      depthData[i + 1] = depth; // G
      depthData[i + 2] = depth; // B
      depthData[i + 3] = 255; // A
    }

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, depthData);

    const depthMapLocation = gl.getUniformLocation(program, "u_depthMap");
    if (depthMapLocation !== null) {
      gl.uniform1i(depthMapLocation, 1); // Use texture unit 1
    }

    // Reset to texture unit 0
    gl.activeTexture(gl.TEXTURE0);
  }

  // Set default palette for hexanate_depth if not provided
  if (strippedShaderName === "hexanate_depth") {
    const paletteLocation = gl.getUniformLocation(program, "u_palette");
    if (paletteLocation !== null && !params.palette) {
      // Default 8-color palette
      const defaultPalette = [
        1.0,
        0.0,
        0.0, // Red
        0.0,
        1.0,
        0.0, // Green
        0.0,
        0.0,
        1.0, // Blue
        1.0,
        1.0,
        0.0, // Yellow
        1.0,
        0.0,
        1.0, // Magenta
        0.0,
        1.0,
        1.0, // Cyan
        0.0,
        0.0,
        0.0, // Black
        1.0,
        1.0,
        1.0, // White
      ];
      gl.uniform3fv(paletteLocation, new Float32Array(defaultPalette));
    }

    const paletteSizeLocation = gl.getUniformLocation(program, "u_paletteSize");
    if (paletteSizeLocation !== null && !params.paletteSize) {
      gl.uniform1i(paletteSizeLocation, 8);
    }
  }

  // Set uniforms for the shader
  for (const [key, value] of Object.entries(params)) {
    const location = gl.getUniformLocation(program, `u_${key}`);
    if (location === null) continue;

    if (typeof value === "boolean") {
      gl.uniform1i(location, value ? 1 : 0);
    } else if (typeof value === "string" && value.startsWith("#")) {
      // Handle color values - convert hex to RGB
      const hex = value.replace("#", "");
      const r = parseInt(hex.substr(0, 2), 16) / 255.0;
      const g = parseInt(hex.substr(2, 2), 16) / 255.0;
      const b = parseInt(hex.substr(4, 2), 16) / 255.0;
      gl.uniform3f(location, r, g, b);
    } else if (typeof value === "number") {
      // Check if this should be an integer uniform based on the key name
      if (key.includes("Size") || key.includes("Mode") || key.includes("paletteSize") || key.includes("fillMode")) {
        gl.uniform1i(location, Math.floor(value));
      } else {
        gl.uniform1f(location, value);
      }
    } else if (Array.isArray(value)) {
      if (value.length === 2) {
        gl.uniform2fv(location, new Float32Array(value));
      } else if (value.length === 3) {
        gl.uniform3fv(location, new Float32Array(value));
      } else if (value.length === 4) {
        gl.uniform4fv(location, new Float32Array(value));
      } else if (key === "palette") {
        // Handle palette array - flatten nested arrays
        const flatPalette = value.flat();
        gl.uniform3fv(location, new Float32Array(flatPalette));
      }
    }
  }

  // Draw the full-screen quad
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};
