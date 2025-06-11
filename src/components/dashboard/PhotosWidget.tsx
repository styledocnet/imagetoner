import React, { useState, useEffect } from "react";
import { storageService } from "../../services/storageService";
import { useRouter } from "../../context/CustomRouter";
import { ImageDocument } from "../../types";

const PhotosWidget: React.FC = () => {
  const [documents, setDocuments] = useState<ImageDocument[]>([]);
  const { navigate } = useRouter();

  const onEditDocument = (documentId?: number) => {
    if (!documentId) {
      console.error("Document ID is missing or invalid.");
      return;
    }
    navigate(`image_edit?id=${documentId}`);
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

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100 p-4">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-4">Photos</h1>
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="mb-4 break-inside-avoid border rounded-md p-4 bg-white dark:bg-gray-800"
              onClick={() => doc.id && onEditDocument(doc.id)}
              style={{ cursor: "pointer" }}
            >
              <div className="mb-4">
                <h2 className="font-semibold text-center">{doc.name || "Untitled Document"}</h2>
                {doc.layers && doc.layers[0]?.image ? (
                  <img src={`data:image/png;base64,${doc.layers[0]?.image}`} alt="Document Preview" className="w-full h-auto rounded-md shadow-md" />
                ) : (
                  <p className="text-center text-gray-500">No Preview Available</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhotosWidget;
