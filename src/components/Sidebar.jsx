import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FiHome,
  FiUsers,
  FiPackage,
  FiShoppingCart,
  FiLayers,
  FiTag,
  FiStar,
  FiClipboard,
  FiSettings,
  FiLogOut,
  FiCpu,
  FiShield,
  FiBox,
  FiFileText,
  FiUserCheck,
  FiGlobe,
  FiMapPin,
} from "react-icons/fi";
import { FiEye } from "react-icons/fi";
import { useAppContext } from "../context/AppContext";
import { MdColorLens } from "react-icons/md";
import { FaPaintRoller, FaIndustry } from "react-icons/fa";

const getCurrentUserRole = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.role ?? null;
  } catch {
    return null;
  }
};

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { language = "ar", changeLanguage = () => {} } = useAppContext() ?? {};
  const userRole = getCurrentUserRole();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const designLinks = [
    ...(userRole === "designer" ? [{ nameKey: "sidebar.links.my_designs", path: "/designs/my", icon: FiLayers }] : []),
    { nameKey: "sidebar.links.designs_gallery", path: "/designs", icon: FiEye },
  ];

  const menuGroups = [
    {
      titleKey: "sidebar.groups.main",
      links: [{ nameKey: "sidebar.links.overview", path: "/dashboard", icon: FiHome }],
    },
    {
      titleKey: "sidebar.groups.management",
      links: [
        { nameKey: "sidebar.links.users", path: "/users", icon: FiUsers },
        { nameKey: "sidebar.links.customers", path: "/customers", icon: FiUserCheck },
        { nameKey: "sidebar.links.audit_logs", path: "/audit-logs", icon: FiShield },
        { nameKey: "sidebar.links.painters", path: "/painters", icon: FaPaintRoller },
        { nameKey: "sidebar.links.vendors", path: "/vendors", icon: FaIndustry },
        { nameKey: "sidebar.links.reviews", path: "/reviews", icon: FiStar },
      ],
    },
    {
      titleKey: "sidebar.groups.inventory",
      links: [
        { nameKey: "sidebar.links.products", path: "/products", icon: FiPackage },
        { nameKey: "sidebar.links.stock_management", path: "/InventoryPage", icon: FiBox },
        { nameKey: "sidebar.links.categories", path: "/categories", icon: FiLayers },
        { nameKey: "sidebar.links.colors_library", path: "/colors", icon: MdColorLens },
      ],
    },
    {
      titleKey: "sidebar.groups.smart_tools",
      links: [
        { nameKey: "sidebar.links.services", path: "/services", icon: FiCpu },
        { nameKey: "sidebar.links.color_visualizer", path: "/simulations", icon: FiEye },
      ],
    },
    ...(designLinks.length > 0
      ? [{ titleKey: "sidebar.groups.designs", links: designLinks }]
      : []),
    {
      titleKey: "sidebar.groups.business",
      links: [
        { nameKey: "sidebar.links.orders", path: "/orders", icon: FiShoppingCart },
        { nameKey: "sidebar.links.visit_requests", path: "/visit-requests", icon: FiMapPin },
        { nameKey: "sidebar.links.invoices", path: "/InvoicesPage", icon: FiFileText },
        { nameKey: "sidebar.links.wholesale_requests", path: "/requests", icon: FiClipboard },
        { nameKey: "sidebar.links.offers_specials", path: "/offers", icon: FiTag },
        { nameKey: "sidebar.links.settings", path: "/settings", icon: FiSettings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex-col h-screen sticky top-0 shadow-2xl hidden md:flex">
      {/* Logo */}
      <div className="p-6 text-2xl font-bold border-b border-slate-800 text-center tracking-tight text-blue-400">
        {t("sidebar.admin")}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6 mt-2 hide-scrollbar">
        {menuGroups.map((group, idx) => (
          <div key={idx}>
            <p className="text-[10px] uppercase text-slate-500 font-bold mb-3 px-2 tracking-[2px]">
              {t(group.titleKey)}
            </p>
            <div className="space-y-1">
              {group.links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                    location.pathname === link.path
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                      : "hover:bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <link.icon
                    className={`text-lg ${
                      location.pathname === link.path
                        ? "text-white"
                        : "group-hover:text-blue-400"
                    }`}
                  />
                  <span className="font-medium text-sm">{t(link.nameKey)}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Action Buttons (Language & Logout) */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-2">
        <button
          onClick={() => changeLanguage(language === "ar" ? "en" : "ar")}
          className="w-full flex items-center gap-3 p-3 cursor-pointer rounded-xl transition-all duration-200 text-slate-400 hover:bg-slate-800 hover:text-blue-400 group"
        >
          <FiGlobe className="text-lg group-hover:rotate-12 transition-transform" />
          <span className="font-medium text-sm">
            {language === "ar" ? t("sidebar.switch_english") : t("sidebar.switch_arabic")}
          </span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 cursor-pointer rounded-xl transition-all duration-200 text-rose-400 hover:bg-rose-500/10 hover:text-rose-500 group"
        >
          <FiLogOut className="text-lg group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm">{t("sidebar.logout")}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
