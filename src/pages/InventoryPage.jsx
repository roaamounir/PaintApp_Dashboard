import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../context/AppContext";
import {
  RefreshCw,
  Edit2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Package,
  TrendingDown,
  Layers,
} from "lucide-react";

const InventoryPage = () => {
  const { t } = useTranslation(); 
  const { paints, updatePaintQuantity, fetchPaints, loading } = useAppContext();
  const [search, setSearch] = useState("");

  /* ======================
      Helpers
  ====================== */

  const getStockStatus = (stock, minLevel = 5) => {
    if (stock <= 0)
      return {
        label: t("inventory.status.outOfStock") || "Out of Stock",
        color: "bg-red-100 text-red-700",
        icon: <XCircle size={14} />,
      };

    if (stock <= minLevel)
      return {
        label: t("messages.lowStock") || "Low Stock",
        color: "bg-amber-100 text-amber-700",
        icon: <AlertTriangle size={14} />,
      };
    return {
      label: t("options.available") || "Available",
      color: "bg-emerald-100 text-emerald-700",
      icon: <CheckCircle size={14} />,
    };
  };

  const filteredPaints = paints.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const lowStockCount = paints.filter(
    (p) => p.stock > 0 && p.stock <= (p.minStockLevel || 5),
  ).length;

  const outOfStockCount = paints.filter((p) => p.stock === 0).length;

  /* ======================
      UI
  ====================== */

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800">
            {t("inventory.title")}
          </h1>
          <p className="text-slate-500 text-sm">{t("inventory.subtitle")}</p>
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder={t("inventory.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-xl w-64 focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          <button
            disabled={loading}
            onClick={fetchPaints}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            {t("common.loading") && loading ? t("common.loading") : "Refresh"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={<Package />}
          label={t("overview.stats.total_products")}
          value={paints.length}
          color="blue"
        />
        <StatCard
          icon={<TrendingDown />}
          label={t("overview.stats.low_stock")}
          value={lowStockCount}
          color="amber"
        />
        <StatCard
          icon={<Layers />}
          label={t("inventory.status.outOfStock") || "Out of Stock"}
          value={outOfStockCount}
          color="red"
        />
      </div>
      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border">
        <table className="w-full text-left">
          <thead className="bg-slate-100 border-b">
            <tr>
              <th className="p-5 font-semibold">{t("table.productDetail")}</th>
              <th className="p-5 font-semibold">{t("table.stockPrice")}</th>
              <th className="p-5 font-semibold">
                {t("overview.alerts.limit")}
              </th>
              <th className="p-5 font-semibold">
                {t("painters.table.status")}
              </th>
              <th className="p-5 font-semibold">{t("audit.table.date")}</th>
              <th className="p-5 font-semibold text-center">
                {t("table.actions")}
              </th>{" "}
            </tr>
          </thead>

          <tbody className="divide-y">
            {filteredPaints.length === 0 && (
              <tr>
                <td colSpan="6" className="p-20 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <Package size={48} className="text-slate-200" />
                    <p>{t("audit.empty.title")}</p>
                  </div>
                </td>
              </tr>
            )}

            {filteredPaints.map((item) => {
              const status = getStockStatus(item.stock, item.minStockLevel);

              return (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-5">
                    <p className="font-bold text-slate-700">{item.name}</p>
                    <p className="text-xs text-slate-400">
                      {item.category?.name || "Paint"}
                    </p>
                  </td>

                  <td
                    className={`p-5 font-black text-lg ${item.stock <= (item.minStockLevel || 5) ? "text-red-600" : "text-slate-800"}`}
                  >
                    {item.stock}{" "}
                    <span className="text-xs font-normal text-slate-400">
                      {t("overview.alerts.units")}
                    </span>
                  </td>

                  <td className="p-5 text-slate-600 font-medium">
                    {item.minStockLevel || 5}
                  </td>
                  <td className="p-5">
                    <span
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black w-fit ${status.color}`}
                    >
                      {status.icon} {status.label}
                    </span>
                  </td>

                  <td className="p-5 text-slate-400 text-sm">
                    {item.updatedAt
                      ? new Date(item.updatedAt).toLocaleDateString()
                      : "---"}
                  </td>

                  <td className="p-5">
                    <button
                      onClick={() => {
                        const newQty = prompt(
                          `${t("modal.updateTitle")}: ${item.name}`,
                          item.stock,
                        );
                        if (newQty !== null && !isNaN(newQty))
                          updatePaintQuantity(item.id, Number(newQty));
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all inline-block"
                    >
                      <Edit2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Alerts */}
      {lowStockCount > 0 && (
        <div className="mt-6 space-y-3">
          {paints
            .filter((p) => p.stock <= (p.minStockLevel || 5))
            .map((p) => (
              <div
                key={p.id}
                className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex justify-between items-center"
              >
                <div className="flex items-center gap-3 text-red-700">
                  <AlertTriangle />
                  <span className="font-bold">{p.name} is running low</span>
                </div>

                <span className="font-black text-red-700">
                  Remaining: {p.stock}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

/* ======================
    Reusable Stat Card
====================== */

const StatCard = ({ icon, label, value, color }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    amber: "bg-amber-100 text-amber-600",
    red: "bg-red-100 text-red-600",
  };
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`p-4 rounded-xl ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className="text-2xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
};
export default InventoryPage;
