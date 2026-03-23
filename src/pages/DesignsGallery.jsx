import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Heart, MessageCircle, Share2, Send } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const DesignsGallery = () => {
  const { t } = useTranslation();
  const { fetchDesigns } = useAppContext();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchDesigns()
      .then((data) => { if (!cancelled) setDesigns(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) setDesigns([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [fetchDesigns]);

  const handleShare = (id) => {
    const url = `${window.location.origin}/designs/${id}`;
    if (navigator.share) {
      navigator.share({ title: "Design", url }).catch(() => navigator.clipboard?.writeText(url));
    } else {
      navigator.clipboard?.writeText(url).then(() => alert(t("designs.copied")));
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
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{t("designs.gallery_title")}</h1>
        <p className="text-slate-500 text-sm">{t("designs.gallery_subtitle")}</p>
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
                <p className="text-xs text-slate-400 mt-2">{t("designs.designer_id")}: {d.designerId}</p>
                <div className="flex items-center gap-2 mt-3">
                  <Link
                    to={`/designs/${d.id}`}
                    className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
                  >
                    <MessageCircle size={16} /> {t("designs.comments")}
                  </Link>
                  <Link
                    to={`/designs/${d.id}`}
                    className="flex items-center gap-1 text-slate-500 hover:text-rose-500 text-sm"
                  >
                    <Heart size={16} /> {t("designs.favorite")}
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleShare(d.id)}
                    className="flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm"
                  >
                    <Share2 size={16} /> {t("designs.share")}
                  </button>
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
