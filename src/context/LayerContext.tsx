import React, { createContext, useContext, useState, ReactNode } from "react";
import { Layer } from "../types";

interface LayerContextProps {
  layers: Layer[];
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  currentLayer: number | null;
  setCurrentLayer: React.Dispatch<React.SetStateAction<number | null>>;
  addNewLayer: (newLayer: Layer) => void;
  removeLayer: (index: number) => void;
  moveLayerUp: (index: number) => void;
  moveLayerDown: (index: number) => void;
  restoreOriginalLayer: () => void;
  updateLayerProp: (index: number, prop: string, value: any) => void;
  originalImage?: string | null;
}

const LayerContext = createContext<LayerContextProps | undefined>(undefined);

export const LayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [currentLayer, setCurrentLayer] = useState<number | null>(null);

  const addNewLayer = (layer: Layer) => {
    // setLayers((prev) => [...prev, { ...newLayer, index: prev.length }]);
    const validatedLayer = {
      ...layer,
      offsetX: isFinite(layer.offsetX) ? layer.offsetX : 0,
      offsetY: isFinite(layer.offsetY) ? layer.offsetY : 0,
      scale: isFinite(layer.scale) && layer.scale > 0 ? layer.scale : 1,
    };

    setLayers([...layers, validatedLayer]);
  };

  const removeLayer = (index: number) => {
    setLayers((prev) => prev.filter((_, i) => i !== index));

    if (currentLayer === index) {
      setCurrentLayer(null);
    } else if (currentLayer !== null && currentLayer > index) {
      setCurrentLayer(currentLayer - 1);
    }
  };

  // Move a layer up in the stack
  const moveLayerUp = (index: number) => {
    if (index > 0) {
      setLayers((prev) => {
        const newLayers = [...prev];
        const temp = newLayers[index - 1];
        newLayers[index - 1] = newLayers[index];
        newLayers[index] = temp;
        return newLayers;
      });
    }
  };

  const moveLayerDown = (index: number) => {
    if (index < layers.length - 1) {
      setLayers((prev) => {
        const newLayers = [...prev];
        const temp = newLayers[index + 1];
        newLayers[index + 1] = newLayers[index];
        newLayers[index] = temp;
        return newLayers;
      });
    }
  };

  const restoreOriginalLayer = () => {
    if (currentLayer !== null) {
      const layer = layers[currentLayer];
      if (layer.originalImage) {
        setLayers((prev) => prev.map((l, index) => (index === currentLayer ? { ...l, image: l.originalImage ?? null, originalImage: null } : l)));
      }
    }
  };

  const updateLayerProp = (index: number, prop: string, value: any) => {
    setLayers((prev) => prev.map((layer, i) => (i === index ? { ...layer, [prop]: value } : layer)));
  };

  return (
    <LayerContext.Provider
      value={{
        layers,
        setLayers,
        currentLayer,
        setCurrentLayer,
        addNewLayer,
        removeLayer,
        moveLayerUp,
        moveLayerDown,
        restoreOriginalLayer,
        updateLayerProp,
      }}
    >
      {children}
    </LayerContext.Provider>
  );
};

export const useLayerContext = () => {
  const context = useContext(LayerContext);
  if (!context) {
    throw new Error("useLayerContext must be used within a LayerProvider");
  }
  return context;
};
