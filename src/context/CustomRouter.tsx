import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface RouterContextType {
  currentRoute: string;
  navigate: (route: string) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

const RouterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState(
    window.location.pathname + window.location.search || "/dashboard",
  );

  const navigate = (route: string) => {
    window.history.pushState({}, "", route);
    setCurrentRoute(route);
  };

  useEffect(() => {
    const onPopState = () => {
      setCurrentRoute(
        window.location.pathname + window.location.search || "/dashboard",
      );
    };

    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  return (
    <RouterContext.Provider value={{ currentRoute, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

// hook to use the router context
const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error("useRouter must be used within a RouterProvider");
  }
  return context;
};

// Route component
const Route: React.FC<{ path: string; component: ReactNode }> = ({
  path,
  component,
}) => {
  const { currentRoute } = useRouter();
  const routeWithoutSearch = currentRoute.split("?")[0];
  return routeWithoutSearch === path ? <>{component}</> : null;
};

// Create the Link component
const Link: React.FC<{ to: string; children: ReactNode }> = ({
  to,
  children,
}) => {
  const { navigate } = useRouter();
  return <button onClick={() => navigate(to)}>{children}</button>;
};

export { RouterProvider, Route, Link, useRouter };
