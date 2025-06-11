import React, { useState, useEffect } from "react";
import { Link, useRouter } from "../../context/CustomRouter";
import { Bars3Icon, PhotoIcon, RectangleGroupIcon, SquaresPlusIcon, SwatchIcon } from "@heroicons/react/24/outline";

type NavItem = {
  name: string;
  value: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
};

const navItems: NavItem[] = [
  { name: "Dashboard", value: "dashboard", icon: RectangleGroupIcon },
  { name: "Photos", value: "photos", icon: PhotoIcon },
  { name: "ImageEdit", value: "image_edit", icon: SquaresPlusIcon },
  { name: "Styles", value: "style_page", icon: SwatchIcon },
];

const MainNav: React.FC = () => {
  const { currentRoute } = useRouter();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  useEffect(() => {
    setIsNavOpen(false);
  }, [currentRoute]);

  return (
    <div className="relative">
      <button className="group focus:outline-none p-2 rounded-full bg-gray-700 text-white dark:bg-gray-200 dark:text-black" onClick={toggleNav}>
        <Bars3Icon className="h-6 w-6 group-active:animate-bounce" />
      </button>
      <nav
        className={`absolute top-12 -left-1 w-48 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-lg transition-transform transform ${
          isNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        onClick={toggleNav}
      >
        {navItems.map((item) => (
          <div key={item.value}>
            <Link
              to={item.value}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded transition
                ${
                  currentRoute === item.value
                    ? "bg-gray-500 text-red-300 dark:bg-gray-400 dark:text-gray-100"
                    : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
            >
              <item.icon className="h-5 w-5 mr-2 inline-flex" />
              {item.name}
            </Link>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default MainNav;
