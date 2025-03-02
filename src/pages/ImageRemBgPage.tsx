import React, { useState, useRef, useEffect } from "react";
import apiService from "../services/apiService";
import { storageService } from "../services/storageService";
import { XMarkIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import { useGesture } from "@use-gesture/react";
import { animated, useSpring } from "@react-spring/web";

const aspectRatios = [
  { label: "Original", value: null },
  { label: "16:9", value: 16 / 9 },
  { label: "4:3", value: 4 / 3 },
  { label: "1:1", value: 1 },
];

const ImageRemBgPage: React.FC<{
  documentId?: number;
  onBack?: () => void;
}> = ({ documentId = null, onBack = null }) => {
  const [layers, setLayers] = useState([
    {
      name: "Background",
      index: 0,
      image: null,
      offsetX: 0,
      offsetY: 0,
      scale: 1,
    },
    {
      name: "Foreground",
      index: 1,
      image: null,
      offsetX: 0,
      offsetY: 0,
      scale: 1,
    },
  ]);
  const [currentLayer, setCurrentLayer] = useState(1);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(600);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [{ x, y, scale }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
  }));

  useEffect(() => {
    const loadDocument = async () => {
      if (documentId) {
        const document = await storageService.getDocument(documentId);
        console.log(document);
        if (document) {
          console.log(document.layers);
          setLayers(document.layers);
        }
      }
    };
    loadDocument();
  }, [documentId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLayers((prev) =>
        prev.map((layer) =>
          layer.index === currentLayer
            ? { ...layer, image: URL.createObjectURL(e.target.files[0]) }
            : layer,
        ),
      );
    }
  };

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveBG = async () => {
    const selectedLayer = layers.find((layer) => layer.index === currentLayer);
    if (!selectedLayer?.image) return;

    setLoading(true);
    try {
      const response = await fetch(selectedLayer.image);
      const blob = await response.blob();
      const file = new File([blob], "uploaded-image.png", { type: blob.type });

      const bgRemovedImage = await apiService.removeBackground(file);
      setLayers((prev) =>
        prev.map((layer) =>
          layer.index === currentLayer
            ? { ...layer, image: bgRemovedImage }
            : layer,
        ),
      );
    } catch (error) {
      alert("Error removing background");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const originalCanvas = document.createElement("canvas");
    const originalCtx = originalCanvas.getContext("2d");

    if (originalCtx) {
      originalCanvas.width = canvasWidth;
      originalCanvas.height = canvasHeight;

      layers.forEach((layer) => {
        if (layer.image) {
          const layerImg = new Image();
          layerImg.src = layer.image;
          layerImg.onload = () => {
            const imgWidth = layerImg.width * layer.scale;
            const imgHeight = layerImg.height * layer.scale;
            const xPos = (originalCanvas.width - imgWidth) / 2 + layer.offsetX;
            const yPos =
              (originalCanvas.height - imgHeight) / 2 + layer.offsetY;
            originalCtx.drawImage(layerImg, xPos, yPos, imgWidth, imgHeight);
          };
        }
      });

      setTimeout(() => {
        const link = document.createElement("a");
        link.href = originalCanvas.toDataURL("image/png");
        link.download = "exported-image.png";
        link.click();
      }, 1000);
    }
  };

  const handleSave = async () => {
    const document = {
      name: `Document ${Date.now()}`,
      layers,
    };
    await storageService.addDocument(document);
    alert("Document saved successfully!");
  };

  const setLayerProp = (layerIndex: number, prop: string, value: any) => {
    setLayers((prevLayers) =>
      prevLayers.map((layer) =>
        layer.index === layerIndex ? { ...layer, [prop]: value } : layer,
      ),
    );
  };

  const bind = useGesture(
    {
      onDrag: ({ offset: [dx, dy] }) => {
        setLayerProp(currentLayer, "offsetX", dx);
        setLayerProp(currentLayer, "offsetY", dy);
      },
      onPinch: ({ offset: [d] }) => {
        setLayerProp(currentLayer, "scale", d);
      },
    },
    {
      drag: {
        from: () => [
          layers[currentLayer].offsetX,
          layers[currentLayer].offsetY,
        ],
      },
      pinch: { from: () => [layers[currentLayer].scale, 0] },
    },
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        layers.forEach((layer) => {
          if (layer.image) {
            const img = new Image();
            img.src = layer.image;
            img.onload = () => {
              const imgWidth = img.width * layer.scale;
              const imgHeight = img.height * layer.scale;
              const xPos = (canvas.width - imgWidth) / 2 + layer.offsetX;
              const yPos = (canvas.height - imgHeight) / 2 + layer.offsetY;
              ctx.drawImage(img, xPos, yPos, imgWidth, imgHeight);
            };
          }
        });
      }
    }
  }, [layers, canvasWidth, canvasHeight]);

  useEffect(() => {
    if (aspectRatio) {
      setCanvasHeight(canvasWidth / aspectRatio);
    } else {
      setCanvasHeight(600);
    }
  }, [aspectRatio, canvasWidth]);

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Image Background Removal
      </h1>
      {onBack && (
        <button
          className="bg-gray-500 text-white py-2 px-4 rounded-md mb-4"
          onClick={onBack}
        >
          Back
        </button>
      )}

      <div className="flex flex-wrap justify-between mb-4">
        <div className="w-full md:w-auto mb-4">
          <label className="block font-semibold">Zoom:</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-full"
          />
          <input
            type="number"
            min="0.5"
            max="2"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-full mt-1"
          />
        </div>
        <div className="w-full md:w-auto mb-4">
          <label className="block font-semibold">X:</label>
          <input
            type="range"
            min="-128"
            max="128"
            step="1"
            value={layers[currentLayer].offsetX}
            onChange={(e) =>
              setLayerProp(currentLayer, "offsetX", parseFloat(e.target.value))
            }
            className="w-full"
          />
          <input
            type="number"
            min="-128"
            max="128"
            step="1"
            value={layers[currentLayer].offsetX}
            onChange={(e) =>
              setLayerProp(currentLayer, "offsetX", parseFloat(e.target.value))
            }
            className="w-full mt-1"
          />
        </div>
        <div className="w-full md:w-auto mb-4">
          <label className="block font-semibold">Y:</label>
          <input
            type="range"
            min="-128"
            max="128"
            step="1"
            value={layers[currentLayer].offsetY}
            onChange={(e) =>
              setLayerProp(currentLayer, "offsetY", parseFloat(e.target.value))
            }
            className="w-full"
          />
          <input
            type="number"
            min="-128"
            max="128"
            step="1"
            value={layers[currentLayer].offsetY}
            onChange={(e) =>
              setLayerProp(currentLayer, "offsetY", parseFloat(e.target.value))
            }
            className="w-full mt-1"
          />
        </div>
        <div className="w-full md:w-auto mb-4">
          <label className="block font-semibold">Scale:</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={layers[currentLayer].scale}
            onChange={(e) =>
              setLayerProp(currentLayer, "scale", parseFloat(e.target.value))
            }
            className="w-full"
          />
          <input
            type="number"
            min="0.5"
            max="2"
            step="0.1"
            value={layers[currentLayer].scale}
            onChange={(e) =>
              setLayerProp(currentLayer, "scale", parseFloat(e.target.value))
            }
            className="w-full mt-1"
          />
        </div>
        <div className="w-full md:w-auto mb-4">
          <label className="block font-semibold">Width:</label>
          <input
            type="number"
            min="100"
            max="1920"
            value={canvasWidth}
            onChange={(e) => setCanvasWidth(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="w-full md:w-auto mb-4">
          <label className="block font-semibold">Height:</label>
          <input
            type="number"
            min="100"
            max="1080"
            value={canvasHeight}
            onChange={(e) => setCanvasHeight(parseInt(e.target.value))}
            className="w-full"
            disabled={aspectRatio !== null}
          />
        </div>
        <div className="w-full md:w-auto mb-4">
          <label className="block font-semibold">Aspect Ratio:</label>
          <select
            value={aspectRatio}
            onChange={(e) =>
              setAspectRatio(e.target.value ? parseFloat(e.target.value) : null)
            }
            className="w-full"
          >
            {aspectRatios.map((ratio) => (
              <option key={ratio.label} value={ratio.value}>
                {ratio.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="relative mb-4">
        <animated.canvas
          {...bind()}
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className={`border mb-4 w-full h-auto transform scale-[${zoom}]`}
          style={{ x, y, scale }}
        />
      </div>

      <div className="flex justify-between mb-4">
        {layers.map((layer) => (
          <button
            key={layer.index}
            className={`px-4 py-2 border rounded-md ${currentLayer === layer.index ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => setCurrentLayer(layer.index)}
          >
            {layer.name}
          </button>
        ))}
      </div>

      <div
        className="border-dashed border-2 p-6 rounded-md flex flex-col items-center relative cursor-pointer"
        onClick={handleDropZoneClick}
      >
        {layers[currentLayer].image ? (
          <img
            src={layers[currentLayer].image}
            className="max-w-full rounded-md shadow-md"
            alt="Layer Preview"
          />
        ) : (
          <p className="text-gray-500">Click or Drop to Import an Image</p>
        )}
        <XMarkIcon className="absolute top-2 right-2 h-6 w-6 text-red-500 cursor-pointer" />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="block w-full mt-2"
        accept="image/*"
        onChange={handleFileChange}
        hidden
      />

      <button
        className="w-full mt-4 bg-green-500 text-white py-2 rounded-md hover:bg-green-700"
        onClick={handleRemoveBG}
        disabled={loading}
      >
        {loading ? "Processing..." : "Remove Background"}
      </button>

      <div className="flex justify-between mt-4">
        <button
          className="min-w-fit bg-inherit text-current py-4 px-4 rounded-md hover:bg-blue-700"
          onClick={handleExport}
        >
          <ArrowDownIcon className="w-4 h-4" /> Download
        </button>

        <button
          className="min-w-fit mt-4 bg-inherit text-current py-4 px-4 rounded-md hover:bg-blue-700"
          onClick={handleSave}
        >
          <ArrowDownIcon className="w-4 h-4" /> Save
        </button>
      </div>
    </div>
  );
};

export default ImageRemBgPage;
