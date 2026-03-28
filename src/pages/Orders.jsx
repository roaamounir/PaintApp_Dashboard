import React, { useEffect, useState } from "react";
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
import { getJwtRole } from "../utils/jwtUser.js";

const Orders = () => {
  const { t, i18n } = useTranslation();
  const isVendor = getJwtRole() === "vendor";
  const {
    orders,
    visits,
    visitRequests,
    fetchVisitRequests,
    fetchDesigns,
    fetchDesignRequests,
    loadingStates,
    updateOrderStatus,
    updateVisitStatus,
  } =
    useAppContext();
  const [activeTab, setActiveTab] = useState("paints");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [designerRequests, setDesignerRequests] = useState([]);
  const navigate = useNavigate();

  const isRTL = i18n.language === "ar";
  const productOrderStatuses = [
    "pending",
    "confirmed",
    "preparing",
    "shipped",
    "delivered",
    "cancelled",
  ];
  const legacyStatusMap = {
    accepted: "confirmed",
    completed: "delivered",
    canceled: "cancelled",
  };
  const normalizeProductStatus = (status) =>
    legacyStatusMap[String(status || "").toLowerCase()] || String(status || "").toLowerCase();
  const getStatusBadgeClass = (status) => {
    const s = normalizeProductStatus(status);
    if (s === "delivered") return "bg-emerald-50 text-emerald-600 border-emerald-200";
    if (s === "cancelled") return "bg-rose-50 text-rose-600 border-rose-200";
    if (s === "shipped") return "bg-indigo-50 text-indigo-600 border-indigo-200";
    return "bg-blue-50 text-blue-600 border-blue-200";
  };
  const renderStatusLabel = (status) =>
    t(`orders.status.${normalizeProductStatus(status)}`, {
      defaultValue: normalizeProductStatus(status) || "-",
    });

  useEffect(() => {
    if (isVendor) setActiveTab("paints");
  }, [isVendor]);

  useEffect(() => {
    fetchVisitRequests({}).catch(() => {});
  }, [fetchVisitRequests]);

  useEffect(() => {
    const loadDesignerRequests = async () => {
      try {
        const designs = await fetchDesigns({});
        const list = Array.isArray(designs) ? designs : [];
        const settled = await Promise.allSettled(
          list.map(async (d) => {
            const reqs = await fetchDesignRequests(d.id);
            return (Array.isArray(reqs) ? reqs : []).map((r) => ({
              ...r,
              designTitle: d.title || "—",
            }));
          }),
        );
        const merged = settled
          .filter((s) => s.status === "fulfilled")
          .flatMap((s) => s.value);
        merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setDesignerRequests(merged);
      } catch {
        setDesignerRequests([]);
      }
    };
    loadDesignerRequests();
  }, [fetchDesignRequests, fetchDesigns, isVendor]);

  if (loadingStates?.orders)
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
            onClick={() => setActiveTab("inspection")}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "inspection" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <ClipboardList size={16} /> {t("orders.tabs.inspection_requests", { defaultValue: "طلبات المعاينة" })}
          </button>
          <button
            onClick={() => setActiveTab("designer")}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "designer" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <ClipboardList size={16} /> {t("orders.tabs.designer_requests", { defaultValue: "طلبات المصمم" })}
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
                  <th className="px-6 py-4">
                    {isVendor ? t("orders.admin_catalog") : t("orders.table.vendor")}
                  </th>
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
                        className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${
                          order.source === "wholesale"
                            ? "bg-amber-100 text-amber-700"
                            : order.source === "pos"
                              ? "bg-purple-100 text-purple-600"
                              : "bg-orange-100 text-orange-600"
                        }`}
                      >
                        {order.source === "wholesale"
                          ? t("overview.vendor.source_wholesale")
                          : order.source === "pos"
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
                          {isVendor
                            ? t("orders.admin_catalog")
                            : order.items?.[0]?.paint?.vendor?.shopName || "Internal"}
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
                      {isVendor ? (
                        <span
                          className={`text-[10px] font-bold uppercase border rounded-lg px-2 py-1 inline-block ${getStatusBadgeClass(order.status)}`}
                        >
                          {renderStatusLabel(order.status)}
                        </span>
                      ) : (
                        <select
                          value={normalizeProductStatus(order.status)}
                          onChange={(e) =>
                            updateOrderStatus(order.id, e.target.value)
                          }
                          className={`text-[10px] font-bold uppercase border rounded-lg px-2 py-1 outline-none cursor-pointer transition-all ${getStatusBadgeClass(order.status)}`}
                        >
                          {productOrderStatuses.map((status) => (
                            <option key={status} value={status}>
                              {t(`orders.status.${status}`, { defaultValue: status })}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === "visits" ? (
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
        ) : activeTab === "inspection" ? (
          <div className="overflow-x-auto">
            <table className={`w-full ${isRTL ? "text-right" : "text-left"} border-collapse`}>
              <thead className="bg-slate-50 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">{t("visitRequests.date", { defaultValue: "التاريخ" })}</th>
                  <th className="px-6 py-4">{t("visitRequests.time", { defaultValue: "الوقت" })}</th>
                  <th className="px-6 py-4">{t("visitRequests.client_name", { defaultValue: "اسم العميل" })}</th>
                  <th className="px-6 py-4">{t("visitRequests.client_phone", { defaultValue: "موبايل العميل" })}</th>
                  <th className="px-6 py-4">{t("visitRequests.address", { defaultValue: "العنوان" })}</th>
                  <th className="px-6 py-4">{t("visitRequests.status_pending", { defaultValue: "الحالة" })}</th>
                  <th className="px-6 py-4 text-center">{t("orders.details.actions.view_details", { defaultValue: "عرض التفاصيل" })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(visitRequests || []).length > 0 ? (
                  visitRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">{req.scheduledDate}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{req.scheduledTime}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-800">{req.clientName || "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{req.clientPhone || "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {req.region ? `${req.region} - ` : ""}
                        {req.address}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold uppercase bg-slate-100 px-2 py-1 rounded-md">
                          {t(`visitRequests.status_${req.status}`, { defaultValue: req.status })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder({ ...req, __isVisitRequest: true })}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                        >
                          {t("orders.details.actions.view_details", { defaultValue: "عرض التفاصيل" })}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-20 text-center text-slate-400">
                      {t("visits.table.no_visits", { defaultValue: "لا توجد طلبات معاينة" })}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`w-full ${isRTL ? "text-right" : "text-left"} border-collapse`}>
              <thead className="bg-slate-50 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">{t("orders.designer.table.date", { defaultValue: "التاريخ" })}</th>
                  <th className="px-6 py-4">{t("orders.designer.table.time", { defaultValue: "الوقت" })}</th>
                  <th className="px-6 py-4">{t("orders.designer.table.client_name", { defaultValue: "اسم العميل" })}</th>
                  <th className="px-6 py-4">{t("orders.designer.table.design", { defaultValue: "اسم التصميم" })}</th>
                  <th className="px-6 py-4">{t("orders.designer.table.client_phone", { defaultValue: "موبايل العميل" })}</th>
                  <th className="px-6 py-4">{t("orders.designer.table.address", { defaultValue: "العنوان" })}</th>
                  <th className="px-6 py-4">{t("orders.designer.table.design_id", { defaultValue: "designId" })}</th>
                  <th className="px-6 py-4 text-center">{t("orders.details.actions.view_details", { defaultValue: "عرض التفاصيل" })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {designerRequests.length > 0 ? (
                  designerRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">
                        {new Date(req.createdAt).toLocaleDateString(isRTL ? "ar-EG" : "en-GB")}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {new Date(req.createdAt).toLocaleTimeString("en-GB-u-nu-latn", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-800">{req.clientName || "-"}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-800">{req.designTitle}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{req.clientPhone || "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{req.address || req.clientAddress || "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{req.designId || "-"}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder({ ...req, __isDesignerRequest: true })}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                        >
                          {t("orders.details.actions.view_details", { defaultValue: "عرض التفاصيل" })}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="p-20 text-center text-slate-400">
                      {t("orders.designer.no_requests", { defaultValue: "لا توجد طلبات مصمم" })}
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
          if (selectedOrder.__isDesignerRequest) {
            return (
              <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                dir={isRTL ? "rtl" : "ltr"}
              >
                <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-black text-slate-800">
                      {t("orders.tabs.designer_requests", { defaultValue: "تفاصيل طلب المصمم" })}
                    </h2>
                    <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-red-500">
                      <X size={24} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div><span className="font-bold">{t("orders.designer.table.date", { defaultValue: "التاريخ" })}:</span> {new Date(selectedOrder.createdAt).toLocaleDateString(isRTL ? "ar-EG" : "en-GB")}</div>
                    <div><span className="font-bold">{t("orders.designer.table.time", { defaultValue: "الوقت" })}:</span> {new Date(selectedOrder.createdAt).toLocaleTimeString("en-GB-u-nu-latn", { hour: "2-digit", minute: "2-digit" })}</div>
                    <div><span className="font-bold">{t("orders.designer.table.client_name", { defaultValue: "اسم العميل" })}:</span> {selectedOrder.clientName || "-"}</div>
                    <div><span className="font-bold">{t("orders.designer.table.design", { defaultValue: "التصميم" })}:</span> {selectedOrder.designTitle || "-"}</div>
                    <div><span className="font-bold">{t("orders.designer.table.client_phone", { defaultValue: "موبايل العميل" })}:</span> {selectedOrder.clientPhone || "-"}</div>
                    <div><span className="font-bold">{t("orders.designer.table.address", { defaultValue: "العنوان" })}:</span> {selectedOrder.address || selectedOrder.clientAddress || "-"}</div>
                    <div><span className="font-bold">{t("orders.designer.table.design_id", { defaultValue: "designId" })}:</span> {selectedOrder.designId || "-"}</div>
                    <div><span className="font-bold">{t("orders.designer.table.status", { defaultValue: "الحالة" })}:</span> {selectedOrder.status || "-"}</div>
                    <div><span className="font-bold">{t("orders.designer.table.description", { defaultValue: "الوصف" })}:</span> {selectedOrder.description || "-"}</div>
                    <div><span className="font-bold">Image URL:</span> {selectedOrder.imageUrl || "-"}</div>
                    <div><span className="font-bold">Video URL:</span> {selectedOrder.videoUrl || "-"}</div>
                  </div>
                </div>
              </div>
            );
          }
          if (selectedOrder.__isVisitRequest) {
            return (
              <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                dir={isRTL ? "rtl" : "ltr"}
              >
                <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-black text-slate-800">
                      {t("orders.tabs.inspection_requests", { defaultValue: "تفاصيل طلب المعاينة" })}
                    </h2>
                    <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-red-500">
                      <X size={24} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div><span className="font-bold">{t("visitRequests.date")}:</span> {selectedOrder.scheduledDate}</div>
                    <div><span className="font-bold">{t("visitRequests.time")}:</span> {selectedOrder.scheduledTime}</div>
                    <div><span className="font-bold">{t("visitRequests.client_name")}:</span> {selectedOrder.clientName || "-"}</div>
                    <div><span className="font-bold">{t("visitRequests.client_phone")}:</span> {selectedOrder.clientPhone || "-"}</div>
                    <div className="md:col-span-2"><span className="font-bold">{t("visitRequests.address")}:</span> {selectedOrder.address}</div>
                    <div><span className="font-bold">{t("visitRequests.region")}:</span> {selectedOrder.region || "-"}</div>
                    <div><span className="font-bold">{t("visitRequests.area")}:</span> {selectedOrder.area ?? "-"}</div>
                    <div className="md:col-span-2"><span className="font-bold">{t("visitRequests.notes")}:</span> {selectedOrder.notes || "-"}</div>
                  </div>
                </div>
              </div>
            );
          }
          const total = selectedOrder.totalPrice || 0;

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
                          className={`text-[12px] px-2 py-0.5 rounded-md font-bold uppercase ${getStatusBadgeClass(
                            selectedOrder.status,
                          )}`}
                        >
                          {t("orders.details.status_label")}:{" "}
                          {renderStatusLabel(selectedOrder.status)}
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
                          <Phone size={14} /> {selectedOrder.shipping?.phone || selectedOrder.user?.phone}
                        </p>
                        <p className="text-sm text-slate-500 flex items-center gap-2">
                          <MapPin size={14} /> {selectedOrder.shipping?.city || selectedOrder.user?.city},{" "}
                          {selectedOrder.user?.region}
                        </p>
                        <p className="text-sm text-slate-500">
                          {selectedOrder.shipping?.addressLine1 || "-"}
                        </p>
                        <p className="text-sm text-slate-500">
                          {selectedOrder.shipping?.addressLine2 || "-"}
                        </p>
                        <p className="text-sm text-slate-500">
                          {t("order.postal_code", { defaultValue: "Postal Code" })}: {selectedOrder.shipping?.postalCode || "-"}
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
                        {selectedOrder.items?.map((item, idx) => {
                          const unitCharged =
                            item.unitPrice != null && item.unitPrice !== ""
                              ? Number(item.unitPrice)
                              : Number(item.paint?.price ?? 0);
                          return (
                          <tr key={idx}>
                            <td className="px-6 py-4 font-bold text-slate-700">
                              {item.paint?.name}
                            </td>
                            <td className="px-6 py-4 font-black">
                              x{item.quantity}
                            </td>
                            <td className="px-6 py-4 text-slate-500 font-mono">
                              {unitCharged} EGP
                            </td>
                            <td className="px-6 py-4 font-black text-blue-600 font-mono">
                              {(item.quantity * unitCharged).toLocaleString()}{" "}
                              EGP
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
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
                    className="flex-2 bg-slate-900 text-white py-3 rounded-2xl font-bold hover:bg-black transition duration-200 shadow-lg"
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
