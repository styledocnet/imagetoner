import React, { useRef, useEffect, useState } from "react";
import { loadCurrentStyleId, storageService } from "../services/storageService";
import { ArrowDownIcon } from "@heroicons/react/24/outline";
import { useGesture } from "@use-gesture/react";
import FillImageModal from "../components/FillImageModal";
import AspectRatioModal from "../components/AspectRatioModal";
import LayerSidebar from "../components/LayerSidebar";
import AddLayerModal from "../components/AddLayerModal";
import WebCamInputModal from "../components/WebCamInputModal";
import useDocument from "../hooks/useDocument";
import { renderLayers } from "../utils/canvasUtils";
import { useRouter } from "../context/CustomRouter";
import Toolbar from "../components/Toolbar";
import { useLayerContext } from "../context/LayerContext";
import FilterDrawer from "../components/FilterDrawer";
import { BrandStyle } from "../types";
// import { removeBackground } from "../utils/removeBackground";

const ImageEditPage: React.FC = () => {
  const { layers, setLayers, currentLayer, setCurrentLayer, restoreOriginalLayer, updateLayerProp, addNewLayer, removeLayer, moveLayerUp, moveLayerDown } =
    useLayerContext();
  const { documentSize, setDocumentSize, setCanvasSize, aspectRatio, setAspectRatio } = useDocument();
  const [isFillModalOpen, setIsFillModalOpen] = useState(false);
  const [isAspectRatioModalOpen, setIsAspectRatioModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isRemBgModalOpen, setIsRemBgModalOpen] = useState(false);
  const [currentStyle, setCurrentStyle] = useState<BrandStyle | null>(null);

  // const [isProcessing, setIsProcessing] = useState(false);
  const [isAddLayerModalOpen, setIsAddLayerModalOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { navigate, currentRoute } = useRouter();

  isRemBgModalOpen;
  // Calculate canvas size from document size
  const calculateCanvasSize = (docSize: { width: number; height: number }) => {
    const scaleFactor = 0.5; // Scale down for display purposes
    return {
      width: docSize.width * scaleFactor,
      height: docSize.height * scaleFactor,
    };
  };

  // Update document size with aspect ratio
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
    // Load and set the current style once on mount (or when needed)
    const styleId = loadCurrentStyleId();
    if (styleId) {
      storageService.getStyle(styleId).then((style) => {
        setCurrentStyle(style ?? null);
      });
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const documentId = params.get("id");
    if (documentId) {
      loadDocument(parseInt(documentId, 10));
    }
  }, [currentRoute]);

  useEffect(() => {
    setCanvasSize(calculateCanvasSize(documentSize));
  }, [documentSize]);

  useEffect(() => {
    renderCanvas();
  }, [layers, documentSize]);

  // ensure currentLayer is valid whenever layers are updated
  useEffect(() => {
    if (currentLayer === null || currentLayer < 0 || currentLayer >= layers.length) {
      setCurrentLayer(layers.length > 0 ? layers.length - 1 : null);
    }
  }, [layers, currentLayer]);

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
        setDocumentSize({ width: updatedLayers[0].width, height: updatedLayers[0].height });
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

  const handleAspectRatioUpdate = (newAspectRatio: number | null) => {
    setAspectRatio(newAspectRatio);
    if (newAspectRatio) {
      setDocumentSize(updateDocumentSizeWithAspectRatio(documentSize.width));
    }
  };

  // const handleRemoveBackground = async () => {
  //   if (currentLayer === null || !layers[currentLayer]?.image) {
  //     alert("Please select a layer with an image.");
  //     return;
  //   }

  //   setIsProcessing(true);

  //   try {
  //     const newImage = await removeBackground(layers[currentLayer].image!);
  //     updateLayerProp(currentLayer, "image", newImage);
  //     alert("Background removed successfully!");
  //   } catch (error) {
  //     console.error("Failed to remove background:", error);
  //     alert("An error occurred while removing the background.");
  //   } finally {
  //     setIsProcessing(false);
  //     setIsRemBgModalOpen(false);
  //   }
  // };

  const handleExport = async () => {
    const originalCanvas = document.createElement("canvas");
    const originalCtx = originalCanvas.getContext("2d");
    if (originalCtx) {
      originalCanvas.width = documentSize.width;
      originalCanvas.height = documentSize.height;
      await renderLayers(originalCtx, layers, originalCanvas.width, originalCanvas.height);
      const link = document.createElement("a");
      link.href = originalCanvas.toDataURL("image/png");
      link.download = "exported-image.png";
      link.click();
    }
  };

  const handleSave = async () => {
    const document = {
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
    if (!canvas) {
      console.error("Canvas not found.");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Canvas context not found.");
      return;
    }

    // this was a current layer check
    // if (currentLayer === null || currentLayer < 0 || currentLayer >= layers.length) {
    //   console.error("Invalid currentLayer index:", currentLayer);
    //   return;
    // }

    // const layer = layers[currentLayer];
    // if (!layer || !layer.image) {
    //   console.error("Invalid or missing layer data:", layer);
    //   return;
    // }

    canvas.width = documentSize.width;
    canvas.height = documentSize.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderLayers(ctx, layers, documentSize.width, documentSize.height);
  };

  // const applyFilter = async (filter: string, params: any, option: string, isPreview = false) => {
  //   console.log(`Applying filter: ${filter}, params:`, params, `option: ${option}`);

  //   const canvas = canvasRef.current;
  //   if (!canvas) {
  //     console.error("Canvas not found.");
  //     return;
  //   }

  //   if (currentLayer === null || currentLayer >= layers.length) {
  //     console.error("Current layer index is invalid or not found:", currentLayer);
  //     return;
  //   }

  //   const layer = layers[currentLayer];
  //   if (!layer || !layer.image) {
  //     console.error("Layer image not found. Current Layer:", layer);
  //     return;
  //   }

  //   console.log("Current layer found:", layer);

  //   const img = new Image();
  //   img.src = layer.image;

  //   img.onload = async () => {
  //     console.log("Image loaded for filtering:", img.src);

  //     // Resize canvas to match image dimensions
  //     canvas.width = img.width;
  //     canvas.height = img.height;

  //     if (filter.startsWith("shader_")) {
  //       console.log(`Applying WebGL shader filter: ${filter}`);
  //       try {
  //         // Ensure shader name is extracted correctly
  //         const shaderName = filter.replace("shader_", ""); // Remove the prefix
  //         const shaderSource = await loadShaderSource(shaderName);

  //         applyShaderFilter(gl, img, shaderSource, params);

  //         // Ensure canvas is still available after applying the filter
  //         if (!canvasRef.current) {
  //           console.error("Canvas reference is null after applying shader filter.");
  //           return;
  //         }

  //         // Generate the filtered image immediately
  //         const filteredImage = canvasRef.current.toDataURL("image/png");
  //         console.log("Filtered image generated:", filteredImage);

  //         if (!isPreview) {
  //           if (option === "applyCurrent") {
  //             updateLayerProp(currentLayer, "image", filteredImage);
  //           } else if (option === "createNew") {
  //             addNewLayer({
  //               name: `${filter} Layer`,
  //               index: layers.length,
  //               image: filteredImage,
  //               offsetX: 0,
  //               offsetY: 0,
  //               scale: 1,
  //               type: "image",
  //               visible: true,
  //             });
  //           }

  //           renderCanvas();
  //         }
  //       } catch (error) {
  //         console.error("Error applying WebGL shader filter:", error);
  //       }
  //     } else {
  //       console.log(`Applying Canvas filter: ${filter}`);

  //       const ctx = canvas.getContext("2d");
  //       if (!ctx) {
  //         console.error("Canvas 2D context not found.");
  //         return;
  //       }

  //       ctx.clearRect(0, 0, canvas.width, canvas.height);
  //       ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  //       await applyFilterToCanvas(filter, ctx, canvas, params);

  //       if (!isPreview) {
  //         const imageUrl = canvas.toDataURL("image/png");

  //         if (option === "applyCurrent") {
  //           updateLayerProp(currentLayer, "image", imageUrl);
  //         } else if (option === "createNew") {
  //           addNewLayer({
  //             name: `${filter} Layer`,
  //             index: layers.length,
  //             image: imageUrl,
  //             offsetX: 0,
  //             offsetY: 0,
  //             scale: 1,
  //             type: "image",
  //             visible: true,
  //           });
  //         }

  //         renderCanvas();
  //       }
  //     }
  //   };

  //   img.onerror = () => {
  //     console.error("Failed to load the image.");
  //   };
  // };
  return (
    <div className="w-full h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <Toolbar
        onImportImage={handleFileChange}
        onFillBackground={() => setIsFillModalOpen(true)}
        onApplyFilter={() => setIsFilterModalOpen(true)}
        onApplyRemBg={() => setIsRemBgModalOpen(true)}
        onExport={handleExport}
        onOpenAspectRatioModal={() => setIsAspectRatioModalOpen(true)}
        onOpenWebcamModal={() => setIsWebcamOpen(true)}
        currentLayerType={currentLayer !== null && currentLayer >= 0 && currentLayer < layers.length ? layers[currentLayer].type : null}
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
        brandStyle={currentStyle}
        isOpen={isFillModalOpen}
        onClose={() => setIsFillModalOpen(false)}
        canvasSize={documentSize}
        onFill={(image) => {
          if (!image) {
            console.error("Invalid image data for Fill Layer.");
            return;
          }
          addNewLayer({
            name: "Fill Layer",
            index: layers.length,
            image: image,
            offsetX: 0,
            offsetY: 0,
            scale: 1,
            type: "image",
            visible: true,
          });
          setCurrentLayer(layers.length);
        }}
      />
      <FilterDrawer
        brandStyle={currentStyle}
        mainCanvasRef={canvasRef}
        isOpen={isFilterModalOpen}
        onClose={() => {
          restoreOriginalLayer();
          setIsFilterModalOpen(false);
        }}
        onApply={(filteredImage, mode) => {
          if (filteredImage) {
            if (mode === "applyCurrent" && currentLayer !== null) {
              updateLayerProp(currentLayer, "image", filteredImage);
            } else if (mode === "createNew") {
              addNewLayer({
                name: "Filtered Layer",
                index: layers.length,
                image: filteredImage,
                offsetX: 0,
                offsetY: 0,
                scale: 1,
                type: "image",
                visible: true,
              });
            }
            renderCanvas();
          }
        }}
        imageSrc={currentLayer !== null ? layers[currentLayer]?.image || "" : ""}
        documentSize={documentSize}
      />

      {/* <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => {
          restoreOriginalLayer();
          setIsFilterModalOpen(false);
        }}
        applyFilter={applyFilter}
        imageSrc={currentLayer !== null ? layers[currentLayer].image : ""}
      /> */}
      <AddLayerModal
        isOpen={isAddLayerModalOpen}
        onClose={() => setIsAddLayerModalOpen(false)}
        onAddLayer={(newLayer) => {
          addNewLayer(newLayer);
          setIsAddLayerModalOpen(false);
        }}
      />
    </div>
  );
};

export default ImageEditPage;
