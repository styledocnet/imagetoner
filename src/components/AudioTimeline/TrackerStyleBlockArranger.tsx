import React, { useState, useEffect } from "react";

interface ArrangerBlock {
  id: string;
  trackId: number;
  variation: string;
  position: number; // Position in the sequence (0-based)
  length: number; // Length in bars
}

interface ArrangerTrack {
  id: number;
  name: string;
  blocks: ArrangerBlock[];
}

interface TrackerStyleBlockArrangerProps {
  tracks: {
    id: number;
    name: string;
  }[];
  onVariationChange: (trackId: number, variation: string) => void;
  totalBars?: number;
  currentBar?: number;
  isPlaying?: boolean;
  onGlobalVariationChange?: (variation: string) => void;
  currentVariation?: string;
}

const TrackerStyleBlockArranger: React.FC<TrackerStyleBlockArrangerProps> = ({
  tracks,
  onVariationChange,
  totalBars = 32,
  currentBar = 0,
  isPlaying = false,
  onGlobalVariationChange,
}) => {
  // State for arranger tracks
  const [arrangerTracks, setArrangerTracks] = useState<ArrangerTrack[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [currentPosition, setCurrentPosition] = useState<number>(0);
  const [blockLength, setBlockLength] = useState<number>(8); // Default block length
  // Playback timer ref is kept for future implementation
  // Timer ref removed as it's not being used

  // Initialize arranger tracks based on props
  useEffect(() => {
    const initialArrangerTracks = tracks.map((track) => {
      // Create a default pattern: A-A-B-A-A-A-C-D for each track
      const defaultBlocks: ArrangerBlock[] = [
        { id: `block-${track.id}-0`, trackId: track.id, variation: "A", position: 0, length: 8 },
        { id: `block-${track.id}-1`, trackId: track.id, variation: "A", position: 8, length: 8 },
        { id: `block-${track.id}-2`, trackId: track.id, variation: "B", position: 16, length: 8 },
        { id: `block-${track.id}-3`, trackId: track.id, variation: "A", position: 24, length: 8 },
        { id: `block-${track.id}-4`, trackId: track.id, variation: "A", position: 32, length: 8 },
        { id: `block-${track.id}-5`, trackId: track.id, variation: "A", position: 40, length: 8 },
        { id: `block-${track.id}-6`, trackId: track.id, variation: "C", position: 48, length: 8 },
        { id: `block-${track.id}-7`, trackId: track.id, variation: "D", position: 56, length: 8 },
      ];

      return {
        id: track.id,
        name: track.name,
        blocks: defaultBlocks,
      };
    });

    setArrangerTracks(initialArrangerTracks);
  }, [tracks]);

  // Update current position based on currentBar prop
  useEffect(() => {
    setCurrentPosition(Math.floor(currentBar / blockLength));
  }, [currentBar, blockLength]);

  // Handle playback and automatic variation switching
  useEffect(() => {
    if (isPlaying) {
      // If we're playing, we need to check the blocks at the current position
      // and trigger variation changes
      const currentBlocks = findBlocksAtPosition(currentPosition);

      // Apply variation changes for all tracks
      currentBlocks.forEach((block) => {
        onVariationChange(block.trackId, block.variation);
      });

      // Check if all tracks are using the same variation at this position
      // If so, we can trigger a global variation change
      if (onGlobalVariationChange && currentBlocks.length > 0) {
        const allSameVariation = currentBlocks.every((block) => block.variation === currentBlocks[0].variation);
        if (allSameVariation) {
          onGlobalVariationChange(currentBlocks[0].variation);
        }
      }
    }
  }, [isPlaying, currentPosition, onVariationChange]);

  // Find all blocks at a specific position
  const findBlocksAtPosition = (position: number) => {
    const blocks: ArrangerBlock[] = [];

    arrangerTracks.forEach((track) => {
      // Find a block in this track that covers the current position
      const block = track.blocks.find((b) => {
        return position >= b.position / blockLength && position < (b.position + b.length) / blockLength;
      });

      if (block) {
        blocks.push(block);
      }
    });

    return blocks;
  };

  // Add a new block to a track
  const addBlock = (trackId: number, position: number) => {
    setArrangerTracks((prev) =>
      prev.map((track) => {
        if (track.id !== trackId) return track;

        // Check if there's already a block at this position
        const existingBlockIndex = track.blocks.findIndex((b) => b.position <= position && b.position + b.length > position);

        if (existingBlockIndex >= 0) {
          // Replace existing block
          const newBlocks = [...track.blocks];

          // Cycle through variations: A -> B -> C -> D -> A
          const currentVariation = newBlocks[existingBlockIndex].variation;
          let newVariation = "A";
          if (currentVariation === "A") newVariation = "B";
          else if (currentVariation === "B") newVariation = "C";
          else if (currentVariation === "C") newVariation = "D";

          newBlocks[existingBlockIndex] = {
            ...newBlocks[existingBlockIndex],
            variation: newVariation,
          };

          return { ...track, blocks: newBlocks };
        } else {
          // Add new block
          const newBlock: ArrangerBlock = {
            id: `block-${trackId}-${Date.now()}`,
            trackId,
            variation: "A",
            position: position - (position % blockLength), // Snap to grid
            length: blockLength,
          };

          return { ...track, blocks: [...track.blocks, newBlock] };
        }
      }),
    );
  };

  // Remove a block
  const removeBlock = (blockId: string) => {
    setArrangerTracks((prev) =>
      prev.map((track) => ({
        ...track,
        blocks: track.blocks.filter((b) => b.id !== blockId),
      })),
    );

    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  };

  // Handle click on a block
  const handleBlockClick = (blockId: string) => {
    setSelectedBlockId(blockId);
  };

  // Render grid cells for each track
  const renderGridCells = (trackId: number) => {
    const cells = [];
    const totalCells = totalBars / blockLength;

    for (let i = 0; i < totalCells; i++) {
      cells.push(
        <div
          key={`cell-${trackId}-${i}`}
          className="flex-1 h-full border-r border-dotted border-gray-700 hover:bg-gray-800 cursor-pointer pointer-events-auto"
          onClick={() => addBlock(trackId, i * blockLength)}
        />,
      );
    }

    return cells;
  };

  // Render blocks for a track
  const renderBlocks = (track: ArrangerTrack) => {
    return track.blocks.map((block) => {
      const isSelected = selectedBlockId === block.id;
      const isCurrentlyPlaying =
        isPlaying && currentPosition >= block.position / blockLength && currentPosition < (block.position + block.length) / blockLength;

      // Get color based on variation
      const getBlockColorClasses = (variation: string) => {
        switch (variation.toLowerCase()) {
          case "a":
            return "bg-blue-500 border-blue-600";
          case "b":
            return "bg-green-500 border-green-600";
          case "c":
            return "bg-orange-500 border-orange-600";
          case "d":
            return "bg-purple-500 border-purple-600";
          default:
            return "bg-gray-500 border-gray-600";
        }
      };

      return (
        <div
          key={block.id}
          className={`absolute top-1 rounded-sm cursor-pointer transition-all duration-150 border
            ${getBlockColorClasses(block.variation)}
            ${isSelected ? "ring-2 ring-white shadow-lg" : ""}
            ${isCurrentlyPlaying ? "animate-pulse" : ""}`}
          style={{
            left: `${(block.position / totalBars) * 100}%`,
            width: `${(block.length / totalBars) * 100}%`,
            height: "calc(100% - 0.5rem)",
          }}
          onClick={() => handleBlockClick(block.id)}
        >
          <div className="flex items-center justify-between h-full px-2 text-white">
            <span className="text-xs font-bold">{block.variation}</span>
            {isSelected && (
              <button
                className="w-5 h-5 rounded-full bg-white bg-opacity-30 hover:bg-red-500 flex items-center justify-center text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  removeBlock(block.id);
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>
      );
    });
  };

  // Render position markers
  const renderPositionMarkers = () => {
    const markers = [];
    const totalMarkers = totalBars / 4; // Mark every 4 bars

    for (let i = 0; i <= totalMarkers; i++) {
      markers.push(
        <div
          key={`marker-${i}`}
          className="absolute top-0 h-full border-l border-gray-600 text-xs text-gray-400 pl-1 pointer-events-none"
          style={{ left: `${((i * 4) / totalBars) * 100}%` }}
        >
          {i * 4}
        </div>,
      );
    }

    return markers;
  };

  // Render playhead
  const renderPlayhead = () => {
    return (
      <div
        className="absolute top-0 h-full w-0.5 bg-red-500 z-10 pointer-events-none"
        style={{
          left: `${(currentBar / totalBars) * 100}%`,
          boxShadow: "0 0 4px rgba(231, 76, 60, 0.7)",
        }}
      />
    );
  };

  return (
    <div className="flex flex-col bg-gray-900 border border-gray-700 rounded-md overflow-hidden mt-5">
      <div className="flex justify-between items-center p-3 bg-gray-800 border-b border-gray-700">
        <h3 className="text-white font-medium text-lg">Block Arranger</h3>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-gray-300">
            Block Length:
            <select
              value={blockLength}
              onChange={(e) => setBlockLength(parseInt(e.target.value))}
              className="bg-gray-700 text-white border border-gray-600 rounded px-2 py-1"
            >
              <option value="4">4 Bars</option>
              <option value="8">8 Bars</option>
              <option value="16">16 Bars</option>
            </select>
          </label>
        </div>
      </div>

      <div className="relative h-6 bg-gray-800 border-b border-gray-700">
        {renderPositionMarkers()}
        {renderPlayhead()}
      </div>

      <div className="flex flex-col overflow-y-auto max-h-72">
        {arrangerTracks.map((track) => (
          <div key={track.id} className="flex flex-col border-b border-gray-700 last:border-b-0">
            <div className="flex items-center px-3 py-2 bg-gray-800 border-b border-gray-700">
              <span className="text-sm text-gray-300 font-medium">{track.name}</span>
            </div>
            <div className="relative h-10">
              <div className="absolute top-0 left-0 w-full h-full flex pointer-events-none">{renderGridCells(track.id)}</div>
              <div className="absolute top-0 left-0 w-full h-full">{renderBlocks(track)}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-2 bg-gray-800 border-t border-gray-700">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500 border border-blue-600"></div>
            <span className="text-xs text-gray-300">A: Main</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500 border border-green-600"></div>
            <span className="text-xs text-gray-300">B: Variation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500 border border-orange-600"></div>
            <span className="text-xs text-gray-300">C: Fill</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-500 border border-purple-600"></div>
            <span className="text-xs text-gray-300">D: Breakdown</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackerStyleBlockArranger;
