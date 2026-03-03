import React, { useState, useEffect } from "react";
import { storageService } from "../services/storageService";
import { ArrowDownIcon, PencilIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { ImageDocument, Layer } from "../types";
import SelectBox from "../components/SelectBox";
import { useTypeSafeNavigate } from "../router/hooks";
import { Virtuoso } from "react-virtuoso";

type SortKey = "createdAt" | "name" | "size";

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

const sortKeyOptions = [
  { value: "createdAt", label: "Newest" },
  { value: "name", label: "Name" },
  { value: "size", label: "Size" },
];

const PhotosPage: React.FC = () => {
  const [documents, setDocuments] = useState<ImageDocument[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [editingDocId, setEditingDocId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");

  const navigate = useTypeSafeNavigate();

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

  const onEditDocument = (documentId: number) => {
    navigate.toImageEdit(documentId);
  };

  const handleDelete = async (id: number) => {
    await storageService.deleteDocument(id);
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const handleStartEditTitle = (doc: ImageDocument) => {
    setEditingDocId(doc.id || null);
    setEditingTitle(doc.name);
  };

  const handleCancelEditTitle = () => {
    setEditingDocId(null);
    setEditingTitle("");
  };

  const handleSaveTitle = async (id: number, newTitle: string) => {
    if (!newTitle.trim()) {
      handleCancelEditTitle();
      return;
    }

    // Update in storage
    await storageService.updateDocumentName(id, newTitle);

    // Update in local state
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, name: newTitle.trim() } : d)));

    handleCancelEditTitle();
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
            <SelectBox options={sortKeyOptions} value={sortKey} onChange={(val) => setSortKey(val as SortKey)} small />

            <button
              className="p-2 rounded border dark:bg-gray-800 dark:border-gray-700"
              title={`Sort ${sortDir === "asc" ? "Descending" : "Ascending"}`}
              onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
            >
              <ArrowDownIcon className={`w-4 h-4 inline transition-transform ${sortDir === "asc" ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {processedDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border rounded-md p-8 bg-white dark:bg-gray-800">
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-4">No photos found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">{filter ? "Try adjusting your search filter" : "Create a new document to get started"}</p>
          </div>
        ) : (
          <div style={{ height: "calc(100vh - 170px)" }}>
            <Virtuoso
              style={{ height: "100%" }}
              totalCount={processedDocuments.length}
              data={processedDocuments}
              className="photos-list"
              overscan={100}
              itemContent={(_, doc) => {
                // Safety check for invalid document
                if (!doc || !doc.name) {
                  return null;
                }

                return (
                  <div className="border rounded-md p-4 bg-white dark:bg-gray-800 mb-4">
                    <div className="flex justify-between items-center mb-4">
                      {editingDocId === doc.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="flex-1 border border-blue-500 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter new title"
                            autoFocus
                            onKeyPress={(e) => {
                              if (e.key === "Enter" && doc.id) {
                                handleSaveTitle(doc.id, editingTitle);
                              }
                            }}
                          />
                          <button
                            className="text-green-500 hover:text-green-700 transition"
                            onClick={() => doc.id && handleSaveTitle(doc.id, editingTitle)}
                            title="Save title"
                          >
                            <CheckIcon className="w-5 h-5" />
                          </button>
                          <button className="text-red-500 hover:text-red-700 transition" onClick={handleCancelEditTitle} title="Cancel editing">
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <h2 className="font-semibold">{doc.name}</h2>
                          <button
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition ml-2"
                            onClick={() => handleStartEditTitle(doc)}
                            title="Edit title"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <div className="flex space-x-2 ml-4">
                        <button className="text-blue-500" onClick={() => doc.id && onEditDocument(doc.id)}>
                          Edit
                        </button>
                        <button className="text-red-500" onClick={() => doc.id && handleDelete(doc.id)}>
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
                            <img
                              key={index}
                              src={`data:image/png;base64,${layer.image}`}
                              alt="Document Preview"
                              className="max-w-64 max-h-64 rounded-md shadow-md"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                                console.error("Failed to load image preview");
                              }}
                            />
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
                );
              }}
              computeItemKey={(index) => {
                // Safeguard against index being out of bounds
                if (index < 0 || index >= processedDocuments.length) {
                  return `index-${index}`;
                }
                // Use the document's id if available, otherwise use the index
                const doc = processedDocuments[index];
                // Use document id, then created timestamp, then index for more reliable keys
                return doc?.id ? `doc-${doc.id}` : doc?.createdAt ? `time-${doc.createdAt}-${index}` : `index-${index}`;
              }}
              initialItemCount={5}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotosPage;
