import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";

const repoName = "imagetoner";

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? `/${repoName}/` : "/",
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          transformers: ["@huggingface/transformers"],
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "ImageToner",
        short_name: "imagetoner",
        description: "PhotoGraphy, Filter and Edit UI",
        theme_color: "#FF7F50",
        background_color: "#FFFFFF",
        icons: [
          {
            src: "512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        // sourcemap: true,
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024,
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        runtimeCaching: [
          {
            urlPattern: /index\..*\.js/,
            handler: "NetworkFirst",
          },
          {
            urlPattern: /.*\.html/,
            handler: "NetworkFirst",
          },
          {
            urlPattern: ({ request }) => request.destination === "document" || request.destination === "script" || request.destination === "style",
            handler: "NetworkFirst",
            options: {
              cacheName: "assets",
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "images",
            },
          },
        ],
      },
    }),
  ],
}));
