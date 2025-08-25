import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Bars3Icon,
  PhotoIcon,
  SquaresPlusIcon,
  SwatchIcon,
  Cog6ToothIcon,
  ChevronRightIcon,
  SpeakerWaveIcon,
  MicrophoneIcon,
  ListBulletIcon,
  XMarkIcon,
  HomeIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import "@/styles/shinui.css";
import { ROUTES } from "@/router/routes";
// import { useTypeSafeNavigate } from "@/router/hooks";

// Nav items definition
type NavItem = {
  name: string;
  path?: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  children?: NavItem[];
  badge?: string;
};

const navItems: NavItem[] = [
  { name: "Dashboard", path: ROUTES.DASHBOARD, icon: HomeIcon },
  {
    name: "Images",
    icon: SquaresPlusIcon,
    children: [
      { name: "Photos", path: ROUTES.PHOTOS, icon: PhotoIcon },
      { name: "Image Editor", path: ROUTES.IMAGE_EDIT, icon: SquaresPlusIcon },
    ],
  },
  {
    name: "Audio",
    icon: SpeakerWaveIcon,
    children: [
      { name: "Recorder", path: ROUTES.RECORDER, icon: MicrophoneIcon },
      { name: "Audio Library", path: ROUTES.AUDIO_LIST, icon: ListBulletIcon },
      { name: "Timeline", path: ROUTES.TIMELINE, icon: ListBulletIcon },
    ],
  },
  {
    name: "Videos",
    icon: VideoCameraIcon,
    children: [
      { name: "Video Projects", path: ROUTES.VIDEOS, icon: VideoCameraIcon },
      { name: "Video Assets", path: ROUTES.VIDEO_ASSETS, icon: PhotoIcon },
    ],
  },
  {
    name: "Themes",
    icon: Cog6ToothIcon,
    children: [{ name: "Styles", path: ROUTES.STYLE_PAGE, icon: SwatchIcon }],
  },
];

// Utility for pointer detection
// @ts-ignore TS6133
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
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<{ [k: string]: boolean }>({});

  // Auto-expand parent menu if child is active
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some((child) => child.path === location.pathname);
        if (hasActiveChild) {
          setOpenMenus((prev) => ({ ...prev, [item.name]: true }));
        }
      }
    });
  }, [location.pathname]);

  useEffect(() => {
    setIsNavOpen(false);
  }, [location.pathname]);

  const toggleNav = () => setIsNavOpen((prev) => !prev);

  const handleMenuToggle = (itemName: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  // Enhanced styling classes
  const transition = "transition-all duration-300 ease-out";
  const itemPerspective = "shinitem-perspective";
  const shadowFocus = "shinitem-shadowfocus";
  const glass = "shinglass";

  // Nav item renderer with enhanced styling
  const renderNavItem = (item: NavItem, depth = 0) => {
    const isActive = item.path && location.pathname === item.path;
    const hasChildren = Array.isArray(item.children) && item.children.length > 0;
    const isOpened = openMenus[item.name];

    const baseStyles = `
      flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer select-none group outline-none relative overflow-hidden
      ${glass} ${transition} ${itemPerspective} ${shadowFocus}
      ${depth === 0 ? "text-base font-bold" : "text-sm font-semibold"}
    `;

    const activeStyles = isActive
      ? "ring-2 ring-sky-400/60 bg-gradient-to-r from-sky-900/20 to-blue-900/20 scale-[1.02] text-sky-200 shin-text-glow"
      : "text-slate-300 hover:text-white";

    const depthStyles = {
      marginLeft: depth * 16,
    };

    const glowEffect = isActive
      ? {
          boxShadow: `
            0px 8px 32px rgba(56, 189, 248, 0.15),
            0px 4px 16px rgba(59, 130, 246, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `,
        }
      : {};

    const ItemContent = (
      <div
        className={`${baseStyles} ${activeStyles}`}
        style={{ ...depthStyles, ...glowEffect }}
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
        {/* Hover shimmer effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-pulse" />
        </div>

        <div className="relative z-10 flex items-center gap-3 w-full">
          <item.icon
            className={`h-6 w-6 transition-all duration-300 ${
              isActive ? "text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]" : "text-slate-400 group-hover:text-slate-200 shinmetallic"
            }`}
          />
          <span className="truncate flex-1">{item.name}</span>

          {item.badge && <span className="px-2 py-1 text-xs bg-sky-500/20 text-sky-300 rounded-full border border-sky-500/30">{item.badge}</span>}

          {hasChildren && (
            <div className={`transition-transform duration-300 ${isOpened ? "rotate-90" : ""}`}>
              <ChevronRightIcon className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
            </div>
          )}
        </div>
      </div>
    );

    return (
      <div key={item.name + (item.path || "")}>
        {item.path && !hasChildren ? (
          <Link to={item.path} className="block focus:outline-none" onClick={() => setIsNavOpen(false)}>
            {ItemContent}
          </Link>
        ) : (
          ItemContent
        )}

        {/* Submenu with enhanced styling */}
        {hasChildren && isOpened && (
          <div className="mt-2 ml-4 space-y-1 relative">
            {/* Connecting line */}
            <div className="absolute left-2 top-0 bottom-0 w-px bg-gradient-to-b from-slate-600 via-slate-500 to-transparent opacity-50" />
            {item.children!.map((child) => renderNavItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative z-50">
      {/* Floating Nav Button with enhanced styling */}
      <button
        className={`
          group focus:outline-none p-2 rounded-1xl shadow-1xl ring-1 ring-slate-600/40
          fixed top-3 left-3 md:static z-[60]
          ${glass} ${shadowFocus} ${transition}
          hover:scale-105 active:scale-95
          shin-border-glow
        `}
        aria-label="Toggle navigation menu"
        onClick={toggleNav}
        style={{
          background: "linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))",
          backdropFilter: "blur(16px) saturate(180%)",
        }}
      >
        <div className="relative">
          {/* Button shimmer effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-2xl" />
          </div>

          {isNavOpen ? (
            <XMarkIcon className="h-5 w-5 text-slate-300 group-hover:text-white transition-colors duration-300 relative z-10" />
          ) : (
            <Bars3Icon className="h-5 w-5 text-slate-300 group-hover:text-white transition-colors duration-300 relative z-10" />
          )}
        </div>
      </button>

      {/* Enhanced Navigation Menu */}
      <nav
        className={`
          fixed top-0 left-0 w-1/3 max-w-[85vw] h-full z-50
          shinnav-bg shin-backdrop
          transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
          ${isNavOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}
          rounded-tr-2xl rounded-br-2xl
          flex flex-col pt-16 pb-8 px-6
          shin-border-glow
        `}
        style={{
          boxShadow: `
            24px 0 80px rgba(0, 0, 0, 0.5),
            inset 1px 0 0 rgba(255, 255, 255, 0.05),
            inset -1px 0 0 rgba(0, 0, 0, 0.2)
          `,
        }}
        onClick={(e) => e.stopPropagation()}
        aria-label="Main navigation"
      >
        {/* Navigation Header */}
        <div className="mb-4 px-2 -mt-7">
          <div className="shinlogo-text text-center mb-2">.•</div>
          <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
        </div>

        {/* Navigation Items */}
        <div className="flex-1 flex flex-col gap-2 custom-scrollbar">{navItems.map((item) => renderNavItem(item))}</div>

        {/* Navigation Footer */}
        {/*<div className="mt-6 pt-6 border-t border-slate-700/50">
          <div className="text-xs text-slate-500 text-center">Lipsum/div>
        </div>*/}
      </nav>

      {/* Enhanced Overlay */}
      {isNavOpen && (
        <div
          className={`
            fixed inset-0 z-40 transition-all duration-300
            ${isNavOpen ? "bg-black/60 backdrop-blur-sm" : "bg-black/0"}
          `}
          onClick={toggleNav}
          aria-label="Close navigation menu"
          tabIndex={-1}
        />
      )}
    </div>
  );
};

export default MainNav;
