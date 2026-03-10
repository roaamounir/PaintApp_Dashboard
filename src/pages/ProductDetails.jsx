import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Box,
  Droplet,
  Layers,
  Thermometer,
  ShieldCheck,
  TrendingUp,
  Truck,
  History,
  DollarSign,
  AlertTriangle,
} from "lucide-react";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const { getPaintDetails } = useAppContext();
  const [productData, setProductData] = useState(null);
  const [loadingLocal, setLoadingLocal] = useState(true);

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
  const stockValue = (product?.stock || 0) * (product?.price || 0);

  if (!product && !loadingLocal) {
    return (
      <div
        className="flex flex-col items-center justify-center h-screen bg-slate-50 p-6"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="bg-white p-12 rounded-[3rem] shadow-xl text-center max-w-md border border-slate-100">
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
      <div className="bg-white p-8 rounded-[3rem] shadow-sm mb-8 border border-slate-100 relative overflow-hidden">
        <div
          className={`absolute top-0 ${isRTL ? "left-0" : "right-0"} p-12 opacity-5 pointer-events-none`}
        >
          <Droplet size={120} className="text-blue-600" />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center relative z-10">
          <div className={isRTL ? "text-right" : "text-left"}>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                {product.Category?.name || t("product.default_category")}
              </span>
              <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                {t("product.sku")}: {product.id}
              </span>
            </div>
            <h1 className="text-5xl font-black text-slate-800 tracking-tight mb-2">
              {product.name}
            </h1>
            <p className="text-slate-400 font-medium max-w-xl text-sm leading-relaxed">
              {product.description || t("product.default_desc")}
            </p>
          </div>
          <div
            className={`${isRTL ? "text-left" : "text-right"} mt-6 md:mt-0 bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100`}
          >
            <p className="text-4xl font-black text-blue-700">
              {product.price}{" "}
              <span className="text-sm font-bold">{t("common.currency")}</span>
            </p>
            <p className="text-[10px] font-black text-blue-400 uppercase mt-1">
              {t("product.unit_price")}
            </p>
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
          value={supplier?.shopName || t("product.internal_supplier")}
          icon={Truck}
          color="text-purple-600"
          bg="bg-purple-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Technical Specs & Safety */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
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
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white">
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
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-slate-800 flex items-center gap-2 text-xl">
              <History className="text-blue-500" size={24} />{" "}
              {t("product.history_title")}
            </h3>
          </div>

          {productSales.length > 0 ? (
            <div className="overflow-x-auto">
              <table className={`w-full ${isRTL ? "text-right" : "text-left"}`}>
                <thead className="text-[10px] text-slate-400 font-black uppercase border-b">
                  <tr>
                    <th className="pb-4">{t("product.history_trn")}</th>
                    <th className="pb-4">{t("product.history_details")}</th>
                    <th className="pb-4">{t("product.history_qty")}</th>
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
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed">
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

const StatCard = ({ label, value, icon: Icon, color, bg }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
      <div
        className={`${bg} ${color} w-10 h-10 rounded-xl flex items-center justify-center mb-4`}
      >
        <Icon size={20} />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
        {label}
      </p>
      <p className="text-xl font-black text-slate-800">{value}</p>
    </div>
  );
};

const SpecItem = ({ label, value, highlight }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
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
