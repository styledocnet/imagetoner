
## Document

documentSize is the source of truth.
canvasSize is derived from documentSize.


## Rendering

Canvas 2D and GPU/Shader Renderer are separated.

Using a separate WebGL/WebGPU renderer:
- GPU operations remain isolated,
- allows to maintain the main canvas for 2D rendering or as the final composite output.
