import { pipeline } from "@xenova/transformers";

const loadSegmentationModel = async () => {
  return await pipeline("image-segmentation", "Xenova/deeplabv3");
};

export const removeBackground = async (imageSrc: string): Promise<string> => {
  const model = await loadSegmentationModel();

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = imageSrc;

  return new Promise((resolve, reject) => {
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject("Failed to create canvas context to process the image");
        return;
      }
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      const segmentation = await model(img);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { data } = imageData;

      segmentation.forEach((segment) => {
        const mask = segment.mask; // Binary mask for the segment
        for (let i = 0; i < data.length; i += 4) {
          const alpha = mask[i / 4]; // Use the mask value to set alpha
          data[i + 3] = alpha ? 255 : 0; // Set alpha to 0 for background
        }
      });

      ctx.putImageData(imageData, 0, 0);

      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = () => reject("Failed to load image for background removal");
  });
};
