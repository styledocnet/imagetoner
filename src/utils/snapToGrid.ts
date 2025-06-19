export interface GridSnapOptions {
  gridSize: number;
  offsetX?: number;
  offsetY?: number;
  snapThreshold?: number;
  highlightCallback?: (x: number, y: number) => void;
}

function snapCoord(value: number, grid: number, offset: number, threshold: number): { value: number; snapped: boolean } {
  // Snap x or y to nearest grid (within threshold)
  const nearest = Math.round((value - offset) / grid) * grid + offset;
  if (Math.abs(value - nearest) <= threshold) {
    return { value: nearest, snapped: true };
  }
  return { value, snapped: false };
}

export function snapToGrid(x: number, y: number, options: GridSnapOptions) {
  const { gridSize, offsetX = 0, offsetY = 0, snapThreshold = 5, highlightCallback } = options;

  const snapX = snapCoord(x, gridSize, offsetX, snapThreshold);
  const snapY = snapCoord(y, gridSize, offsetY, snapThreshold);

  if (snapX.snapped && highlightCallback) highlightCallback(snapX.value, y);
  if (snapY.snapped && highlightCallback) highlightCallback(x, snapY.value);

  return {
    x: snapX.value,
    y: snapY.value,
    snapped: snapX.snapped || snapY.snapped,
  };
}
