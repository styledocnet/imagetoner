# imagetoner

Web-based image (document) editor featuring React, Tailwind, and Canvas, supporting advanced background removal (Transformers.js) and both 2D and GPU-based rendering.

Parts of this project were bootstrapped using [OpenAI GPT](https://openai.com/research/gpt) and with coding assistance from [GitHub Copilot](https://github.com/features/copilot).


## Features

- **Background Removal** using [Transformers.js](https://huggingface.co/docs/transformers.js/).
- **UI** built with React and Tailwind CSS.
- **Document & Image Editing**: Layers, compositing, blend modes, and opacity.
- **Download and Export**: Save your final work as images.

## Demo

<!-- ![Screenshot](docs/screenshot.png) -->

Try it live: [Demo link](https://styledocnet.github.io/imagetoner/)

## Document Model

- `documentSize` is the source of truth for the workspace dimensions.
- `canvasSize` is always derived from the `documentSize` and adapts to device or viewport.

## Rendering Architecture

- **Canvas 2D Renderer**: Handles standard drawing, text, and image layers.
- **GPU Renderer**: Isolated in a separate WebGL/WebGPU context for advanced effects (e.g., shaders, background removal, filters).
- The main canvas can composite the 2D and GPU outputs for final display or export.


## Installation & Getting Started

```bash
git clone https://github.com/styledocnet/imagetoner.git
cd imagetoner
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to view in your browser.


## PWA & Local-First Approach

The editor is a true [PWA](https://web.dev/articles/what-are-pwas): installable, offline-capable, and responsive.
All your work is stored locally in your browser for privacy and speed, no server required.


## Key Dependencies

- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [@huggingface/transformers](https://huggingface.co/docs/transformers.js/index)


## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.


## License

[MIT License](LICENSE)

---

> **Note:**
> This is a prototype under active development. Features and interface may change.
