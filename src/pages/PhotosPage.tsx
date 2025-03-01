import React, { useState, useEffect } from "react";
import { storageService } from "../services/storageService";
import { ArrowDownIcon, FunnelIcon } from "@heroicons/react/24/outline";

const PhotosPage: React.FC<{
  onEditDocument: (documentId: number) => void;
  onFilterLayer: (imageUrl: string) => void;
}> = ({ onEditDocument, onFilterLayer }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    const fetchDocuments = async () => {
      const docs = await storageService.getDocuments();
      setDocuments(docs);
    };
    fetchDocuments();
  }, []);

  const handleDelete = async (id: number) => {
    await storageService.deleteDocument(id);
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const handleDownloadLayer = (image: string) => {
    const link = document.createElement("a");
    link.href = image;
    link.download = "layer-image.png";
    link.click();
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Photos</h1>
      <input
        type="text"
        placeholder="Filter by name"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-4 p-2 border rounded-md w-full"
      />
      <div className="accordion">
        {filteredDocuments.map((doc) => (
          <div key={doc.id} className="accordion-item border rounded-md mb-4">
            <div className="accordion-header flex justify-between items-center p-4 bg-gray-100">
              <h2 className="font-semibold">{doc.name}</h2>
              <div className="flex space-x-2">
                <button
                  className="text-blue-500"
                  onClick={() => onEditDocument(doc.id!)}
                >
                  Edit
                </button>
                <button
                  className="text-red-500"
                  onClick={() => handleDelete(doc.id!)}
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="accordion-body p-4">
              <div className="mb-4">
                <h3 className="font-semibold">Preview:</h3>
                <img
                  src={doc.layers[1]?.image || doc.layers[0]?.image}
                  alt="Document Preview"
                  className="max-w-full rounded-md shadow-md"
                />
              </div>
              <div>
                <h3 className="font-semibold">Layers:</h3>
                {doc.layers.map((layer) => (
                  <div
                    key={layer.index}
                    className="flex justify-between items-center mb-2"
                  >
                    <span>{layer.name}</span>
                    <div className="flex space-x-2">
                      <button
                        className="text-blue-500"
                        onClick={() => onFilterLayer(layer.image!)}
                      >
                        <FunnelIcon className="w-4 h-4" />
                      </button>
                      <button
                        className="text-green-500"
                        onClick={() => handleDownloadLayer(layer.image!)}
                      >
                        <ArrowDownIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotosPage;
