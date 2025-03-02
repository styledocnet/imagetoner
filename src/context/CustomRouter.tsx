import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Define the context type
interface RouterContextType {
  currentRoute: string;
  navigate: (route: string) => void;
}

// Create the context
const RouterContext = createContext<RouterContextType | undefined>(undefined);

// Create the RouterProvider component
const RouterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState(
    window.location.pathname.substring(1) || "dashboard",
  );

  const navigate = (route: string) => {
    window.history.pushState({}, "", `/${route}`);
    setCurrentRoute(route);
  };

  useEffect(() => {
    const onPopState = () => {
      setCurrentRoute(window.location.pathname.substring(1) || "dashboard");
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

// Custom hook to use the router context
const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error("useRouter must be used within a RouterProvider");
  }
  return context;
};

// Create the Route component
const Route: React.FC<{ path: string; component: ReactNode }> = ({
  path,
  component,
}) => {
  const { currentRoute } = useRouter();
  return currentRoute === path ? <>{component}</> : null;
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
