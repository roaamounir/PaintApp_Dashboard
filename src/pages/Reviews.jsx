import React, { useEffect } from "react";
import { useTranslation } from "react-i18next"; 
import {
  Trash2,
  User,
  Star,
  MessageSquare,
  Paintbrush,
  Loader2,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

const Reviews = () => {
  const { t } = useTranslation(); 
  const { reviews, fetchReviews, deleteReview, loading } = useAppContext();

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  if (loading && reviews.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            {t("reviews.title")}
          </h1>
          <p className="text-slate-500 text-sm">{t("reviews.subtitle")}</p>
        </div>
        <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold uppercase">
          {t("reviews.total")}: {reviews.length}
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-6 py-5">{t("reviews.table.user")}</th>
                <th className="px-6 py-5">{t("reviews.table.painter")}</th>
                <th className="px-6 py-5 text-center">
                  {t("reviews.table.rating")}
                </th>
                <th className="px-6 py-5">{t("reviews.table.comment")}</th>
                <th className="px-6 py-5 text-center">
                  {t("reviews.table.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reviews.map((rev) => (
                <tr
                  key={rev.id}
                  className="hover:bg-slate-50/30 transition-colors group"
                >
                  {/* User Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center text-slate-500 shadow-sm">
                        <User size={14} />
                      </div>
                      <span className="font-bold text-slate-700 text-sm">
                        {rev.user?.name || t("reviews.fields.unknown_user")}
                      </span>
                    </div>
                  </td>

                  {/* Target Painter */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Paintbrush size={14} className="text-blue-500" />
                      <span className="text-sm text-slate-600 font-semibold uppercase">
                        {rev.painter?.user?.name || t("reviews.fields.na")}
                      </span>
                    </div>
                  </td>

                  {/* Rating Stars */}
                  <td className="px-6 py-4">
                    <div
                      className="flex justify-center items-center gap-0.5 text-yellow-400"
                      dir="ltr"
                    >
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < rev.rating ? "currentColor" : "none"}
                          className={i >= rev.rating ? "text-slate-200" : ""}
                        />
                      ))}
                    </div>
                  </td>

                  <td className="px-6 py-4 max-w-xs">
                    <div className="flex items-start gap-2">
                      <MessageSquare
                        size={14}
                        className="text-slate-300 mt-1 shrink-0"
                      />
                      <p className="text-sm text-slate-500 leading-relaxed italic line-clamp-2">
                        {rev.review}
                      </p>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <button
                        onClick={() => {
                          if (
                            window.confirm(t("reviews.alerts.confirm_delete"))
                          ) {
                            deleteReview(rev.id);
                          }
                        }}
                        className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-90"
                        title={t("reviews.actions.delete")}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {reviews.length === 0 && !loading && (
          <div className="py-20 text-center">
            <div className="inline-flex p-4 bg-slate-50 rounded-full text-slate-300 mb-4">
              <Star size={32} />
            </div>
            <p className="text-slate-400 font-medium">{t("reviews.empty")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
