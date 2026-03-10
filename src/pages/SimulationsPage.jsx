import React, { useEffect, useState } from "react";
import axios from "axios";
import { HiOutlineTrash, HiOutlineX } from "react-icons/hi"; // أضفت أيقونة X للإغلاق
import { useTranslation } from "react-i18next";

const SimulationsPage = () => {
  const { t, i18n } = useTranslation();
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSim, setSelectedSim] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSims = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/simulations", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSimulations(res.data.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteSim = async (id) => {
    if (!window.confirm(t("admin.simulations.confirm_delete"))) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/simulations/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSimulations(simulations.filter((s) => s.id !== id));
    } catch (err) {
      alert(t("admin.simulations.delete_error"));
    }
  };

  useEffect(() => {
    fetchSims();
  }, []);

  if (loading)
    return <div className="p-6 text-center text-slate-500">{t("common.loading")}</div>;

  return (
    <div className={`p-6 bg-slate-50 min-h-screen ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        {t("admin.simulations.title")}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {simulations.map((sim) => (
          <div
            key={sim.id}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative group transition-all hover:shadow-md"
          >
            {/* Delete Button */}
            <button
              onClick={() => deleteSim(sim.id)}
              className={`absolute top-2 ${i18n.language === 'ar' ? 'right-2' : 'left-2'} z-10 p-2 bg-red-50 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100`}
            >
              <HiOutlineTrash size={18} />
            </button>

            <div className="relative h-48 bg-slate-200">
              <img
                src={sim.resultImage}
                alt="Result"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-slate-500">
                  {t("admin.simulations.user")}: {sim.user?.name || t("admin.simulations.unknown_user")}
                </span>
                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase">
                  {t("admin.simulations.color_id")}: {sim.appliedSelections?.colorId || "N/A"}
                </span>
              </div>

              <div className="text-sm text-slate-600 mb-4 space-y-1">
                <p className="flex items-center gap-2">
                  {t("admin.simulations.coordinates")}:
                  <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">
                    X:{sim.appliedSelections?.coordinates?.x} Y:{sim.appliedSelections?.coordinates?.y}
                  </span>
                </p>
                <p className="text-[10px] text-slate-400">
                  {new Date(sim.createdAt).toLocaleString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedSim(sim);
                  setIsModalOpen(true);
                }}
                className="w-full py-2 bg-slate-100 hover:bg-blue-600 hover:text-white text-blue-600 rounded-xl text-sm font-medium transition-all"
              >
                {t("admin.simulations.view_comparison")}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && selectedSim && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className={`absolute top-4 ${i18n.language === 'ar' ? 'left-4' : 'right-4'} text-slate-400 hover:text-slate-600`}
            >
              <HiOutlineX size={24} />
            </button>

            <h2 className="text-xl font-bold mb-6 text-center">{t("admin.simulations.comparison_title")}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                  {t("admin.simulations.original_img")}
                </p>
                <img
                  src={selectedSim.originalImage}
                  className="rounded-2xl w-full aspect-video object-cover border border-slate-100"
                  alt="Before"
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-blue-500 uppercase tracking-wider text-center">
                  {t("admin.simulations.result_img")}
                </p>
                <img
                  src={selectedSim.resultImage}
                  className="rounded-2xl w-full aspect-video object-cover border-2 border-blue-500 shadow-lg"
                  alt="After"
                />
              </div>
            </div>

            <div className="mt-8 bg-slate-50 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-start">
                <p className="text-sm text-slate-700 font-medium">
                  {t("admin.simulations.log_detail", { id: selectedSim.appliedSelections?.colorId })}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {t("admin.simulations.logged_on")}: {new Date(selectedSim.createdAt).toLocaleString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}
                </p>
              </div>
              <button className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-blue-200">
                {t("admin.simulations.download_logs")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationsPage;