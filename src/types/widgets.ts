export type WidgetType = "chart" | "table" | "card";

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  data: any;
  liveMode: boolean;
  created: boolean;
  updated: boolean;
}
