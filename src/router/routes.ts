/**
 * TypeScript-safe routing configuration for the application
 * This file defines all routes, their parameters, and provides type-safe utilities for navigation
 */

// Route path constants - single source of truth for all routes
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  PHOTOS: '/photos',
  IMAGE_EDIT: '/image-edit',
  IMAGE_EDIT_WITH_ID: '/image-edit/:id',
  STYLE_PAGE: '/style-page',
  RECORDER: '/recorder',
  AUDIO_LIST: '/audio-list',
  ROUTER_DEMO: '/router-demo',
} as const;

// Type definitions for route parameters
export interface RouteParams {
  [ROUTES.IMAGE_EDIT_WITH_ID]: {
    id: string;
  };
  // Add more parameterized routes here as needed
}

// Type for all valid route paths
export type RoutePath = typeof ROUTES[keyof typeof ROUTES];

// Type for routes that have parameters
export type ParameterizedRoute = keyof RouteParams;

// Type for routes without parameters
export type SimpleRoute = Exclude<RoutePath, ParameterizedRoute>;

// Helper function to build parameterized routes with type safety
export function buildRoute<T extends ParameterizedRoute>(
  route: T,
  params: RouteParams[T]
): string {
  let path = route as string;

  // Replace route parameters with actual values
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`:${key}`, String(value));
  });

  return path;
}

// Type-safe navigation helpers
export const Navigation = {
  /**
   * Navigate to a simple route (no parameters)
   */
  to: (route: SimpleRoute) => route,

  /**
   * Navigate to image edit page with specific ID
   */
  toImageEdit: (id: number | string) => buildRoute(ROUTES.IMAGE_EDIT_WITH_ID, { id: String(id) }),

  /**
   * Navigate to image edit page (new document)
   */
  toNewImageEdit: () => ROUTES.IMAGE_EDIT,
} as const;

// Route metadata for navigation components
export interface RouteInfo {
  path: RoutePath;
  label: string;
  description?: string;
  requiresParams?: boolean;
}

export const ROUTE_INFO: Record<string, RouteInfo> = {
  dashboard: {
    path: ROUTES.DASHBOARD,
    label: 'Dashboard',
    description: 'Main dashboard with overview and widgets',
  },
  photos: {
    path: ROUTES.PHOTOS,
    label: 'Photos',
    description: 'Manage your photo library',
  },
  imageEdit: {
    path: ROUTES.IMAGE_EDIT,
    label: 'Image Editor',
    description: 'Create and edit images',
  },
  stylePage: {
    path: ROUTES.STYLE_PAGE,
    label: 'Style Page',
    description: 'Customize application themes and styles',
  },
  recorder: {
    path: ROUTES.RECORDER,
    label: 'Audio Recorder',
    description: 'Record audio clips',
  },
  audioList: {
    path: ROUTES.AUDIO_LIST,
    label: 'Audio Library',
    description: 'Manage your audio files',
  },
  routerDemo: {
    path: ROUTES.ROUTER_DEMO,
    label: 'Router Demo',
    description: 'Demonstrate routing capabilities',
  },
} as const;

// Validation helper
export function isValidRoute(path: string): path is RoutePath {
  return Object.values(ROUTES).includes(path as RoutePath);
}

// Get route info helper
export function getRouteInfo(path: RoutePath): RouteInfo | undefined {
  return Object.values(ROUTE_INFO).find(info => info.path === path);
}
