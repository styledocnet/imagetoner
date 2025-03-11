import {
  applyVignetteFilter,
  applyMonoFilter,
  applyDuotoneFilter,
  applyTritoneFilter,
  applyQuadtoneFilter,
  applyGrayscaleFilter,
  applySepiaFilter,
  applyBlurFilter,
} from "./filters";
import { FilterParams } from "../types";

export const applyFilterToCanvas = (
  filter: string,
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  params: FilterParams,
) => {
  switch (filter) {
    case "vignette":
      applyVignetteFilter(ctx, canvas, params);
      break;
    case "mono":
      applyMonoFilter(ctx, canvas, params);
      break;
    case "duotone":
      applyDuotoneFilter(ctx, canvas, params);
      break;
    case "tritone":
      applyTritoneFilter(ctx, canvas, params);
      break;
    case "quadtone":
      applyQuadtoneFilter(ctx, canvas, params);
      break;
    case "grayscale":
      applyGrayscaleFilter(ctx, canvas, params);
      break;
    case "sepia":
      applySepiaFilter(ctx, canvas, params);
      break;
    case "blur":
      applyBlurFilter(ctx, canvas, params);
      break;
    default:
      break;
  }
};
