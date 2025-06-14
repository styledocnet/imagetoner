export type BrandColorRole = "primary" | "secondary" | "accent" | "other";

export interface BrandColor {
  hex: string;
  role: BrandColorRole;
  name?: string;
}

export interface BrandLogo {
  url: string; // File URL or base64 string
  description?: string;
}

export interface BrandStyle {
  id: number;
  name: string;
  description?: string;
  teaser?: string;
  colors: BrandColor[];
  logos: BrandLogo[];
  createdAt?: string;
  updatedAt?: string;
}

export type LayerType = "image" | "text" | "shape" | "group";

export type BlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "darken"
  | "lighten"
  | "color-dodge"
  | "color-burn"
  | "hard-light"
  | "soft-light"
  | "difference"
  | "exclusion"
  | "hue"
  | "saturation"
  | "color"
  | "luminosity";

export interface Layer {
  name: string;
  index: number;
  type: LayerType;
  image?: string | null;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  shapeType?: "rect" | "ellipse" | "polygon" | "custom";
  shapeProps?: any; // TODO more specific
  groupLayers?: Layer[];
  offsetX: number;
  offsetY: number;
  scale: number;
  width?: number;
  height?: number;
  opacity?: number;
  blendMode?: BlendMode;
  visible?: boolean;
  originalImage?: string | null;
}

export interface FilterParams {
  [key: string]: any;
}

export interface FilteredLayer {
  image: string | null;
  filter: string;
  params: any;
}

export interface ImageDocument {
  id?: number;
  name: string;
  layers: Layer[];
  createdAt?: string;
  updatedAt?: string;
}

export type FilterType =
  | "quadtone"
  | "tritone"
  | "duotone"
  | "mono"
  | "vignette"
  | "blur"
  | "brightness"
  | "contrast"
  | "grayscale"
  | "hue-rotate"
  | "invert"
  | "saturate"
  | "sepia";
