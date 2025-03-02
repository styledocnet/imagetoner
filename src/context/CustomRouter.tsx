import React, { createContext, useContext, useState, ReactNode } from "react";

interface RouterContextType {
  currentRoute: string;
  navigate: (route: string) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

const RouterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState("home");

  const navigate = (route: string) => {
    setCurrentRoute(route);
  };

  return (
    <RouterContext.Provider value={{ currentRoute, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error("useRouter must be used within a RouterProvider");
  }
  return context;
};

const Route: React.FC<{ path: string; component: ReactNode }> = ({
  path,
  component,
}) => {
  const { currentRoute } = useRouter();
  return currentRoute === path ? <>{component}</> : null;
};

const Link: React.FC<{ to: string; children: ReactNode }> = ({
  to,
  children,
}) => {
  const { navigate } = useRouter();
  return <button onClick={() => navigate(to)}>{children}</button>;
};

export { RouterProvider, Route, Link };
