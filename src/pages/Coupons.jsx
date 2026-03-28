import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiPlus, FiTag, FiTrash2, FiLoader } from "react-icons/fi";
import { useAppContext } from "../context/AppContext";

const initialForm = {
  title: "",
  discount: "",
  discountType: "percentage",
  targetPriceType: "retail",
  scopeType: "category",
  scopeId: "",
  startDate: "",
  endDate: "",
  isActive: true,
};

const Coupons = () => {
  const { t } = useTranslation();
  const {
    coupons,
    categories,
    paints,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    loadingStates,
  } = useAppContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  const loading = Boolean(loadingStates?.coupons);

  const activeCount = useMemo(
    () => coupons.filter((item) => item.isActive).length,
    [coupons],
  );

  const beneficiaryLabel = (target) => {
    if (target === "wholesale") return "جملة";
    if (target === "retail") return "قطاعي";
    return "الكل";
  };

  const resetForm = () => {
    setEditingCoupon(null);
    setFormData(initialForm);
  };

  const openCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEdit = (coupon) => {
    const toDateInput = (v) => (v ? String(v).slice(0, 10) : "");
    setEditingCoupon(coupon);
    setFormData({
      title: coupon.title || "",
      discount: coupon.discount ?? "",
      discountType: coupon.discountType || "percentage",
      targetPriceType: coupon.targetPriceType || "retail",
      scopeType: coupon.scopeType || "category",
      scopeId: coupon.scopeId || "",
      startDate: toDateInput(coupon.startDate),
      endDate: toDateInput(coupon.endDate),
      isActive: coupon.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      discount: Number(formData.discount),
    };
    const result = editingCoupon
      ? await updateCoupon(editingCoupon.id, payload)
      : await addCoupon(payload);
    if (result?.success) {
      setIsModalOpen(false);
      resetForm();
    }
  };

  const targetOptions = formData.scopeType === "category" ? categories : paints;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">الكوبونات</h1>
          <p className="text-gray-500">إضافة كوبون خصم وتحديد المستفيد: جملة أو قطاعي</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          <FiPlus /> إضافة كوبون
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
            <FiTag size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium">إجمالي الكوبونات</p>
            <p className="text-2xl font-bold text-gray-800">{coupons.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <FiTag size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium">الكوبونات النشطة</p>
            <p className="text-2xl font-bold text-gray-800">{activeCount}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-12 text-indigo-600">
          <FiLoader className="animate-spin" size={32} />
          <span className="ml-3">{t("common.loading", { defaultValue: "جاري التحميل..." })}</span>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-start px-4 py-3">الكود</th>
                <th className="text-start px-4 py-3">الخصم</th>
                <th className="text-start px-4 py-3">المستفيد</th>
                <th className="text-start px-4 py-3">الحالة</th>
                <th className="text-start px-4 py-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((item) => (
                <tr key={item.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-semibold">{item.title}</td>
                  <td className="px-4 py-3">
                    {item.discountType === "fixed" ? `${item.discount} ج.م` : `${item.discount}%`}
                  </td>
                  <td className="px-4 py-3">{beneficiaryLabel(item.targetPriceType)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.isActive ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {item.isActive ? "نشط" : "غير نشط"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"
                      >
                        تعديل
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCoupon(item.id)}
                        className="p-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100"
                        title="حذف"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-gray-500 text-center" colSpan={5}>
                    لا توجد كوبونات مضافة حالياً.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-5">
              {editingCoupon ? "تعديل كوبون" : "إضافة كوبون جديد"}
            </h2>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">كود الكوبون</label>
                  <input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="WELCOME10"
                    className="w-full bg-gray-50 border-none p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">نوع الخصم</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full bg-gray-50 border-none p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="percentage">نسبة مئوية %</option>
                    <option value="fixed">مبلغ ثابت</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">قيمة الخصم</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="w-full bg-gray-50 border-none p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">المستفيد من الكوبون</label>
                  <select
                    value={formData.targetPriceType}
                    onChange={(e) => setFormData({ ...formData, targetPriceType: e.target.value })}
                    className="w-full bg-gray-50 border-none p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="retail">القطاعي</option>
                    <option value="wholesale">الجملة</option>
                    <option value="both">الكل</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">نطاق التطبيق</label>
                  <select
                    value={formData.scopeType}
                    onChange={(e) =>
                      setFormData({ ...formData, scopeType: e.target.value, scopeId: "" })
                    }
                    className="w-full bg-gray-50 border-none p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="category">قسم</option>
                    <option value="product">منتج</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    {formData.scopeType === "category" ? "اختر القسم" : "اختر المنتج"}
                  </label>
                  <select
                    required
                    value={formData.scopeId}
                    onChange={(e) => setFormData({ ...formData, scopeId: e.target.value })}
                    className="w-full bg-gray-50 border-none p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">اختيار...</option>
                    {targetOptions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">تاريخ البداية</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-gray-50 border-none p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">تاريخ النهاية</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-gray-50 border-none p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                تفعيل الكوبون
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  {editingCoupon ? "حفظ التعديلات" : "إضافة الكوبون"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;
