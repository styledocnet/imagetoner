import React, { useState, useEffect, useRef } from "react";
import { videoStorage } from "../storage/videoStorage";
import { useTypeSafeNavigate } from "../router/hooks";
import { PlusIcon, TrashIcon, PhotoIcon, MusicalNoteIcon, FilmIcon, ArrowLeftIcon, EyeIcon, PlayIcon } from "@heroicons/react/24/outline";

type AssetType = "image" | "audio" | "video";

interface VideoAsset {
  id?: number;
  name: string;
  type: AssetType;
  blob: Blob;
  mimeType: string;
  createdAt: Date;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
  };
}

const VideoAssetsPage: React.FC = () => {
  const [assets, setAssets] = useState<VideoAsset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<VideoAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<AssetType | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<VideoAsset | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useTypeSafeNavigate();

  useEffect(() => {
    loadAssets();
  }, []);

  useEffect(() => {
    // Filter assets based on type and search term
    let filtered = assets;

    if (selectedType !== "all") {
      filtered = filtered.filter((asset) => asset.type === selectedType);
    }

    if (searchTerm) {
      filtered = filtered.filter((asset) => asset.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    setFilteredAssets(filtered);
  }, [assets, selectedType, searchTerm]);

  const loadAssets = async () => {
    try {
      const allAssets = await videoStorage.getAssets();
      setAssets(allAssets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error("Error loading assets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        const assetType: AssetType = file.type.startsWith("image/") ? "image" : file.type.startsWith("audio/") ? "audio" : "video";

        let metadata: VideoAsset["metadata"] = {};

        // Get metadata for different file types
        if (assetType === "image") {
          const img = new Image();
          img.src = URL.createObjectURL(file);
          await new Promise((resolve) => {
            img.onload = () => {
              metadata.width = img.width;
              metadata.height = img.height;
              resolve(null);
            };
          });
        } else if (assetType === "audio" || assetType === "video") {
          const element = document.createElement(assetType);
          element.src = URL.createObjectURL(file);
          await new Promise((resolve) => {
            element.onloadedmetadata = () => {
              metadata.duration = element.duration;
              if (assetType === "video") {
                metadata.width = (element as HTMLVideoElement).videoWidth;
                metadata.height = (element as HTMLVideoElement).videoHeight;
              }
              resolve(null);
            };
          });
        }

        await videoStorage.addAsset({
          name: file.name,
          type: assetType,
          blob: file,
          mimeType: file.type,
          metadata,
        });
      }

      await loadAssets();
    } catch (error) {
      console.error("Error uploading assets:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteAsset = async (asset: VideoAsset) => {
    if (!window.confirm(`Delete "${asset.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await videoStorage.deleteAsset(asset.id!);
      await loadAssets();
    } catch (error) {
      console.error("Error deleting asset:", error);
    }
  };

  const handlePreviewAsset = (asset: VideoAsset) => {
    setPreviewAsset(asset);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getAssetIcon = (type: AssetType) => {
    switch (type) {
      case "image":
        return <PhotoIcon className="w-8 h-8" />;
      case "audio":
        return <MusicalNoteIcon className="w-8 h-8" />;
      case "video":
        return <FilmIcon className="w-8 h-8" />;
    }
  };

  const getAssetCounts = () => {
    const counts = { all: assets.length, image: 0, audio: 0, video: 0 };
    assets.forEach((asset) => {
      counts[asset.type]++;
    });
    return counts;
  };

  const assetCounts = getAssetCounts();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading assets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Video Assets</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage images, audio, and video files for your projects</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <input ref={fileInputRef} type="file" multiple accept="image/*,audio/*,video/*" onChange={handleFileUpload} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium
                       text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50
                       disabled:cursor-not-allowed rounded-md transition-colors duration-200 shadow-sm"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              {isUploading ? "Uploading..." : "Add Assets"}
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Asset Type Filters */}
            <div className="flex space-x-2">
              {(
                [
                  ["all", "All"],
                  ["image", "Images"],
                  ["audio", "Audio"],
                  ["video", "Videos"],
                ] as const
              ).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    selectedType === type
                      ? "text-white bg-blue-600 hover:bg-blue-700"
                      : "text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {label} ({assetCounts[type]})
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="w-full md:w-64">
              <input
                type="text"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Assets Grid */}
        {filteredAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
            <PhotoIcon className="w-16 h-16 mb-4" />
            <h3 className="text-lg font-medium mb-2">No assets found</h3>
            <p>Upload some images, audio, or video files to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg
                         transition-all duration-200 border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Asset Preview */}
                <div className="aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center relative">
                  {asset.type === "image" ? (
                    <img src={URL.createObjectURL(asset.blob)} alt={asset.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-gray-400">{getAssetIcon(asset.type)}</div>
                  )}

                  {/* Preview button overlay */}
                  <button
                    onClick={() => handlePreviewAsset(asset)}
                    className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50
                             transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100"
                  >
                    <EyeIcon className="w-8 h-8 text-white" />
                  </button>
                </div>

                {/* Asset Info */}
                <div className="p-4">
                  <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate mb-2">{asset.name}</h3>

                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <div>{formatFileSize(asset.blob.size)}</div>
                    {asset.metadata?.width && asset.metadata?.height && (
                      <div>
                        {asset.metadata.width}×{asset.metadata.height}
                      </div>
                    )}
                    {asset.metadata?.duration && <div>{formatDuration(asset.metadata.duration)}</div>}
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        asset.type === "image"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : asset.type === "audio"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      }`}
                    >
                      {asset.type}
                    </span>

                    <button
                      onClick={() => handleDeleteAsset(asset)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50
                               dark:hover:bg-red-900/20 rounded-md transition-colors duration-200"
                      title="Delete asset"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold">{previewAsset.name}</h3>
              <button onClick={() => setPreviewAsset(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                ×
              </button>
            </div>

            <div className="p-6">
              {previewAsset.type === "image" && (
                <img src={URL.createObjectURL(previewAsset.blob)} alt={previewAsset.name} className="max-w-full max-h-96 mx-auto" />
              )}
              {previewAsset.type === "audio" && (
                <audio controls className="w-full">
                  <source src={URL.createObjectURL(previewAsset.blob)} type={previewAsset.mimeType} />
                </audio>
              )}
              {previewAsset.type === "video" && (
                <video controls className="max-w-full max-h-96 mx-auto">
                  <source src={URL.createObjectURL(previewAsset.blob)} type={previewAsset.mimeType} />
                </video>
              )}

              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <div>Type: {previewAsset.type}</div>
                <div>Size: {formatFileSize(previewAsset.blob.size)}</div>
                {previewAsset.metadata?.width && previewAsset.metadata?.height && (
                  <div>
                    Dimensions: {previewAsset.metadata.width}×{previewAsset.metadata.height}
                  </div>
                )}
                {previewAsset.metadata?.duration && <div>Duration: {formatDuration(previewAsset.metadata.duration)}</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoAssetsPage;
