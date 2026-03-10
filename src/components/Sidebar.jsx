import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
} from "react-icons/fi";
import { FiEye } from "react-icons/fi"; 
import { AppContext } from "../context/AppContext";
import { MdColorLens } from "react-icons/md";
import { FaPaintRoller, FaIndustry } from "react-icons/fa";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, changeLanguage } = useContext(AppContext);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const menuGroups = [
    {
      title: "Main",
      links: [{ name: "Overview", path: "/dashboard", icon: FiHome }],
    },
    {
      title: "Management",
      links: [
        { name: "Users", path: "/users", icon: FiUsers },
        { name: "Customers", path: "/customers", icon: FiUserCheck },
        { name: "Audit Logs", path: "/audit-logs", icon: FiShield },
        { name: "Painters", path: "/painters", icon: FaPaintRoller },
        { name: "Vendors", path: "/vendors", icon: FaIndustry },
        { name: "Reviews", path: "/reviews", icon: FiStar },
      ],
    },
    {
      title: "Inventory",
      links: [
        { name: "Products", path: "/products", icon: FiPackage },
        { name: "Stock Management", path: "/InventoryPage", icon: FiBox },
        { name: "Categories", path: "/categories", icon: FiLayers },
        { name: "Colors Library", path: "/colors", icon: MdColorLens },
      ],
    },
    {
      title: "Smart Tools",
      links: [
        { name: "Services", path: "/services", icon: FiCpu },
        { name: "Color Visualizer", path: "/simulations", icon: FiEye },
      ],
    },
    {
      title: "Business",
      links: [
        { name: "Orders", path: "/orders", icon: FiShoppingCart },
        { name: "Invoices", path: "/InvoicesPage", icon: FiFileText },
        { name: "Wholesale Requests", path: "/requests", icon: FiClipboard },
        { name: "Offers & Specials", path: "/offers", icon: FiTag },
        { name: "Settings", path: "/settings", icon: FiSettings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex h-screen sticky top-0 shadow-2xl">
      {/* Logo */}
      <div className="p-6 text-2xl font-bold border-b border-slate-800 text-center tracking-tight text-blue-400">
        Admin
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6 mt-2 hide-scrollbar">
        {menuGroups.map((group, idx) => (
          <div key={idx}>
            <p className="text-[10px] uppercase text-slate-500 font-bold mb-3 px-2 tracking-[2px]">
              {group.title}
            </p>
            <div className="space-y-1">
              {group.links.map((link) => (
                <Link
                  key={link.name}
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
                  <span className="font-medium text-sm">{link.name}</span>
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
            {language === "ar" ? "English" : "العربية"}
          </span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 cursor-pointer rounded-xl transition-all duration-200 text-rose-400 hover:bg-rose-500/10 hover:text-rose-500 group"
        >
          <FiLogOut className="text-lg group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
