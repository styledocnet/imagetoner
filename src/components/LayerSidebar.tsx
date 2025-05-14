import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import LayerAccordion from "./LayerAccordion";

const LayerSidebar = ({ expanded, onToggle, layers, currentLayer, setCurrentLayer, setLayerProp, removeLayer, moveLayerUp, moveLayerDown }: any) => {
  return (
    <aside className={"transition-all duration-300 bg-gray-300 dark:bg-gray-700 h-full shadow-lg" + (expanded ? "min-w-fit w-96" : "w-14")}>
      <div className="flex items-center justify-between p-2 border-b border-gray-300 dark:border-gray-700">
        <button className="btn btn-ghost p-1" onClick={onToggle} title="Toggle Layers Panel">
          {expanded ? <ChevronLeftIcon className="w-5 h-5" /> : <ChevronRightIcon className="w-5 h-5" />}
        </button>
        {expanded && <span className="text-sm font-semibold">Layers</span>}
      </div>

      {expanded ? (
        <div className="p-2 overflow-y-auto max-h-[calc(100vh-4rem)]">
          <LayerAccordion
            layers={layers}
            currentLayer={currentLayer}
            setCurrentLayer={setCurrentLayer}
            setLayerProp={setLayerProp}
            removeLayer={removeLayer}
            moveLayerUp={moveLayerUp}
            moveLayerDown={moveLayerDown}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center p-2 gap-2">
          {layers.map((layer: any) => (
            <div
              key={layer.index}
              className={
                "w-8 h-8 bg-gray-400 rounded-full cursor-pointer hover:ring-2 ring-blue-500" + (currentLayer === layer.index && "ring-2 ring-blue-600")
              }
              title={layer.name}
              onClick={() => setCurrentLayer(layer.index)}
            />
          ))}
        </div>
      )}
    </aside>
  );
};

export default LayerSidebar;
