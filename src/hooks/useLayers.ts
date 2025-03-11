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

  return { layers, setLayers, updateLayerProp, removeLayer, addNewLayer };
};

export default useLayers;
