import React, { useState, useEffect } from "react";
import { Link, useRouter } from "../../context/CustomRouter";
import {
  Bars3Icon,
  PhotoIcon,
  RectangleGroupIcon,
  SquaresPlusIcon,
  SwatchIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  SpeakerWaveIcon,
  MicrophoneIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import "../../styles/shinui.css";

// Nav items definition
type NavItem = {
  name: string;
  value?: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  children?: NavItem[];
};

const navItems: NavItem[] = [
  { name: "Dashboard", value: "dashboard", icon: RectangleGroupIcon },
  {
    name: "Images",
    icon: SquaresPlusIcon,
    children: [
      { name: "Photos", value: "photos", icon: PhotoIcon },
      { name: "ImageEdit", value: "image_edit", icon: SquaresPlusIcon },
    ],
  },
  {
    name: "Audio",
    icon: SpeakerWaveIcon,
    children: [
      { name: "Recorder", value: "recorder", icon: MicrophoneIcon },
      { name: "AudioList", value: "audio_list", icon: ListBulletIcon },
    ],
  },
  {
    name: "Themes",
    icon: Cog6ToothIcon,
    children: [{ name: "Styles", value: "style_page", icon: SwatchIcon }],
  },
];

// Utility for pointer detection
const usePointerDevice = () => {
  const [isPointer, setPointer] = useState(false);
  useEffect(() => {
    const updatePointer = (e: Event) => setPointer((e as any).pointerType !== "touch");
    window.addEventListener("pointerdown", updatePointer, { once: true });
    return () => window.removeEventListener("pointerdown", updatePointer);
  }, []);
  return isPointer;
};

const MainNav: React.FC = () => {
  const { currentRoute } = useRouter();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<{ [k: string]: boolean }>({});
  const isPointer = usePointerDevice();

  useEffect(() => {
    setIsNavOpen(false);
    setOpenMenus({});
  }, [currentRoute]);

  const toggleNav = () => setIsNavOpen((prev) => !prev);

  const handleMenuToggle = (itemName: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  // Styling classes
  const navBg = "shinnav-bg";
  const metallic = "shinmetallic";
  const glass = "shinglass";
  const transition = "transition-all duration-400 ease-[cubic-bezier(.33,1.02,.53,1)]";
  const itemPerspective = "shinitem-perspective";

  // Nav item renderer
  const renderNavItem = (item: NavItem, depth = 0) => {
    const isActive = item.value && currentRoute === item.value;
    const hasChildren = Array.isArray(item.children) && item.children.length > 0;
    const isOpened = openMenus[item.name];

    const baseGlow = "focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:z-20";
    const pointerGlow = isPointer ? "hover:shadow-[0_0_18px_3px_rgba(56,189,248,0.22)] hover:ring-2 hover:ring-sky-300" : "";

    const ItemContent = (
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer select-none group outline-none
          ${glass} ${transition} ${itemPerspective} ${baseGlow} ${pointerGlow}
          ${isActive ? "ring-2 ring-sky-300 bg-sky-900/10 scale-105 text-sky-200" : ""}
          ${depth === 0 ? "text-lg font-extrabold" : "text-base font-semibold"}
          `}
        style={{
          marginLeft: depth * 22,
          boxShadow: isActive ? "0px 8px 32px rgba(0,120,255,0.13)" : undefined,
          perspective: "500px",
        }}
        onClick={() => hasChildren && handleMenuToggle(item.name)}
        tabIndex={0}
        role="button"
        aria-expanded={hasChildren ? isOpened : undefined}
        onKeyDown={(e) => {
          if (hasChildren && (e.key === " " || e.key === "Enter")) {
            e.preventDefault();
            handleMenuToggle(item.name);
          }
        }}
      >
        <item.icon className={`h-7 w-7 ${metallic} drop-shadow-[0_1px_3px_rgba(0,0,0,0.36)]`} />
        <span className="truncate">{item.name}</span>
        {hasChildren && (isOpened ? <ChevronDownIcon className="w-4 h-4 ml-auto opacity-70" /> : <ChevronRightIcon className="w-4 h-4 ml-auto opacity-70" />)}
      </div>
    );

    return (
      <div key={item.name + (item.value || "")}>
        {item.value && !hasChildren ? (
          <Link to={item.value} className="block focus:outline-none">
            {ItemContent}
          </Link>
        ) : (
          ItemContent
        )}
        {hasChildren && isOpened && (
          <div className="space-y-1 ml-2 border-l-2 border-slate-600 pl-2">{item.children!.map((child) => renderNavItem(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <div className="relative z-50">
      {/* Floating Nav Button */}
      <button
        className={`
          group focus:outline-none p-3 rounded-full shadow-xl ring-2 ring-sky-600/40
          bg-gradient-to-br from-[#242d3c] to-[#3d4256] hover:from-[#31354a] hover:to-[#2e3340]
          border-2 border-slate-700 hover:scale-105 active:scale-95 transition
          fixed top-4 left-4 md:static
        `}
        aria-label="Open navigation menu"
        onClick={toggleNav}
        style={{
          zIndex: 70,
        }}
      >
        <Bars3Icon className="h-8 w-8 group-hover:text-sky-400 transition" />
      </button>
      {/* Menu */}
      <nav
        className={`
          fixed top-0 left-0 w-[88vw] max-w-md h-full ${navBg}
          transition-transform duration-500 ease-[cubic-bezier(.33,1.02,.53,1)]
          ${isNavOpen ? "translate-x-0" : "-translate-x-full"}
          rounded-tr-3xl rounded-br-3xl border-r-4 border-slate-700
          shadow-[0_8px_32px_rgba(20,40,80,0.38)]
          flex flex-col pt-12 pb-8 px-6
          z-50
        `}
        style={{
          perspective: "1200px",
          backdropFilter: "blur(9px)",
        }}
        onClick={(e) => e.stopPropagation()}
        aria-label="Main navigation"
      >
        <div className="flex-1 flex flex-col gap-2">{navItems.map((item) => renderNavItem(item))}</div>
      </nav>
      {/* Overlay for mobile */}
      {isNavOpen && <div className="fixed inset-0 bg-black/40 z-40" onClick={toggleNav} aria-label="Close navigation menu" tabIndex={-1} />}
    </div>
  );
};

export default MainNav;
