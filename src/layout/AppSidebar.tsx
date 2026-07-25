import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  TableIcon,
  UserCircleIcon,
  PlugInIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";

// 1. Definisikan Type NavItem yang konsisten
type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  pro?: boolean;
  allowedRoles: ("admin" | "mentor" | "intern")[];
  subItems?: { 
    name: string; 
    path: string;
    pro?: boolean; 
  }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
    allowedRoles: ["admin", "mentor", "intern"],
  },
  {
    name: "Manajemen Pengguna",
    icon: <UserCircleIcon />,
    allowedRoles: ["admin"],
    subItems: [
      { name: "Akun Peserta Magang", path: "/users/internship", pro: false },
      { name: "Akun Mentor", path: "/users/mentor", pro: false },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "Manajemen Organisasi",
    path: "/organization",
    allowedRoles: ["admin"],
  },
  {
    icon: <ListIcon />, // Menggunakan ListIcon agar berbeda dengan Organisasi
    name: "Kriteria Penilaian",
    path: "/kriteria-management",
    allowedRoles: ["admin"],
  },
  {
    icon: <PlugInIcon />,
    name: "Penempatan",
    path: "/placement",
    allowedRoles: ["admin"],
  },
  {
    icon: <CalenderIcon />,
    name: "Manajemen Tugas",
    path: "/task-management",
    allowedRoles: ["mentor"],
  },
  {
    icon: <CalenderIcon />,
    name: "Manajemen Tugas",
    path: "/task",
    allowedRoles: ["intern"],
  },
  {
    icon: <ListIcon />,
    name: "Daftar Peserta Magang",
    path: "/intern-list",
    allowedRoles: ["mentor"],
  },
  {
    icon: <PageIcon />,
    name: "Laporan & Riwayat",
    path: "/logbook",
    allowedRoles: ["intern"],
  },
  {
    icon: <PageIcon />, // Gunakan icon yang sesuai, misal PageIcon atau GridIcon
    name: "Evaluasi Kompetensi",
    path: "/evaluation",
    allowedRoles: ["mentor", "intern"],
  },
];

const othersItems: NavItem[] = [
  
];

const AppSidebar: React.FC = () => {
  const { user } = useAuth();
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const currentUserRole = (user?.role as "admin" | "mentor" | "intern") || "intern";

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  // Efek untuk otomatis buka submenu jika path aktif ada di dalamnya
  // Efek untuk menangani sinkronisasi dropdown dengan URL aktif
  useEffect(() => {
    let submenuMatched = false;

    // Kita cek semua menu untuk melihat apakah path saat ini ada di dalam salah satu subItems
    const allGroups = [
      { type: "main" as const, items: navItems },
      { type: "others" as const, items: othersItems }
    ];

    for (const group of allGroups) {
      const foundIndex = group.items.findIndex(nav => 
        nav.subItems?.some(sub => location.pathname === sub.path)
      );

      if (foundIndex !== -1) {
        setOpenSubmenu({ type: group.type, index: foundIndex });
        submenuMatched = true;
        break; 
      }
    }

    // CRITICAL FIX: Jika menu yang diklik bukan bagian dari submenu manapun, 
    // langsung paksa tutup dropdown yang sedang terbuka.
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location.pathname]); // Trigger setiap kali URL berubah

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prev) => 
      prev?.type === menuType && prev?.index === index ? null : { type: menuType, index }
    );
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => {
    const filteredItems = items.filter((item) => item.allowedRoles.includes(currentUserRole));

    return (
      <ul className="flex flex-col gap-2">
        {filteredItems.map((nav, index) => {
          const isSubMenuOpen = openSubmenu?.type === menuType && openSubmenu?.index === index;
          const showFullContent = isExpanded || isHovered || isMobileOpen;

          return (
            <li key={nav.name}>
              {nav.subItems ? (
                <>
                  <button
                    onClick={() => handleSubmenuToggle(index, menuType)}
                    className={`menu-item group w-full ${
                      isSubMenuOpen ? "menu-item-active" : "menu-item-inactive"
                    } ${!showFullContent ? "lg:justify-center" : "lg:justify-start"}`}
                  >
                    <span className={`menu-item-icon-size ${isSubMenuOpen ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
                      {nav.icon}
                    </span>
                    {showFullContent && (
                      <>
                        <span className="menu-item-text">{nav.name}</span>
                        <ChevronDownIcon className={`ml-auto w-5 h-5 transition-transform ${isSubMenuOpen ? "rotate-180" : ""}`} />
                      </>
                    )}
                  </button>

                  {/* RENDER SUB-ITEMS DISINI */}
                  {showFullContent && isSubMenuOpen && (
                    <ul className="mt-2 ml-9 flex flex-col gap-1 border-l border-gray-200 dark:border-gray-700">
                      {nav.subItems.map((sub) => (
                        <li key={sub.path}>
                          <Link
                            to={sub.path}
                            className={`block py-2 px-4 text-sm transition-colors ${
                              isActive(sub.path) 
                                ? "text-brand-500 font-medium" 
                                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                            }`}
                          >
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link
                  to={nav.path || "#"}
                  className={`menu-item group ${isActive(nav.path || "") ? "menu-item-active" : "menu-item-inactive"} ${
                    !showFullContent ? "lg:justify-center" : ""
                  }`}
                >
                  <span className={`menu-item-icon-size ${isActive(nav.path || "") ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
                    {nav.icon}
                  </span>
                  {showFullContent && <span className="menu-item-text">{nav.name}</span>}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 h-screen transition-all duration-300 z-50 border-r border-gray-200 dark:border-gray-800
        ${isExpanded || isHovered || isMobileOpen ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <img src="/images/logo/logo-pt.png" alt="Logo" width={190} height={40} />
          ) : (
            <img src="/images/logo/logo-pt.png" alt="Logo" width={24} height={24} />
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-6">
            <div>
              <h2 className={`mb-4 text-xs uppercase text-gray-400 flex ${!isExpanded && !isHovered ? "lg:justify-center" : ""}`}>
                {isExpanded || isHovered || isMobileOpen ? "Menu Utama" : <HorizontaLDots className="size-6" />}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            {/* {currentUserRole === "admin" && (
              <div>
                <h2 className={`mb-4 text-xs uppercase text-gray-400 flex ${!isExpanded && !isHovered ? "lg:justify-center" : ""}`}>
                  {isExpanded || isHovered || isMobileOpen ? "Sistem" : <HorizontaLDots className="size-6" />}
                </h2>
                {renderMenuItems(othersItems, "others")}
              </div>
            )} */}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;