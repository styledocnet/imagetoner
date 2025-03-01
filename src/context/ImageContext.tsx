import React, { createContext, useContext, useState, useEffect } from "react";
import { signal } from "@preact/signals-react";
import apiService from "../services/apiService";
import { storageService } from "../services/storageService";

interface Layer {
  name: string;
  index: number;
  image: string | null;
  offsetX: number;
  offsetY: number;
  scale: number;
}

interface ImageContextProps {
  layers: Layer[];
  currentLayer: number;
  loading: boolean;
  zoom: number;
  canvasWidth: number;
  canvasHeight: number;
  aspectRatio: number | null;
  setLayers: (layers: Layer[]) => void;
  setCurrentLayer: (index: number) => void;
  setLoading: (loading: boolean) => void;
  setZoom: (zoom: number) => void;
  setCanvasWidth: (width: number) => void;
  setCanvasHeight: (height: number) => void;
  setAspectRatio: (ratio: number | null) => void;
  loadDocument: (documentId: number) => void;
  handleRemoveBG: () => void;
}

const ImageContext = createContext<ImageContextProps | null>(null);

export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [layers, setLayers] = useState<Layer[]>([
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
  const loading = signal(false);
  const zoom = signal(1);
  const canvasWidth = signal(800);
  const canvasHeight = signal(600);
  const aspectRatio = signal<number | null>(null);

  const loadDocument = async (documentId: number) => {
    const document = await storageService.getDocument(documentId);
    if (document) {
      setLayers(document.layers);
    }
  };

  const handleRemoveBG = async () => {
    const selectedLayer = layers.find((layer) => layer.index === currentLayer);
    if (!selectedLayer?.image) return;

    loading.value = true;
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
      loading.value = false;
    }
  };

  return (
    <ImageContext.Provider
      value={{
        layers,
        currentLayer,
        loading: loading.value,
        zoom: zoom.value,
        canvasWidth: canvasWidth.value,
        canvasHeight: canvasHeight.value,
        aspectRatio: aspectRatio.value,
        setLayers,
        setCurrentLayer,
        setLoading: (value) => (loading.value = value),
        setZoom: (value) => (zoom.value = value),
        setCanvasWidth: (value) => (canvasWidth.value = value),
        setCanvasHeight: (value) => (canvasHeight.value = value),
        setAspectRatio: (value) => (aspectRatio.value = value),
        loadDocument,
        handleRemoveBG,
      }}
    >
      {children}
    </ImageContext.Provider>
  );
};

export const useImage = () => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error("useImage must be used within an ImageProvider");
  }
  return context;
};
