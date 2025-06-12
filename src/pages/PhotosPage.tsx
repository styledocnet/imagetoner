import React, { useState, useEffect } from "react";
import { storageService } from "../services/storageService";
import { ArrowDownIcon } from "@heroicons/react/24/outline";
import { useRouter } from "../context/CustomRouter";
import { ImageDocument, Layer } from "../types";

type SortKey = "createdAt" | "name" | "size";

const itemsPerPage = 5;

const formatSize = (size?: number) => (typeof size === "number" ? `${(size / 1024).toFixed(1)} KB` : "—");

const formatDate = (date?: string) => (date ? new Date(date).toLocaleString() : "—");

function getLayerSize(layer: Layer): number {
  // Estimate size of a layer (text or image)
  if (layer.type === "text" && layer.text) {
    return new Blob([layer.text]).size;
  }
  if (layer.image) {
    // Base64 string size estimate: 1 char = 1 byte, but base64 = 4/3 of real bytes
    // To get bytes: base64 length * 3/4
    const b64 = layer.image;
    return Math.floor((b64.length * 3) / 4);
  }
  return 0;
}

function computeDocumentSize(doc: ImageDocument): number {
  // Sum up all layer sizes for a document
  if (!doc.layers) return 0;
  return doc.layers.reduce((sum, layer) => sum + getLayerSize(layer), 0);
}

const PhotosPage: React.FC = () => {
  const [documents, setDocuments] = useState<ImageDocument[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const { navigate } = useRouter();

  useEffect(() => {
    // On mount, load docs and compute sizes
    const fetchDocuments = async () => {
      const docs = await storageService.getDocuments();
      // Attach computed size to each doc
      const docsWithSizes = docs.map((doc) => ({
        ...doc,
        size: computeDocumentSize(doc),
      }));
      setDocuments(docsWithSizes);
      setTotalPages(Math.max(1, Math.ceil(docsWithSizes.length / itemsPerPage)));
    };
    fetchDocuments();
  }, []);

  const getSortFn = (key: SortKey) => {
    return (a: ImageDocument, b: ImageDocument) => {
      if (key === "name") return a.name.localeCompare(b.name);
      if (key === "size") return computeDocumentSize(a) - computeDocumentSize(b);
      if (key === "createdAt") return new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime();
      return 0;
    };
  };

  const processedDocuments = documents.filter((doc) => doc.name.toLowerCase().includes(filter.toLowerCase())).sort(getSortFn(sortKey));

  if (sortDir === "desc") {
    processedDocuments.reverse();
  }

  useEffect(() => {
    // Pagination
    setTotalPages(Math.max(1, Math.ceil(processedDocuments.length / itemsPerPage)));
    if (page > Math.ceil(processedDocuments.length / itemsPerPage)) {
      setPage(1);
    }
    // eslint-disable-next-line
  }, [processedDocuments.length]);

  const paginatedDocuments = processedDocuments.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const onEditDocument = (documentId: number) => {
    navigate(`image_edit?id=${documentId}`);
  };

  const handleDelete = async (id: number) => {
    await storageService.deleteDocument(id);
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const handleDownloadLayer = (layer: Layer) => {
    if (layer.type === "text" && layer.text) {
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

  const getLayerTypeTag = (layer: Layer) => {
    return (
      <span
        className={`inline-block text-xs rounded-full px-2 py-0.5 ml-2
        ${
          layer.type === "text"
            ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
            : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
        }`}
      >
        {layer.type}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-4">Photos</h1>

        {/* Sort and filter bar */}
        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <input
            type="text"
            placeholder="Filter by name"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-2 border rounded-md flex-1 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
          />
          <div className="flex gap-2 items-center">
            <select
              className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
            >
              <option value="createdAt">Newest</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
            </select>
            <button
              className="p-2 rounded border dark:bg-gray-800 dark:border-gray-700"
              title={`Sort ${sortDir === "asc" ? "Descending" : "Ascending"}`}
              onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
            >
              <ArrowDownIcon className={`w-4 h-4 inline transition-transform ${sortDir === "asc" ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {paginatedDocuments.map((doc) => (
            <div key={doc.id} className="border rounded-md p-4 bg-white dark:bg-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">{doc.name}</h2>
                <div className="flex space-x-2">
                  <button className="text-blue-500" onClick={() => onEditDocument(doc.id!)}>
                    Edit
                  </button>
                  <button className="text-red-500" onClick={() => handleDelete(doc.id!)}>
                    Delete
                  </button>
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex flex-wrap gap-4 mb-3">
                <span>
                  Size: {"\u2248"} {formatSize(computeDocumentSize(doc))}
                </span>
                <span>Created: {formatDate(doc.createdAt)}</span>
                <span>Updated: {formatDate(doc.updatedAt)}</span>
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
                      <img key={index} src={`data:image/png;base64,${layer.image}`} alt="Document Preview" className="max-w-64 max-h-64 rounded-md shadow-md" />
                    ),
                  )
                )}
              </div>
              <div>
                <h3 className="font-semibold">Layers:</h3>
                {doc.layers.map((layer) => (
                  <div key={layer.index} className="flex justify-between items-center mb-2">
                    <span>
                      {layer.name}
                      {getLayerTypeTag(layer)}
                    </span>
                    <div className="flex space-x-2">
                      <button className="text-green-500" onClick={() => handleDownloadLayer(layer)}>
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
          <button className="bg-gray-700 text-white py-2 px-4 rounded-md" disabled={page === 1} onClick={() => setPage(page - 1)}>
            Previous
          </button>
          <span className="text-gray-700 dark:text-gray-300">
            Page {page} of {totalPages}
          </span>
          <button className="bg-gray-700 text-white py-2 px-4 rounded-md" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotosPage;
