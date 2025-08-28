import PhotosWidget from "../components/dashboard/PhotosWidget";
import VersionChangelogWidget from "../components/dashboard/VersionChangelogWidget";

const Dashboard = () => {
  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-8 py-6 flex-grow">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <VersionChangelogWidget />
        <div className="mt-8">
          <PhotosWidget />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
