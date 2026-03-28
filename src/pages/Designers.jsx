import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, Eye, Loader2, Star, Trash2 } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const Designers = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { designers, loadingStates, deleteDesigner } = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");
  const loading = loadingStates?.designers;

  const filtered = designers.filter((d) => {
    const q = searchQuery.toLowerCase();
    const name = d.user?.name?.toLowerCase() || "";
    const email = d.user?.email?.toLowerCase() || "";
    const spec = (d.specialties || "").toLowerCase();
    return name.includes(q) || email.includes(q) || spec.includes(q);
  });

  const handleDeleteDesigner = async (userId) => {
    const res = await deleteDesigner(userId);
    if (!res?.success) {
      alert(res?.error || "Failed to delete designer");
    }
  };

  return (
    <div className="space-y-6 relative text-right" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800">
            {t("designers.title")}
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            {t("designers.subtitle")}
          </p>
        </div>
        {loading && (
          <Loader2 className="animate-spin text-blue-600" size={20} />
        )}
      </div>

      <div className="relative">
        <Search
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          type="text"
          placeholder={t("designers.search_placeholder")}
          className="w-full bg-white border border-slate-200 rounded-xl py-3 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-6 py-4">{t("designers.table.designer")}</th>
                <th className="px-6 py-4">{t("designers.table.profile")}</th>
                <th className="px-6 py-4 text-center">
                  {t("designers.table.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((d) => (
                <tr
                  key={d.userId}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 font-bold">
                        {(d.user?.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-slate-800 font-bold text-sm">
                          {d.user?.name}
                        </p>
                        <p className="text-slate-400 text-[11px] font-medium">
                          {d.user?.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-600 text-sm line-clamp-2">
                      {d.specialties || t("designers.fields.no_profile")}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-amber-600 text-xs font-bold">
                      <Star size={12} className="fill-amber-500" />
                      {d.rating != null ? Number(d.rating).toFixed(1) : "—"}
                      {d.experience != null && (
                        <span className="text-slate-400 font-medium mr-2">
                          {d.experience} {t("designers.fields.experience_years")}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/designers/${d.userId}`)}
                        className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition inline-flex"
                        title={t("designers.detail.edit")}
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDesigner(d.userId)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition inline-flex"
                        title={t("common.delete")}
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
        {!loading && filtered.length === 0 && (
          <p className="p-8 text-center text-slate-400 text-sm">
            {t("designers.empty_list")}
          </p>
        )}
      </div>
    </div>
  );
};

export default Designers;
