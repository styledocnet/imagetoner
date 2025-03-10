import React, { useState, useRef, useEffect } from "react";
import { storageService } from "../services/storageService";
import { ArrowDownIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useGesture } from "@use-gesture/react";
import { animated, useSpring } from "@react-spring/web";
import FillImageModal from "../components/FillImageModal";
import AspectRatioModal from "../components/AspectRatioModal";
import FilterModal from "../components/FilterModal";
import LayerAccordion from "../components/LayerAccordion";
import AddLayerModal from "../components/AddLayerModal";
import { applyFilterToCanvas } from "../utils/filterUtils";
import { Layer, FilterParams } from "../types";
import { useRouter } from "../context/CustomRouter";

const ImageEditPage: React.FC = () => {
  const [layers, setLayers] = useState<Layer[]>([
    {
      name: "Background",
      index: 0,
      image: null,
      offsetX: 0,
      offsetY: 0,
      scale: 1,
      type: "image",
      visible: true,
    },
    {
      name: "Foreground",
      index: 1,
      image: null,
      offsetX: 0,
      offsetY: 0,
      scale: 1,
      type: "image",
      visible: true,
    },
  ]);
  const [currentLayer, setCurrentLayer] = useState(1);
  const [loading, setLoading] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(1280);
  const [canvasHeight, setCanvasHeight] = useState(1024);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [isFillModalOpen, setIsFillModalOpen] = useState(false);
  const [isAspectRatioModalOpen, setIsAspectRatioModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isAddLayerModalOpen, setIsAddLayerModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [{ x, y, scale }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
  }));

  const { navigate, currentRoute } = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const documentId = params.get("id");
    if (documentId) {
      loadDocument(parseInt(documentId));
    }
  }, [currentRoute]);

  const loadDocument = async (id: number) => {
    const document = await storageService.getDocument(id);
    if (document) {
      const updatedLayers = document.layers.map((layer) => ({
        ...layer,
        image: layer.image ? `data:image/png;base64,${layer.image}` : null,
      }));
      setLayers(updatedLayers);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        updateLayerProp(currentLayer, "image", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleExport = () => {
    const originalCanvas = document.createElement("canvas");
    const originalCtx = originalCanvas.getContext("2d");

    if (originalCtx) {
      originalCanvas.width = canvasWidth;
      originalCanvas.height = canvasHeight;

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
      })),
    };
    await storageService.addDocument(document);
    alert("Document saved successfully!");
    navigate("photos");
  };

  const updateLayerProp = (layerIndex: number, prop: string, value: any) => {
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

  const moveLayerUp = (index: number) => {
    if (index > 0) {
      setLayers((prevLayers) => {
        const newLayers = [...prevLayers];
        [newLayers[index], newLayers[index - 1]] = [
          newLayers[index - 1],
          newLayers[index],
        ];
        return newLayers;
      });
    }
  };

  const moveLayerDown = (index: number) => {
    if (index < layers.length - 1) {
      setLayers((prevLayers) => {
        const newLayers = [...prevLayers];
        [newLayers[index], newLayers[index + 1]] = [
          newLayers[index + 1],
          newLayers[index],
        ];
        return newLayers;
      });
    }
  };

  const bind = useGesture(
    {
      onDrag: ({ offset: [dx, dy] }) => {
        updateLayerProp(currentLayer, "offsetX", dx);
        updateLayerProp(currentLayer, "offsetY", dy);
      },
      onPinch: ({ offset: [d] }) => {
        updateLayerProp(currentLayer, "scale", d);
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
    renderCanvas();
  }, [layers, canvasWidth, canvasHeight]);

  useEffect(() => {
    if (aspectRatio) {
      setCanvasHeight(canvasWidth / aspectRatio);
    } else {
      setCanvasHeight(1024);
    }
  }, [aspectRatio, canvasWidth]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        renderLayers(ctx, layers, canvas.width, canvas.height);
      }
    }
  };

  const renderLayers = (
    ctx: CanvasRenderingContext2D,
    layers: Layer[],
    width: number,
    height: number,
  ) => {
    const sortedLayers = [...layers].sort((a, b) => a.index - b.index);

    const drawLayer = (layer: Layer) => {
      if (layer.visible) {
        if (layer.type === "image" && layer.image) {
          return new Promise<void>((resolve) => {
            const img = new Image();
            img.src = layer.image;
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
          ctx.fillStyle = layer.color;
          ctx.fillText(layer.text || "", layer.offsetX, layer.offsetY);
          return Promise.resolve();
        }
      }
      return Promise.resolve();
    };

    const drawLayersSequentially = async () => {
      for (const layer of sortedLayers) {
        await drawLayer(layer);
      }
    };

    drawLayersSequentially();
  };

  const handleFill = (image: string) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const img = new Image();
        img.src = image;
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imageUrl = canvas.toDataURL("image/png");
          updateLayerProp(currentLayer, "image", imageUrl);
        };
      }
    }
  };

  const applyFilter = (
    filter: string,
    params: FilterParams,
    option: string,
  ) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const layer = layers.find((layer) => layer.index === currentLayer);

    if (ctx && layer) {
      const img = new Image();
      img.src = layer.image || "";

      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        applyFilterToCanvas(filter, ctx, canvas, params);

        const imageUrl = canvas.toDataURL("image/png");

        if (option === "applyCurrent") {
          updateLayerProp(currentLayer, "image", imageUrl);
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
          setLayers([...layers, newLayer]);
        } else if (option === "mergeAndCreateNew") {
          createMergedLayerWithFilter(filter, params);
        }

        // Ensure the canvas is re-rendered after applying the filter
        renderCanvas();
      };
    }
  };

  const createMergedLayerWithFilter = (
    filter: string,
    params: FilterParams,
  ) => {
    const mergedCanvas = document.createElement("canvas");
    const mergedCtx = mergedCanvas.getContext("2d");

    if (mergedCtx) {
      mergedCanvas.width = canvasWidth;
      mergedCanvas.height = canvasHeight;

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
          setLayers([...layers, newLayer]);

          // Ensure the canvas is re-rendered after creating the merged layer
          renderCanvas();
        }
      }, 1000);
    }
  };

  const addNewLayer = (layer: Layer) => {
    setLayers((prev) => [...prev, { ...layer, index: prev.length }]);
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
            className="bg-yellow-500 hover:bg-yellow-600 py-2 px-4 rounded-md transition"
            onClick={() => setIsAspectRatioModalOpen(true)}
          >
            Aspect Ratio
          </button>
          <button
            className="bg-purple-500 hover:bg-purple-600 py-2 px-4 rounded-md transition"
            onClick={() => setIsFilterModalOpen(true)}
          >
            Filter
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <label className="block font-semibold">Add Image </label>
          <button
            className="bg-gray-700 hover:bg-gray-800 py-2 px-2 rounded-md transition"
            onClick={handleDropZoneClick}
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-grow flex">
        <div className="w-1/4 bg-gray-200 dark:bg-gray-800 p-4 overflow-auto">
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
        <div className="flex-grow flex justify-center items-center bg-gray-300 dark:bg-gray-700 p-4">
          <animated.canvas
            {...bind()}
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="border mb-4 w-full h-auto shadow-lg"
            style={{ x, y, scale }}
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
