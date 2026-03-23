import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Heart, MessageCircle, Share2, Send, ArrowLeft } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const DesignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    fetchDesignById,
    fetchDesignComments,
    addDesignComment,
    toggleDesignFavorite,
    fetchDesignFavoriteStatus,
    createDesignRequest,
  } = useAppContext();
  const [design, setDesign] = useState(null);
  const [comments, setComments] = useState([]);
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestData, setRequestData] = useState({ description: "", imageUrl: "", videoUrl: "" });

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    Promise.all([
      fetchDesignById(id),
      fetchDesignComments(id).catch(() => []),
      fetchDesignFavoriteStatus(id).catch(() => false),
    ])
      .then(([d, c, f]) => {
        if (!cancelled) {
          setDesign(d);
          setComments(Array.isArray(c) ? c : []);
          setFavorited(!!f);
        }
      })
      .catch(() => { if (!cancelled) setDesign(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, fetchDesignById, fetchDesignComments, fetchDesignFavoriteStatus]);

  const handleFavorite = async () => {
    const res = await toggleDesignFavorite(id);
    if (res.success && res.favorited !== undefined) setFavorited(res.favorited);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/designs/${id}`;
    if (navigator.share) {
      navigator.share({ title: design?.title || "Design", url }).catch(() => navigator.clipboard?.writeText(url));
    } else {
      navigator.clipboard?.writeText(url).then(() => alert(t("designs.copied")));
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const res = await addDesignComment(id, commentText.trim());
    if (res.success && res.data) {
      setComments((prev) => [...prev, res.data]);
      setCommentText("");
    } else alert(res.error || "Failed to add comment");
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!requestData.description.trim()) {
      alert(t("designs.request_description_required"));
      return;
    }
    const res = await createDesignRequest(id, {
      description: requestData.description.trim(),
      imageUrl: requestData.imageUrl.trim() || undefined,
      videoUrl: requestData.videoUrl.trim() || undefined,
    });
    if (res.success) {
      setRequestOpen(false);
      setRequestData({ description: "", imageUrl: "", videoUrl: "" });
      alert(t("designs.request_sent"));
    } else alert(res.error || "Failed to submit request");
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!design) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">{t("designs.not_found")}</p>
        <button
          type="button"
          onClick={() => navigate("/designs")}
          className="mt-4 text-blue-600 hover:underline flex items-center gap-2 justify-center mx-auto"
        >
          <ArrowLeft size={18} /> {t("designs.back_to_gallery")}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-800"
      >
        <ArrowLeft size={18} /> {t("designs.back")}
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="aspect-video bg-slate-100">
          {design.videoUrl ? (
            <video src={design.videoUrl} className="w-full h-full object-contain" controls />
          ) : (
            <img src={design.imageUrl} alt={design.title} className="w-full h-full object-contain" />
          )}
        </div>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-slate-800">{design.title}</h1>
          <p className="text-slate-600 mt-2 whitespace-pre-wrap">{design.description}</p>
          <p className="text-xs text-slate-400 mt-2">{t("designs.designer_id")}: {design.designerId}</p>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <button
              type="button"
              onClick={handleFavorite}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${
                favorited ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-rose-50"
              }`}
            >
              <Heart size={18} fill={favorited ? "currentColor" : "none"} /> {t("designs.favorite")}
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
            >
              <Share2 size={18} /> {t("designs.share")}
            </button>
            <button
              type="button"
              onClick={() => setRequestOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <Send size={18} /> {t("designs.request_design")}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <MessageCircle size={20} /> {t("designs.comments")} ({comments.length})
        </h2>
        <form onSubmit={handleAddComment} className="mt-4 flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={t("designs.comment_placeholder")}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
            {t("designs.post_comment")}
          </button>
        </form>
        <ul className="mt-4 space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="py-2 border-b border-slate-100 last:border-0">
              <p className="text-sm text-slate-700">{c.text}</p>
              <p className="text-xs text-slate-400">userId: {c.userId}</p>
            </li>
          ))}
        </ul>
      </div>

      {requestOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">{t("designs.request_modal_title")}</h3>
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t("designs.request_description")} *</label>
                <textarea
                  value={requestData.description}
                  onChange={(e) => setRequestData((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t("designs.request_image_url")}</label>
                <input
                  type="url"
                  value={requestData.imageUrl}
                  onChange={(e) => setRequestData((p) => ({ ...p, imageUrl: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t("designs.request_video_url")}</label>
                <input
                  type="url"
                  value={requestData.videoUrl}
                  onChange={(e) => setRequestData((p) => ({ ...p, videoUrl: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
                  {t("designs.submit_request")}
                </button>
                <button
                  type="button"
                  onClick={() => setRequestOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50"
                >
                  {t("common.cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignDetail;
