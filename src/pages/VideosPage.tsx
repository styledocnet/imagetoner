import React, { useState, useEffect } from "react";
import { videoStorage, VideoProjectDocument } from "../storage/videoStorage";
import VideosList from "../components/Video/VideosList";
import { useTypeSafeNavigate } from "../router/hooks";
import { PlusIcon, FolderOpenIcon } from "@heroicons/react/24/outline";

const VideosPage: React.FC = () => {
  const [projects, setProjects] = useState<VideoProjectDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const navigate = useTypeSafeNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const allProjects = await videoStorage.getProjects();
      setProjects(allProjects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    } catch (error) {
      console.error("Error loading projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    try {
      const defaultProject = videoStorage.createDefaultProject(newProjectName);
      defaultProject.description = newProjectDescription;

      const projectId = await videoStorage.createProject(defaultProject);
      await loadProjects();

      setShowCreateDialog(false);
      setNewProjectName("");
      setNewProjectDescription("");

      // Navigate to video editor
      navigate("video-editor", { projectId: projectId.toString() });
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const handleOpenProject = (project: VideoProjectDocument) => {
    navigate("video-editor", { projectId: project.id!.toString() });
  };

  const handleEditProject = async (project: VideoProjectDocument) => {
    const newName = prompt("Enter new project name:", project.name);
    if (!newName || newName === project.name) return;

    try {
      await videoStorage.updateProject({ ...project, name: newName });
      await loadProjects();
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  const handleDeleteProject = async (project: VideoProjectDocument) => {
    if (!window.confirm(`Delete project "${project.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await videoStorage.deleteProject(project.id!);
      await loadProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleDuplicateProject = async (project: VideoProjectDocument) => {
    const newName = prompt("Enter name for duplicate project:", `${project.name} (Copy)`);
    if (!newName) return;

    try {
      await videoStorage.duplicateProject(project.id!, newName);
      await loadProjects();
    } catch (error) {
      console.error("Error duplicating project:", error);
    }
  };

  const handlePreviewProject = (project: VideoProjectDocument) => {
    // TODO: Implement preview functionality
    console.log("Preview project:", project);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading video projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Video Projects</h1>
            <p className="text-gray-600 dark:text-gray-400">Create and manage your video projects</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate("video-assets")}
              className="inline-flex items-center px-4 py-2 text-sm font-medium
                       text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800
                       border border-gray-300 dark:border-gray-600 rounded-md
                       hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <FolderOpenIcon className="w-4 h-4 mr-2" />
              Manage Assets
            </button>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium
                       text-white bg-blue-600 hover:bg-blue-700 rounded-md
                       transition-colors duration-200 shadow-sm"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              New Project
            </button>
          </div>
        </div>

        {/* Project Statistics */}
        {projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-2">Total Projects</h3>
              <p className="text-3xl font-bold text-blue-600">{projects.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{projects[0] ? new Date(projects[0].updatedAt).toLocaleDateString() : "No activity"}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-2">Total Duration</h3>
              <p className="text-3xl font-bold text-green-600">{Math.round(projects.reduce((acc, p) => acc + p.duration, 0))}s</p>
            </div>
          </div>
        )}

        {/* Projects List */}
        <VideosList
          projects={projects}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
          onDuplicate={handleDuplicateProject}
          onPlay={handlePreviewProject}
          onOpen={handleOpenProject}
          fullMode={true}
          pageSize={12}
        />
      </div>

      {/* Create Project Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create New Video Project</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter project name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600
                           rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                <textarea
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Enter project description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600
                           rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateDialog(false);
                  setNewProjectName("");
                  setNewProjectDescription("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                         bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
                         rounded-md transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600
                         hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                         rounded-md transition-colors duration-200"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideosPage;
