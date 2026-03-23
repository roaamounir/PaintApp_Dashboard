import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { useAppContext } from "../context/AppContext";

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

const MyDesigns = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    fetchDesigns,
    deleteDesign,
  } = useAppContext();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = getCurrentUserId();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetchDesigns({ designerId: userId })
      .then((data) => { if (!cancelled) setDesigns(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) setDesigns([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [userId, fetchDesigns]);

  const handleDelete = async (id) => {
    if (!window.confirm(t("designs.confirm_delete"))) return;
    const res = await deleteDesign(id);
    if (res.success) setDesigns((prev) => prev.filter((d) => d.id !== id));
    else alert(res.error || "Delete failed");
  };

  if (!userId) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>{t("designs.login_required")}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t("designs.my_designs_title")}</h1>
          <p className="text-slate-500 text-sm">{t("designs.my_designs_subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/designs/new")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium"
        >
          <Plus size={18} /> {t("designs.add_design")}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {designs.length === 0 ? (
          <p className="col-span-full text-center text-slate-500 py-12">{t("designs.no_designs")}</p>
        ) : (
          designs.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
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
                <div className="flex items-center gap-2 mt-3">
                  <Link
                    to={`/designs/${d.id}`}
                    className="p-2 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                    title={t("designs.view")}
                  >
                    <Eye size={18} />
                  </Link>
                  <Link
                    to={`/designs/${d.id}/edit`}
                    className="p-2 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-slate-100"
                    title={t("designs.edit")}
                  >
                    <Edit size={18} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(d.id)}
                    className="p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                    title={t("designs.delete")}
                  >
                    <Trash2 size={18} />
                  </button>
                  <Link
                    to={`/designs/${d.id}`}
                    className="ml-auto text-sm text-blue-600 hover:underline"
                  >
                    {t("designs.view_requests")}
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

export default MyDesigns;
