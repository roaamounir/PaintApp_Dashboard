import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../context/AppContext";
import {
  FiPlus,
  FiTrash2,
  FiTag,
  FiCheckCircle,
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";

const Offers = () => {
  const { t } = useTranslation();
  const { offers, addOffer, deleteOffer, toggleOfferStatus, loading } =
    useAppContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    discount: "",
    discountType: "percentage",
    isActive: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await addOffer(formData);
    if (result.success) {
      setIsModalOpen(false);
      setFormData({
        title: "",
        discount: "",
        discountType: "percentage",
        isActive: true,
      });
    }
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
          onClick={() => setIsModalOpen(true)}
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
              <button
                onClick={() => deleteOffer(offer.id)}
                className="p-3 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                title={t("offers.actions.delete")}
              >
                <FiTrash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create Offer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {t("offers.new_offer")}
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

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="flex items-center gap-3 p-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-5 h-5 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm text-gray-600 font-medium"
                >
                  {t("offers.form.is_active")}
                </label>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-4 rounded-2xl text-gray-500 font-bold hover:bg-gray-100 transition-colors"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                >
                  {t("offers.form.create_offer")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Offers;
