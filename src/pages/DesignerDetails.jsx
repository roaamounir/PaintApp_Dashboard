import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import {
  ArrowLeft,
  Save,
  Loader2,
  ExternalLink,
  Edit3,
  X,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

const getApiBase = () => {
  const env = import.meta.env.VITE_API_URL;
  if (env && String(env).trim()) return String(env).replace(/\/$/, "");
  if (typeof window !== "undefined") return `${window.location.origin}/api-backend`;
  return "http://localhost:5000";
};

const DesignerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { updateDesigner, fetchDesigners } = useAppContext();

  const [record, setRecord] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
    specialties: "",
    portfolio: "",
    bio: "",
    location: "",
  });

  const API_BASE = getApiBase();

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    axios
      .get(`${API_BASE}/designers/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => {
        if (cancelled) return;
        const d = res.data;
        setRecord(d);
        setForm({
          name: d.user?.name || "",
          email: d.user?.email || "",
          phone: d.user?.phone || "",
          experience: d.experience != null ? String(d.experience) : "",
          specialties: d.specialties || "",
          portfolio: d.portfolio || "",
          bio: d.bio || "",
          location: d.location || "",
        });
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    const expNum = form.experience === "" ? null : Number(form.experience);
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      experience: expNum !== null && Number.isNaN(expNum) ? null : expNum,
      specialties: form.specialties || null,
      portfolio: form.portfolio || null,
      bio: form.bio || null,
      location: form.location || null,
    };
    const res = await updateDesigner(id, payload);
    setSaving(false);
    if (res.success && res.data) {
      setRecord(res.data);
      setIsEditing(false);
      alert(t("designers.detail.saved"));
      await fetchDesigners?.();
    } else {
      alert(res.error || t("designers.detail.save_failed"));
    }
  };

  const handleCancel = () => {
    if (!record) return;
    setForm({
      name: record.user?.name || "",
      email: record.user?.email || "",
      phone: record.user?.phone || "",
      experience: record.experience != null ? String(record.experience) : "",
      specialties: record.specialties || "",
      portfolio: record.portfolio || "",
      bio: record.bio || "",
      location: record.location || "",
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="p-20 flex flex-col items-center gap-4" dir={isRTL ? "rtl" : "ltr"}>
        <Loader2 className="animate-spin text-violet-600" size={40} />
        <p className="text-slate-500">{t("designers.detail.loading")}</p>
      </div>
    );
  }

  if (loadError || !record) {
    return (
      <div className="p-20 flex flex-col items-center gap-4 text-center" dir={isRTL ? "rtl" : "ltr"}>
        <p className="text-slate-500">{t("designers.detail.not_found")}</p>
        <button
          type="button"
          onClick={() => navigate("/designers")}
          className="flex items-center gap-2 text-violet-600 font-bold hover:underline"
        >
          <ArrowLeft size={16} className={isRTL ? "rotate-180" : ""} />
          {t("designers.detail.back")}
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
          onClick={() => navigate("/designers")}
          className="flex items-center gap-2 text-slate-500 hover:text-violet-600 text-sm font-bold"
        >
          <ArrowLeft size={18} className={isRTL ? "rotate-180" : ""} />
          {t("designers.detail.back")}
        </button>
        <div className="flex items-center gap-2">
          <Link
            to={`/designs?designerId=${encodeURIComponent(id || "")}`}
            className="text-sm font-bold text-violet-600 hover:underline inline-flex items-center gap-1"
          >
            {t("designers.detail.open_gallery")}
            <ExternalLink size={14} />
          </Link>
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-violet-700"
            >
              <Edit3 size={16} />
              {t("designers.detail.edit")}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-2 border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                <X size={16} />
                {t("designers.detail.cancel")}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Save size={16} />
                )}
                {t("designers.detail.save")}
              </button>
            </>
          )}
        </div>
      </div>

      <h1 className="text-2xl font-black text-slate-800">
        {t("designers.detail.title")}: {record.user?.name}
      </h1>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
          {t("designers.detail.account")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              {t("users.fields.name", { defaultValue: "الاسم" })}
            </label>
            {isEditing ? (
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className={inputClass}
              />
            ) : (
              <p className={readClass}>{record.user?.name}</p>
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
              <p className={readClass}>{record.user?.email}</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              {t("users.fields.phone_req", { defaultValue: "الهاتف" })}
            </label>
            {isEditing ? (
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={inputClass}
              />
            ) : (
              <p className={readClass}>{record.user?.phone}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
          {t("designers.detail.profile_section")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              {t("designers.fields.experience_years")}
            </label>
            {isEditing ? (
              <input
                name="experience"
                type="number"
                min={0}
                value={form.experience}
                onChange={handleChange}
                className={inputClass}
              />
            ) : (
              <p className={readClass}>
                {record.experience != null ? record.experience : "—"}
              </p>
            )}
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              {t("designers.fields.rating")}
            </label>
            <p className={readClass}>
              {record.rating != null ? Number(record.rating).toFixed(1) : "—"}
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              {t("designers.fields.specialties")}
            </label>
            {isEditing ? (
              <textarea
                name="specialties"
                value={form.specialties}
                onChange={handleChange}
                rows={3}
                className={inputClass}
              />
            ) : (
              <p className={readClass}>{record.specialties || "—"}</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              {t("designers.fields.location")}
            </label>
            {isEditing ? (
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                className={inputClass}
              />
            ) : (
              <p className={readClass}>{record.location || "—"}</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              {t("designers.fields.bio")}
            </label>
            {isEditing ? (
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={4}
                className={inputClass}
              />
            ) : (
              <p className={`${readClass} whitespace-pre-wrap`}>{record.bio || "—"}</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              {t("designers.fields.portfolio")}
            </label>
            {isEditing ? (
              <input
                name="portfolio"
                value={form.portfolio}
                onChange={handleChange}
                className={inputClass}
              />
            ) : (
              <p className={readClass}>
                {record.portfolio ? (
                  <a
                    href={record.portfolio}
                    target="_blank"
                    rel="noreferrer"
                    className="text-violet-600 hover:underline break-all"
                  >
                    {record.portfolio}
                  </a>
                ) : (
                  "—"
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignerDetails;
