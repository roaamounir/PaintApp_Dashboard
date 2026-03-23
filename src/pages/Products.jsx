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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { useTranslation } from "react-i18next"; 
import axios from "axios";

const getApiBase = () => {
  const env = import.meta.env.VITE_API_URL;
  if (env && String(env).trim()) return String(env).replace(/\/$/, "");
  if (typeof window !== "undefined") return `${window.location.origin}/api-backend`;
  return "http://localhost:5000";
};

const Products = () => {
  const { t, i18n } = useTranslation(); 
  const { paints, fetchPaints, deletePaint, importPaintsExcel, categories, vendors: contextVendors = [], fetchVendors } =
    useAppContext();
  const vendors = Array.isArray(contextVendors) ? contextVendors : [];
  const API_BASE = getApiBase();

  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPaint, setEditingPaint] = useState(null);

  const isRtl = i18n.language === "ar";

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
    description: "",
    price: "",
    stock: "",
    coverage: "",
    coatHours: "",
    dryDays: "",
    base: "water",
    finish: "matte",
    unit: "kg",
    usage: "indoor",
    categoryId: "",
    subCategoryId: "",
    type: "paint",
    vendorId: "",
    weightKg: "1",
    minStockLevel: "10",
    status: "available",
    discount: "0",
  });

  useEffect(() => {
    fetchPaints();
  }, [fetchPaints]);

  useEffect(() => {
    if (typeof fetchVendors === "function") fetchVendors();
  }, [fetchVendors]);

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
        description: String(paint.description ?? ""),
        price: paint.price != null && Number.isFinite(Number(paint.price)) ? String(paint.price) : "",
        stock: paint.stock != null && Number.isFinite(Number(paint.stock)) ? String(paint.stock) : "",
        coverage: paint.coverage != null && Number.isFinite(Number(paint.coverage)) ? String(paint.coverage) : "",
        coatHours: paint.coatHours != null && Number.isFinite(Number(paint.coatHours)) ? String(paint.coatHours) : "",
        dryDays: paint.dryDays != null && Number.isFinite(Number(paint.dryDays)) ? String(paint.dryDays) : "",
        base: String(paint.base ?? "water").toLowerCase(),
        finish: String(paint.finish ?? "matte").toLowerCase().replace(/\s+/g, "_"),
        unit: String(paint.unit ?? "kg").toLowerCase(),
        usage: String(paint.usage ?? "indoor").toLowerCase(),
        categoryId: paint.categoryId != null ? String(paint.categoryId) : "",
        subCategoryId: paint.subCategoryId != null ? String(paint.subCategoryId) : "",
        type: String(paint.type ?? "paint"),
        vendorId: paint.vendorId != null ? String(paint.vendorId) : "",
        weightKg: paint.weightKg != null || paint.weightkg != null
          ? String(paint.weightKg ?? paint.weightkg ?? "1")
          : "1",
      });
    } else {
      setEditingPaint(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        coverage: "",
        coatHours: "",
        dryDays: "",
        base: "water",
        finish: "matte",
        unit: "kg",
        usage: "indoor",
        categoryId: "",
        subCategoryId: "",
        type: "paint",
        vendorId: "",
        weightKg: "1",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEdit = Boolean(editingPaint);

    try {
      const categoryId = formData.categoryId ? parseInt(formData.categoryId, 10) : NaN;
      const vendorId = formData.vendorId ? parseInt(formData.vendorId, 10) : NaN;
      const dryDays = Math.max(0, parseInt(formData.dryDays, 10) || 0);

      if (!isEdit) {
        if (!Number.isFinite(categoryId) || categoryId <= 0) {
          alert(t("modal.requiredCategory") || "يرجى اختيار التصنيف");
          return;
        }
        if (!Number.isFinite(vendorId) || vendorId <= 0) {
          alert(t("modal.requiredVendor") || "يرجى اختيار المورد");
          return;
        }
      }

      const payload = {
        name: String(formData.name || "").trim() || (editingPaint?.name ?? ""),
        description: formData.description ?? "",
        price: parseFloat(formData.price) || 0,
        stock: Math.max(0, parseInt(formData.stock, 10) || 0),
        coverage: parseFloat(formData.coverage) || 0,
        coatHours: parseInt(formData.coatHours, 10) || 0,
        dryDays,
        categoryId: Number.isFinite(categoryId) && categoryId > 0 ? categoryId : (editingPaint?.categoryId ?? undefined),
        subCategoryId: formData.subCategoryId ? (parseInt(formData.subCategoryId, 10) > 0 ? parseInt(formData.subCategoryId, 10) : null) : null,
        base: String(formData.base ?? "water").toLowerCase(),
        finish: String(formData.finish ?? "matte").toLowerCase().replace(/\s+/g, "_"),
        unit: String(formData.unit ?? "kg").toLowerCase(),
        usage: String(formData.usage ?? "indoor").toLowerCase(),
        type: String(formData.type ?? "paint").trim() || "paint",
        vendorId: Number.isFinite(vendorId) && vendorId > 0 ? vendorId : (editingPaint?.vendorId ?? undefined),
        weightKg: formData.weightKg !== "" && !Number.isNaN(parseFloat(formData.weightKg)) ? parseFloat(formData.weightKg) : null,
      };
      if (isEdit && payload.categoryId === undefined) delete payload.categoryId;
      if (isEdit && payload.vendorId === undefined) delete payload.vendorId;
      if (!isEdit) {
        payload.categoryId = categoryId;
        payload.vendorId = vendorId;
      }

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
  const selectedCategory = categories.find(
    (cat) => String(cat.id) === String(formData.categoryId),
  );
  const availableSubCategories = selectedCategory?.SubCategory || [];
  const selectStyle =
    "w-full bg-slate-50 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer";
  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-4xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-2xl">
            <Box className="text-blue-600" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">
              {t("inventory.title")}
            </h1>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-tighter">
              {t("inventory.subtitle")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
        
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-200 transition"
          >
            <FileDown size={16} /> {t("buttons.export")}
          </button>

          <button
            onClick={handleExportLowStock}
            className="flex items-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-amber-100 transition"
            title={t("buttons.exportLowStock") || "تحميل المنتجات قليلة/منتهية المخزون"}
          >
            <FileDown size={16} /> {t("buttons.exportLowStock") || "تحميل قليل/منتهي المخزون"}
          </button>

          <label className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-100 px-4 py-2.5 rounded-xl font-bold text-xs cursor-pointer hover:bg-emerald-100 transition">
            <FileSpreadsheet size={16} /> {t("buttons.import")}
            <input
              type="file"
              className="hidden"
              onChange={handleImport}
              accept=".xlsx, .xls"
            />
          </label>

          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            <Plus size={18} /> {t("buttons.addPaint")}
          </button>
        </div>
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
              {cat.name}
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
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                          {paint.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">
                          {paint.category?.name}
                          {paint.subCategory && ` > ${paint.subCategory.name}`}
                        </span>
                        <span className="text-[9px] text-blue-400 font-medium uppercase">
                          {t(`options.${paint.finish}`)} {t("table.finish")} |
                          {t(`options.${paint.unit}`)} {t("table.unit")}
                        </span>
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
                      <p className="font-black text-blue-700 text-base">
                        {paint.price} EGP
                      </p>
                      <p
                        className={`text-[10px] font-bold ${paint.stock <= paint.minStockLevel ? "text-red-500 animate-pulse" : "text-slate-400"}`}
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
                  {t("modal.productName")}
                </label>
                <input
                  required
                  className="w-full bg-slate-50 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="md:col-span-3 space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 px-1">
                  {t("modal.description") || "الوصف"}
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-slate-50 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                  placeholder={t("modal.descriptionPlaceholder") || "وصف المنتج (اختياري)"}
                  value={formData.description ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 px-1">
                  {t("modal.price")} (EGP)
                </label>
                <input
                  type="number"
                  required
                  className="w-full bg-slate-50 border-none rounded-xl p-3 outline-none"
                  value={formData.price ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
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

              {/* Vendor — مطلوب عند إنشاء منتج */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 px-1">
                  {t("modal.vendor") || "المورد"} {!editingPaint && " *"}
                </label>
                <select
                  required={!editingPaint}
                  className={selectStyle}
                  value={formData.vendorId}
                  onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                >
                  <option value="">{t("modal.selectVendor") || "اختر المورد"}</option>
                  {vendors.length === 0 && (
                    <option value="" disabled>{t("modal.noVendors") || "لا يوجد موردين — أضف مورداً أولاً"}</option>
                  )}
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.shopName || v.companyName || v.name || v.user?.name || `مورد #${v.id}`}
                    </option>
                  ))}
                </select>
                {vendors.length === 0 && !editingPaint && (
                  <p className="text-xs text-amber-600 mt-1">{t("modal.noVendorsHint") || "يجب وجود مورد واحد على الأقل لإنشاء منتج."}</p>
                )}
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
                      subCategoryId: "",
                    });
                  }}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub-Category Selection */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 px-1">
                  Sub Category (Optional)
                </label>
                <select
                  className="w-full bg-slate-50 border-none rounded-xl p-3 outline-none"
                  value={formData.subCategoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, subCategoryId: e.target.value })
                  }
                  disabled={!formData.categoryId}
                >
                  <option value="">No Sub-category</option>
                  {availableSubCategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
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
