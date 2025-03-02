import React from "react";
import { Link } from "../../context/CustomRouter";

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
  return (
    <nav className="flex space-x-4 ml-2">
      {navItems.map((item) => (
        <Link key={item.value} to={item.value}>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              window.location.pathname === `/${item.value}`
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {item.name}
          </button>
        </Link>
      ))}
    </nav>
  );
};

export default MainNav;
