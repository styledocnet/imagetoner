import React, { useState, useEffect } from "react";
import { storageService } from "../services/storageService";
import { ArrowDownIcon } from "@heroicons/react/24/outline";
import { useRouter } from "../context/CustomRouter";

const PhotosPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 5;
  const { navigate } = useRouter();

  const onEditDocument = (documentId: number) => {
    navigate(`image_edit?id=${documentId}`);
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      const docs = await storageService.getDocuments();
      setDocuments(docs);
      setTotalPages(Math.ceil(docs.length / itemsPerPage));
    };
    fetchDocuments();
  }, []);

  const handleDelete = async (id: number) => {
    await storageService.deleteDocument(id);
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    setTotalPages(Math.ceil(documents.length / itemsPerPage));
  };

  const handleDownloadLayer = (layer: Layer) => {
    if (layer.type === "text") {
      const blob = new Blob([layer.text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${layer.name}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (layer.image) {
      const link = document.createElement("a");
      link.href = `data:image/png;base64,${layer.image}`;
      link.download = `${layer.name}.png`;
      link.click();
    }
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(filter.toLowerCase()),
  );

  const paginatedDocuments = filteredDocuments.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-4">Photos</h1>
        <input
          type="text"
          placeholder="Filter by name"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="mb-4 p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
        />
        <div className="space-y-4">
          {paginatedDocuments.map((doc) => (
            <div
              key={doc.id}
              className="border rounded-md p-4 bg-white dark:bg-gray-800"
            >
              <div className="flex justify-between items-center mb-4">
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
              <div className="mb-4">
                <h3 className="font-semibold">Preview:</h3>
                {doc.layers.length === 0 ? (
                  <p>No preview available</p>
                ) : (
                  doc.layers.map((layer, index) =>
                    layer.type === "text" ? (
                      <div key={index} className="text-preview text-xs">
                        <p>{layer.text}</p>
                      </div>
                    ) : (
                      <img
                        key={index}
                        src={`data:image/png;base64,${layer.image}`}
                        alt="Document Preview"
                        className="max-w-64 max-h-64 rounded-md shadow-md"
                      />
                    ),
                  )
                )}
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
                        className="text-green-500"
                        onClick={() => handleDownloadLayer(layer)}
                      >
                        <ArrowDownIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4">
          <button
            className="bg-gray-700 text-white py-2 px-4 rounded-md"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <span className="text-gray-700 dark:text-gray-300">
            Page {page} of {totalPages}
          </span>
          <button
            className="bg-gray-700 text-white py-2 px-4 rounded-md"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotosPage;
