import React, { useRef, useEffect, useState } from "react";
import { storageService } from "../services/storageService";
import { ArrowDownIcon, PlusIcon, Cog6ToothIcon, CameraIcon } from "@heroicons/react/24/outline";
import { useGesture } from "@use-gesture/react";
import FillImageModal from "../components/FillImageModal";
import AspectRatioModal from "../components/AspectRatioModal";
import FilterModal from "../components/FilterModal";
import LayerSidebar from "../components/LayerSidebar";
import AddLayerModal from "../components/AddLayerModal";
import WebCamInputModal from "../components/WebCamInputModal";
import useLayers from "../hooks/useLayers";
import useDocument from "../hooks/useDocument";
import { renderLayers } from "../utils/canvasUtils";
import { applyFilterToCanvas } from "../utils/filterUtils";
import { useRouter } from "../context/CustomRouter";
import { Document, Layer, FilteredLayer } from "../types";
import Toolbar from "../components/Toolbar";
import WebGLFilterRenderer from "../components/WebGLFilterRenderer";
import { loadShaderSource } from "../utils/glUtils";

const ImageEditPage: React.FC = () => {
  const { layers, setLayers, updateLayerProp, removeLayer, addNewLayer, moveLayerUp, moveLayerDown } = useLayers();
  const [currentLayer, setCurrentLayer] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { documentSize, setDocumentSize, canvasSize, setCanvasSize, aspectRatio, setAspectRatio } = useDocument();
  const [isFillModalOpen, setIsFillModalOpen] = useState(false);
  const [isAspectRatioModalOpen, setIsAspectRatioModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isAddLayerModalOpen, setIsAddLayerModalOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [filteredLayer, setFilteredLayer] = useState<FilteredLayer | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { navigate, currentRoute } = useRouter();

  // calculate canvas size from document size
  const calculateCanvasSize = (docSize: { width: number; height: number }) => {
    const scaleFactor = 0.5; // Scale down for display purposes
    return {
      width: docSize.width * scaleFactor,
      height: docSize.height * scaleFactor,
    };
  };

  // update document size with aspect ratio
  const updateDocumentSizeWithAspectRatio = (newWidth: number) => {
    if (aspectRatio) {
      return {
        width: newWidth,
        height: Math.round(newWidth / aspectRatio),
      };
    }
    return { width: newWidth, height: documentSize.height };
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const documentId = params.get("id");
    if (documentId) {
      loadDocument(parseInt(documentId));
    }
  }, [currentRoute]);

  useEffect(() => {
    setCanvasSize(calculateCanvasSize(documentSize));
  }, [documentSize]);

  useEffect(() => {
    renderCanvas();
  }, [layers, documentSize]);

  // useEffect(() => {
  //   if (aspectRatio) {
  //     setCanvasSize((prevSize) => ({
  //       ...prevSize,
  //       height: prevSize.width / aspectRatio,
  //     }));
  //   } else {
  //     setCanvasSize((prevSize) => ({ ...prevSize, height: 1024 }));
  //   }
  // }, [aspectRatio, canvasSize.width]);

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
        // TODO save Document Size in Props
        setDocumentSize({ width: firstLayer.width, height: firstLayer.height });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          addNewLayer({
            name: "Image Layer",
            index: layers.length,
            image: img.src,
            offsetX: 0,
            offsetY: 0,
            scale: 1,
            type: "image",
            visible: true,
          });
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCamInputClick = () => {
    setIsWebcamOpen(true);
  };

  const handleAspectRatioUpdate = (newAspectRatio: number | null) => {
    setAspectRatio(newAspectRatio);
    if (newAspectRatio) {
      setDocumentSize(updateDocumentSizeWithAspectRatio(documentSize.width));
    }
  };

  const handleExport = () => {
    const originalCanvas = document.createElement("canvas");
    const originalCtx = originalCanvas.getContext("2d");
    if (originalCtx) {
      originalCanvas.width = documentSize.width;
      originalCanvas.height = documentSize.height;
      renderLayers(originalCtx, layers, originalCanvas.width, originalCanvas.height);
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
        if (currentLayer !== null) {
          updateLayerProp(currentLayer, "offsetX", dx);
          updateLayerProp(currentLayer, "offsetY", dy);
        }
      },
      onPinch: ({ offset: [d] }) => {
        if (currentLayer !== null) {
          updateLayerProp(currentLayer, "scale", d);
        }
      },
    },
    {
      drag: {
        from: () => (currentLayer !== null ? [layers[currentLayer].offsetX, layers[currentLayer].offsetY] : [0, 0]),
      },
      pinch: {
        from: () => (currentLayer !== null ? [layers[currentLayer].scale, 0] : [1, 0]),
      },
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

  const applyFilter = async (filter: string, params: any, option: string) => {
    console.log("Applying filter:", filter, "with params:", params, "and option:", option);

    if (filter.startsWith("shader_")) {
      const shaderName = filter.replace("shader_", "");
      const shaderSource = await loadShaderSource(shaderName);
      setFilteredLayer({
        image: layers[currentLayer!].image,
        filter: shaderSource,
        params,
      });
    } else {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const layer = layers.find((layer) => layer.index === currentLayer);

      if (ctx && layer) {
        console.log("Current layer found:", layer);

        const img = new Image();
        img.src = layer.image || "";
        img.onload = () => {
          ctx.clearRect(0, 0, documentSize.width, documentSize.height);
          ctx.drawImage(img, 0, 0, documentSize.width, documentSize.height);
          applyFilterToCanvas(filter, ctx, canvas, params);

          const imageUrl = canvas.toDataURL("image/png");
          console.log("Filtered image URL:", imageUrl);

          if (option === "applyCurrent") {
            console.log("Applying filter to current layer");
            updateLayerProp(currentLayer!, "image", imageUrl);
          } else if (option === "createNew") {
            console.log("Creating new layer with filter");
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
            console.log("Merging and creating new layer with filter");
            createMergedLayerWithFilter(filter, params);
          }

          renderCanvas();
        };
      } else {
        console.error("No current layer or canvas context found");
      }
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
          filterCtx.drawImage(mergedCanvas, 0, 0, filterCanvas.width, filterCanvas.height);
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
      <Toolbar
        onImportImage={handleFileChange}
        onFillBackground={() => setIsFillModalOpen(true)}
        onApplyFilter={() => setIsFilterModalOpen(true)}
        onExport={handleExport}
        onOpenAspectRatioModal={() => setIsAspectRatioModalOpen(true)}
        onOpenWebcamModal={handleCamInputClick}
        currentLayerType={currentLayer !== null ? layers[currentLayer].type : null}
      />
      <div className="flex-grow flex flex-col sm:flex-row-reverse sm:flex-wrap-reverse">
        <div className="flex-grow flex overflow-hidden">
          <LayerSidebar
            expanded={isSidebarOpen}
            onToggle={() => setSidebarOpen((v) => !v)}
            layers={layers}
            currentLayer={currentLayer}
            setCurrentLayer={setCurrentLayer}
            setLayerProp={updateLayerProp}
            removeLayer={removeLayer}
            moveLayerUp={moveLayerUp}
            moveLayerDown={moveLayerDown}
            setIsAddLayerModalOpen={setIsAddLayerModalOpen}
          />

          <div className="flex-grow overflow-auto bg-gray-300 dark:bg-gray-700 p-4">
            <div className="w-full h-full max-w-[90%] max-h-[80vh] mx-auto flex items-center justify-center relative">
              <canvas
                {...bind()}
                ref={canvasRef}
                width={documentSize.width}
                height={documentSize.height}
                className="w-full h-auto object-contain border shadow-lg"
                style={{
                  aspectRatio: `${documentSize.width} / ${documentSize.height}`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 dark:bg-gray-700 text-white p-4 flex justify-between items-center shadow-md">
        <button className="bg-blue-500 hover:bg-blue-600 py-2 px-4 rounded-md transition" onClick={handleExport}>
          <ArrowDownIcon className="w-4 h-4 inline-block mr-2" />
          Download
        </button>
        <button className="bg-green-500 hover:bg-green-600 py-2 px-4 rounded-md transition" onClick={handleSave}>
          <ArrowDownIcon className="w-4 h-4 inline-block mr-2" />
          Save
        </button>
      </div>

      {filteredLayer && (
        <WebGLFilterRenderer
          image={filteredLayer.image}
          filter={filteredLayer.filter}
          params={filteredLayer.params}
          width={documentSize.width}
          height={documentSize.height}
          onUpdate={(filteredImage) => {
            updateLayerProp(currentLayer!, "image", filteredImage);
            setFilteredLayer(null);
          }}
        />
      )}

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
        setAspectRatio={handleAspectRatioUpdate}
        documentSize={documentSize}
        setDocumentSize={setDocumentSize}
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
        imageSrc={currentLayer !== null ? layers[currentLayer].image : ""}
      />
      <AddLayerModal isOpen={isAddLayerModalOpen} onClose={() => setIsAddLayerModalOpen(false)} onAddLayer={addNewLayer} />
    </div>
  );
};

export default ImageEditPage;
