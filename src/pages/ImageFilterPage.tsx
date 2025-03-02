import React, { useState } from "react";
import apiService from "../services/apiService";
import { ArrowDownIcon } from "@heroicons/react/24/outline";

const ImageFilterPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filter, setFilter] = useState("vignette");
  const [params, setParams] = useState({
    strength: 0.5,
    sizeFactor: 1.5,
    color: "#000000",
    color1: "#FF1133",
    color2: "#770099",
    color3: "#FFFFFF",
  });
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value);
  };

  const handleParamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ ...params, [e.target.name]: e.target.value });
  };

  const handleApplyFilter = async () => {
    if (!selectedFile) {
      alert("Please select an image.");
      return;
    }

    setLoading(true);
    try {
      const imageUrl = await apiService.applyFilter(
        selectedFile,
        filter,
        params,
      );
      setOutputImage(imageUrl);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (outputImage) {
      const link = document.createElement("a");
      link.href = outputImage;
      link.download = "filtered-image.png";
      link.click();
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-current p-6 rounded-lg shadow-md">
      {/* <h1 className="text-2xl font-bold mb-4 text-center">Image Filter</h1> */}

      <input
        type="file"
        className="block w-full mb-4 border p-2 rounded-md"
        accept="image/*"
        onChange={handleFileChange}
      />

      <label className="block mb-2 font-semibold">Select Filter:</label>
      <select
        className="w-full border p-2 rounded-md mb-4"
        value={filter}
        onChange={handleFilterChange}
      >
        <option value="vignette">Vignette</option>
        <option value="duotone">Duotone</option>
        <option value="mono">Monotone</option>
        <option value="tritone">Tritone</option>
        <option value="quadtone">Quadtone</option>
      </select>

      {filter === "vignette" && (
        <div className="text-gray-800 dark:text-gray-200">
          <label className="block font-semibold">Strength (0 - 1):</label>
          <input
            type="range"
            name="strength"
            min="0"
            max="1"
            step="0.1"
            value={params.strength}
            className="w-full"
            onChange={handleParamChange}
          />
          <label className="block font-semibold">Size Factor (1 - 2):</label>
          <input
            type="range"
            name="sizeFactor"
            min="1"
            max="2"
            step="0.1"
            value={params.sizeFactor}
            className="w-full"
            onChange={handleParamChange}
          />
          <label className="block font-semibold">Color:</label>
          <input
            type="color"
            name="color"
            value={params.color}
            className="w-full"
            onChange={handleParamChange}
          />
        </div>
      )}

      {filter === "mono" && (
        <div className="text-gray-800 dark:text-gray-200">
          <label className="block font-semibold">Color 1:</label>
          <input
            type="color"
            name="color1"
            value={params.color1}
            className="w-full"
            onChange={handleParamChange}
          />
        </div>
      )}

      {filter === "duotone" && (
        <div className="text-gray-800 dark:text-gray-200">
          <label className="block font-semibold">Color 1:</label>
          <input
            type="color"
            name="color1"
            value={params.color1}
            className="w-full"
            onChange={handleParamChange}
          />
          <label className="block font-semibold">Color 2:</label>
          <input
            type="color"
            name="color2"
            value={params.color2}
            className="w-full"
            onChange={handleParamChange}
          />
        </div>
      )}

      {filter === "tritone" && (
        <div className="text-gray-800 dark:text-gray-200">
          <label className="block font-semibold">Color 1:</label>
          <input
            type="color"
            name="color1"
            value={params.color1}
            className="w-full"
            onChange={handleParamChange}
          />
          <label className="block font-semibold">Color 2:</label>
          <input
            type="color"
            name="color2"
            value={params.color2}
            className="w-full"
            onChange={handleParamChange}
          />
          <label className="block font-semibold">Color 3:</label>
          <input
            type="color"
            name="color3"
            value={params.color3}
            className="w-full"
            onChange={handleParamChange}
          />
        </div>
      )}

      {filter === "quadtone" && (
        <div className="text-gray-800 dark:text-gray-200">
          <label className="block font-semibold">Color 1:</label>
          <input
            type="color"
            name="color1"
            value={params.color1}
            className="w-full"
            onChange={handleParamChange}
          />
          <label className="block font-semibold">Color 2:</label>
          <input
            type="color"
            name="color2"
            value={params.color2}
            className="w-full"
            onChange={handleParamChange}
          />
          <label className="block font-semibold">Color 3:</label>
          <input
            type="color"
            name="color3"
            value={params.color3}
            className="w-full"
            onChange={handleParamChange}
          />
          <label className="block font-semibold">Color 4:</label>
          <input
            type="color"
            name="color4"
            value={params.color4}
            className="w-full"
            onChange={handleParamChange}
          />
        </div>
      )}

      <button
        onClick={handleApplyFilter}
        className="w-full mt-4 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Processing..." : "Apply Filter"}
      </button>

      {outputImage && (
        <div className="mt-6 text-center">
          <h2 className="text-xl font-semibold">Filtered Image:</h2>
          <img
            src={outputImage}
            className="mt-4 max-w-full rounded-lg shadow-md"
            alt="Filtered Output"
          />
          <button
            className="bg-inherit text-current px-4 py-2 rounded-md hover:bg-gray-500"
            onClick={handleDownload}
          >
            <ArrowDownIcon className="w-4 h-4" /> Download
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageFilterPage;
