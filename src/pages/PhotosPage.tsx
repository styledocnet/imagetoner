import React, { useState, useEffect } from "react";
import { storageService } from "../services/storageService";

const PhotosPage: React.FC = () => {
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

  const handleEdit = (id: number) => {
    // Logic to handle edit
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Photos</h1>
      <input
        type="text"
        placeholder="Filter by name"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-4 p-2 border rounded-md w-full"
      />
      <div className="grid grid-cols-1 gap-4">
        {filteredDocuments.map((doc) => (
          <div key={doc.id} className="p-4 border rounded-md shadow-md">
            <h2 className="font-semibold">{doc.name}</h2>
            <div className="flex space-x-4 mt-2">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700"
                onClick={() => handleDelete(doc.id!)}
              >
                Delete
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                onClick={() => handleEdit(doc.id!)}
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotosPage;
