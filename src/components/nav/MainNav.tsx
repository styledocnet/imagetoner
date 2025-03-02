import React, { useState, useEffect } from "react";
import { Link, useRouter } from "../../context/CustomRouter";
import { Bars3Icon } from "@heroicons/react/24/outline";

type NavItem = {
  name: string;
  value: string;
};

const navItems: NavItem[] = [
  { name: "Dashboard", value: "dashboard" },
  { name: "Photos", value: "photos" },
  { name: "Filter", value: "image_filter" },
  { name: "RemoveBG", value: "image_rembg" },
];

const MainNav: React.FC = () => {
  const { currentRoute } = useRouter();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  // useEffect(() => {
  //   const handleRouteChange = () => {
  //     setIsNavOpen(false);
  //   };
  //   window.addEventListener("routechange", handleRouteChange);
  //   return () => {
  //     window.removeEventListener("routechange", handleRouteChange);
  //   };
  // }, []);

  useEffect(() => {
    setIsNavOpen(false);
  }, [currentRoute]);

  return (
    <div className="relative">
      <button
        className="p-2 rounded-full bg-gray-700 text-white dark:bg-gray-200 dark:text-black"
        onClick={toggleNav}
      >
        <Bars3Icon className="h-6 w-6" />
      </button>
      <nav
        className={`absolute top-12 left-0 w-48 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-lg transition-transform transform ${
          isNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {navItems.map((item) => (
          <Link key={item.value} to={item.value}>
            <button
              className={`block w-full text-left px-4 py-2 rounded-md text-sm font-medium mb-2 ${
                currentRoute === item.value
                  ? "bg-gray-500 text-red-300 dark:bg-gray-400 dark:text-gray-100"
                  : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {item.name}
            </button>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default MainNav;
