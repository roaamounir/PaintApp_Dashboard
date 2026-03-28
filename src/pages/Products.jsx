import React, { useEffect, useState } from "react";
import {
  Trash2,
  Edit,
  Plus,
  Search,
  Layers,
  Droplet,
  FileSpreadsheet,
  FileDown,
  Box,
  Clock,
  X,
  CheckCircle2,
  Eye,
  Languages,
  ImagePlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { useTranslation } from "react-i18next"; 
import axios from "axios";
import { getUnitPriceForBuyer, paintHasWholesale } from "../utils/buyerPricing.js";

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

// ===== HEX color helpers =====
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

const getDashboardAuth = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return { role: null, canBuyWholesale: false };
    const payload = JSON.parse(atob(token.split(".")[1])) || {};
    return {
      role: payload?.role ?? null,
      canBuyWholesale: Boolean(payload?.canBuyWholesale),
    };
  } catch {
    return { role: null, canBuyWholesale: false };
  }
};

const Products = () => {
  const { t, i18n } = useTranslation();
  const { paints, fetchPaints, deletePaint, importPaintsExcel, categories } = useAppContext();
  const API_BASE = getApiBase();

  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPaint, setEditingPaint] = useState(null);

  const isRtl = i18n.language === "ar";
  const displayCategoryName = (cat) => {
    if (!cat) return "";
    return isRtl
      ? cat.nameAr || cat.name || cat.nameEn || ""
      : cat.nameEn || cat.name || cat.nameAr || "";
  };

  const [filters, setFilters] = useState({
    category: "",
    finish: "",
    usage: "",
    base: "",
    color: "",
    dryDays: "",
  });

  const resetFilters = () => {
    setFilters({
      category: "",
      finish: "",
      usage: "",
      base: "",
      color: "",
      dryDays: "",
    });
    setSearchTerm("");
  };

  const [formData, setFormData] = useState({
    name: "",
    nameAr: "",
    nameEn: "",
    description: "",
    descriptionAr: "",
    descriptionEn: "",
    sku: "",
    price: "",
    wholesalePrice: "",
    stock: "",
    coverage: "",
    coatHours: "",
    dryDays: "",
    base: "water",
    finish: "matte",
    unit: "kg",
    usage: "indoor",
    categoryId: "",
    type: "paint",
    weightKg: "1",
    minStockLevel: "10",
    status: "available",
    discount: "0",
    image: "",
  });

  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    fetchPaints();
  }, [fetchPaints]);

  const handleExport = async () => {
    try {
      const response = await axios.get(`${API_BASE}/paint/export`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `paints_report_${new Date().toLocaleDateString()}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
    } catch {
      alert(t("messages.exportError"));
    }
  };

  const handleExportLowStock = async () => {
    try {
      const response = await axios.get(`${API_BASE}/paint/export-low-stock`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `low_stock_products_${new Date().toLocaleDateString().replace(/\//g, "-")}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
    } catch {
      alert(t("messages.exportError") || "فشل تحميل الملف");
    }
  };
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (file && (await importPaintsExcel(file)).success)
      alert(t("messages.importSuccess"));
  };

  // Modal Open (Add/Edit)
  const openModal = (paint = null) => {
    if (paint) {
      setEditingPaint(paint);
      setFormData({
        name: String(paint.name ?? ""),
        nameAr: String(paint.nameAr ?? paint.name ?? ""),
        nameEn: String(paint.nameEn ?? paint.name ?? ""),
        description: String(paint.description ?? ""),
        descriptionAr: String(paint.descriptionAr ?? paint.description ?? ""),
        descriptionEn: String(paint.descriptionEn ?? paint.description ?? ""),
        sku: paint.sku != null ? String(paint.sku) : "",
        price: paint.price != null && Number.isFinite(Number(paint.price)) ? String(paint.price) : "",
        wholesalePrice: paint.wholesalePrice != null && Number.isFinite(Number(paint.wholesalePrice)) ? String(paint.wholesalePrice) : "",
        stock: paint.stock != null && Number.isFinite(Number(paint.stock)) ? String(paint.stock) : "",
        coverage: paint.coverage != null && Number.isFinite(Number(paint.coverage)) ? String(paint.coverage) : "",
        coatHours: paint.coatHours != null && Number.isFinite(Number(paint.coatHours)) ? String(paint.coatHours) : "",
        dryDays: paint.dryDays != null && Number.isFinite(Number(paint.dryDays)) ? String(paint.dryDays) : "",
        base: String(paint.base ?? "water").toLowerCase(),
        finish: String(paint.finish ?? "matte").toLowerCase().replace(/\s+/g, "_"),
        unit: String(paint.unit ?? "kg").toLowerCase(),
        usage: String(paint.usage ?? "indoor").toLowerCase(),
        categoryId: paint.categoryId != null ? String(paint.categoryId) : "",
        type: String(paint.type ?? "paint"),
        weightKg: paint.weightKg != null || paint.weightkg != null
          ? String(paint.weightKg ?? paint.weightkg ?? "1")
          : "1",
        image: paint.image != null ? String(paint.image) : "",
      });
    } else {
      setEditingPaint(null);
      setFormData({
        name: "",
        nameAr: "",
        nameEn: "",
        description: "",
        descriptionAr: "",
        descriptionEn: "",
        sku: "",
        price: "",
        wholesalePrice: "",
        stock: "",
        coverage: "",
        coatHours: "",
        dryDays: "",
        base: "water",
        finish: "matte",
        unit: "kg",
        usage: "indoor",
        categoryId: "",
        type: "paint",
        weightKg: "1",
        image: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleProductImageFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImageUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const { data } = await axios.post(`${API_BASE}/paint/image`, fd, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (data?.imageUrl) setFormData((prev) => ({ ...prev, image: data.imageUrl }));
    } catch (err) {
      const msg = err.response?.data?.error;
      alert(typeof msg === "string" ? msg : t("messages.productImageUploadError"));
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEdit = Boolean(editingPaint);

    try {
      const categoryId = formData.categoryId ? String(formData.categoryId).trim() : "";
      const dryDays = Math.max(0, parseInt(formData.dryDays, 10) || 0);

      if (!isEdit) {
        if (!categoryId) {
          alert(t("modal.requiredCategory") || "يرجى اختيار التصنيف");
          return;
        }
      }

      const payload = {
        name_ar: String(formData.nameAr || "").trim(),
        name_en: String(formData.nameEn || "").trim(),
        name:
          String(formData.name || "").trim() ||
          (i18n.language === "ar"
            ? String(formData.nameAr || "").trim()
            : String(formData.nameEn || "").trim()) ||
          (editingPaint?.name ?? ""),
        description_ar: formData.descriptionAr ?? "",
        description_en: formData.descriptionEn ?? "",
        description:
          (i18n.language === "ar"
            ? formData.descriptionAr
            : formData.descriptionEn) ?? formData.description ?? "",
        sku: formData.sku && String(formData.sku).trim() !== "" ? String(formData.sku).trim() : null,
        price: parseFloat(formData.price) || 0,
        wholesalePrice: formData.wholesalePrice !== "" && !Number.isNaN(parseFloat(formData.wholesalePrice))
          ? parseFloat(formData.wholesalePrice)
          : null,
        stock: Math.max(0, parseInt(formData.stock, 10) || 0),
        coverage: parseFloat(formData.coverage) || 0,
        coatHours: parseInt(formData.coatHours, 10) || 0,
        dryDays,
        categoryId: categoryId || (editingPaint?.categoryId ?? undefined),
        base: String(formData.base ?? "water").toLowerCase(),
        finish: String(formData.finish ?? "matte").toLowerCase().replace(/\s+/g, "_"),
        unit: String(formData.unit ?? "kg").toLowerCase(),
        usage: String(formData.usage ?? "indoor").toLowerCase(),
        type: String(formData.type ?? "paint").trim() || "paint",
        weightKg: formData.weightKg !== "" && !Number.isNaN(parseFloat(formData.weightKg)) ? parseFloat(formData.weightKg) : null,
        image:
          formData.image != null && String(formData.image).trim() !== ""
            ? String(formData.image).trim()
            : null,
      };
      if (isEdit && !payload.categoryId) delete payload.categoryId;
      payload.vendorId = null;

      const url = isEdit
        ? `${API_BASE}/paint/${editingPaint.id}`
        : `${API_BASE}/paint`;

      await axios[isEdit ? "put" : "post"](url, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      setIsModalOpen(false);
      fetchPaints();
      alert(isEdit ? "Updated Successfully" : "Added Successfully");
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Save failed";
      console.error("Detailed Error:", err.response?.data || err);
      alert(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  };

  const { role: dashRole, canBuyWholesale } = getDashboardAuth();
  const isInventoryAdmin = dashRole === "admin";
  const isWholesaleBuyer =
    dashRole === "vendor" || dashRole === "designer" || canBuyWholesale;

  const selectStyle =
    "w-full bg-slate-50 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer";
  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
      {isWholesaleBuyer && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-900 flex items-start gap-3">
          <span className="font-black text-amber-700 shrink-0">ℹ</span>
          <p>
            {t("inventory.wholesale_buyer_hint", {
              defaultValue:
                "أسعار المنتجات المعروضة هي سعر الجملة عند توفره؛ وإلا يُعرض سعر التجزئة. يمكنك فتح التفاصيل للمراجعة.",
            })}
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-4xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-2xl">
            <Box className="text-blue-600" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">
              {isInventoryAdmin ? t("inventory.title") : t("inventory.vendor_catalog_title")}
            </h1>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-tighter">
              {isInventoryAdmin ? t("inventory.subtitle") : t("inventory.vendor_catalog_subtitle")}
            </p>
          </div>
        </div>

        {isInventoryAdmin && (
          <div className="flex flex-wrap lg:flex-nowrap gap-1.5">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-2 rounded-xl font-semibold text-[11px] whitespace-nowrap hover:bg-slate-200 transition"
            >
              <FileDown size={14} /> {t("buttons.export")}
            </button>

            <button
              onClick={handleExportLowStock}
              className="flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-2 rounded-xl font-semibold text-[11px] whitespace-nowrap hover:bg-amber-100 transition"
              title={t("buttons.exportLowStock") || "تحميل المنتجات قليلة/منتهية المخزون"}
            >
              <FileDown size={14} /> {t("buttons.exportLowStock") || "تحميل قليل/منتهي المخزون"}
            </button>

            <label className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-2 rounded-xl font-semibold text-[11px] whitespace-nowrap cursor-pointer hover:bg-emerald-100 transition">
              <FileSpreadsheet size={14} /> {t("buttons.import")}
              <input
                type="file"
                className="hidden"
                onChange={handleImport}
                accept=".xlsx, .xls"
              />
            </label>

            <button
              onClick={() => openModal()}
              className="flex items-center gap-1.5 bg-blue-600 text-white px-3.5 py-2 rounded-xl font-semibold text-[11px] whitespace-nowrap hover:bg-blue-700 transition shadow-lg shadow-blue-200"
            >
              <Plus size={15} /> {t("buttons.addPaint")}
            </button>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search
          className={`absolute ${isRtl ? "right-5" : "left-5"} top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors`}
          size={20}
        />
        <input
          type="text"
          placeholder={t("inventory.searchPlaceholder")}
          className={`w-full bg-white border border-slate-200 rounded-2xl py-4 ${isRtl ? "pr-14 pl-4" : "pl-14 pr-4"} outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 transition-all shadow-sm`}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-2 md:grid-cols-6 gap-3">
        {/* Category Filter */}
        <select
          className="bg-slate-50 text-xs font-bold p-2.5 rounded-xl outline-none border-none"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">{t("filters.allCategories")}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {displayCategoryName(cat)}
            </option>
          ))}
        </select>

        {/* Finish Filter */}
        <select
          className="bg-slate-50 text-xs font-bold p-2.5 rounded-xl outline-none border-none"
          value={filters.finish}
          onChange={(e) => setFilters({ ...filters, finish: e.target.value })}
        >
          <option value="">{t("filters.allFinishes")}</option>
          <option value="matte">{t("options.matte")}</option>
          <option value="semi_gloss">{t("options.semi_gloss")}</option>
          <option value="gloss">{t("options.gloss")}</option>
        </select>

        {/* Usage Filter */}
        <select
          className="bg-slate-50 text-xs font-bold p-2.5 rounded-xl outline-none border-none"
          value={filters.usage}
          onChange={(e) => setFilters({ ...filters, usage: e.target.value })}
        >
          <option value="">{t("filters.allUsages")}</option>
          <option value="indoor">{t("options.indoor")}</option>
          <option value="outdoor">{t("options.outdoor")}</option>
          <option value="both">{t("options.both")}</option>
        </select>

        <select
          className="bg-slate-50 text-xs font-bold p-2.5 rounded-xl outline-none"
          value={filters.base}
          onChange={(e) => setFilters({ ...filters, base: e.target.value })}
        >
          <option value="">{t("filters.allBases")}</option>
          <option value="water">{t("options.water")}</option>
          <option value="oil">{t("options.oil")}</option>
          <option value="wood">{t("options.wood")}</option>
        </select>

        {/* Dry Days Filter */}
        <select
          className="bg-slate-50 text-xs font-bold p-2.5 rounded-xl outline-none"
          value={filters.dryDays}
          onChange={(e) => setFilters({ ...filters, dryDays: e.target.value })}
        >
          <option value="">{t("filters.dryingTime")}</option>
          <option value="1">1 {t("units.day")}</option>
          <option value="2">2 {t("units.days")}</option>
          <option value="3">3+ {t("units.days")}</option>
        </select>

        {/* Reset Button */}
        <button
          onClick={resetFilters}
          className="text-[10px] font-black uppercase text-red-500 hover:bg-red-50 rounded-xl transition-all"
        >
          {t("buttons.clearFilters")}
        </button>
      </div>
      {/* Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80 text-slate-400 font-bold text-[10px] uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">{t("table.productDetail")}</th>
                <th className="px-6 py-5">{t("table.techSpecs")}</th>
                <th className="px-6 py-5">{t("table.application")}</th>
                <th className="px-6 py-5">{t("table.stockPrice")}</th>
                <th
                  className={`px-8 py-5 ${isRtl ? "text-left" : "text-right"}`}
                >
                  {t("table.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(paints || [])
                .filter((paint) => {
                  const matchesSearch = paint.name
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase());

                  const matchesCategory = filters.category
                    ? paint.categoryId?.toString() ===
                      filters.category.toString()
                    : true;

                  const matchesFinish = filters.finish
                    ? paint.finish?.toLowerCase() ===
                      filters.finish.toLowerCase()
                    : true;

                  const matchesUsage = filters.usage
                    ? paint.usage?.toLowerCase() === filters.usage.toLowerCase()
                    : true;

                  const matchesBase = filters.base
                    ? paint.base?.toLowerCase() === filters.base.toLowerCase()
                    : true;

                  const matchesDry = filters.dryDays
                    ? filters.dryDays === "3"
                      ? paint.dryDays >= 3
                      : paint.dryDays?.toString() === filters.dryDays
                    : true;

                  return (
                    matchesSearch &&
                    matchesCategory &&
                    matchesFinish &&
                    matchesUsage &&
                    matchesBase &&
                    matchesDry
                  );
                })
                .map((paint) => (
                  <tr
                    key={paint.id}
                    className="hover:bg-blue-50/20 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-start gap-3">
                        {paint.image ? (
                          <img
                            src={resolveMediaUrl(API_BASE, paint.image)}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-sm shrink-0 bg-slate-100"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl border border-dashed border-slate-200 bg-slate-50 shrink-0" />
                        )}
                        <div className="flex flex-col min-w-0">
                        <span className="font-black text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                          {paint.name}
                        </span>
                        {paint.sku && (
                          <span className="flex items-center gap-1.5 mt-0.5 w-fit">
                            <span
                              className="w-4 h-4 rounded-full border border-white shadow-sm ring-1 ring-black/10 shrink-0"
                              style={{ backgroundColor: toDisplayHex(paint.sku) ?? "#e2e8f0" }}
                            />
                            <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              #{String(paint.sku).replace(/^#/, "").toUpperCase()}
                            </span>
                          </span>
                        )}
                        <span className="text-[9px] text-blue-400 font-medium uppercase mt-0.5">
                          {t(`options.${paint.finish}`)} {t("table.finish")} |
                          {t(`options.${paint.unit}`)} {t("table.unit")}
                        </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <p className="text-emerald-600 text-[11px] font-bold flex items-center gap-1">
                          <CheckCircle2 size={12} /> {paint.coverage}
                          {t("units.sqm")}
                        </p>
                        <p className="text-slate-400 text-[10px] font-medium flex items-center gap-1">
                          <Clock size={12} /> {paint.coatHours}
                          {t("units.h")} {t("table.coat")} | {paint.dryDays}
                          {t("units.d")} {t("table.dry")}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                          <Droplet size={14} className="text-blue-400" />
                          {t(`options.${paint.base}`)} {t("table.base")}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">
                          <Layers size={12} /> {t(`options.${paint.usage}`)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {(() => {
                        const hasWs = paintHasWholesale(paint);
                        const effective = getUnitPriceForBuyer(
                          dashRole,
                          paint,
                          canBuyWholesale
                        );
                        if (isWholesaleBuyer) {
                          return (
                            <>
                              <p
                                className={`font-black text-base ${hasWs ? "text-amber-700" : "text-blue-700"}`}
                              >
                                {effective} EGP
                              </p>
                              <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">
                                {hasWs
                                  ? t("table.wholesale", { defaultValue: "جملة" })
                                  : t("product.unit_price", { defaultValue: "سعر التجزئة" })}
                              </p>
                              {hasWs && (
                                <p className="text-[10px] text-slate-400 line-through mt-0.5">
                                  {paint.price} EGP
                                </p>
                              )}
                            </>
                          );
                        }
                        return (
                          <>
                            <p className="font-black text-blue-700 text-base">
                              {paint.price} EGP
                            </p>
                            {hasWs && (
                              <p className="text-[10px] font-bold text-amber-600 flex items-center gap-1 mt-0.5">
                                <span className="bg-amber-100 px-1 py-0.5 rounded text-[8px] uppercase font-black">
                                  {t("table.wholesale", { defaultValue: "جملة" })}
                                </span>
                                {paint.wholesalePrice} EGP
                              </p>
                            )}
                          </>
                        );
                      })()}
                      <p
                        className={`text-[10px] font-bold mt-0.5 ${paint.stock <= paint.minStockLevel ? "text-red-500 animate-pulse" : "text-slate-400"}`}
                      >
                        {paint.stock} {t("units.stock")}
                        {paint.stock <= paint.minStockLevel &&
                          `(${t("messages.lowStock")})`}
                      </p>
                    </td>
                    <td
                      className={`px-8 py-5 ${isRtl ? "text-left" : "text-right"}`}
                    >
                      <div
                        className={`flex ${isRtl ? "justify-start" : "justify-end"} gap-2`}
                      >
                        <button
                          onClick={() => navigate(`/product/${paint.id}`)}
                          className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                        >
                          <Eye size={18} />
                        </button>
                        {isInventoryAdmin && (
                          <>
                            <button
                              onClick={() => openModal(paint)}
                              className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => deletePaint(paint.id)}
                              className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                {editingPaint ? <Edit size={20} /> : <Plus size={20} />}
                {editingPaint ? t("modal.updateTitle") : t("modal.addTitle")}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-white p-2 rounded-full text-slate-400 hover:text-red-500 transition-colors"
              >
                <X />
              </button>
            </div>
            <form
              onSubmit={handleSubmit}
              className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-5"
            >
              {/* Basic Info */}
              <div className="md:col-span-3 text-[11px] font-black text-blue-600 uppercase tracking-widest border-b pb-2">
                {t("modal.basicInfo")}
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 px-1">
                  {t("modal.productNameAr", { defaultValue: "اسم المنتج (عربي)" })}
                </label>
                <input
                  required
                  className="w-full bg-slate-50 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  value={formData.nameAr}
                  onChange={(e) =>
                    setFormData({ ...formData, nameAr: e.target.value, name: e.target.value })
                  }
                />
              </div>
              <div className="md:col-span-1 space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 px-1">
                  {t("modal.productNameEn", { defaultValue: "Product Name (English)" })}
                </label>
                <input
                  required
                  className="w-full bg-slate-50 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  value={formData.nameEn}
                  onChange={(e) =>
                    setFormData({ ...formData, nameEn: e.target.value })
                  }
                />
              </div>
              {/* كود اللون (HEX) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 px-1">
                  {t("modal.sku", { defaultValue: "كود اللون (HEX)" })}
                </label>
                <div className="flex items-center gap-3">
                  {/* دائرة اللون الحية */}
                  <div
                    className="w-11 h-11 rounded-full shrink-0 border-4 border-white shadow-md ring-1 ring-black/10 transition-all duration-200"
                    style={{
                      backgroundColor: toDisplayHex(formData.sku) ?? "#e2e8f0",
                    }}
                    title={toDisplayHex(formData.sku) ?? "أدخل كود HEX"}
                  />
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm select-none pointer-events-none">
                      #
                    </span>
                    <input
                      type="text"
                      maxLength={7}
                      placeholder={t("modal.skuPlaceholder", { defaultValue: "مثال: FF5733" })}
                      className="w-full bg-slate-50 border-none rounded-xl p-3 pl-7 outline-none focus:ring-2 focus:ring-blue-500/20 font-mono tracking-widest uppercase"
                      value={(formData.sku ?? "").replace(/^#/, "")}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9A-Fa-f]/g, "").slice(0, 6);
                        setFormData({ ...formData, sku: raw });
                      }}
                    />
                  </div>
                  {/* معاينة اللون اسم HEX */}
                  {toDisplayHex(formData.sku) && (
                    <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg shrink-0">
                      {toDisplayHex(formData.sku)}
                    </span>
                  )}
                </div>
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 px-1">
                  {t("modal.descriptionAr", { defaultValue: "الوصف (عربي)" })}
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-slate-50 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                  placeholder={t("modal.descriptionArPlaceholder", { defaultValue: "وصف المنتج بالعربي (اختياري)" })}
                  value={formData.descriptionAr ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, descriptionAr: e.target.value, description: e.target.value })
                  }
                />
              </div>
              <div className="md:col-span-3 space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 px-1">
                  {t("modal.descriptionEn", { defaultValue: "Description (English)" })}
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-slate-50 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                  placeholder={t("modal.descriptionEnPlaceholder", { defaultValue: "Product description in English (optional)" })}
                  value={formData.descriptionEn ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, descriptionEn: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-3 space-y-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                <label className="text-[10px] font-bold uppercase text-slate-400 px-1 block">
                  {t("modal.productImage")}
                </label>
                <p className="text-[10px] text-slate-400 px-1 -mt-1">
                  {t("modal.productImageHint")}
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="w-24 h-24 rounded-xl border border-slate-200 bg-white overflow-hidden shrink-0 flex items-center justify-center">
                    {resolveMediaUrl(API_BASE, formData.image) ? (
                      <img
                        src={resolveMediaUrl(API_BASE, formData.image)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImagePlus className="text-slate-300" size={32} />
                    )}
                  </div>
                  <div className="flex flex-col gap-2 min-w-[200px] flex-1">
                    <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer hover:bg-blue-700 transition disabled:opacity-50">
                      <ImagePlus size={16} />
                      {imageUploading ? "…" : t("modal.productImageChoose")}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        disabled={imageUploading}
                        onChange={handleProductImageFile}
                      />
                    </label>
                    <label className="text-[10px] font-bold uppercase text-slate-500 px-1">
                      {t("modal.productImageOptionalUrl")}
                    </label>
                    <input
                      type="text"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder={t("modal.productImageUrlPlaceholder")}
                      value={formData.image ?? ""}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                    />
                    {(formData.image ?? "") !== "" && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: "" })}
                        className="text-xs font-bold text-red-600 hover:text-red-700"
                      >
                        {t("modal.productImageRemove")}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 px-1">
                  {t("modal.retailPrice", { defaultValue: "السعر الأساسي (للعملاء)" })} (EGP)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="w-full bg-slate-50 border-none rounded-xl p-3 outline-none"
                  value={formData.price ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 px-1 flex items-center gap-1">
                  {t("modal.wholesalePrice", { defaultValue: "سعر الجملة (للمصممين والتجار)" })}
                  <span className="text-[8px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-black uppercase">
                    {t("modal.wholesaleOnly", { defaultValue: "جملة" })}
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder={t("modal.wholesalePricePlaceholder", { defaultValue: "اختياري" })}
                  className="w-full bg-amber-50 border border-amber-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-amber-300/30"
                  value={formData.wholesalePrice ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, wholesalePrice: e.target.value })
                  }
                />
              </div>

              {/* Technical Specs */}
              <div className="md:col-span-3 text-[11px] font-black text-blue-600 uppercase tracking-widest border-b pb-2 pt-2">
                Technical Specifications
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 px-1">
                  Coverage (sqm/kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  className="w-full bg-slate-50 border-none rounded-xl p-3 outline-none"
                  value={formData.coverage ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, coverage: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 px-1">
                  Re-coat (Hours)
                </label>
                <input
                  type="number"
                  required
                  className="w-full bg-slate-50 border-none rounded-xl p-3 outline-none"
                  value={formData.coatHours ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, coatHours: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 px-1">
                  Full Dry (Days)
                </label>
                <input
                  type="number"
                  required
                  className="w-full bg-slate-50 border-none rounded-xl p-3 outline-none"
                  value={formData.dryDays ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, dryDays: e.target.value })
                  }
                />
              </div>

              {/* Additions Section inside Modal Form */}
              <div className="space-y-4 md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 px-1">
                    Base
                  </label>
                  <select
                    className={selectStyle}
                    value={String(formData.base ?? "water")}
                    onChange={(e) =>
                      setFormData({ ...formData, base: e.target.value })
                    }
                  >
                    <option value="water">Water-based</option>
                    <option value="oil">Oil-based</option>
                    <option value="wood">Wood-based</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 px-1">
                    Finish
                  </label>
                  <select
                    className={selectStyle}
                    value={String(formData.finish ?? "matte")}
                    onChange={(e) =>
                      setFormData({ ...formData, finish: e.target.value })
                    }
                  >
                    <option value="matte">Matt</option>
                    <option value="semi_gloss">Semi-Gloss</option>
                    <option value="gloss">Gloss</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 px-1">
                    Unit
                  </label>
                  <select
                    className={selectStyle}
                    value={String(formData.unit ?? "kg")}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                  >
                    <option value="liter">Liter</option>
                    <option value="kg">Kg</option>
                  </select>
                </div>
              </div>

              {/* Product Type */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 px-1">
                  {t("modal.type") || "نوع المنتج"}
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border-none rounded-xl p-3 outline-none"
                  placeholder="paint"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                />
              </div>


              {/* Weight (kg) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 px-1">
                  {t("modal.weightKg") || "وزن المنتج (kg)"}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full bg-slate-50 border-none rounded-xl p-3 outline-none"
                  value={formData.weightKg}
                  onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                />
              </div>

              {/* Category Selection */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 px-1">
                  Main Category {!editingPaint && "*"}
                </label>
                <select
                  required={!editingPaint}
                  className="w-full bg-slate-50 border-none rounded-xl p-3 outline-none"
                  value={formData.categoryId}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      categoryId: e.target.value,
                    });
                  }}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {displayCategoryName(cat)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Usage */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 px-1">
                  Usage Environment
                </label>
                <select
                  className="w-full bg-slate-50 border-none rounded-xl p-3 outline-none font-bold text-blue-600"
                  value={String(formData.usage ?? "indoor")}
                  onChange={(e) =>
                    setFormData({ ...formData, usage: e.target.value })
                  }
                >
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="both">Both (Indoor/Outdoor)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 px-1">
                  Stock
                </label>
                <input
                  type="number"
                  required
                  className="w-full bg-slate-50 border-none rounded-xl p-3 outline-none"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-3 pt-6">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-blue-700 transition-all tracking-widest"
                >
                  {editingPaint
                    ? t("modal.saveUpdated")
                    : t("modal.confirmNew")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
