import React, { useState, useEffect, useCallback } from "react";
import { storageService } from "../../services/storageService";
import { ImageDocument } from "../../types";
import { useTypeSafeNavigate } from "../../router/hooks";
import { VirtuosoGrid } from "react-virtuoso";

const PhotosWidget: React.FC = () => {
  const [documents, setDocuments] = useState<ImageDocument[]>([]);
  const navigate = useTypeSafeNavigate();

  const onEditDocument = (documentId?: number) => {
    if (!documentId) {
      console.error("Document ID is missing or invalid.");
      return;
    }
    navigate.toImageEdit(documentId);
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const docs = await storageService.getDocuments();
        console.log("Fetched Documents:", docs); // Debugging log
        setDocuments(docs || []);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };
    fetchDocuments();
  }, []);

  // Item renderer for the grid - memoized to prevent unnecessary re-renders
  const ItemRenderer = useCallback(
    ({ item: doc }: { item: ImageDocument }) => {
      // Safety check for invalid document
      if (!doc || !doc.name) {
        return null;
      }

      return (
        <div
          className="mb-4 mx-2 border rounded-md p-4 bg-white dark:bg-gray-800"
          onClick={() => doc.id && onEditDocument(doc.id)}
          style={{ cursor: "pointer" }}
        >
          <div className="mb-4">
            <h2 className="font-semibold text-center">{doc.name || "Untitled Document"}</h2>
            {doc.layers && doc.layers.length > 0 && doc.layers[0]?.image ? (
              <img
                src={`data:image/png;base64,${doc.layers[0]?.image}`}
                alt="Document Preview"
                className="w-full h-auto rounded-md shadow-md"
                loading="lazy"
                onError={(e) => {
                  // Handle image load errors
                  (e.target as HTMLImageElement).style.display = "none";
                  console.error("Failed to load image preview");
                }}
              />
            ) : (
              <p className="text-center text-gray-500">No Preview Available</p>
            )}
          </div>
        </div>
      );
    },
    [onEditDocument],
  );

  return (
    <div className="text-gray-900 dark:text-gray-100">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-4">Photos</h1>
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border rounded-md p-8 bg-white dark:bg-gray-800">
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-4">No photos found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Create a new document to get started</p>
          </div>
        ) : (
          <div style={{ height: "calc(100vh - 100px)" }}>
            <VirtuosoGrid
              style={{ height: "100%" }}
              totalCount={documents.length}
              data={documents}
              itemContent={(_, doc) => (doc ? <ItemRenderer item={doc} /> : null)}
              listClassName="virtuoso-grid-list"
              itemClassName="virtuoso-grid-item"
              overscan={200}
              computeItemKey={(index) => {
                // Safeguard against index being out of bounds
                if (index < 0 || index >= documents.length) {
                  return `index-${index}`;
                }
                const doc = documents[index];
                // Triple safety check - use document id, then created timestamp, then index
                return doc?.id ? `doc-${doc.id}` : doc?.createdAt ? `time-${doc.createdAt}-${index}` : `index-${index}`;
              }}
              fixedItemHeight={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotosWidget;
