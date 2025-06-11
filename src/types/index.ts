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

export interface Layer {
  name: string;
  index: number;
  image: string | null;
  offsetX: number;
  offsetY: number;
  scale: number;
  type: "image" | "text";
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  visible?: boolean;
  width?: number;
  height?: number;
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
