import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface RouterContextType {
  currentRoute: string;
  navigate: (route: string) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

const RouterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState(window.location.pathname + window.location.search || "/dashboard");

  const navigate = (route: string) => {
    window.history.pushState({}, "", route);
    setCurrentRoute(route);
  };

  useEffect(() => {
    const onPopState = () => {
      // TODO FIX THIS
      console.log("popstate");
      console.log("window.location.pathname: " + window.location.pathname);
      console.log(window.location);
      setCurrentRoute(window.location.pathname + window.location.search || "/dashboard");
    };

    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  return <RouterContext.Provider value={{ currentRoute, navigate }}>{children}</RouterContext.Provider>;
};

// hook to use the router context
const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error("useRouter must be used within a RouterProvider");
  }
  return context;
};

const Route: React.FC<{ path: string; component: ReactNode }> = ({ path, component }) => {
  const { currentRoute } = useRouter();
  // TODO mount component and give queryString as kv props if they matched the typed interface
  const routeWithoutSearch = currentRoute.split("?")[0];
  return routeWithoutSearch === path ? <>{component}</> : null;
};

const Link: React.FC<{ to: string } & React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ to, children, className = "", ...rest }) => {
  const { navigate } = useRouter();
  return (
    <button onClick={() => navigate(to)} className={className} {...rest}>
      {children}
    </button>
  );
};

export { RouterProvider, Route, Link, useRouter };
