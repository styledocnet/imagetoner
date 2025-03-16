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
  visible: boolean;
}

export interface FilterParams {
  [key: string]: any;
}

export interface FilteredLayer {
  image: string | null;
  filter: string;
  params: any;
}

export interface Document {
  id?: number;
  name: string;
  layers: Layer[];
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
