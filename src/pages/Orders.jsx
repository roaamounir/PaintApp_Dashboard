import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { useTranslation } from "react-i18next"; // استيراد الترجـمة
import {
  UserCheck,
  MapPin,
  Package,
  ShoppingBag,
  ClipboardList,
  X,
  Phone,
  Store,
} from "lucide-react";

const Orders = () => {
  const { t, i18n } = useTranslation();
  const { orders, visits, loading, updateOrderStatus, updateVisitStatus } =
    useAppContext();
  const [activeTab, setActiveTab] = useState("paints");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  const isRTL = i18n.language === "ar";

  if (loading)
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        <span className="font-bold text-slate-600">
          {t("common.loading") || "Loading..."}
        </span>
      </div>
    );
  return (
    <div
      className={`space-y-6 p-4 ${isRTL ? "font-cairo" : ""}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {t("orders.title")}
          </h1>
          <p className="text-slate-500 text-sm">{t("orders.subtitle")}</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("paints")}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "paints" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <ShoppingBag size={16} /> {t("orders.tabs.paints")}
          </button>
          <button
            onClick={() => setActiveTab("visits")}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "visits" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <ClipboardList size={16} /> {t("orders.tabs.visits")}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {activeTab === "paints" ? (
          <div className="overflow-x-auto">
            <table
              className={`w-full ${isRTL ? "text-right" : "text-left"} border-collapse`}
            >
              <thead className="bg-slate-50 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">{t("orders.table.order_info")}</th>
                  <th className="px-6 py-4">
                    {t("overview.transactions.source")}
                  </th>
                  <th className="px-6 py-4">{t("orders.table.customer")}</th>
                  <th className="px-6 py-4">{t("orders.table.vendor")}</th>
                  <th className="px-6 py-4">{t("orders.table.items")}</th>
                  <th className="px-6 py-4">{t("orders.table.total")}</th>
                  <th className="px-6 py-4 text-center">
                    {t("orders.table.status")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="text-[10px] font-black text-blue-600 uppercase mb-1 tracking-tighter">
                        {order.orderNumber || `ID: ${String(order.id).slice(0, 8)}`}
                      </div>
                      <div className="text-sm font-bold text-slate-700">
                        {new Date(order.createdAt).toLocaleDateString(
                          isRTL ? "ar-EG" : "en-GB",
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${order.source === "pos" ? "bg-purple-100 text-purple-600" : "bg-orange-100 text-orange-600"}`}
                      >
                        {order.source === "pos"
                          ? t("overview.charts.pos_system")
                          : t("overview.charts.mobile_app")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-800">
                        {order.user?.name}
                      </div>
                      <div className="text-[11px] text-blue-600 font-bold flex items-center gap-1 mt-1">
                        <MapPin size={10} className="text-blue-400" />
                        <span className="truncate max-w-[150px]">
                          {order.user?.city}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Store size={14} className="text-blue-500" />
                        <span className="text-sm font-bold text-slate-700">
                          {order.items?.[0]?.paint?.vendor?.shopName ||
                            "Internal"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      <span className="bg-slate-100 px-2 py-1 rounded-md text-[10px] font-bold text-slate-600">
                        {order.items?.length || 0} {t("orders.table.products")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-slate-800">
                      {(order.totalPrice || 0).toLocaleString()}{" "}
                      <span className="text-[10px] font-medium text-slate-400">
                        {t("customers.fields.egp")}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(order.id, e.target.value)
                        }
                        className={`text-[10px] font-bold uppercase border rounded-lg px-2 py-1 outline-none cursor-pointer transition-all ${order.status === "completed" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-blue-50 text-blue-600 border-blue-200"}`}
                      >
                        <option value="pending">
                          {t("painters.status.pending")}
                        </option>
                        <option value="completed">
                          {t("vendors.status.approved")}
                        </option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table
              className={`w-full ${isRTL ? "text-right" : "text-left"} border-collapse`}
            >
              <thead className="bg-slate-50 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">{t("visits.table.date_time")}</th>
                  <th className="px-6 py-4">{t("visits.table.customer")}</th>
                  <th className="px-6 py-4">{t("visits.table.painter")}</th>
                  <th className="px-6 py-4">{t("visits.table.area")}</th>
                  <th className="px-6 py-4 text-center">
                    {t("visits.table.status")}
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {visits.length > 0 ? (
                  visits.map((visit) => (
                    <tr
                      key={visit.id}
                      className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/visits/${visit.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-700">
                          {new Date(visit.visitDate).toLocaleDateString(
                            isRTL ? "ar-EG" : "en-GB",
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {visit.visitTime === "Morning Slot"
                            ? t("visits.table.slots.morning")
                            : visit.visitTime}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-800">
                          {visit.user?.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {visit.user?.phone}
                        </div>
                        <div className="text-[11px] text-blue-600 font-bold flex items-center gap-1 mt-1">
                          <MapPin size={10} className="text-blue-400" />
                          <span>
                            {visit.city || visit.user?.city}
                            {(visit.region || visit.user?.region) &&
                              `, ${visit.region || visit.user?.region}`}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            <UserCheck size={14} />
                          </div>
                          <span className="text-sm font-bold text-blue-600">
                            {visit.painter?.user?.name ||
                              t("visits.table.any_painter")}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm font-black text-slate-800">
                        {visit.area} m²
                      </td>

                      <td
                        className="px-6 py-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={visit.status}
                          onChange={(e) =>
                            updateVisitStatus(visit.id, e.target.value)
                          }
                          className={`text-[10px] font-bold uppercase border rounded-lg px-2 py-1 outline-none cursor-pointer transition-all ${
                            visit.status === "completed"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                              : visit.status === "pending"
                                ? "bg-amber-50 text-amber-600 border-amber-200"
                                : "bg-blue-50 text-blue-600 border-blue-200"
                          }`}
                        >
                          <option value="pending">
                            {t("painters.status.pending")}
                          </option>
                          <option value="accepted">
                            {t("vendors.status.approved")}
                          </option>
                          <option value="completed">
                            {t("orders.status.completed")}
                          </option>
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-20 text-center text-slate-400">
                      {t("visits.table.no_visits")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedOrder &&
        (() => {
          const total = selectedOrder.totalPrice || 0;
          const vat = total * 0.14;
          const commission = total * 0.1;
          const netProfit = total - vat - commission;

          return (
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              dir={isRTL ? "rtl" : "ltr"}
            >
              <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200 border border-slate-100">
                {/* Header */}
                <div className="p-6 border-b flex justify-between items-center bg-slate-50/80">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
                      <Package size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-800">
                        {t("orders.details.title")}
                        {selectedOrder.orderNumber ||
                          String(selectedOrder.id).slice(0, 8)}
                      </h2>
                      <div className="flex gap-3 mt-1">
                        <span className="text-[12px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-bold italic">
                          {t("orders.details.order_time")}:{" "}
                          {new Date(selectedOrder.createdAt).toLocaleString(
                            isRTL ? "ar-EG" : "en-GB",
                          )}
                        </span>
                        <span
                          className={`text-[12px] px-2 py-0.5 rounded-md font-bold uppercase ${
                            selectedOrder.status === "completed"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {t("orders.details.status_label")}:{" "}
                          {selectedOrder.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors text-slate-400"
                  >
                    <X size={28} />
                  </button>
                </div>

                <div className="p-8 overflow-y-auto flex-1 bg-white">
                  {/* Cards Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                      <h4 className="text-blue-600 font-black text-xs mb-4 flex items-center gap-2">
                        <UserCheck size={16} />{" "}
                        {t("orders.details.customer_info")}
                      </h4>
                      <div className="space-y-3">
                        <p className="text-sm font-bold text-slate-700">
                          {selectedOrder.user?.name}
                        </p>
                        <p className="text-sm text-slate-500 flex items-center gap-2 font-mono">
                          <Phone size={14} /> {selectedOrder.user?.phone}
                        </p>
                        <p className="text-sm text-slate-500 flex items-center gap-2">
                          <MapPin size={14} /> {selectedOrder.user?.city},{" "}
                          {selectedOrder.user?.region}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                      <h4 className="text-orange-600 font-black text-xs mb-4 flex items-center gap-2">
                        <Store size={16} /> {t("orders.details.store_info")}
                      </h4>
                      <div className="space-y-3">
                        <p className="text-sm font-bold text-slate-700">
                          {selectedOrder.items?.[0]?.paint?.vendor?.shopName ||
                            t("orders.details.main_system")}
                        </p>
                        <p className="text-sm text-slate-500">
                          {t("orders.details.items_count")}:{" "}
                          {selectedOrder.items?.length}
                        </p>
                        <p className="text-xs bg-orange-100 text-orange-700 w-fit px-2 py-1 rounded-lg font-bold">
                          {t("orders.details.source")}:{" "}
                          {selectedOrder.source || "App"}
                        </p>
                      </div>
                    </div>

                    <div className="bg-blue-600 p-5 rounded-3xl text-white shadow-xl shadow-blue-100 flex flex-col justify-center">
                      <p className="text-blue-100 text-xs font-bold mb-1">
                        {t("orders.details.total_invoice")}
                      </p>
                      <h2 className="text-3xl font-black">
                        {total.toLocaleString()}{" "}
                        <span className="text-sm font-light">EGP</span>
                      </h2>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="rounded-2xl border border-slate-100 overflow-hidden mb-8">
                    <table
                      className={`w-full ${isRTL ? "text-right" : "text-left"}`}
                    >
                      <thead className="bg-slate-50 text-slate-400 text-[11px] font-black uppercase">
                        <tr>
                          <th className="px-6 py-3">
                            {t("orders.details.table.product")}
                          </th>
                          <th className="px-6 py-3">
                            {t("orders.details.table.qty")}
                          </th>
                          <th className="px-6 py-3">
                            {t("orders.details.table.unit_price")}
                          </th>
                          <th className="px-6 py-3">
                            {t("orders.details.table.total")}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-sm">
                        {selectedOrder.items?.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-6 py-4 font-bold text-slate-700">
                              {item.paint?.name}
                            </td>
                            <td className="px-6 py-4 font-black">
                              x{item.quantity}
                            </td>
                            <td className="px-6 py-4 text-slate-500 font-mono">
                              {item.paint?.price} EGP
                            </td>
                            <td className="px-6 py-4 font-black text-blue-600 font-mono">
                              {(
                                item.quantity * item.paint?.price
                              ).toLocaleString()}{" "}
                              EGP
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Calculations Footer */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900 p-6 rounded-4xl text-white">
                    <div className="p-2">
                      <p className="text-slate-400 text-[10px] font-bold mb-1 uppercase">
                        {t("orders.details.calculations.customer_total")}
                      </p>
                      <p className="text-xl font-black font-mono">
                        {total.toLocaleString()} EGP
                      </p>
                    </div>
                    <div
                      className={`p-2 ${isRTL ? "border-r" : "border-l"} border-slate-800`}
                    >
                      <p className="text-amber-400 text-[10px] font-bold mb-1 uppercase">
                        {t("orders.details.calculations.vat")}
                      </p>
                      <p className="text-xl font-black font-mono">
                        {vat.toLocaleString()} EGP
                      </p>
                    </div>
                    <div
                      className={`p-2 ${isRTL ? "border-r" : "border-l"} border-slate-800`}
                    >
                      <p className="text-blue-400 text-[10px] font-bold mb-1 uppercase">
                        {t("orders.details.calculations.commission")}
                      </p>
                      <p className="text-xl font-black font-mono">
                        {commission.toLocaleString()} EGP
                      </p>
                    </div>
                    <div className="p-4 bg-emerald-500/20 rounded-2xl border border-emerald-500/30">
                      <p className="text-emerald-400 text-[10px] font-bold mb-1 uppercase">
                        {t("orders.details.calculations.net_profit")}
                      </p>
                      <p className="text-2xl font-black text-emerald-400 font-mono">
                        {netProfit.toLocaleString()} EGP
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 bg-slate-50 border-t flex gap-4">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 bg-white border border-slate-200 py-3 rounded-2xl font-bold text-slate-700 hover:bg-slate-100 transition duration-200 shadow-sm"
                  >
                    {t("orders.details.actions.print")}
                  </button>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="flex-[2] bg-slate-900 text-white py-3 rounded-2xl font-bold hover:bg-black transition duration-200 shadow-lg"
                  >
                    {t("orders.details.actions.close")}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
};

export default Orders;
