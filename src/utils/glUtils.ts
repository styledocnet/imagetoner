const shaderAllowList = [
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
      gl_Position = vec4(position, 0, 1);
    }
  `;

  const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);

  return vertexShader;
};
/*
export const applyShaderFilter = (
  gl: WebGLRenderingContext,
  texture: HTMLImageElement,
  filter: string,
  params: any,
) => {
  const program = createProgram(gl, filter);
  if (!program) {
    console.error("Failed to create WebGL program");
    return;
  }

  gl.useProgram(program);

  // Set uniforms based on params
  for (const [key, value] of Object.entries(params)) {
    const location = gl.getUniformLocation(program, `u_${key}`);
    if (location === null) {
      console.warn(`Uniform ${key} not found in shader`);
      continue;
    }
    console.log(`Setting uniform ${key} to value ${value}`);
    if (typeof value === "number" || !isNaN(parseFloat(value))) {
      gl.uniform1f(location, parseFloat(value));
    } else if (Array.isArray(value) && value.length === 3) {
      gl.uniform3fv(location, new Float32Array(value));
    } else if (typeof value === "string" && /^#[0-9A-F]{6}$/i.test(value)) {
      const color = hexToRgb(value);
      if (color) {
        gl.uniform3fv(location, new Float32Array(color));
      } else {
        console.warn(`Unsupported uniform type for ${key}`);
      }
    } else {
      console.warn(`Unsupported uniform type for ${key}`);
    }
  }

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);

  // Flip the image vertically before uploading it to the texture
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture);

  const positionLocation = gl.getAttribLocation(program, "position");
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};
*/

export const applyShaderFilter = (gl: WebGLRenderingContext, texture: HTMLImageElement, filter: string, params: any) => {
  const shaderSource = `
    // Add your fragment shader code here for ${filter}
    precision mediump float;
    varying vec2 vUV;
    uniform sampler2D u_texture;
    uniform float u_strength; // Example uniform
    void main() {
      vec4 color = texture2D(u_texture, vUV);
      gl_FragColor = vec4(color.rgb * u_strength, color.a);
    }
  `; // Replace this with actual shader code from `loadShaderSource`.

  const program = createProgram(gl, shaderSource);
  if (!program) {
    console.error("Failed to create WebGL program");
    return;
  }

  gl.useProgram(program);

  // Set uniforms based on params
  for (const [key, value] of Object.entries(params)) {
    const location = gl.getUniformLocation(program, `u_${key}`);
    if (location === null) {
      console.warn(`Uniform ${key} not found in shader`);
      continue;
    }
    console.log(`Setting uniform ${key} to value ${value}`);
    if (typeof value === "number") {
      gl.uniform1f(location, value);
    } else if (Array.isArray(value) && value.length === 3) {
      gl.uniform3fv(location, new Float32Array(value));
    } else if (typeof value === "string" && /^#[0-9A-F]{6}$/i.test(value)) {
      const color = hexToRgb(value);
      if (color) {
        gl.uniform3fv(location, new Float32Array(color));
      }
    }
  }

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture);

  const positionLocation = gl.getAttribLocation(program, "position");
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};
const createProgram = (gl: WebGLRenderingContext, fragmentShaderSource: string) => {
  const vertexShader = initGL(gl);
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);

  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(fragmentShader));
    return null;
  }

  const program = gl.createProgram()!;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    return null;
  }

  return program;
};

export const loadShaderSource = async (shaderName: string): Promise<string> => {
  if (!shaderAllowList.includes(shaderName)) {
    throw new Error(`Shader ${shaderName} is not allowed`);
  }

  const shaderModule = await import(`../assets/shader/filter/${shaderName}.frag.ts`);
  return shaderModule.default;
};

const hexToRgb = (hex: string): [number, number, number] | null => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result ? [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255] : null;
};
