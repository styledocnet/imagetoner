import React, { useState, useEffect } from "react";
import { storageService } from "../../services/storageService";
import Sparkline from "../Sparkline";

const SparkWidget: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      const docs = await storageService.getDocuments();
      setDocuments(docs);
    };
    fetchDocuments();
  }, []);

  const sizes = documents.map((doc) => doc.name);
  const usage = documents.map((doc) => doc.id);

  console.log("sizes, usage", sizes, usage);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Size
        </h2>
        <Sparkline data={sizes} />
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Usage
        </h2>
        <Sparkline data={usage} />
      </div>
    </div>
  );
};

export default SparkWidget;
