import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Box,
  Droplet,
  ShieldCheck,
  TrendingUp,
  Truck,
  History,
  DollarSign,
  AlertTriangle,
  Tag,
} from "lucide-react";
import { getUnitPriceForBuyer, paintHasWholesale } from "../utils/buyerPricing.js";

// HEX helpers
const isValidHex = (val) => {
  if (!val) return false;
  const h = String(val).trim().replace(/^#/, "");
  return /^([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(h);
};
const toDisplayHex = (val) => {
  if (!isValidHex(val)) return null;
  const h = String(val).trim().replace(/^#/, "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return "#" + full.toUpperCase();
};

// استخراج دور المستخدم من التوكن
const getApiBase = () => {
  const env = import.meta.env.VITE_API_URL;
  if (env && String(env).trim()) return String(env).replace(/\/$/, "");
  if (typeof window !== "undefined") return `${window.location.origin}/api-backend`;
  return "http://localhost:5000";
};

const resolveMediaUrl = (base, pathOrUrl) => {
  if (pathOrUrl == null || String(pathOrUrl).trim() === "") return null;
  const s = String(pathOrUrl).trim();
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("/")) return `${base}${s}`;
  return `${base}/${s}`;
};

const getUserAuth = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return { role: null, canBuyWholesale: false };
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      role: payload?.role ?? null,
      canBuyWholesale: Boolean(payload?.canBuyWholesale),
    };
  } catch {
    return { role: null, canBuyWholesale: false };
  }
};
const WHOLESALE_ROLES = ["admin", "vendor", "designer"];
const WHOLESALE_BUYER_ROLES = ["vendor", "designer"];

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const { getPaintDetails } = useAppContext();
  const [productData, setProductData] = useState(null);
  const [loadingLocal, setLoadingLocal] = useState(true);
  const API_BASE = getApiBase();

  useEffect(() => {
    const loadDetails = async () => {
      setLoadingLocal(true);
      const data = await getPaintDetails(id);
      if (data) {
        setProductData(data);
      }
      setLoadingLocal(false);
    };
    loadDetails();
  }, [id, getPaintDetails]);

  if (loadingLocal) {
    return (
      <div
        className="flex items-center justify-center h-screen bg-slate-50"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-200 rounded-full mb-4"></div>
          <p className="text-slate-500 font-bold">{t("product.loading")}</p>
        </div>
      </div>
    );
  }

  const product = productData;
  const productSales = productData?.orderItems || [];
  const supplier = productData?.vendor;

  const totalSold = productData?.analytics?.totalSoldQuantity || 0;
  const movementsTotal =
    productData?.analytics?.orderMovementsTotal ?? productSales.length;
  const movementsShown =
    productData?.analytics?.orderMovementsShown ?? productSales.length;
  const stockValue = Number(product?.stock || 0) * Number(product?.price || 0);
  const { role: userRole, canBuyWholesale } = getUserAuth();
  const canSeeWholesale = WHOLESALE_ROLES.includes(userRole) || canBuyWholesale;
  const isWholesaleBuyer = WHOLESALE_BUYER_ROLES.includes(userRole) || canBuyWholesale;
  const hasWholesalePrice = product ? paintHasWholesale(product) : false;
  const buyerEffectivePrice = product
    ? getUnitPriceForBuyer(userRole, product, canBuyWholesale)
    : 0;
  if (!product && !loadingLocal) {
    return (
      <div
        className="flex flex-col items-center justify-center h-screen bg-slate-50 p-6"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="bg-white p-12 rounded-3xl shadow-xl text-center max-w-md border border-slate-100">
          <div className="bg-amber-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={40} className="text-amber-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">
            {t("product.not_found_title")}
          </h2>
          <p className="text-slate-400 font-medium mb-8 leading-relaxed">
            {t("product.not_found_desc")}
          </p>
          <button
            onClick={() => navigate("/products")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} className={isRTL ? "rotate-180" : ""} />{" "}
            {t("product.back_to_list")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-8 bg-slate-50 min-h-screen font-sans"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Navigation */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-all font-bold text-sm bg-white px-4 py-2 rounded-xl shadow-sm"
        >
          <ArrowLeft size={18} className={isRTL ? "rotate-180" : ""} />{" "}
          {t("common.back_to_inventory")}
        </button>
        <span className="bg-white px-4 py-2 rounded-xl shadow-sm text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {t("common.last_synced")}:{" "}
          {new Date().toLocaleTimeString(isRTL ? "ar-EG" : "en-US")}
        </span>
      </div>

      {/* Hero Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm mb-8 border border-slate-100 relative overflow-hidden">
        <div
          className={`absolute top-0 ${isRTL ? "left-0" : "right-0"} p-12 opacity-5 pointer-events-none`}
        >
          <Droplet size={120} className="text-blue-600" />
        </div>
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8 relative z-10">
          <div className={`${isRTL ? "text-right" : "text-left"} flex-1 min-w-0`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                {product.Category?.name || t("product.default_category")}
              </span>
              {product.sku ? (
                <span className="flex items-center gap-2 bg-slate-800 text-white px-3 py-1.5 rounded-full text-[10px] font-mono font-black uppercase tracking-widest">
                  <span
                    className="w-4 h-4 rounded-full border-2 border-white/30 shrink-0"
                    style={{ backgroundColor: toDisplayHex(product.sku) ?? "#6b7280" }}
                  />
                  #{String(product.sku).replace(/^#/, "").toUpperCase()}
                </span>
              ) : (
                <span className="bg-slate-100 text-slate-400 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                  {t("product.sku")}: {product.id?.slice(0, 8)}…
                </span>
              )}
            </div>
            <h1 className="text-5xl font-black text-slate-800 tracking-tight mb-2">
              {product.name}
            </h1>
            <p className="text-slate-400 font-medium max-w-xl text-sm leading-relaxed">
              {product.description || t("product.default_desc")}
            </p>
          </div>
          {resolveMediaUrl(API_BASE, product.image) && (
            <div className="shrink-0">
              <img
                src={resolveMediaUrl(API_BASE, product.image)}
                alt={product.name || ""}
                className="w-40 h-40 md:w-48 md:h-48 object-cover rounded-3xl border border-slate-100 shadow-md bg-slate-100"
              />
            </div>
          )}
          <div
            className={`${isRTL ? "text-left" : "text-right"} mt-6 lg:mt-0 space-y-3 shrink-0`}
          >
            {isWholesaleBuyer ? (
              /* تاجر / مصمم: سعر واحد = جملة إن وُجد، وإلا سعر التجزئة */
              <div
                className={`p-5 rounded-3xl border ${
                  hasWholesalePrice
                    ? "bg-amber-50/50 border-amber-200"
                    : "bg-blue-50/50 border-blue-100"
                }`}
              >
                <p
                  className={`text-4xl font-black ${
                    hasWholesalePrice ? "text-amber-700" : "text-blue-700"
                  }`}
                >
                  {buyerEffectivePrice}{" "}
                  <span className="text-sm font-bold">{t("common.currency")}</span>
                </p>
                <p
                  className={`text-[10px] font-black uppercase mt-1 ${
                    hasWholesalePrice ? "text-amber-500" : "text-blue-400"
                  }`}
                >
                  {hasWholesalePrice
                    ? t("product.wholesale_price", { defaultValue: "سعر الجملة" })
                    : t("product.unit_price")}
                </p>
                {hasWholesalePrice && (
                  <p className="text-sm text-slate-400 line-through mt-2">
                    {product.price} {t("common.currency")}{" "}
                    <span className="text-[10px] font-normal not-italic">
                      ({t("product.unit_price")})
                    </span>
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="bg-blue-50/50 p-5 rounded-3xl border border-blue-100">
                  <p className="text-4xl font-black text-blue-700">
                    {product.price}{" "}
                    <span className="text-sm font-bold">{t("common.currency")}</span>
                  </p>
                  <p className="text-[10px] font-black text-blue-400 uppercase mt-1">
                    {t("product.unit_price")}
                  </p>
                </div>

                {canSeeWholesale && product.wholesalePrice != null && (
                  <div className="bg-amber-50 p-4 rounded-3xl border border-amber-200 flex items-center gap-3">
                    <Tag size={16} className="text-amber-600 shrink-0" />
                    <div className={isRTL ? "text-right" : "text-left"}>
                      <p className="text-xl font-black text-amber-700">
                        {product.wholesalePrice}{" "}
                        <span className="text-xs font-bold">{t("common.currency")}</span>
                      </p>
                      <p className="text-[10px] font-black text-amber-500 uppercase">
                        {t("product.wholesale_price", { defaultValue: "سعر الجملة" })}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          label={t("product.stats_stock")}
          value={`${product.stock} ${t("common.units")}`}
          icon={Box}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatCard
          label={t("product.stats_sold")}
          value={`${totalSold} ${t("common.units")}`}
          icon={TrendingUp}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <StatCard
          label={t("product.stats_value")}
          value={`${stockValue.toLocaleString()} ${t("common.currency")}`}
          icon={DollarSign}
          color="text-amber-600"
          bg="bg-amber-50"
        />
        <StatCard
          label={t("product.stats_supplier")}
          value={supplier?.shopName || t("product.admin_catalog", { defaultValue: "مخزون الإدارة" })}
          icon={Truck}
          color="text-purple-600"
          bg="bg-purple-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Technical Specs & Safety */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2 border-b pb-4">
              <ShieldCheck className="text-blue-500" size={20} />{" "}
              {t("product.tech_details_title")}
            </h3>
            <div className="space-y-6">
              <SpecItem
                label={t("product.spec_base")}
                value={product.base || t("product.base_water")}
              />
              <SpecItem
                label={t("product.spec_finish")}
                value={product.finish || t("product.finish_matt")}
              />
              <SpecItem
                label={t("product.spec_coverage")}
                value={`${product.coverage || 0} ${t("common.unit_coverage")}`}
                highlight
              />
              <SpecItem
                label={t("product.spec_drying")}
                value={`${product.dryDays || 1} ${t("common.days")}`}
              />
              <SpecItem
                label={t("product.spec_weight") || "الوزن"}
                value={`${(product.weightKg ?? product.weightkg ?? 1)} kg`}
              />
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-3xl shadow-xl text-white">
            <h3 className="font-black mb-4 flex items-center gap-2">
              {t("product.inventory_health")}
            </h3>
            <div className="flex items-end justify-between mb-2">
              <p className="text-3xl font-black">{product.stock}</p>
              <p className="text-slate-400 text-xs">
                {t("product.min_level")}: {product.minStockLevel || 5}
              </p>
            </div>
            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${product.stock <= (product.minStockLevel || 5) ? "bg-red-500" : "bg-emerald-500"}`}
                style={{
                  width: `${Math.min((product.stock / ((product.minStockLevel || 5) * 3)) * 100, 100)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-center mb-6">
            <h3 className="font-black text-slate-800 flex items-center gap-2 text-xl">
              <History className="text-blue-500" size={24} />{" "}
              {t("product.history_title")}
            </h3>
            {movementsTotal > 0 && (
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                {movementsTotal > movementsShown
                  ? t("product.history_showing_last", {
                      shown: movementsShown,
                      total: movementsTotal,
                    })
                  : t("product.history_all_movements", {
                      count: movementsTotal,
                    })}
              </p>
            )}
          </div>

          {productSales.length > 0 ? (
            <div className="max-h-[min(28rem,55vh)] overflow-y-auto overflow-x-auto rounded-xl border border-slate-100 shadow-inner bg-slate-50/30">
              <table
                className={`w-full min-w-[640px] ${isRTL ? "text-right" : "text-left"}`}
              >
                <thead className="sticky top-0 z-1 text-[10px] text-slate-400 font-black uppercase border-b border-slate-200 bg-white shadow-sm">
                  <tr>
                    <th className="pb-4">{t("product.history_trn")}</th>
                    <th className="pb-4">{t("product.history_details")}</th>
                    <th className="pb-4">{t("product.history_qty")}</th>
                    <th className="pb-4">{t("product.history_price_type")}</th>
                    <th
                      className={`pb-4 ${isRTL ? "text-left" : "text-right"}`}
                    >
                      {t("product.history_revenue")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {productSales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-4 text-xs font-bold text-blue-600">
                        #TRN-{sale.id}
                      </td>
                      <td className="py-4 text-xs font-bold text-slate-700">
                        {sale.User?.name || t("product.standard_sale")}
                      </td>
                      <td className="py-4 text-xs font-black">
                        -{sale.quantity}
                      </td>
                      <td className="py-4 text-xs font-bold text-slate-600">
                        {sale.salePriceType === "wholesale"
                          ? t("product.sale_price_wholesale")
                          : sale.salePriceType === "retail"
                            ? t("product.sale_price_retail")
                            : t("product.sale_price_other")}
                      </td>
                      <td
                        className={`py-4 text-xs font-black ${isRTL ? "text-left" : "text-right"}`}
                      >
                        {sale.totalPrice} {t("common.currency")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-4xl border-2 border-dashed">
              <TrendingUp size={40} className="text-slate-200 mb-2" />
              <p className="text-slate-400 font-bold">
                {t("product.no_sales")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color, bg }) => {
  const IconEl = icon;
  return (
    <div className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm">
      <div
        className={`${bg} ${color} w-10 h-10 rounded-xl flex items-center justify-center mb-4`}
      >
        <IconEl size={20} />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
        {label}
      </p>
      <p className="text-xl font-black text-slate-800">{value}</p>
    </div>
  );
};

const SpecItem = ({ label, value, highlight }) => {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-400 font-bold text-xs uppercase">
        {label}
      </span>
      <span
        className={`font-bold ${highlight ? "text-emerald-600" : "text-slate-700"}`}
      >
        {value}
      </span>
    </div>
  );
};

export default ProductDetails;
