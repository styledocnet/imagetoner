import { env, AutoModel, AutoProcessor, RawImage, PreTrainedModel, Processor } from "@huggingface/transformers";

const WEBGPU_MODEL_ID = "Xenova/modnet";
const FALLBACK_MODEL_ID = "briaai/RMBG-1.4";

let model: PreTrainedModel | null = null;
let processor: Processor | null = null;

function isWebGPUSupported(): boolean {
  return typeof (navigator as any).gpu !== "undefined";
}

export async function initializeRemoveBgModel(): Promise<void> {
  if (isWebGPUSupported()) {
    if (env.backends?.onnx?.wasm) {
      env.backends.onnx.wasm.proxy = false;
    }
    model = await AutoModel.from_pretrained(WEBGPU_MODEL_ID, { device: "webgpu" });
    processor = await AutoProcessor.from_pretrained(WEBGPU_MODEL_ID, {});
    return;
  }
  if (env.backends?.onnx?.wasm) {
    env.backends.onnx.wasm.proxy = true;
  }
  model = await AutoModel.from_pretrained(FALLBACK_MODEL_ID, {});
  processor = await AutoProcessor.from_pretrained(FALLBACK_MODEL_ID, {});
}

export async function removeBackground(image: File | string): Promise<string> {
  if (!model || !processor) throw new Error("Model not initialized. Call initializeRemoveBgModel() first.");

  let rawImage: RawImage;
  if (typeof image === "string") {
    rawImage = await RawImage.fromURL(image);
  } else {
    rawImage = await RawImage.fromURL(URL.createObjectURL(image));
  }

  const { pixel_values } = await processor(rawImage);
  const { output } = await model({ input: pixel_values });

  const maskData: Uint8Array = (await RawImage.fromTensor(output[0].mul(255).to("uint8")).resize(rawImage.width, rawImage.height)).data;

  const canvas = document.createElement("canvas");
  canvas.width = rawImage.width;
  canvas.height = rawImage.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2D context");
  ctx.drawImage(rawImage.toCanvas(), 0, 0);
  const imgData = ctx.getImageData(0, 0, rawImage.width, rawImage.height);
  for (let i = 0; i < maskData.length; ++i) {
    imgData.data[4 * i + 3] = maskData[i];
  }
  ctx.putImageData(imgData, 0, 0);

  return canvas.toDataURL("image/png");
}
