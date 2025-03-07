import { FilterParams } from "../types/filters";

export const applyVignetteFilter = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  params: FilterParams,
) => {
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

export const applyMonoFilter = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  params: FilterParams,
) => {
  const { color1 } = params;
  ctx.globalCompositeOperation = "source-atop";
  ctx.fillStyle = color1;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

export const applyDuotoneFilter = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  params: FilterParams,
) => {
  const { color1, color2 } = params;
  ctx.globalCompositeOperation = "source-atop";
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

export const applyTritoneFilter = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  params: FilterParams,
) => {
  const { color1, color2, color3 } = params;
  ctx.globalCompositeOperation = "source-atop";
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(0.5, color2);
  gradient.addColorStop(1, color3);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

export const applyQuadtoneFilter = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  params: FilterParams,
) => {
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
