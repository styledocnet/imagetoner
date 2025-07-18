import PhotosWidget from "../components/dashboard/PhotosWidget";
import VersionChangelogWidget from "../components/dashboard/VersionChangelogWidget";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <VersionChangelogWidget />
      <PhotosWidget />
    </div>
  );
};

export default Dashboard;
