import React from "react";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import MainNav from "./components/nav/MainNav";
import PhotosPage from "./pages/PhotosPage";
import ImageFilterPage from "./pages/ImageFilterPage";
import ImageRemBgPage from "./pages/ImageRemBgPage";

const App: React.FC = () => {
  const [activePage, setActivePage] = React.useState("dashboard");

  const renderPage = () => {
    // console.log("activePage", activePage);
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;
      case "image_filter":
        return <ImageFilterPage />;
      case "image_rembg":
        return <ImageRemBgPage />;
      case "photos":
        return <PhotosPage />;
      default:
        return <NotFound />;
    }
  };

  // <div className="bg-sky-800 min-h-screen flex flex-col">
  return (
    <div className="antialiased flex flex-col text-slate-400 dark:text-slate-800 bg-gradient-to-br from-neutral-300 to-stone-400 min-h-screen">
      <header className="bg-sky-900 text-sky-900 text-center py-4">
        <MainNav activePage={activePage} setActivePage={setActivePage} />
      </header>
      <main className="flex-grow p-2">{renderPage()}</main>
    </div>
  );
};

export default App;
