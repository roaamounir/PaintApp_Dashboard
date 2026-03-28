import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Trash2,
  Eye,
  Search,
  Star,
  X,
  UserCheck,
  Loader2,
  MapPin,
  Briefcase,
  Image as ImageIcon,
  MessageSquare,
  Info,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

const Painters = () => {
  const { t, i18n } = useTranslation();
  console.log("اختبار الترجمة:", t("painters.title"));
  const {
    painters,
    loading,
    users,
    addPainter,
    deletePainter,
   fetchPainters,
  } = useAppContext();
  const navigate = useNavigate();

  // فحص حالة اللغة الحالية
  const isRtl = i18n.language === "ar";
  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedPainter, setSelectedPainter] = useState(null);
  // const [activeTab, setActiveTab] = useState("info");
  const [newPainter, setNewPainter] = useState({
    userId: "",
    city: "",
    yearsOfExperience: "",
    bio: "",
    service: "both",
  });
  const API_URL = "http://localhost:5000";

  const handleRegisterPainter = async () => {
    if (
      !newPainter.userId ||
      !newPainter.city ||
      !newPainter.yearsOfExperience
    ) {
      alert(t("painters.alerts.fill_required"));
      return;
    }

    const result = await addPainter({
      userId: parseInt(newPainter.userId),
      city: newPainter.city,
      experience: parseInt(newPainter.yearsOfExperience),
      bio: newPainter.bio,
      service: newPainter.service || "both",
    });

    if (result.success) {
      setIsAddOpen(false);
      setNewPainter({
        userId: "",
        city: "",
        yearsOfExperience: "",
        bio: "",
        service: "both",
      });
      alert(t("painters.alerts.register_success"));
    }
  };
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(t("painters.alerts.confirm_delete"));
    if (!confirmDelete) return;

    try {
      await deletePainter(id);
    } catch (err) {
      console.error("Failed to delete painter", err);
      alert(t("painters.alerts.delete_error"));
    }
  };

  // Filtering Logic
  const usersWithPainterRole = users.filter(
    (user) =>
      user.role === "painter" && !painters.some((p) => p.userId === user.id),
  );

  const pendingPaintersFromUsers = usersWithPainterRole.map((user) => ({
    id: `temp-${user.id}`,
    userId: user.id,
    user: user,
    experience: 0,
    isNewRequest: true,
  }));

  const allDisplayPainters = [...painters, ...pendingPaintersFromUsers];

  const filteredPainters = allDisplayPainters.filter((painter) => {
    const search = searchTerm.toLowerCase();
    const nameMatch = (painter.user?.name || "").toLowerCase().includes(search);
    const cityMatch = (painter.city || "").toLowerCase().includes(search);
    const expMatch = (painter.experience?.toString() || "").includes(search);
    return nameMatch || cityMatch || expMatch;
  });

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setIsAddOpen(false);
        setSelectedPainter(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);
  useEffect(() => {
    fetchPainters();
  }, [fetchPainters]);
  const toggleLanguage = () => {
    const newLang = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(newLang).then(() => {
      console.log("Language changed to: ", newLang);
    });
  };
  return (
    <div
      key={i18n.language} // إجباري عشان الصفحة تتغير فوراً
      className={`space-y-6 p-4 ${i18n.language === "ar" ? "text-right" : "text-left"}`}
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {t("painters.title")}
          </h1>
          <p className="text-slate-500 text-sm">{t("painters.subtitle")}</p>
        </div>
      </div>
      {/* Search Bar */}
      <div className="relative">
        <Search
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t("painters.search_placeholder")}
          className="w-full bg-white border border-slate-200 rounded-xl py-3 pr-12 pl-4 focus:ring-2 focus:ring-blue-500/20 outline-none transition shadow-sm"
        />
      </div>
      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-800">
            {t("painters.directory")}
          </h2>
          {loading && (
            <Loader2 className="animate-spin text-blue-500" size={20} />
          )}
        </div>

        <div className="overflow-x-auto">
          <table className={`w-full ${isRtl ? "text-right" : "text-left"}`}>
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">{t("painters.table.name")}</th>
                <th className="px-6 py-4 text-center">
                  {t("painters.table.exp")}
                </th>
                <th className="px-6 py-4 text-center">
                  {t("painters.table.rating")}
                </th>
                <th className="px-6 py-4 text-center">
                  {t("painters.table.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPainters.length > 0 ? (
                filteredPainters.map((painter) => (
                  <tr
                    key={painter.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td
                      className={`px-6 py-4 text-sm font-semibold text-slate-600 ${isRtl ? "text-right" : "text-left"}`}
                    >
                      {painter.user?.name || t("painters.fields.unknown")}
                      {painter.isNewRequest && (
                        <span className="ms-2 text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                          {t("painters.status.new")}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-slate-600">
                      {painter.experience || 0} {t("painters.fields.years")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-yellow-500 font-bold text-sm">
                        <Star size={14} fill="currentColor" />
                        {painter.rating
                          ? Number(painter.rating).toFixed(1)
                          : "0.0"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            if (painter.isNewRequest) {
                              setNewPainter({
                                ...newPainter,
                                userId: painter.userId,
                              });
                              setIsAddOpen(true);
                            } else {
                              navigate(`/painters/${painter.id}`);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 transition"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(painter.id)}
                          className="p-2 text-slate-400 hover:text-red-600 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-10 text-center text-slate-400 italic"
                  >
                    {t("painters.empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                {t("painters.modals.complete_data")}
              </h2>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder={t("painters.fields.city")}
                className="w-full border p-3 rounded-xl outline-none focus:border-blue-500 text-right"
                value={newPainter.city}
                onChange={(e) =>
                  setNewPainter({ ...newPainter, city: e.target.value })
                }
              />

              <input
                type="number"
                placeholder={t("painters.fields.exp_years")}
                className="w-full border p-3 rounded-xl outline-none focus:border-blue-500 text-right"
                value={newPainter.yearsOfExperience}
                onChange={(e) =>
                  setNewPainter({
                    ...newPainter,
                    yearsOfExperience: e.target.value,
                  })
                }
              />

              <textarea
                placeholder={t("painters.fields.bio_placeholder")}
                className="w-full border p-3 rounded-xl outline-none focus:border-blue-500 h-32 text-right"
                value={newPainter.bio}
                onChange={(e) =>
                  setNewPainter({ ...newPainter, bio: e.target.value })
                }
              ></textarea>

              <button
                onClick={handleRegisterPainter}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <UserCheck size={20} />
                )}
                {t("painters.actions.verify")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Painters;
