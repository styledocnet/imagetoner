import { Layer } from "../types";

export const renderLayers = (ctx: CanvasRenderingContext2D, layers: Layer[], width: number, height: number) => {
  // const sortedLayers = [...layers].sort((a, b) => a.index - b.index);

  const drawLayer = (layer: Layer) => {
    if (layer.visible) {
      if (layer.type === "image" && layer.image) {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.src = layer.image || "";
          img.onload = () => {
            const imgWidth = img.width * layer.scale;
            const imgHeight = img.height * layer.scale;
            const xPos = (width - imgWidth) / 2 + layer.offsetX;
            const yPos = (height - imgHeight) / 2 + layer.offsetY;
            ctx.drawImage(img, xPos, yPos, imgWidth, imgHeight);
            resolve();
          };
        });
      } else if (layer.type === "text") {
        ctx.font = `${layer.fontSize}px ${layer.fontFamily}`;
        ctx.fillStyle = layer.color || "tomato";
        ctx.fillText(layer.text || "", layer.offsetX, layer.offsetY);
        return Promise.resolve();
      }
    }
    return Promise.resolve();
  };

  const drawLayersSequentially = async () => {
    for (const layer of layers) {
      await drawLayer(layer);
    }
  };

  drawLayersSequentially();
};
