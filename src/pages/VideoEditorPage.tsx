import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { videoStorage, VideoProjectDocument, VideoTrack, VideoEffect, Keyframe } from "../storage/videoStorage";
import { useTypeSafeNavigate } from "../router/hooks";
import { ROUTES } from "../router/routes";
import VideoTimeline from "../components/VideoEditor/VideoTimeline";
import {
  ArrowLeftIcon,
  // PlayIcon,
  // PauseIcon,
  CogIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  // PlusIcon,
  PhotoIcon,
  MusicalNoteIcon,
  FilmIcon,
} from "@heroicons/react/24/outline";

const VideoEditorPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useTypeSafeNavigate();

  const [project, setProject] = useState<VideoProjectDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAssetsPicker, setShowAssetsPicker] = useState(false);
  const [assetPickerType, setAssetPickerType] = useState<"image" | "audio" | "video">("image");
  const [availableAssets, setAvailableAssets] = useState<any[]>([]);
  const [showProjectSettings, setShowProjectSettings] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  // const audioContextRef = useRef<AudioContext | null>(null);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  useEffect(() => {
    loadAvailableAssets();
  }, []);

  useEffect(() => {
    if (isPlaying && project) {
      playIntervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const nextTime = prev + 1 / project.fps;
          if (nextTime >= project.duration) {
            setIsPlaying(false);
            return 0;
          }
          return nextTime;
        });
      }, 1000 / project.fps);
    } else if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, project]);

  const loadProject = async () => {
    try {
      if (!projectId) return;
      const loadedProject = await videoStorage.getProject(parseInt(projectId));
      if (loadedProject) {
        setProject(loadedProject);
        setCurrentTime(0);
      } else {
        navigate.to(ROUTES.VIDEOS);
      }
    } catch (error) {
      console.error("Error loading project:", error);
      navigate.to(ROUTES.VIDEOS);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableAssets = async () => {
    try {
      const assets = await videoStorage.getAssets();
      setAvailableAssets(assets);
    } catch (error) {
      console.error("Error loading assets:", error);
    }
  };

  const saveProject = async () => {
    if (!project) return;
    try {
      await videoStorage.updateProject(project);
      console.log("Project saved successfully");
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  const handleTracksChange = async (tracks: VideoTrack[]) => {
    if (!project) return;
    const updatedProject = { ...project, tracks };
    setProject(updatedProject);
    await videoStorage.updateProject(updatedProject);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleAddTrack = (type: "image" | "audio" | "video") => {
    setAssetPickerType(type);
    setShowAssetsPicker(true);
  };

  const handleAssetSelect = async (asset: any) => {
    if (!project) return;

    // Find the next available layer
    const maxLayer = Math.max(0, ...project.tracks.map((t) => t.layer));
    const newLayer = maxLayer + 1;

    const newTrack = videoStorage.createTrackFromAsset(
      asset,
      currentTime,
      newLayer,
      asset.type === "image" ? project.settings.defaultImageDuration : undefined,
    );

    const updatedTracks = [...project.tracks, newTrack];
    await handleTracksChange(updatedTracks);
    setShowAssetsPicker(false);
  };

  const handleDeleteTrack = async (trackId: string) => {
    if (!project) return;
    const updatedTracks = project.tracks.filter((t) => t.id !== trackId);
    await handleTracksChange(updatedTracks);
  };

  const handleSplitTrack = async (trackId: string, time: number) => {
    if (!project) return;

    const trackIndex = project.tracks.findIndex((t) => t.id === trackId);
    const track = project.tracks[trackIndex];

    if (!track || time <= track.startTime || time >= track.endTime) return;

    // Create two new tracks from the split
    const firstTrack = {
      ...track,
      id: `${track.id}_1`,
      endTime: time,
      duration: time - track.startTime,
    };

    const secondTrack = {
      ...track,
      id: `${track.id}_2`,
      startTime: time,
      duration: track.endTime - time,
    };

    const updatedTracks = [...project.tracks.slice(0, trackIndex), firstTrack, secondTrack, ...project.tracks.slice(trackIndex + 1)];

    await handleTracksChange(updatedTracks);
  };

  const handleAddEffect = async (trackId: string, effect: VideoEffect) => {
    if (!project) return;

    const updatedTracks = project.tracks.map((track) => {
      if (track.id === trackId) {
        return {
          ...track,
          effects: [...track.effects, effect],
        };
      }
      return track;
    });

    await handleTracksChange(updatedTracks);
  };

  const handleAddKeyframe = async (trackId: string, keyframe: Keyframe) => {
    if (!project) return;

    const updatedTracks = project.tracks.map((track) => {
      if (track.id === trackId) {
        return {
          ...track,
          keyframes: [...track.keyframes, keyframe],
        };
      }
      return track;
    });

    await handleTracksChange(updatedTracks);
  };

  const handleExportVideo = () => {
    // TODO: Implement video export functionality
    alert("Video export functionality coming soon!");
  };

  const renderPreview = () => {
    if (!project || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to project resolution
    canvas.width = project.resolution.width;
    canvas.height = project.resolution.height;

    // Clear canvas with background color
    ctx.fillStyle = project.settings.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render active tracks at current time
    const activeTracks = project.tracks
      .filter((track) => track.enabled && currentTime >= track.startTime && currentTime <= track.endTime)
      .sort((a, b) => a.layer - b.layer); // Render in layer order

    activeTracks.forEach((track) => {
      if (track.type === "image" && track.source.blob) {
        const img = new Image();
        img.onload = () => {
          const opacity = track.opacity || 1;
          ctx.globalAlpha = opacity;

          // Apply keyframe animations
          let scale = 1;
          let x = 0;
          let y = 0;

          track.keyframes.forEach((keyframe) => {
            if (keyframe.time <= currentTime) {
              switch (keyframe.property) {
                case "opacity":
                  ctx.globalAlpha = keyframe.value;
                  break;
                case "scale":
                  scale = keyframe.value;
                  break;
                case "position":
                  x = keyframe.value.x || 0;
                  y = keyframe.value.y || 0;
                  break;
              }
            }
          });

          const width = canvas.width * scale;
          const height = canvas.height * scale;
          ctx.drawImage(img, x, y, width, height);
          ctx.globalAlpha = 1;
        };
        img.src = URL.createObjectURL(track.source.blob);
      }
    });
  };

  useEffect(() => {
    renderPreview();
  }, [project, currentTime]);

  if (loading) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
          <button onClick={() => navigate.to(ROUTES.VIDEOS)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded">
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate.to(ROUTES.VIDEOS)} className="p-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">{project.name}</h1>
            <p className="text-sm text-gray-400">
              {project.resolution.width}×{project.resolution.height} • {project.fps}fps
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowProjectSettings(true)}
            className="flex items-center px-3 py-2 text-sm text-gray-300 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            <CogIcon className="w-4 h-4 mr-2" />
            Settings
          </button>
          <button onClick={saveProject} className="flex items-center px-3 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded transition-colors">
            <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
            Save
          </button>
          <button
            onClick={handleExportVideo}
            className="flex items-center px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            <ShareIcon className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Preview Panel */}
        <div className="w-1/2 bg-black flex items-center justify-center p-4">
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-full border border-gray-600"
              style={{
                aspectRatio: `${project.resolution.width}/${project.resolution.height}`,
                width: "auto",
                height: "100%",
              }}
            />
            <div className="absolute top-4 left-4 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
              {Math.floor(currentTime / 60)}:
              {Math.floor(currentTime % 60)
                .toString()
                .padStart(2, "0")}
            </div>
          </div>
        </div>

        {/* Timeline Panel */}
        <div className="w-1/2 flex flex-col">
          <VideoTimeline
            tracks={project.tracks}
            duration={project.duration}
            currentTime={currentTime}
            fps={project.fps}
            isPlaying={isPlaying}
            onTracksChange={handleTracksChange}
            onCurrentTimeChange={setCurrentTime}
            onPlayPause={handlePlayPause}
            onStop={handleStop}
            onAddTrack={handleAddTrack}
            onDeleteTrack={handleDeleteTrack}
            onSplitTrack={handleSplitTrack}
            onAddEffect={handleAddEffect}
            onAddKeyframe={handleAddKeyframe}
          />
        </div>
      </div>

      {/* Asset Picker Modal */}
      {showAssetsPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">Select {assetPickerType.charAt(0).toUpperCase() + assetPickerType.slice(1)} Asset</h2>
              <button onClick={() => setShowAssetsPicker(false)} className="text-gray-400 hover:text-white text-xl">
                ×
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-96">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {availableAssets
                  .filter((asset) => asset.type === assetPickerType)
                  .map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => handleAssetSelect(asset)}
                      className="bg-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-600 transition-colors"
                    >
                      <div className="aspect-square bg-gray-600 rounded mb-2 flex items-center justify-center">
                        {asset.type === "image" ? (
                          <img src={URL.createObjectURL(asset.blob)} alt={asset.name} className="w-full h-full object-cover rounded" />
                        ) : asset.type === "audio" ? (
                          <MusicalNoteIcon className="w-8 h-8 text-gray-400" />
                        ) : (
                          <FilmIcon className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <p className="text-sm text-white truncate">{asset.name}</p>
                    </div>
                  ))}
              </div>

              {availableAssets.filter((asset) => asset.type === assetPickerType).length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  <PhotoIcon className="w-12 h-12 mx-auto mb-4" />
                  <p>No {assetPickerType} assets found</p>
                  <button onClick={() => navigate.to(ROUTES.VIDEO_ASSETS)} className="mt-2 text-blue-400 hover:text-blue-300">
                    Upload some assets
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Project Settings Modal */}
      {showProjectSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">Project Settings</h2>
              <button onClick={() => setShowProjectSettings(false)} className="text-gray-400 hover:text-white text-xl">
                ×
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Duration (seconds)</label>
                <input
                  type="number"
                  value={project.duration}
                  onChange={(e) => {
                    const newDuration = parseFloat(e.target.value) || 0;
                    setProject({ ...project, duration: newDuration });
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">FPS</label>
                <select
                  value={project.fps}
                  onChange={(e) => {
                    const newFps = parseInt(e.target.value);
                    setProject({ ...project, fps: newFps });
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value={24}>24 FPS</option>
                  <option value={30}>30 FPS</option>
                  <option value={60}>60 FPS</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Background Color</label>
                <input
                  type="color"
                  value={project.settings.backgroundColor}
                  onChange={(e) => {
                    setProject({
                      ...project,
                      settings: { ...project.settings, backgroundColor: e.target.value },
                    });
                  }}
                  className="w-full h-10 bg-gray-700 border border-gray-600 rounded"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                <button onClick={() => setShowProjectSettings(false)} className="px-4 py-2 text-sm text-gray-300 bg-gray-700 hover:bg-gray-600 rounded">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    saveProject();
                    setShowProjectSettings(false);
                  }}
                  className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoEditorPage;
