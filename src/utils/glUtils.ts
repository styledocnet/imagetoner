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
  "polygonate",
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
      vUV = (position + 1.0) * 0.5;
      gl_Position = vec4(position, 0, 1);
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

  // Set uniforms for the shader
  for (const [key, value] of Object.entries(params)) {
    const location = gl.getUniformLocation(program, `u_${key}`);
    if (location === null) continue;

    if (typeof value === "number") {
      gl.uniform1f(location, value);
    } else if (Array.isArray(value) && value.length === 3) {
      gl.uniform3fv(location, new Float32Array(value));
    }
  }

  // Draw the full-screen quad
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};
