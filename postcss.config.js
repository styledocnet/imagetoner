// postcss.config.js
export default {
  plugins: {
    // Tailwind v4 no longer requires PostCSS
    // as it's now a standalone CSS processor
    // We keep autoprefixer for browser compatibility
    autoprefixer: {},
  },
};
