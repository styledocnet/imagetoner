import React, { useState } from "react";
import { VideoProjectDocument } from "../../storage/videoStorage";
import {
  PlayIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ClockIcon,
  FilmIcon,
  EyeIcon
} from "@heroicons/react/24/outline";

interface VideosListProps {
  projects: VideoProjectDocument[];
  onEdit: (project: VideoProjectDocument) => void;
  onDelete: (project: VideoProjectDocument) => void;
  onDuplicate: (project: VideoProjectDocument) => void;
  onPlay?: (project: VideoProjectDocument) => void;
  onOpen: (project: VideoProjectDocument) => void;
  fullMode?: boolean;
  pageSize?: number;
}

const VideosList: React.FC<VideosListProps> = ({
  projects,
  onEdit,
  onDelete,
  onDuplicate,
  onPlay,
  onOpen,
  fullMode = true,
  pageSize = 12,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter projects based on search term
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginate projects
  const totalPages = Math.ceil(filteredProjects.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + pageSize);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getProjectSize = (project: VideoProjectDocument): number => {
    return project.tracks.reduce((total, track) => {
      return total + (track.source.blob?.size || 0);
    }, 0);
  };

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
        <FilmIcon className="w-16 h-16 mb-4" />
        <h3 className="text-lg font-medium mb-2">No video projects yet</h3>
        <p>Create your first video project to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      {fullMode && (
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Projects Grid */}
      <div className={fullMode
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        : "space-y-3"
      }>
        {paginatedProjects.map((project) => (
          <div
            key={project.id}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg
                       transition-all duration-200 border border-gray-200 dark:border-gray-700
                       ${fullMode ? 'p-6' : 'p-4'}`}
          >
            {/* Project Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {project.description}
                  </p>
                )}
              </div>
              <FilmIcon className="w-6 h-6 text-gray-400 flex-shrink-0 ml-2" />
            </div>

            {/* Project Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <ClockIcon className="w-4 h-4 mr-2" />
                {formatDuration(project.duration)}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {project.resolution.width}x{project.resolution.height}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {project.tracks.length} tracks
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {formatFileSize(getProjectSize(project))}
              </div>
            </div>

            {/* Dates */}
            {fullMode && (
              <div className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                <div>Created: {formatDate(project.createdAt)}</div>
                <div>Updated: {formatDate(project.updatedAt)}</div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onOpen(project)}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium
                           text-white bg-blue-600 hover:bg-blue-700 rounded-md
                           transition-colors duration-200"
                >
                  <EyeIcon className="w-4 h-4 mr-1" />
                  Open
                </button>
                {onPlay && (
                  <button
                    onClick={() => onPlay(project)}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium
                             text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700
                             hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md
                             transition-colors duration-200"
                  >
                    <PlayIcon className="w-4 h-4 mr-1" />
                    Preview
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => onEdit(project)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50
                           dark:hover:bg-blue-900/20 rounded-md transition-colors duration-200"
                  title="Edit project"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDuplicate(project)}
                  className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50
                           dark:hover:bg-green-900/20 rounded-md transition-colors duration-200"
                  title="Duplicate project"
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(project)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50
                           dark:hover:bg-red-900/20 rounded-md transition-colors duration-200"
                  title="Delete project"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {fullMode && totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border
                     border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50
                     disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600
                     dark:text-gray-400 dark:hover:bg-gray-700"
          >
            Previous
          </button>

          <div className="flex space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                  ${currentPage === page
                    ? 'text-white bg-blue-600 hover:bg-blue-700'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border
                     border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50
                     disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600
                     dark:text-gray-400 dark:hover:bg-gray-700"
          >
            Next
          </button>
        </div>
      )}

      {/* Results info */}
      {fullMode && searchTerm && (
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Showing {filteredProjects.length} of {projects.length} projects
        </div>
      )}
    </div>
  );
};

export default VideosList;
