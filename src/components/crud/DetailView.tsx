import React from "react";

interface DetailViewProps<T> {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: T | null;
}

const DetailView = <T,>({
  isOpen,
  onClose,
  selectedItem,
}: DetailViewProps<T>) => {
  return (
    <div
      className={`fixed top-0 right-0 w-2/4 bg-white h-full shadow-lg z-10 transform transition-transform ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="p-4 overflow-y-auto h-full">
        <button className="text-xl font-bold mb-4" onClick={onClose}>
          Close
        </button>
        <h2 className="text-lg font-semibold mb-4">Detail View</h2>
        {selectedItem ? (
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(selectedItem).map(([key, value]) => (
                <tr key={key}>
                  <td className="font-semibold pr-4 align-text-top">{key}:</td>
                  <td>{value?.toString() || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No item selected</p>
        )}
      </div>
    </div>
  );
};

export default DetailView;
