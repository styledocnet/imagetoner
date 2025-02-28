import React from "react";

type NavItem = {
  name: string;
  value: string;
};

type MainNavProps = {
  activePage: string;
  setActivePage: (page: string) => void;
};

const navItems: NavItem[] = [
  { name: "Dashboard", value: "dashboard" },
  // { name: "Photos", value: "photos" },
  { name: "Filter", value: "image_filter" },
  { name: "RemoveBG", value: "image_rembg" },
];

const MainNav: React.FC<MainNavProps> = ({ activePage, setActivePage }) => {
  return (
    <nav className="flex space-x-4 ml-2">
      {navItems.map((item) => (
        <button
          key={item.value}
          onClick={() => setActivePage(item.value)}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activePage === item.value
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          {item.name}
        </button>
      ))}
    </nav>
  );
};

export default MainNav;
