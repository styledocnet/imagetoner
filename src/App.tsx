import React, { useEffect } from "react";
import { RouterProvider, Route, useRouter } from "./context/CustomRouter";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import MainNav from "./components/nav/MainNav";
import PhotosPage from "./pages/PhotosPage";
// import ImageFilterPage from "./pages/ImageFilterPage";
import ImageEditPage from "./pages/ImageEditPage";
import StylePage from "./pages/StylePage";
// import ImageStyleTransferPage from "./pages/ImageStyleTransferPage";
import { LayerProvider } from "./context/LayerContext";

const App: React.FC = () => {
  useEffect(() => {
    if (!window.location.search.includes("cb=")) {
      const url = new URL(window.location.href);
      url.searchParams.set("cb", Date.now().toString());
      window.location.replace(url.toString());
    }
  }, []);

  return (
    <RouterProvider>
      <LayerProvider>
        <AppContent />
      </LayerProvider>
    </RouterProvider>
  );
};

const AppContent: React.FC = () => {
  const { currentRoute } = useRouter();

  return (
    <div className="antialiased flex flex-col text-slate-400 dark:text-slate-800 min-h-screen bg-gradient-to-br from-neutral-300 to-stone-400 dark:from-gray-900 dark:to-gray-700">
      <header className="flex justify-between items-center bg-sky-900 text-white dark:bg-gray-900 p-4">
        <MainNav />
        <h1 className="text-xl">{currentRoute}</h1>
      </header>
      <main className="flex-grow p-4">
        <Route path="dashboard" component={<Dashboard />} />
        {/* <Route path="image_filter" component={<ImageFilterPage />} /> */}
        <Route path="image_edit" component={<ImageEditPage />} />
        <Route path="/image-edit/:id" component={<ImageEditPage />} />
        {/* <Route path="image_styletransfer" component={<ImageStyleTransferPage />} /> */}
        <Route path="style_page" component={<StylePage />} />
        <Route path="photos" component={<PhotosPage />} />
        <Route path="not_found" component={<NotFound />} />
      </main>
    </div>
  );
};

export default App;
