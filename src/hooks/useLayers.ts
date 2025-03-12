import { useState } from "react";
import { Layer } from "../types";

const useLayers = () => {
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

  const addNewLayer = (layer: Layer) => {
    setLayers((prevLayers) => [
      ...prevLayers,
      { ...layer, index: prevLayers.length },
    ]);
  };

  const moveLayerUp = (layerIndex: number) => {
    setLayers((prevLayers) => {
      const index = prevLayers.findIndex((layer) => layer.index === layerIndex);
      if (index > 0) {
        const newLayers = [...prevLayers];
        [newLayers[index - 1], newLayers[index]] = [
          newLayers[index],
          newLayers[index - 1],
        ];
        return newLayers;
      }
      return prevLayers;
    });
  };

  const moveLayerDown = (layerIndex: number) => {
    setLayers((prevLayers) => {
      const index = prevLayers.findIndex((layer) => layer.index === layerIndex);
      if (index < prevLayers.length - 1) {
        const newLayers = [...prevLayers];
        [newLayers[index + 1], newLayers[index]] = [
          newLayers[index],
          newLayers[index + 1],
        ];
        return newLayers;
      }
      return prevLayers;
    });
  };

  return {
    layers,
    setLayers,
    updateLayerProp,
    removeLayer,
    addNewLayer,
    moveLayerUp,
    moveLayerDown,
  };
};

export default useLayers;
