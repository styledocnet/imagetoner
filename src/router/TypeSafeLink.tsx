/**
 * Type-safe Link components with compile-time route validation
 * These components provide enhanced type safety and developer experience over the default React Router Link
 */

import React from 'react';
import { Link as ReactRouterLink, LinkProps as ReactRouterLinkProps, NavLink as ReactRouterNavLink, NavLinkProps as ReactRouterNavLinkProps } from 'react-router-dom';
import { ROUTES, Navigation, ParameterizedRoute, RouteParams, SimpleRoute, buildRoute, isValidRoute, RoutePath } from './routes';

// Base props for our type-safe links
interface BaseLinkProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
}

// Props for simple routes (no parameters)
interface SimpleLinkProps extends BaseLinkProps {
  to: SimpleRoute;
  state?: any;
  replace?: boolean;
}

// Props for parameterized routes
interface ParameterizedLinkProps<T extends ParameterizedRoute> extends BaseLinkProps {
  to: T;
  params: RouteParams[T];
  state?: any;
  replace?: boolean;
}

// Union type for all possible link props
type TypeSafeLinkProps = SimpleLinkProps | ParameterizedLinkProps<ParameterizedRoute>;

/**
 * Type-safe Link component that validates routes at compile time
 */
export function TypeSafeLink(props: TypeSafeLinkProps) {
  const { children, className, style, target, rel, state, replace } = props;

  // Build the path based on whether it's a parameterized route or not
  const path = 'params' in props
    ? buildRoute(props.to, props.params)
    : props.to;

  // Validate route in development
  if (process.env.NODE_ENV === 'development') {
    if (!isValidRoute(path as RoutePath) && !path.includes('?') && !path.includes('#')) {
      console.warn(`Invalid route detected: ${path}. This route is not defined in ROUTES.`);
    }
  }

  return (
    <ReactRouterLink
      to={path}
      className={className}
      style={style}
      target={target}
      rel={rel}
      state={state}
      replace={replace}
    >
      {children}
    </ReactRouterLink>
  );
}

// Props for NavLink with active styling
interface NavLinkProps extends Omit<ReactRouterNavLinkProps, 'to'> {
  to: SimpleRoute;
  activeClassName?: string;
  inactiveClassName?: string;
}

interface ParameterizedNavLinkProps<T extends ParameterizedRoute> extends Omit<ReactRouterNavLinkProps, 'to'> {
  to: T;
  params: RouteParams[T];
  activeClassName?: string;
  inactiveClassName?: string;
}

type TypeSafeNavLinkProps = NavLinkProps | ParameterizedNavLinkProps<ParameterizedRoute>;

/**
 * Type-safe NavLink component with active state handling
 */
export function TypeSafeNavLink(props: TypeSafeNavLinkProps) {
  const { children, className, activeClassName, inactiveClassName, ...rest } = props;

  // Build the path
  const path = 'params' in props
    ? buildRoute(props.to, props.params)
    : props.to;

  return (
    <ReactRouterNavLink
      to={path}
      className={({ isActive }) => {
        const baseClass = className || '';
        const stateClass = isActive ? activeClassName || '' : inactiveClassName || '';
        return `${baseClass} ${stateClass}`.trim();
      }}
      {...rest}
    >
      {children}
    </ReactRouterNavLink>
  );
}

/**
 * Convenience components for specific route types
 */

// Link to image edit page
interface ImageEditLinkProps extends BaseLinkProps {
  id: number | string;
  state?: any;
  replace?: boolean;
}

export function ImageEditLink({ id, children, ...props }: ImageEditLinkProps) {
  return (
    <TypeSafeLink to={ROUTES.IMAGE_EDIT_WITH_ID} params={{ id: String(id) }} {...props}>
      {children}
    </TypeSafeLink>
  );
}

// Link to dashboard
export function DashboardLink({ children, ...props }: Omit<SimpleLinkProps, 'to'>) {
  return (
    <TypeSafeLink to={ROUTES.DASHBOARD} {...props}>
      {children}
    </TypeSafeLink>
  );
}

// Link to photos page
export function PhotosLink({ children, ...props }: Omit<SimpleLinkProps, 'to'>) {
  return (
    <TypeSafeLink to={ROUTES.PHOTOS} {...props}>
      {children}
    </TypeSafeLink>
  );
}

// Button-style link for UI actions
interface LinkButtonProps extends BaseLinkProps {
  to: SimpleRoute;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export function LinkButton({
  to,
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  ...props
}: LinkButtonProps) {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const buttonClasses = [
    'inline-flex items-center justify-center font-medium rounded-md transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    variantClasses[variant],
    sizeClasses[size],
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    className,
  ].filter(Boolean).join(' ');

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <TypeSafeLink
      to={to}
      className={buttonClasses}
      onClick={handleClick}
      {...props}
    >
      {children}
    </TypeSafeLink>
  );
}

/**
 * External link component for links outside the app
 */
interface ExternalLinkProps extends BaseLinkProps {
  href: string;
  openInNewTab?: boolean;
}

export function ExternalLink({
  href,
  children,
  className = '',
  openInNewTab = true,
  ...props
}: ExternalLinkProps) {
  return (
    <a
      href={href}
      className={`text-blue-600 hover:text-blue-800 underline ${className}`}
      target={openInNewTab ? '_blank' : undefined}
      rel={openInNewTab ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
    </a>
  );
}
