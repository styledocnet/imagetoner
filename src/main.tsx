import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import Dashboard from "./pages/Dashboard";
import PhotosPage from "./pages/PhotosPage";
import ImageEditPage from "./pages/ImageEditPage";
import StylePage from "./pages/StylePage";
import AudioRecorderPage from "./pages/AudioRecorderPage";
import AudioFilesPage from "./pages/AudioFilesPage";
import NotFound from "./pages/NotFound";
import { LayerProvider } from "./context/LayerContext";
import { ROUTES } from "./router/routes";

const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: ROUTES.DASHBOARD.slice(1), // Remove leading slash for nested routes
        element: <Dashboard />,
      },
      {
        path: ROUTES.PHOTOS.slice(1),
        element: <PhotosPage />,
      },
      {
        path: ROUTES.IMAGE_EDIT.slice(1),
        element: <ImageEditPage />,
      },
      {
        path: ROUTES.IMAGE_EDIT_WITH_ID.slice(1),
        element: <ImageEditPage />,
      },
      {
        path: ROUTES.STYLE_PAGE.slice(1),
        element: <StylePage />,
      },
      {
        path: ROUTES.RECORDER.slice(1),
        element: <AudioRecorderPage />,
      },
      {
        path: ROUTES.AUDIO_LIST.slice(1),
        element: <AudioFilesPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LayerProvider>
      <RouterProvider router={router} />
    </LayerProvider>
  </StrictMode>,
);
