import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { getJwtRole } from "../utils/jwtUser.js";

const DesignFormPage = () => {
  const { id } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { fetchDesignById, createDesign, uploadDesignImage, updateDesign } = useAppContext();
  const role = getJwtRole();
  const isAdmin = role === "admin";
  const isNew = pathname === "/designs/new" || pathname.endsWith("/designs/new");
  const isEdit = !isNew && id;
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", imageUrl: "", videoUrl: "" });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    fetchDesignById(id)
      .then((d) => setForm({
        title: d.title || "",
        description: d.description || "",
        imageUrl: d.imageUrl || "",
        videoUrl: d.videoUrl || "",
      }))
      .catch(() => navigate(isAdmin ? "/designs" : "/designs/my"))
      .finally(() => setLoading(false));
  }, [id, isEdit, fetchDesignById, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || (!form.imageUrl.trim() && !imageFile)) {
      alert(t("designs.fill_required"));
      return;
    }
    setSaving(true);
    let resolvedImageUrl = form.imageUrl.trim();
    if (imageFile) {
      const uploadRes = await uploadDesignImage(imageFile);
      if (!uploadRes.success || !uploadRes.imageUrl) {
        setSaving(false);
        alert(uploadRes.error || "Failed to upload image");
        return;
      }
      resolvedImageUrl = uploadRes.imageUrl;
    }
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      imageUrl: resolvedImageUrl,
      videoUrl: form.videoUrl.trim() || undefined,
    };
    const res = isEdit ? await updateDesign(id, payload) : await createDesign(payload);
    setSaving(false);
    if (res.success) {
      navigate(isEdit ? `/designs/${id}` : isAdmin ? "/designs" : "/designs/my");
    } else {
      alert(res.error || "Failed to save");
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      <button
        type="button"
        onClick={() => navigate(isEdit ? `/designs/${id}` : "/designs/my")}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-800"
      >
        <ArrowLeft size={18} /> {t("designs.back")}
      </button>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h1 className="text-xl font-bold text-slate-800 mb-4">
          {isEdit ? t("designs.edit_design") : t("designs.add_design")}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t("designs.title")} *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t("designs.description")} *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={4}
              className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t("designs.image_url")}</label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-400 mt-1">أدخل رابط صورة أو ارفع صورة من الجهاز.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">رفع صورة</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:ring-2 focus:ring-blue-500"
            />
            {imageFile ? (
              <p className="text-xs text-emerald-600 mt-1">{imageFile.name}</p>
            ) : null}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t("designs.video_url")}</label>
            <input
              type="url"
              value={form.videoUrl}
              onChange={(e) => setForm((p) => ({ ...p, videoUrl: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "..." : (isEdit ? t("designs.save") : t("designs.create"))}
            </button>
            <button
              type="button"
              onClick={() => navigate(isEdit ? `/designs/${id}` : "/designs/my")}
              className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              {t("common.cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DesignFormPage;
