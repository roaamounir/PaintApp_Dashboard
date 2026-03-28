import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import {
  ArrowLeft,
  Save,
  Loader2,
  Edit3,
  X,
  ImagePlus,
  RefreshCcw,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

const getApiBase = () => {
  const env = import.meta.env.VITE_API_URL;
  if (env && String(env).trim()) return String(env).replace(/\/$/, "");
  if (typeof window !== "undefined") return `${window.location.origin}/api-backend`;
  return "http://localhost:5000";
};

const getJwtPayload = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return {};
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return {};
  }
};

const PainterDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const jwt = getJwtPayload();
  const isAdmin = jwt.role === "admin";

  const {
    updatePainter,
    updateUser,
    painterGallery,
    fetchPainterGallery,
    addPainterGalleryItem,
    updatePainterGalleryItem,
    deleteGalleryItem,
  } = useAppContext();

  const [record, setRecord] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [galleryBusy, setGalleryBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    experience: "",
    serviceType: "interior",
    bio: "",
  });

  const API_BASE = getApiBase();

  const hydrateForm = (p) => {
    setForm({
      name: p?.user?.name || "",
      email: p?.user?.email || "",
      phone: p?.user?.phone || "",
      city: p?.city || "",
      address: p?.address || "",
      experience: p?.experience != null ? String(p.experience) : "",
      serviceType: p?.serviceType || "interior",
      bio: p?.bio || "",
    });
  };

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    axios
      .get(`${API_BASE}/painters/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => {
        if (cancelled) return;
        setRecord(res.data);
        hydrateForm(res.data);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(true);
          setRecord(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, API_BASE]);

  useEffect(() => {
    if (!record?.id) return;
    fetchPainterGallery(record.id);
  }, [record?.id, fetchPainterGallery]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!record?.id) return;
    setSaving(true);

    const painterPayload = {
      city: form.city,
      address: form.address,
      experience: form.experience === "" ? 0 : Number(form.experience),
      serviceType: form.serviceType,
      bio: form.bio || null,
    };
    const userPayload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
    };

    const userRes = await updateUser(record.userId, userPayload);
    const painterRes = await updatePainter(record.id, painterPayload);
    setSaving(false);

    if (userRes.success && painterRes.success) {
      const next = {
        ...record,
        ...painterPayload,
        user: { ...(record.user || {}), ...userPayload },
      };
      setRecord(next);
      setIsEditing(false);
      alert(t("messages.update_success", { defaultValue: "تم التحديث بنجاح" }));
      return;
    }
    alert(t("messages.update_error", { defaultValue: "حدث خطأ أثناء التحديث" }));
  };

  const handleCancel = () => {
    if (!record) return;
    hydrateForm(record);
    setIsEditing(false);
  };

  const handleAddGalleryImage = async (file) => {
    if (!isAdmin || !record?.id || !file) return;
    setGalleryBusy(true);
    const res = await addPainterGalleryItem(record.id, file);
    if (!res.success) alert(res.error || "فشل إضافة الصورة");
    await fetchPainterGallery(record.id);
    setGalleryBusy(false);
  };

  const handleReplaceGalleryImage = async (galleryId, file) => {
    if (!isAdmin || !galleryId || !file) return;
    setGalleryBusy(true);
    const res = await updatePainterGalleryItem(galleryId, file);
    if (!res.success) alert(res.error || "فشل تحديث الصورة");
    await fetchPainterGallery(record.id);
    setGalleryBusy(false);
  };

  const handleDeleteGalleryImage = async (galleryId) => {
    if (!isAdmin || !galleryId) return;
    setGalleryBusy(true);
    const res = await deleteGalleryItem(galleryId);
    if (!res?.success) alert("فشل حذف الصورة");
    await fetchPainterGallery(record.id);
    setGalleryBusy(false);
  };

  if (loading) {
    return (
      <div className="p-20 flex flex-col items-center gap-4" dir={isRTL ? "rtl" : "ltr"}>
        <Loader2 className="animate-spin text-violet-600" size={40} />
        <p className="text-slate-500">{t("painterDetails.loading", { defaultValue: "جاري التحميل..." })}</p>
      </div>
    );
  }

  if (loadError || !record) {
    return (
      <div className="p-20 flex flex-col items-center gap-4 text-center" dir={isRTL ? "rtl" : "ltr"}>
        <p className="text-slate-500">{t("painterDetails.not_found", { defaultValue: "لم يتم العثور على الفني" })}</p>
        <button
          type="button"
          onClick={() => navigate("/painters")}
          className="flex items-center gap-2 text-violet-600 font-bold hover:underline"
        >
          <ArrowLeft size={16} className={isRTL ? "rotate-180" : ""} />
          {t("common.back_to_list")}
        </button>
      </div>
    );
  }

  const inputClass =
    "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none bg-white";
  const readClass = "text-slate-800 font-medium text-sm py-1";

  return (
    <div className="space-y-6 max-w-3xl" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate("/painters")}
          className="flex items-center gap-2 text-slate-500 hover:text-violet-600 text-sm font-bold"
        >
          <ArrowLeft size={18} className={isRTL ? "rotate-180" : ""} />
          {t("common.back_to_list")}
        </button>
        <div className="flex items-center gap-2">
          <Link
            to="#painter-gallery"
            className="text-sm font-bold text-violet-600 hover:underline inline-flex items-center gap-1"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("painter-gallery")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            {t("painterDetails.portfolio_label", { defaultValue: "معرض أعمال الفني" })}
            <ExternalLink size={14} />
          </Link>
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-violet-700"
            >
              <Edit3 size={16} />
              {t("common.edit", { defaultValue: "تعديل" })}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-2 border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                <X size={16} />
                {t("common.cancel")}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 disabled:opacity-60"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {t("common.save", { defaultValue: "حفظ" })}
              </button>
            </>
          )}
        </div>
      </div>

      <h1 className="text-2xl font-black text-slate-800">
        {t("painterDetails.edit_title", { defaultValue: "تفاصيل الفني" })}: {record.user?.name}
      </h1>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
          {t("painterDetails.account_section", { defaultValue: "بيانات الحساب" })}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              {t("users.fields.name", { defaultValue: "الاسم" })}
            </label>
            {isEditing ? (
              <input name="name" value={form.name} onChange={handleChange} className={inputClass} />
            ) : (
              <p className={readClass}>{record.user?.name || "—"}</p>
            )}
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              {t("users.fields.email", { defaultValue: "البريد" })}
            </label>
            {isEditing ? (
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className={inputClass}
              />
            ) : (
              <p className={readClass}>{record.user?.email || "—"}</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              {t("users.fields.phone_req", { defaultValue: "الهاتف" })}
            </label>
            {isEditing ? (
              <input name="phone" value={form.phone} onChange={handleChange} className={inputClass} />
            ) : (
              <p className={readClass}>{record.user?.phone || "—"}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
          {t("painterDetails.profile_section", { defaultValue: "الملف الفني" })}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("painterDetails.city", { defaultValue: "المدينة" })} name="city" form={form} record={record} isEditing={isEditing} onChange={handleChange} inputClass={inputClass} readClass={readClass} />
          <Field label={t("painterDetails.service_type", { defaultValue: "نوع الخدمة" })} name="serviceType" form={form} record={record} isEditing={isEditing} onChange={handleChange} inputClass={inputClass} readClass={readClass} />
          <Field label={t("painters.table.exp", { defaultValue: "الخبرة" })} name="experience" type="number" form={form} record={record} isEditing={isEditing} onChange={handleChange} inputClass={inputClass} readClass={readClass} />
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              {t("painters.table.rating", { defaultValue: "التقييم" })}
            </label>
            <p className={readClass}>
              {record.rating != null ? Number(record.rating).toFixed(1) : "—"}
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              {t("users.fields.address", { defaultValue: "العنوان" })}
            </label>
            {isEditing ? (
              <input name="address" value={form.address} onChange={handleChange} className={inputClass} />
            ) : (
              <p className={readClass}>{record.address || "—"}</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              {t("painterDetails.bio", { defaultValue: "نبذة" })}
            </label>
            {isEditing ? (
              <textarea name="bio" rows={4} value={form.bio} onChange={handleChange} className={inputClass} />
            ) : (
              <p className={`${readClass} whitespace-pre-wrap`}>{record.bio || "—"}</p>
            )}
          </div>
        </div>
      </div>

      <div id="painter-gallery" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
            {t("painterDetails.portfolio_label", { defaultValue: "معرض أعمال الفني" })}
          </h2>
          {isAdmin && (
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-600 text-white text-sm font-bold cursor-pointer hover:bg-violet-700">
              <ImagePlus size={16} />
              {galleryBusy ? t("common.loading", { defaultValue: "جاري التحميل..." }) : t("common.add", { defaultValue: "إضافة" })}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={galleryBusy}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  handleAddGalleryImage(file);
                }}
              />
            </label>
          )}
        </div>

        {Array.isArray(painterGallery) && painterGallery.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {painterGallery.map((item) => (
              <div key={item.id} className="group relative rounded-xl overflow-hidden border border-slate-200">
                <img
                  src={
                    item.imageUrl?.startsWith("http")
                      ? item.imageUrl
                      : `${API_BASE}/${String(item.imageUrl || "").replace(/^\//, "")}`
                  }
                  alt="painter-work"
                  className="w-full h-44 object-cover"
                />
                {isAdmin && (
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-2 opacity-0 group-hover:opacity-100 transition">
                    <label className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold cursor-pointer">
                      <RefreshCcw size={12} />
                      {t("common.edit", { defaultValue: "تعديل" })}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={galleryBusy}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = "";
                          handleReplaceGalleryImage(item.id, file);
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      disabled={galleryBusy}
                      onClick={() => handleDeleteGalleryImage(item.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-60"
                    >
                      <Trash2 size={12} />
                      {t("common.delete", { defaultValue: "حذف" })}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            {t("tabs.no_images_found", { defaultValue: "لا توجد صور في المعرض حالياً" })}
          </p>
        )}
      </div>
    </div>
  );
};

const Field = ({ label, name, type = "text", form, record, isEditing, onChange, inputClass, readClass }) => (
  <div>
    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{label}</label>
    {isEditing ? (
      <input name={name} type={type} value={form[name] ?? ""} onChange={onChange} className={inputClass} />
    ) : (
      <p className={readClass}>{record?.[name] ?? "—"}</p>
    )}
  </div>
);

export default PainterDetails;
