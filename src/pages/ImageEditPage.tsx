import React, { useState, useRef, useEffect } from "react";
import apiService from "../services/apiService";
import { storageService } from "../services/storageService";
import {
  XMarkIcon,
  ArrowDownIcon,
  AdjustmentsHorizontalIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useGesture } from "@use-gesture/react";
import { animated, useSpring } from "@react-spring/web";
import FillImageModal from "../components/FillImageModal";
import AspectRatioModal from "../components/AspectRatioModal";
import LayerAccordion from "../components/LayerAccordion";

const ImageEditPage: React.FC<{
  documentId?: number;
}> = ({ documentId = null }) => {
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
  const [canvasWidth, setCanvasWidth] = useState(1280);
  const [canvasHeight, setCanvasHeight] = useState(1024);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [isFillModalOpen, setIsFillModalOpen] = useState(false);
  const [isAspectRatioModalOpen, setIsAspectRatioModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [{ x, y, scale }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
  }));

  // documentId = "12";

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

  const removeLayer = (layerIndex: number) => {
    setLayers((prevLayers) =>
      prevLayers.filter((layer) => layer.index !== layerIndex),
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
      // setCanvasHeight(canvasHeight);
    }
  }, [aspectRatio, canvasWidth]);

  const handleFill = (image: string) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.index === currentLayer ? { ...layer, image } : layer,
      ),
    );
  };

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <div className="flex space-x-4">
          <input
            ref={fileInputRef}
            type="file"
            className="block w-full mt-2 hidden"
            accept="image/*"
            onChange={handleFileChange}
            hidden
          />

          {/* TODO only when image is loaded and then under a menupoint */}
          <button
            className="bg-green-500 py-2 px-4 rounded-md"
            onClick={handleRemoveBG}
            disabled={loading}
          >
            {loading ? "Processing..." : "Remove Background"}
          </button>

          {/* TODO under a menupoint Generate? */}
          <button
            className="bg-blue-500 py-2 px-4 rounded-md"
            onClick={() => setIsFillModalOpen(true)}
          >
            Fill
          </button>

          <button
            className="bg-yellow-500 py-2 px-4 rounded-md"
            onClick={() => setIsAspectRatioModalOpen(true)}
          >
            Aspect Ratio
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <label className="block font-semibold">Add Image </label>
          <button
            className="bg-gray-700 py-2 px-2 rounded-md"
            onClick={handleDropZoneClick}
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-grow flex">
        <div className="w-1/4 bg-current p-4 overflow-auto">
          <LayerAccordion
            layers={layers}
            currentLayer={currentLayer}
            setCurrentLayer={setCurrentLayer}
            setLayerProp={setLayerProp}
            removeLayer={removeLayer}
          />
        </div>
        <div className="flex-grow flex justify-center items-center bg-gray-300 p-4">
          <animated.canvas
            {...bind()}
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="border mb-4 w-full h-auto"
            style={{ x, y, scale }}
          />
        </div>
      </div>

      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <button
          className="bg-inherit text-current py-4 px-4 rounded-md hover:bg-blue-700"
          onClick={handleExport}
        >
          <ArrowDownIcon className="w-4 h-4" /> Download
        </button>
        <button
          className="bg-inherit text-current py-4 px-4 rounded-md hover:bg-blue-700"
          onClick={handleSave}
        >
          <ArrowDownIcon className="w-4 h-4" /> Save
        </button>
      </div>

      <FillImageModal
        isOpen={isFillModalOpen}
        onClose={() => setIsFillModalOpen(false)}
        onFill={handleFill}
      />

      <AspectRatioModal
        isOpen={isAspectRatioModalOpen}
        onClose={() => setIsAspectRatioModalOpen(false)}
        aspectRatio={aspectRatio}
        setAspectRatio={setAspectRatio}
        canvasWidth={canvasWidth}
        setCanvasWidth={setCanvasWidth}
        canvasHeight={canvasHeight}
        setCanvasHeight={setCanvasHeight}
      />
    </div>
  );
};

export default ImageEditPage;
