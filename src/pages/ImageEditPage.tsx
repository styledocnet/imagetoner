import React, { useRef, useEffect, useState } from "react";
import { storageService } from "../services/storageService";
import {
  ArrowDownIcon,
  PlusIcon,
  Cog6ToothIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import { useGesture } from "@use-gesture/react";
import { animated, useSpring } from "@react-spring/web";
import FillImageModal from "../components/FillImageModal";
import AspectRatioModal from "../components/AspectRatioModal";
import FilterModal from "../components/FilterModal";
import LayerAccordion from "../components/LayerAccordion";
import AddLayerModal from "../components/AddLayerModal";
import WebCamInputModal from "../components/WebCamInputModal";
import useLayers from "../hooks/useLayers";
import { renderLayers } from "../utils/canvasUtils";
import { applyFilterToCanvas } from "../utils/filterUtils";
import { useRouter } from "../context/CustomRouter";
import { Document, Layer } from "../types";

const ImageEditPage: React.FC = () => {
  const {
    layers,
    setLayers,
    updateLayerProp,
    removeLayer,
    addNewLayer,
    moveLayerUp,
    moveLayerDown,
  } = useLayers();
  const [currentLayer, setCurrentLayer] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [documentSize, setDocumentSize] = useState({
    width: 1920,
    height: 1080,
  });
  const [canvasSize, setCanvasSize] = useState({ width: 960, height: 540 });
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [isFillModalOpen, setIsFillModalOpen] = useState(false);
  const [isAspectRatioModalOpen, setIsAspectRatioModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isAddLayerModalOpen, setIsAddLayerModalOpen] = useState(false);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [{ x, y, scale }, api] = useSpring(() => ({ x: 0, y: 0, scale: 1 }));
  const { navigate, currentRoute } = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const documentId = params.get("id");
    if (documentId) {
      loadDocument(parseInt(documentId));
    }
  }, [currentRoute]);

  useEffect(() => {
    setCanvasSize({
      width: documentSize.width / 2,
      height: documentSize.height / 2,
    });
  }, [documentSize]);

  useEffect(() => {
    renderCanvas();
  }, [layers, documentSize]);

  useEffect(() => {
    if (aspectRatio) {
      setCanvasSize((prevSize) => ({
        ...prevSize,
        height: prevSize.width / aspectRatio,
      }));
    } else {
      setCanvasSize((prevSize) => ({ ...prevSize, height: 1024 }));
    }
  }, [aspectRatio, canvasSize.width]);

  const loadDocument = async (id: number) => {
    const document = await storageService.getDocument(id);
    if (document) {
      const updatedLayers = document.layers.map((layer) => ({
        ...layer,
        image: layer.image ? `data:image/png;base64,${layer.image}` : null,
        width: layer.width || documentSize.width,
        height: layer.height || documentSize.height,
      }));
      setLayers(updatedLayers);
      if (updatedLayers.length > 0) {
        const firstLayer = updatedLayers[0];
        setDocumentSize({ width: firstLayer.width, height: firstLayer.height });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        updateLayerProp(currentLayer!, "image", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleCamInputClick = () => {
    setIsWebcamOpen(true);
  };

  const handleExport = () => {
    const originalCanvas = document.createElement("canvas");
    const originalCtx = originalCanvas.getContext("2d");
    if (originalCtx) {
      originalCanvas.width = documentSize.width;
      originalCanvas.height = documentSize.height;
      renderLayers(
        originalCtx,
        layers,
        originalCanvas.width,
        originalCanvas.height,
      );
      setTimeout(() => {
        const link = document.createElement("a");
        link.href = originalCanvas.toDataURL("image/png");
        link.download = "exported-image.png";
        link.click();
      }, 1000);
    }
  };

  const handleSave = async () => {
    const document: Document = {
      name: `Document ${Date.now()}`,
      layers: layers.map((layer) => ({
        ...layer,
        image: layer.image?.split(",")[1] || null,
        width: documentSize.width,
        height: documentSize.height,
      })),
    };
    await storageService.addDocument(document);
    alert("Document saved successfully!");
    navigate("photos");
  };

  const bind = useGesture(
    {
      onDrag: ({ offset: [dx, dy] }) => {
        updateLayerProp(currentLayer!, "offsetX", dx);
        updateLayerProp(currentLayer!, "offsetY", dy);
      },
      onPinch: ({ offset: [d] }) => {
        updateLayerProp(currentLayer!, "scale", d);
      },
    },
    {
      drag: {
        from: () => [
          layers[currentLayer!].offsetX,
          layers[currentLayer!].offsetY,
        ],
      },
      pinch: { from: () => [layers[currentLayer!].scale, 0] },
    },
  );

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, documentSize.width, documentSize.height);
        renderLayers(ctx, layers, documentSize.width, documentSize.height);
      }
    }
  };

  const applyFilter = (filter: string, params: any, option: string) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const layer = layers.find((layer) => layer.index === currentLayer);
    if (ctx && layer) {
      const img = new Image();
      img.src = layer.image || "";
      img.onload = () => {
        ctx.clearRect(0, 0, documentSize.width, documentSize.height);
        ctx.drawImage(img, 0, 0, documentSize.width, documentSize.height);
        applyFilterToCanvas(filter, ctx, canvas, params);
        const imageUrl = canvas.toDataURL("image/png");
        if (option === "applyCurrent") {
          updateLayerProp(currentLayer!, "image", imageUrl);
        } else if (option === "createNew") {
          const newLayer: Layer = {
            name: `${filter} Layer`,
            index: layers.length,
            image: imageUrl,
            offsetX: 0,
            offsetY: 0,
            scale: 1,
            type: "image",
            visible: true,
          };
          addNewLayer(newLayer);
        } else if (option === "mergeAndCreateNew") {
          createMergedLayerWithFilter(filter, params);
        }
        renderCanvas();
      };
    }
  };

  const createMergedLayerWithFilter = (filter: string, params: any) => {
    const mergedCanvas = document.createElement("canvas");
    const mergedCtx = mergedCanvas.getContext("2d");
    if (mergedCtx) {
      mergedCanvas.width = documentSize.width;
      mergedCanvas.height = documentSize.height;
      renderLayers(mergedCtx, layers, mergedCanvas.width, mergedCanvas.height);
      setTimeout(() => {
        const filterCanvas = document.createElement("canvas");
        const filterCtx = filterCanvas.getContext("2d");
        filterCanvas.width = mergedCanvas.width;
        filterCanvas.height = mergedCanvas.height;
        if (filterCtx) {
          filterCtx.drawImage(
            mergedCanvas,
            0,
            0,
            filterCanvas.width,
            filterCanvas.height,
          );
          applyFilterToCanvas(filter, filterCtx, filterCanvas, params);
          const mergedImageUrl = filterCanvas.toDataURL("image/png");
          const newLayer: Layer = {
            name: `${filter} Merged Layer`,
            index: layers.length,
            image: mergedImageUrl,
            offsetX: 0,
            offsetY: 0,
            scale: 1,
            type: "image",
            visible: true,
          };
          addNewLayer(newLayer);
          renderCanvas();
        }
      }, 1000);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <div className="bg-gray-800 dark:bg-gray-700 text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex space-x-4">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <button
            className="bg-blue-500 hover:bg-blue-600 py-2 px-4 rounded-md transition"
            onClick={() => setIsFillModalOpen(true)}
          >
            Fill
          </button>
          <button
            className="bg-purple-500 hover:bg-purple-600 py-2 px-4 rounded-md transition"
            onClick={() => setIsFilterModalOpen(true)}
          >
            Filter
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="bg-yellow-500 hover:bg-yellow-600 py-2 px-4 rounded-md transition"
            onClick={() => setIsAspectRatioModalOpen(true)}
          >
            <Cog6ToothIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <label className="block font-semibold">Add </label>
          <button
            className="bg-gray-700 hover:bg-gray-800 py-2 px-2 rounded-md transition"
            onClick={handleCamInputClick}
          >
            <CameraIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="" className="block font-semibold">
            Add Image{" "}
          </label>
          <button
            className="bg-gray-700 hover:bg-gray-800 py-2 px-2 rounded-md transition"
            onClick={handleDropZoneClick}
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-grow flex flex-col sm:flex-row-reverse sm:flex-wrap-reverse">
        <div className="w-full sm:w-1/4 bg-gray-200 dark:bg-gray-800 p-4 overflow-auto">
          <LayerAccordion
            layers={layers}
            currentLayer={currentLayer}
            setCurrentLayer={setCurrentLayer}
            setLayerProp={updateLayerProp}
            removeLayer={removeLayer}
            moveLayerUp={moveLayerUp}
            moveLayerDown={moveLayerDown}
          />
          <button
            className="w-full mt-4 py-2 px-4 bg-gray-700 text-white rounded-md flex items-center justify-center hover:bg-gray-800 transition"
            onClick={() => setIsAddLayerModalOpen(true)}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Layer
          </button>
        </div>
        <div className="flex-grow flex justify-center items-start bg-gray-300 dark:bg-gray-700 p-4">
          <animated.canvas
            {...bind()}
            ref={canvasRef}
            width={documentSize.width}
            height={documentSize.height}
            className="border mb-4 w-full h-auto shadow-lg"
            style={{
              width: `${canvasSize.width}px`,
              height: `${canvasSize.height}px`,
            }}
          />
        </div>
      </div>

      <div className="bg-gray-800 dark:bg-gray-700 text-white p-4 flex justify-between items-center shadow-md">
        <button
          className="bg-blue-500 hover:bg-blue-600 py-2 px-4 rounded-md transition"
          onClick={handleExport}
        >
          <ArrowDownIcon className="w-4 h-4 inline-block mr-2" />
          Download
        </button>
        <button
          className="bg-green-500 hover:bg-green-600 py-2 px-4 rounded-md transition"
          onClick={handleSave}
        >
          <ArrowDownIcon className="w-4 h-4 inline-block mr-2" />
          Save
        </button>
      </div>

      <WebCamInputModal
        isOpen={isWebcamOpen}
        onClose={() => setIsWebcamOpen(false)}
        onCapture={(image) => updateLayerProp(currentLayer!, "image", image)}
        canvasSize={documentSize}
      />
      <AspectRatioModal
        isOpen={isAspectRatioModalOpen}
        onClose={() => setIsAspectRatioModalOpen(false)}
        aspectRatio={aspectRatio}
        setAspectRatio={setAspectRatio}
        canvasSize={canvasSize}
        setCanvasSize={setCanvasSize}
      />
      <FillImageModal
        isOpen={isFillModalOpen}
        onClose={() => setIsFillModalOpen(false)}
        canvasSize={documentSize}
        onFill={(image) => updateLayerProp(currentLayer!, "image", image)}
      />
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        applyFilter={applyFilter}
      />
      <AddLayerModal
        isOpen={isAddLayerModalOpen}
        onClose={() => setIsAddLayerModalOpen(false)}
        onAddLayer={addNewLayer}
      />
    </div>
  );
};

export default ImageEditPage;
