import React, { useState, useEffect } from "react";
import { storageService } from "../../services/storageService";
import { useRouter } from "../../context/CustomRouter";

const PhotosWidget: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const { navigate } = useRouter();

  const onEditDocument = (documentId: number) => {
    navigate(`image_edit?id=${documentId}`);
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      const docs = await storageService.getDocuments();
      setDocuments(docs);
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
              onClick={() => onEditDocument(doc.id!)}
              style={{ cursor: "pointer" }}
            >
              <div className="mb-4">
                <h2 className="font-semibold text-center">{doc.name}</h2>
                <img
                  src={`data:image/png;base64,${doc.layers[0]?.image}`}
                  alt="Document Preview"
                  className="w-full h-auto rounded-md shadow-md"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhotosWidget;
