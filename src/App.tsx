import React from "react";
import { RouterProvider, Route } from "./context/CustomRouter";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import MainNav from "./components/nav/MainNav";
import PhotosPage from "./pages/PhotosPage";
import ImageFilterPage from "./pages/ImageFilterPage";
import ImageRemBgPage from "./pages/ImageRemBgPage";

const App: React.FC = () => {
  return (
    <RouterProvider>
      <div className="antialiased flex flex-col text-slate-400 dark:text-slate-800 bg-gradient-to-br from-neutral-300 to-stone-400 min-h-screen">
        <header className="bg-sky-900 text-sky-900 text-center py-4">
          <MainNav />
        </header>
        <main className="flex-grow p-2">
          <Route path="dashboard" component={<Dashboard />} />
          <Route path="image_filter" component={<ImageFilterPage />} />
          <Route path="image_rembg" component={<ImageRemBgPage />} />
          <Route path="photos" component={<PhotosPage />} />
          <Route path="not_found" component={<NotFound />} />
        </main>
      </div>
    </RouterProvider>
  );
};

export default App;
