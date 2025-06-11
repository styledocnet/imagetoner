import { FilterParams } from "../types";

export const hexToRgb = (hex: string): [number, number, number] => {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
};

export const applyVignetteFilter = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, params: FilterParams) => {
  const { strength, sizeFactor, color } = params;
  ctx.globalCompositeOperation = "source-over";
  const gradient = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    canvas.width / sizeFactor,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width / 2,
  );
  gradient.addColorStop(0, "transparent");
  gradient.addColorStop(1, color);
  ctx.fillStyle = gradient;
  ctx.globalAlpha = strength;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

export const applyMonoFilter = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, params: FilterParams) => {
  const { color1 } = params;
  ctx.globalCompositeOperation = "source-atop";
  ctx.fillStyle = color1;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

export const applyDuotoneFilter = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, params: FilterParams) => {
  const { color1, color2 } = params;

  // Convert hex colors to RGB arrays if necessary
  const rgbColor1 = typeof color1 === "string" ? hexToRgb(color1) : color1;
  const rgbColor2 = typeof color2 === "string" ? hexToRgb(color2) : color2;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;

  // Generate gradient array
  const gradientArray: [number, number, number][] = [];
  for (let d = 0; d < 256; d++) {
    const ratio = d / 255;
    const rA = Math.floor(rgbColor1[0] * (1 - ratio) + rgbColor2[0] * ratio);
    const gA = Math.floor(rgbColor1[1] * (1 - ratio) + rgbColor2[1] * ratio);
    const bA = Math.floor(rgbColor1[2] * (1 - ratio) + rgbColor2[2] * ratio);
    gradientArray.push([rA, gA, bA]);
  }

  // Apply duotone filter
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Calculate luminance (grayscale value)
    const luminance = Math.floor(0.299 * r + 0.587 * g + 0.114 * b);

    // Replace colors with gradient-mapped colors
    const [newR, newG, newB] = gradientArray[luminance];
    data[i] = newR; // Red
    data[i + 1] = newG; // Green
    data[i + 2] = newB; // Blue
  }

  // Put the modified image data back onto the canvas
  ctx.putImageData(imageData, 0, 0);
};

export const applyTritoneFilter = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, params: FilterParams) => {
  const { color1, color2, color3 } = params;

  // Convert hex colors to RGB arrays if necessary
  const rgbColor1 = typeof color1 === "string" ? hexToRgb(color1) : color1;
  const rgbColor2 = typeof color2 === "string" ? hexToRgb(color2) : color2;
  const rgbColor3 = typeof color3 === "string" ? hexToRgb(color3) : color3;

  const gradientArray: [number, number, number][] = [];
  for (let d = 0; d < 256; d++) {
    const ratio = d / 255;
    let rA, gA, bA;

    if (ratio < 0.5) {
      // Interpolate between color1 and color2
      const l = ratio * 2;
      rA = Math.floor(rgbColor1[0] * (1 - l) + rgbColor2[0] * l);
      gA = Math.floor(rgbColor1[1] * (1 - l) + rgbColor2[1] * l);
      bA = Math.floor(rgbColor1[2] * (1 - l) + rgbColor2[2] * l);
    } else {
      // Interpolate between color2 and color3
      const l = (ratio - 0.5) * 2;
      rA = Math.floor(rgbColor2[0] * (1 - l) + rgbColor3[0] * l);
      gA = Math.floor(rgbColor2[1] * (1 - l) + rgbColor3[1] * l);
      bA = Math.floor(rgbColor2[2] * (1 - l) + rgbColor3[2] * l);
    }

    gradientArray.push([rA, gA, bA]);
  }

  // Apply tritone filter (same as duotone logic)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const luminance = Math.floor(0.299 * r + 0.587 * g + 0.114 * b);
    const [newR, newG, newB] = gradientArray[luminance];
    data[i] = newR;
    data[i + 1] = newG;
    data[i + 2] = newB;
  }

  ctx.putImageData(imageData, 0, 0);
};
export const applyQuadtoneFilter = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, params: FilterParams) => {
  const { color1, color2, color3, color4 } = params;
  ctx.globalCompositeOperation = "source-atop";
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(0.33, color2);
  gradient.addColorStop(0.66, color3);
  gradient.addColorStop(1, color4);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

export const applyGrayscaleFilter = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, params: FilterParams) => {
  params;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 2;
    data[i] = avg;
    data[i + 1] = avg;
    data[i + 2] = avg;
  }
  ctx.putImageData(imageData, 0, 0);
};

export const applySepiaFilter = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, params: FilterParams) => {
  params;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const avg = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
    data[i] = avg + 100;
    data[i + 1] = avg + 50;
    data[i + 2] = avg;
  }
  ctx.putImageData(imageData, 0, 0);
};

export const applyBlurFilter = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, params: FilterParams) => {
  const { strength } = params;
  ctx.filter = `blur(${strength}px)`;
  ctx.drawImage(canvas, 0, 0);
  ctx.filter = "none";
};
