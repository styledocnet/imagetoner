type ParameterType = "number" | "boolean" | "color";

interface FilterParameter {
  type: ParameterType;
  default: any;
  min?: number;
  max?: number;
  step?: number;
  desc: string; // Added description for each parameter
}

interface FilterMetadata {
  [key: string]: {
    [param: string]: FilterParameter;
  };
}

export const shaderFilterParams: FilterMetadata = {
  shader_vignette: {
    strength: {
      type: "number",
      default: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      desc: "Strength of the vignette effect",
    },
    sizeFactor: {
      type: "number",
      default: 1,
      min: 0,
      max: 2,
      step: 0.01,
      desc: "Size factor of the vignette area",
    },
    color: {
      type: "color",
      default: "#FFFFFF",
      desc: "Color of the vignette effect",
    },
  },
  shader_posterize: {
    levels: {
      type: "number",
      default: 4,
      min: 2,
      max: 10,
      step: 1,
      desc: "Number of levels for posterization",
    },
    fade: {
      type: "number",
      default: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      desc: "Fade strength of the posterization effect",
    },
  },
  shader_solarize: {
    threshold: {
      type: "number",
      default: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      desc: "Threshold for the solarization effect",
    },
    fade: {
      type: "number",
      default: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      desc: "Fade strength of the solarization effect",
    },
  },
  shader_mirror: {
    flipX: {
      type: "boolean",
      default: false,
      desc: "Flip the image horizontally",
    },
    flipY: {
      type: "boolean",
      default: false,
      desc: "Flip the image vertically",
    },
    fade: {
      type: "number",
      default: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      desc: "Fade strength of the mirror effect",
    },
  },
  shader_blur: {
    radius: {
      type: "number",
      default: 0.01,
      min: 0,
      max: 1,
      step: 0.01,
      desc: "Radius of the blur effect",
    },
    fade: {
      type: "number",
      default: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      desc: "Fade strength of the blur effect",
    },
  },
  shader_tilt_blur: {
    radius: {
      type: "number",
      default: 0.01,
      min: 0,
      max: 1,
      step: 0.01,
      desc: "Radius of the tilt blur effect",
    },
    fade: {
      type: "number",
      default: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      desc: "Fade strength of the tilt blur effect",
    },
  },
  shader_dof: {
    focusDepth: {
      type: "number",
      default: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      desc: "Depth of focus for the effect",
    },
    threshold: {
      type: "number",
      default: 0.1,
      min: 0,
      max: 1,
      step: 0.01,
      desc: "Threshold for depth of focus",
    },
    blurRadius: {
      type: "number",
      default: 0.02,
      min: 0,
      max: 1,
      step: 0.01,
      desc: "Radius of blur for depth of focus",
    },
  },
  shader_grayscale: {
    intensity: {
      type: "number",
      default: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      desc: "Intensity of the grayscale effect",
    }
  },
  shader_tritone: {
    shadowColor: {
      type: "color",
      default: "#000000",
      desc: "Color for shadows",
    },
    midColor: {
      type: "color",
      default: "#888888",
      desc: "Color for mid-tones",
    },
    highColor: {
      type: "color",
      default: "#FFFFFF",
      desc: "Color for highlights",
    },
    fade: {
      type: "number",
      default: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      desc: "Fade strength of the tritone effect",
    },
  },

  shader_quadtone: {
    shadowColor: {
      type: "color",
      default: "#000000",
      desc: "Color for shadows",
    },
    midShadowColor: {
      type: "color",
      default: "#444444",
      desc: "Color for mid-shadows",
    },
    midHighlightColor: {
      type: "color",
      default: "#888888",
      desc: "Color for mid-highlights",
    },
    highColor: {
      type: "color",
      default: "#FFFFFF",
      desc: "Color for highlights",
    },
    fade: {
      type: "number",
      default: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      desc: "Fade strength of the quadtone effect",
    },
  },
  shader_triangulate: {
    points: {
      type: "number",
      default: 300,
      min: 50,
      max: 1000,
      step: 10,
      desc: "Base number of points (density of triangles)",
    },
    variation: {
      type: "number",
      default: 0.3,
      min: 0,
      max: 1,
      step: 0.01,
      desc: "Randomization of triangle placement",
    },
    cutoff: {
      type: "number",
      default: 5,
      min: 1,
      max: 20,
      step: 1,
      desc: "Color matching precision",
    },
    edgeThreshold: {
      type: "number",
      default: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      desc: "Sensitivity to edges",
    },
    blendAmount: {
      type: "number",
      default: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      desc: "Mixing original and stylized color",
    },
    triangleSizeScaling: {
      type: "number",
      default: 1.0,
      min: 0.5,
      max: 2.0,
      step: 0.1,
      desc: "Scale factor for triangle sizes",
    },
  },
  shader_polygonate: {
    points: {
      type: "number",
      default: 300,
      min: 50,
      max: 1000,
      step: 10,
      desc: "Base number of points for polygonation",
    },
    mutations: {
      type: "number",
      default: 2,
      min: 0,
      max: 10,
      step: 1,
      desc: "Number of mutations applied during polygonation",
    },
    variation: {
      type: "number",
      default: 0.3,
      min: 0,
      max: 1,
      step: 0.01,
      desc: "Randomization of polygon placement",
    },
    population: {
      type: "number",
      default: 400,
      min: 100,
      max: 1000,
      step: 10,
      desc: "Population density of polygons",
    },
    cutoff: {
      type: "number",
      default: 5,
      min: 1,
      max: 20,
      step: 1,
      desc: "Color matching precision for polygons",
    },
    block: {
      type: "number",
      default: 5,
      min: 1,
      max: 20,
      step: 1,
      desc: "Block size for polygons",
    },
  },
  shader_hexanate: {
    points: {
      type: "number",
      default: 300,
      min: 50,
      max: 1000,
      step: 10,
      desc: "Base number of points for hexagonal shapes",
    },
    mutations: {
      type: "number",
      default: 2,
      min: 0,
      max: 10,
      step: 1,
      desc: "Number of mutations applied during hexagonal shaping",
    },
    variation: {
      type: "number",
      default: 0.3,
      min: 0,
      max: 1,
      step: 0.01,
      desc: "Randomization of hexagonal placement",
    },
    population: {
      type: "number",
      default: 400,
      min: 100,
      max: 1000,
      step: 10,
      desc: "Population density of hexagonal shapes",
    },
    cutoff: {
      type: "number",
      default: 5,
      min: 1,
      max: 20,
      step: 1,
      desc: "Color matching precision for hexagonal shapes",
    },
    block: {
      type: "number",
      default: 5,
      min: 1,
      max: 20,
      step: 1,
      desc: "Block size for hexagonal shapes",
    },
  },
};

export const canvasFilterParams: FilterMetadata = {
  grayscale: {
    fade: {
      type: "number",
      default: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      desc: "Fade strength of the grayscale effect",
    },
  },
  sepia: {
    fade: {
      type: "number",
      default: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      desc: "Fade strength of the sepia effect",
    },
  },
  vignette: {
    colors: {
      type: "number",
      default: 128,
      min: 1,
      max: 256,
      step: 1,
      desc: "Number of colors for the vignette effect",
    },
    fade: {
      type: "number",
      default: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      desc: "Fade strength of the vignette effect",
    },
  },
  mono: {
    colors: {
      type: "number",
      default: 128,
      min: 1,
      max: 256,
      step: 1,
      desc: "Number of colors for the mono effect",
    },
    fade: {
      type: "number",
      default: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      desc: "Fade strength of the mono effect",
    },
  },
  duotone: {
    color1: {
      type: "color",
      default: "#ffeeaa",
      desc: "First color for the duotone effect",
    },
    color2: {
      type: "color",
      default: "#aaeeff",
      desc: "Second color for the duotone effect",
    },
  },
  tritone: {
    color1: {
      type: "color",
      default: "#ffeeaa",
      desc: "First color for the tritone effect",
    },
    color2: {
      type: "color",
      default: "#aaeeff",
      desc: "Second color for the tritone effect",
    },
    color3: {
      type: "color",
      default: "#aaffee",
      desc: "Third color for the tritone effect",
    },
  },
  quadtone: {
    color1: {
      type: "color",
      default: "#ffeeaa",
      desc: "First color for the quadtone effect",
    },
    color2: {
      type: "color",
      default: "#aaee00",
      desc: "Second color for the quadtone effect",
    },
    color3: {
      type: "color",
      default: "#aaffee",
      desc: "Third color for the quadtone effect",
    },
    color4: {
      type: "color",
      default: "#ff22ee",
      desc: "Fourth color for the quadtone effect",
    },
  },
  blur: {
    fade: {
      type: "number",
      default: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      desc: "Fade strength of the blur effect",
    },
  },
  quantize: {
    colors: {
      type: "number",
      default: 128,
      min: 1,
      max: 256,
      step: 1,
      desc: "Number of colors for the quantization effect",
    },
    fade: {
      type: "number",
      default: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      desc: "Fade strength of the quantization effect",
    },
  },
  rotate: {
    degrees: {
      type: "number",
      default: 45,
      min: 0,
      max: 360,
      step: 1,
      desc: "Rotation angle in degrees",
    },
    fade: {
      type: "number",
      default: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      desc: "Fade strength of the rotation effect",
    },
  },
  autocontrast: {
    cutoff: {
      type: "number",
      default: 0,
      min: 0,
      max: 100,
      step: 1,
      desc: "Cutoff percentage for autocontrast",
    },
    fade: {
      type: "number",
      default: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      desc: "Fade strength of the autocontrast effect",
    },
  },
  equalize: {
    fade: {
      type: "number",
      default: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      desc: "Fade strength of the equalize effect",
    },
  },
  brightness: {
    factor: {
      type: "number",
      default: 50,
      min: 0,
      max: 100,
      step: 1,
      desc: "Brightness adjustment factor",
    },
    fade: {
      type: "number",
      default: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      desc: "Fade strength of the brightness effect",
    },
  },
  contrast: {
    factor: {
      type: "number",
      default: 50,
      min: 0,
      max: 100,
      step: 1,
      desc: "Contrast adjustment factor",
    },
    fade: {
      type: "number",
      default: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      desc: "Fade strength of the contrast effect",
    },
  },
  sharpness: {
    factor: {
      type: "number",
      default: 50,
      min: 0,
      max: 100,
      step: 1,
      desc: "Sharpness adjustment factor",
    },
    fade: {
      type: "number",
      default: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      desc: "Fade strength of the sharpness effect",
    },
  },
  gaussian_blur: {
    radius: {
      type: "number",
      default: 2,
      min: 0,
      max: 10,
      step: 0.1,
      desc: "Radius for the Gaussian blur effect",
    },
    fade: {
      type: "number",
      default: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      desc: "Fade strength of the Gaussian blur effect",
    },
  },
  unsharp_mask: {
    radius: {
      type: "number",
      default: 2,
      min: 0,
      max: 10,
      step: 0.1,
      desc: "Radius for the unsharp mask effect",
    },
    percent: {
      type: "number",
      default: 150,
      min: 0,
      max: 300,
      step: 1,
      desc: "Percentage strength of the unsharp mask effect",
    },
    threshold: {
      type: "number",
      default: 3,
      min: 0,
      max: 10,
      step: 0.1,
      desc: "Threshold for the unsharp mask effect",
    },
    fade: {
      type: "number",
      default: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      desc: "Fade strength of the unsharp mask effect",
    },
  },
};