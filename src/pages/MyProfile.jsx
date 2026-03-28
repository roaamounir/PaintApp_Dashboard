import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import {
  Loader2,
  User,
  Camera,
  Save,
  ImagePlus,
  Trash2,
  Layers,
  Paintbrush,
} from "lucide-react";

const getApiBase = () => {
  const env = import.meta.env.VITE_API_URL;
  if (env && String(env).trim()) return String(env).replace(/\/$/, "");
  if (typeof window !== "undefined") return `${window.location.origin}/api-backend`;
  return "http://localhost:5000";
};

const resolveUploadUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const base = getApiBase();
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
};

function parseJwtPayload() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

const MyProfile = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const API_BASE = getApiBase();
  const token = localStorage.getItem("token");
  const authHeader = { Authorization: `Bearer ${token}` };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [me, setMe] = useState(null);
  const [role, setRole] = useState(null);

  const [userForm, setUserForm] = useState({ name: "", email: "", phone: "" });
  const [designerForm, setDesignerForm] = useState({
    experience: "",
    specialties: "",
    rating: "",
    portfolio: "",
    bio: "",
    location: "",
  });
  const [painterForm, setPainterForm] = useState({
    city: "",
    address: "",
    experience: "",
    serviceType: "",
    bio: "",
  });

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);

  const loadMe = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/users/me`, { headers: authHeader });
      const data = res.data;
      setMe(data);
      const jwt = parseJwtPayload();
      const r = data.role || jwt?.role;
      setRole(r);
      setUserForm({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
      });
      if (r === "designer") {
        const dp = data.designerProfile;
        setDesignerForm({
          experience: dp?.experience != null ? String(dp.experience) : "",
          specialties: dp?.specialties || "",
          rating: dp?.rating != null ? String(dp.rating) : "",
          portfolio: dp?.portfolio || "",
          bio: dp?.bio || "",
          location: dp?.location || "",
        });
      }
      if (r === "painter" && data.painterProfile) {
        const pp = data.painterProfile;
        setPainterForm({
          city: pp.city || "",
          address: pp.address || "",
          experience: String(pp.experience ?? ""),
          serviceType: pp.serviceType || "",
          bio: pp.bio || "",
        });
      }
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await axios.post(`${API_BASE}/users/me/avatar`, fd, {
        headers: { Authorization: authHeader.Authorization },
      });
      if (res.data?.user) {
        setMe((prev) => ({ ...prev, ...res.data.user, avatarUrl: res.data.avatarUrl }));
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
    } catch (err) {
      alert(err.response?.data?.error || t("profile.avatar_error"));
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  const saveUserBasics = async () => {
    const jwt = parseJwtPayload();
    const id = jwt?.id;
    if (!id) return;
    setSaving(true);
    try {
      await axios.put(
        `${API_BASE}/users/${id}`,
        { name: userForm.name, email: userForm.email, phone: userForm.phone },
        { headers: authHeader }
      );
      await loadMe();
      alert(t("profile.saved"));
    } catch (err) {
      alert(err.response?.data?.error || t("profile.save_failed"));
    } finally {
      setSaving(false);
    }
  };

  const saveDesigner = async () => {
    setSaving(true);
    try {
      const expNum = designerForm.experience === "" ? null : Number(designerForm.experience);
      const rateNum = designerForm.rating === "" ? null : Number(designerForm.rating);
      await axios.put(
        `${API_BASE}/designers/me`,
        {
          name: userForm.name,
          email: userForm.email,
          phone: userForm.phone,
          experience: expNum !== null && Number.isNaN(expNum) ? null : expNum,
          specialties: designerForm.specialties || null,
          rating: rateNum !== null && Number.isNaN(rateNum) ? null : rateNum,
          portfolio: designerForm.portfolio || null,
          bio: designerForm.bio || null,
          location: designerForm.location || null,
        },
        { headers: authHeader }
      );
      await loadMe();
      alert(t("profile.saved"));
    } catch (err) {
      alert(err.response?.data?.error || t("profile.save_failed"));
    } finally {
      setSaving(false);
    }
  };

  const savePainter = async () => {
    setSaving(true);
    try {
      await axios.put(
        `${API_BASE}/painters/me`,
        {
          name: userForm.name,
          email: userForm.email,
          phone: userForm.phone,
          city: painterForm.city,
          address: painterForm.address || null,
          experience: Number(painterForm.experience) || 0,
          serviceType: painterForm.serviceType,
          bio: painterForm.bio || null,
        },
        { headers: authHeader }
      );
      await loadMe();
      alert(t("profile.saved"));
    } catch (err) {
      alert(err.response?.data?.error || t("profile.save_failed"));
    } finally {
      setSaving(false);
    }
  };

  const uploadGallery = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setGalleryUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      await axios.post(`${API_BASE}/painters/me/gallery`, fd, {
        headers: { Authorization: authHeader.Authorization },
      });
      await loadMe();
    } catch (err) {
      alert(err.response?.data?.error || t("profile.gallery_upload_error"));
    } finally {
      setGalleryUploading(false);
      e.target.value = "";
    }
  };

  const deleteGalleryItem = async (galleryId) => {
    if (!window.confirm(t("profile.confirm_delete_image"))) return;
    try {
      await axios.delete(`${API_BASE}/painters/me/gallery/${galleryId}`, { headers: authHeader });
      await loadMe();
    } catch (err) {
      alert(err.response?.data?.error || t("profile.gallery_delete_error"));
    }
  };

  const inputClass =
    "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none bg-white";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-20" dir={isRTL ? "rtl" : "ltr"}>
        <Loader2 className="animate-spin text-violet-600" size={40} />
        <p className="text-slate-500">{t("profile.loading")}</p>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="p-8 text-slate-600" dir={isRTL ? "rtl" : "ltr"}>
        {t("profile.load_error")}
      </div>
    );
  }

  const gallery = role === "painter" && me.painterProfile?.gallery ? me.painterProfile.gallery : [];

  return (
    <div className="max-w-3xl space-y-8" dir={isRTL ? "rtl" : "ltr"}>
      <div>
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <User className="text-violet-600" />
          {t("profile.title")}
        </h1>
        <p className="text-slate-500 text-sm mt-1">{t("profile.subtitle")}</p>
      </div>

      {/* Avatar — جميع الأدوار */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
          {t("profile.avatar_section")}
        </h2>
        <div className="flex flex-wrap items-center gap-6">
          <div className="relative h-24 w-24 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200">
            {me.avatarUrl ? (
              <img
                src={resolveUploadUrl(me.avatarUrl)}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-400">
                <User size={40} />
              </div>
            )}
          </div>
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold cursor-pointer hover:bg-slate-800">
            {avatarUploading ? <Loader2 className="animate-spin" size={18} /> : <Camera size={18} />}
            {t("profile.change_avatar")}
            <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={handleAvatarChange} disabled={avatarUploading} />
          </label>
        </div>
      </section>

      {/* بيانات الحساب */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
          {t("profile.account_section")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t("users.fields.name")}</label>
            <input className={inputClass} value={userForm.name} onChange={(e) => setUserForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t("users.fields.email")}</label>
            <input type="email" className={inputClass} value={userForm.email} onChange={(e) => setUserForm((p) => ({ ...p, email: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t("users.fields.phone_req")}</label>
            <input className={inputClass} value={userForm.phone} onChange={(e) => setUserForm((p) => ({ ...p, phone: e.target.value }))} />
          </div>
        </div>
        {role !== "designer" && role !== "painter" && (
          <button
            type="button"
            onClick={saveUserBasics}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-violet-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {t("profile.save")}
          </button>
        )}
      </section>

      {/* مصمم */}
      {role === "designer" && (
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Paintbrush size={16} />
              {t("profile.designer_section")}
            </h2>
            <Link to="/designs/my" className="text-sm font-bold text-violet-600 hover:underline inline-flex items-center gap-1">
              <Layers size={16} />
              {t("profile.my_designs_link")}
            </Link>
          </div>
          <p className="text-sm text-slate-500">{t("profile.designer_hint")}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t("designers.fields.specialties")}</label>
              <textarea className={inputClass} rows={2} value={designerForm.specialties} onChange={(e) => setDesignerForm((p) => ({ ...p, specialties: e.target.value }))} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t("designers.fields.experience_years")}</label>
              <input type="number" min={0} className={inputClass} value={designerForm.experience} onChange={(e) => setDesignerForm((p) => ({ ...p, experience: e.target.value }))} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t("profile.location")}</label>
              <input className={inputClass} value={designerForm.location} onChange={(e) => setDesignerForm((p) => ({ ...p, location: e.target.value }))} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t("designers.fields.rating")}</label>
              <input type="number" step="0.1" min={0} max={5} className={inputClass} value={designerForm.rating} onChange={(e) => setDesignerForm((p) => ({ ...p, rating: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t("profile.bio")}</label>
              <textarea className={inputClass} rows={4} value={designerForm.bio} onChange={(e) => setDesignerForm((p) => ({ ...p, bio: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t("designers.fields.portfolio")}</label>
              <input className={inputClass} value={designerForm.portfolio} onChange={(e) => setDesignerForm((p) => ({ ...p, portfolio: e.target.value }))} />
            </div>
          </div>
          <button
            type="button"
            onClick={saveDesigner}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-violet-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {t("profile.save_all")}
          </button>
        </section>
      )}

      {/* فني دهان */}
      {role === "painter" && (
        <>
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">{t("profile.painter_section")}</h2>
            <p className="text-sm text-slate-500">{t("profile.painter_hint")}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t("profile.service_type")}</label>
                <input className={inputClass} value={painterForm.serviceType} onChange={(e) => setPainterForm((p) => ({ ...p, serviceType: e.target.value }))} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t("designers.fields.experience_years")}</label>
                <input type="number" min={0} className={inputClass} value={painterForm.experience} onChange={(e) => setPainterForm((p) => ({ ...p, experience: e.target.value }))} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t("profile.city")}</label>
                <input className={inputClass} value={painterForm.city} onChange={(e) => setPainterForm((p) => ({ ...p, city: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t("profile.address")}</label>
                <input className={inputClass} value={painterForm.address} onChange={(e) => setPainterForm((p) => ({ ...p, address: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t("profile.bio")}</label>
                <textarea className={inputClass} rows={4} value={painterForm.bio} onChange={(e) => setPainterForm((p) => ({ ...p, bio: e.target.value }))} />
              </div>
            </div>
            <button
              type="button"
              onClick={savePainter}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-violet-700 disabled:opacity-60"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {t("profile.save_all")}
            </button>
          </section>

          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">{t("profile.work_gallery")}</h2>
            <p className="text-sm text-slate-500">{t("profile.work_gallery_hint")}</p>
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-slate-300 text-slate-700 text-sm font-bold cursor-pointer hover:bg-slate-50">
              {galleryUploading ? <Loader2 className="animate-spin" size={18} /> : <ImagePlus size={18} />}
              {t("profile.add_work_photo")}
              <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={uploadGallery} disabled={galleryUploading} />
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {gallery.map((item) => (
                <div key={item.id} className="relative group rounded-xl overflow-hidden border border-slate-100 aspect-square bg-slate-100">
                  <img src={resolveUploadUrl(item.imageUrl)} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => deleteGalleryItem(item.id)}
                    className="absolute top-2 end-2 p-1.5 rounded-lg bg-red-600 text-white opacity-0 group-hover:opacity-100 transition"
                    aria-label="delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            {gallery.length === 0 && (
              <p className="text-sm text-slate-400">{t("profile.gallery_empty")}</p>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default MyProfile;
