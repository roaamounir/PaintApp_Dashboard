import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../context/AppContext";
import {
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiEye,
  FiTag,
  FiCheckCircle,
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";

const Offers = () => {
  const { t } = useTranslation();
  const { offers, categories, paints, addOffer, updateOffer, deleteOffer, toggleOfferStatus, loading } =
    useAppContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [viewingOffer, setViewingOffer] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    discount: "",
    discountType: "percentage",
    scopeType: "category",
    scopeId: "",
    targetPriceType: "both",
    startDate: "",
    endDate: "",
    isActive: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData };
    const result = editingOffer
      ? await updateOffer(editingOffer.id, payload)
      : await addOffer(payload);
    if (result.success) {
      setIsModalOpen(false);
      setEditingOffer(null);
      setFormData({
        title: "",
        discount: "",
        discountType: "percentage",
        scopeType: "category",
        scopeId: "",
        targetPriceType: "both",
        startDate: "",
        endDate: "",
        isActive: true,
      });
    }
  };

  const openCreateModal = () => {
    setEditingOffer(null);
    setFormData({
      title: "",
      discount: "",
      discountType: "percentage",
      scopeType: "category",
      scopeId: "",
      targetPriceType: "both",
      startDate: "",
      endDate: "",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (offer) => {
    const toDateInput = (v) => (v ? String(v).slice(0, 10) : "");
    setEditingOffer(offer);
    setFormData({
      title: offer.title || "",
      discount: offer.discount ?? "",
      discountType: offer.discountType || "percentage",
      scopeType: offer.scopeType || "category",
      scopeId: offer.scopeId || "",
      targetPriceType: offer.targetPriceType || "both",
      startDate: toDateInput(offer.startDate),
      endDate: toDateInput(offer.endDate),
      isActive: offer.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString();
  };

  const getScopeName = (offer) => {
    if (!offer?.scopeId) return "-";
    const source = offer.scopeType === "product" ? paints : categories;
    const row = Array.isArray(source)
      ? source.find((item) => String(item.id) === String(offer.scopeId))
      : null;
    return row?.name || offer.scopeId;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            {t("offers.title")}
          </h1>
          <p className="text-gray-500">{t("offers.subtitle")}</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          <FiPlus /> {t("offers.create_new")}
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
            <FiTag size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium">
              {t("offers.total_promotions")}
            </p>
            <p className="text-2xl font-bold text-gray-800">{offers.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <FiCheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium">
              {t("offers.currently_active")}
            </p>
            <p className="text-2xl font-bold text-gray-800">
              {offers.filter((o) => o.isActive).length}
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center p-12 text-indigo-600">
          <FiLoader className="animate-spin" size={32} />
          <span className="ml-3">{t("offers.loading")}</span>
        </div>
      )}

      {/* Offers Grid */}
      {!loading && offers.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <FiAlertCircle className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">{t("offers.no_offers")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex justify-between items-center transition-hover hover:shadow-md"
            >
              <div className="flex items-center gap-5">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${
                    offer.isActive
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {offer.discountType === "percentage"
                    ? `${offer.discount}%`
                    : `$${offer.discount}`}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">
                    {offer.title}
                  </h3>
                  <button
                    onClick={() => toggleOfferStatus(offer.id)}
                    className={`mt-1 text-xs px-3 py-1 rounded-full font-semibold transition-colors ${
                      offer.isActive
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                    }`}
                  >
                    {offer.isActive
                      ? t("offers.status.active")
                      : t("offers.status.inactive")}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewingOffer(offer)}
                  className="p-3 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
                  title={t("offers.actions.view", { defaultValue: "View details" })}
                >
                  <FiEye size={18} />
                </button>
                <button
                  onClick={() => openEditModal(offer)}
                  className="p-3 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
                  title={t("offers.actions.edit", { defaultValue: "Edit offer" })}
                >
                  <FiEdit2 size={18} />
                </button>
                <button
                  onClick={() => deleteOffer(offer.id)}
                  className="p-3 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                  title={t("offers.actions.delete")}
                >
                  <FiTrash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Offer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-4xl p-8 w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {editingOffer
                ? t("offers.edit_offer", { defaultValue: "Edit Promotion" })
                : t("offers.new_offer")}
            </h2>
            <p className="text-gray-500 mb-8 text-sm">
              {t("offers.modal_subtitle")}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
                  {t("offers.form.title")}
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder={t("offers.form.placeholder_title")}
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
                    {t("offers.form.discount")}
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder={t("offers.form.placeholder_discount")}
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({ ...formData, discount: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
                    {t("offers.form.type")}
                  </label>
                  <select
                    className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({ ...formData, discountType: e.target.value })
                    }
                  >
                    <option value="percentage">
                      {t("offers.form.percent")}
                    </option>
                    <option value="fixed">{t("offers.form.fixed")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
                    {t("offers.form.is_active")}
                  </label>
                  <div className="w-full bg-gray-50 border-none p-4 rounded-2xl h-[56px] flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="w-5 h-5 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-600 font-medium">
                      {formData.isActive
                        ? t("offers.status.active")
                        : t("offers.status.inactive")}
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
                    {t("offers.form.scope_type", { defaultValue: "Apply To" })}
                  </label>
                  <select
                    className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                    value={formData.scopeType}
                    onChange={(e) =>
                      setFormData({ ...formData, scopeType: e.target.value, scopeId: "" })
                    }
                  >
                    <option value="category">{t("offers.form.scope_category", { defaultValue: "Category" })}</option>
                    <option value="product">{t("offers.form.scope_product", { defaultValue: "Product" })}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
                    {t("offers.form.target_price_type", { defaultValue: "Target Price" })}
                  </label>
                  <select
                    className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                    value={formData.targetPriceType}
                    onChange={(e) =>
                      setFormData({ ...formData, targetPriceType: e.target.value })
                    }
                  >
                    <option value="both">{t("offers.form.target_both", { defaultValue: "Retail + Wholesale" })}</option>
                    <option value="retail">{t("offers.form.target_retail", { defaultValue: "Retail only" })}</option>
                    <option value="wholesale">{t("offers.form.target_wholesale", { defaultValue: "Wholesale only" })}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
                    {formData.scopeType === "category"
                      ? t("offers.form.pick_category", { defaultValue: "Category" })
                      : t("offers.form.pick_product", { defaultValue: "Product" })}
                  </label>
                  <select
                    required
                    className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                    value={formData.scopeId}
                    onChange={(e) => setFormData({ ...formData, scopeId: e.target.value })}
                  >
                    <option value="">
                      {formData.scopeType === "category"
                        ? t("offers.form.pick_category_placeholder", { defaultValue: "Select category" })
                        : t("offers.form.pick_product_placeholder", { defaultValue: "Select product" })}
                    </option>
                    {(formData.scopeType === "category" ? categories : paints).map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
                    {t("offers.form.start_date", { defaultValue: "Start Date" })}
                  </label>
                  <input
                    type="date"
                    className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
                    {t("offers.form.end_date", { defaultValue: "End Date" })}
                  </label>
                  <input
                    type="date"
                    className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
                    ID
                  </label>
                  <input
                    type="text"
                    value={editingOffer?.id || "-"}
                    disabled
                    className="w-full bg-gray-100 border-none p-4 rounded-2xl text-gray-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingOffer(null);
                  }}
                  className="flex-1 px-4 py-4 rounded-2xl text-gray-500 font-bold hover:bg-gray-100 transition-colors"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                >
                  {editingOffer
                    ? t("offers.form.save_offer", { defaultValue: "Save Changes" })
                    : t("offers.form.create_offer")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewingOffer && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-4xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {t("offers.actions.view", { defaultValue: "Offer Details" })}
            </h2>
            <p className="text-gray-500 mb-6 text-sm">
              {viewingOffer.title}
            </p>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">ID</span>
                <span className="font-semibold text-gray-800 break-all text-right">
                  {viewingOffer.id || "-"}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">{t("offers.form.title")}</span>
                <span className="font-semibold text-gray-800">{viewingOffer.title || "-"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">{t("offers.form.discount")}</span>
                <span className="font-semibold text-gray-800">
                  {viewingOffer.discountType === "percentage"
                    ? `${viewingOffer.discount}%`
                    : `$${viewingOffer.discount}`}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">{t("offers.form.type")}</span>
                <span className="font-semibold text-gray-800">
                  {viewingOffer.discountType === "percentage"
                    ? t("offers.form.percent")
                    : t("offers.form.fixed")}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">{t("offers.form.scope_type", { defaultValue: "Apply To" })}</span>
                <span className="font-semibold text-gray-800">
                  {viewingOffer.scopeType === "product"
                    ? t("offers.form.scope_product", { defaultValue: "Product" })
                    : t("offers.form.scope_category", { defaultValue: "Category" })}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">
                  {viewingOffer.scopeType === "product"
                    ? t("offers.form.pick_product", { defaultValue: "Product" })
                    : t("offers.form.pick_category", { defaultValue: "Category" })}
                </span>
                <span className="font-semibold text-gray-800 text-right">{getScopeName(viewingOffer)}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">{t("offers.form.target_price_type", { defaultValue: "Target Price" })}</span>
                <span className="font-semibold text-gray-800">
                  {viewingOffer.targetPriceType === "retail"
                    ? t("offers.form.target_retail", { defaultValue: "Retail only" })
                    : viewingOffer.targetPriceType === "wholesale"
                    ? t("offers.form.target_wholesale", { defaultValue: "Wholesale only" })
                    : t("offers.form.target_both", { defaultValue: "Retail + Wholesale" })}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">{t("offers.form.start_date", { defaultValue: "Start Date" })}</span>
                <span className="font-semibold text-gray-800">{formatDate(viewingOffer.startDate)}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">{t("offers.form.end_date", { defaultValue: "End Date" })}</span>
                <span className="font-semibold text-gray-800">{formatDate(viewingOffer.endDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t("offers.form.is_active")}</span>
                <span
                  className={`font-semibold ${
                    viewingOffer.isActive ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  {viewingOffer.isActive
                    ? t("offers.status.active")
                    : t("offers.status.inactive")}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Created At</span>
                <span className="font-semibold text-gray-800">{formatDate(viewingOffer.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Updated At</span>
                <span className="font-semibold text-gray-800">{formatDate(viewingOffer.updatedAt)}</span>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={() => setViewingOffer(null)}
                className="w-full px-4 py-3 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors"
              >
                {t("common.close", { defaultValue: "Close" })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Offers;
