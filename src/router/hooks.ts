/**
 * Type-safe navigation hooks for React Router
 * These hooks provide enhanced type safety and developer experience over the default React Router hooks
 */

import { useNavigate as useReactRouterNavigate, useParams as useReactRouterParams, NavigateOptions } from 'react-router-dom';
import { ROUTES, Navigation, ParameterizedRoute, RouteParams, SimpleRoute, RoutePath, buildRoute } from './routes';

/**
 * Type-safe navigation hook that provides compile-time route validation
 */
export function useTypeSafeNavigate() {
  const navigate = useReactRouterNavigate();

  return {
    /**
     * Navigate to a simple route (no parameters required)
     */
    to: (route: SimpleRoute, options?: NavigateOptions) => {
      navigate(route, options);
    },

    /**
     * Navigate to a parameterized route with type-safe parameters
     */
    toRoute: <T extends ParameterizedRoute>(
      route: T,
      params: RouteParams[T],
      options?: NavigateOptions
    ) => {
      const path = buildRoute(route, params);
      navigate(path, options);
    },

    /**
     * Navigate to image edit page with ID
     */
    toImageEdit: (id: number | string, options?: NavigateOptions) => {
      navigate(Navigation.toImageEdit(id), options);
    },

    /**
     * Navigate back in history
     */
    back: (steps = -1) => {
      navigate(steps);
    },

    /**
     * Navigate forward in history
     */
    forward: (steps = 1) => {
      navigate(steps);
    },

    /**
     * Replace current route
     */
    replace: (route: SimpleRoute, options?: Omit<NavigateOptions, 'replace'>) => {
      navigate(route, { ...options, replace: true });
    },

    /**
     * Replace current route with parameters
     */
    replaceRoute: <T extends ParameterizedRoute>(
      route: T,
      params: RouteParams[T],
      options?: Omit<NavigateOptions, 'replace'>
    ) => {
      const path = buildRoute(route, params);
      navigate(path, { ...options, replace: true });
    },

    /**
     * Raw navigate function for edge cases
     */
    raw: navigate,
  };
}

/**
 * Type-safe params hook for parameterized routes
 */
export function useTypeSafeParams<T extends ParameterizedRoute>(): RouteParams[T] {
  const params = useReactRouterParams();
  return params as RouteParams[T];
}

/**
 * Hook for image edit page parameters
 */
export function useImageEditParams() {
  return useTypeSafeParams<typeof ROUTES.IMAGE_EDIT_WITH_ID>();
}

/**
 * Hook to check if current route matches a specific route
 */
export function useRouteMatch(route: RoutePath): boolean {
  const currentPath = window.location.pathname;

  // Handle exact matches
  if (currentPath === route) return true;

  // Handle parameterized routes by checking if the pattern matches
  if (route.includes(':')) {
    const routePattern = route.replace(/:[^/]+/g, '[^/]+');
    const regex = new RegExp(`^${routePattern}$`);
    return regex.test(currentPath);
  }

  return false;
}

/**
 * Hook to get current route information
 */
export function useCurrentRoute() {
  const currentPath = window.location.pathname;

  // Find matching route
  const matchingRoute = Object.values(ROUTES).find(route => {
    if (route === currentPath) return true;

    if (route.includes(':')) {
      const routePattern = route.replace(/:[^/]+/g, '[^/]+');
      const regex = new RegExp(`^${routePattern}$`);
      return regex.test(currentPath);
    }

    return false;
  });

  return {
    currentPath,
    matchingRoute: matchingRoute as RoutePath | undefined,
    isKnownRoute: matchingRoute !== undefined,
  };
}

/**
 * Hook for breadcrumb navigation
 */
export function useBreadcrumbs() {
  const { currentPath } = useCurrentRoute();

  const breadcrumbs = currentPath
    .split('/')
    .filter(Boolean)
    .reduce((acc, segment, index, array) => {
      const path = '/' + array.slice(0, index + 1).join('/');
      acc.push({
        path: path as RoutePath,
        label: segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' '),
        isLast: index === array.length - 1,
      });
      return acc;
    }, [] as Array<{ path: RoutePath; label: string; isLast: boolean }>);

  // Always include home if not already there
  if (breadcrumbs.length > 0 && breadcrumbs[0].path !== ROUTES.HOME) {
    breadcrumbs.unshift({
      path: ROUTES.HOME,
      label: 'Home',
      isLast: false,
    });
  }

  return breadcrumbs;
}
