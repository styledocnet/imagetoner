import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import MainNav from "./components/nav/MainNav";
import { useUpdateChecker } from "./app/UpdateChecker";

const App: React.FC = () => {
  useUpdateChecker();
  const location = useLocation();

  return (
    <div className="antialiased flex flex-col text-slate-400 dark:text-slate-200 min-h-screen min-w-screen bg-gradient-to-br from-neutral-300 to-stone-400 dark:from-gray-900 dark:to-gray-700">
      <header className="flex justify-between items-center bg-sky-900 text-gray-400 dark:bg-gray-900 p-4">
        <MainNav />
        <h1 className="text-xs">{location.pathname}</h1>
      </header>
      <main className="flex-grow p-4 overflow-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default App;
