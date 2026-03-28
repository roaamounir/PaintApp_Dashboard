import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Edit, Eye, Plus, Send, Trash2 } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { getJwtRole } from "../utils/jwtUser.js";

const getCurrentUserId = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.id ?? null;
  } catch {
    return null;
  }
};

const DesignsGallery = () => {
  const { t } = useTranslation();
  const { fetchDesigns, deleteDesign } = useAppContext();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [designerName, setDesignerName] = useState("");
  const designerId = (searchParams.get("designerId") || "").trim();
  const role = getJwtRole();
  const isAdmin = role === "admin";
  const currentUserId = getCurrentUserId();

  const handleDelete = async (id) => {
    if (!window.confirm(t("designs.confirm_delete"))) return;
    const res = await deleteDesign(id);
    if (res?.success) {
      setDesigns((prev) => prev.filter((d) => d.id !== id));
    } else {
      alert(res?.error || "Delete failed");
    }
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = {};
    if (designerName.trim()) params.designerName = designerName.trim();
    if (designerId) params.designerId = designerId;
    fetchDesigns(params)
      .then((data) => { if (!cancelled) setDesigns(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) setDesigns([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [fetchDesigns, designerName, designerId]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t("designs.gallery_title")}</h1>
          <p className="text-slate-500 text-sm">{t("designs.gallery_subtitle")}</p>
        </div>

        {isAdmin && (
          <Link
            to="/designs/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium shadow-sm"
          >
            <Plus size={18} /> {t("designs.add_design")}
          </Link>
        )}
      </div>
      <div className="max-w-md">
        <input
          type="text"
          value={designerName}
          onChange={(e) => setDesignerName(e.target.value)}
          placeholder="فلترة باسم المصمم"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {designs.length === 0 ? (
          <p className="col-span-full text-center text-slate-500 py-12">{t("designs.no_designs")}</p>
        ) : (
          designs.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <Link to={`/designs/${d.id}`} className="block aspect-video bg-slate-100">
                {d.videoUrl ? (
                  <video src={d.videoUrl} className="w-full h-full object-cover" muted playsInline />
                ) : (
                  <img src={d.imageUrl} alt={d.title} className="w-full h-full object-cover" />
                )}
              </Link>
              <div className="p-4">
                <h2 className="font-semibold text-slate-800 truncate">{d.title}</h2>
                <p className="text-sm text-slate-500 line-clamp-2 mt-1">{d.description}</p>
                <p className="text-xs text-slate-400 mt-2">
                  {t("designs.designer_id")}: {d.designerName || d.designerId}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Link
                    to={`/designs/${d.id}`}
                    className="p-2 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                    title={t("designs.view")}
                  >
                    <Eye size={16} />
                  </Link>

                    {(isAdmin || String(d.designerId) === String(currentUserId || "")) && (
                      <>
                        <Link
                          to={`/designs/${d.id}/edit`}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                          title={t("designs.edit")}
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(d.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                          title={t("designs.delete")}
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}

                  <Link
                    to={`/designs/${d.id}`}
                    className="flex items-center gap-1 text-indigo-600 hover:underline text-sm ml-auto"
                  >
                    <Send size={16} /> {t("designs.request_design")}
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DesignsGallery;
