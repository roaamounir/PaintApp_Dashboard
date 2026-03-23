import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../context/AppContext";
import {
  Calendar,
  Clock,
  MapPin,
  Ruler,
  Plus,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Send,
} from "lucide-react";

const getCurrentUserRole = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.role ?? null;
  } catch {
    return null;
  }
};

const VisitRequests = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const painterIdFromUrl = searchParams.get("painterId");

  const {
    painters,
    visitRequests,
    fetchVisitRequests,
    createVisitRequest,
    updateVisitRequestStatus,
    loadingStates,
  } = useAppContext();

  const userRole = getCurrentUserRole();
  const isPainter = userRole === "painter";
  const isAdmin = userRole === "admin";

  const [showForm, setShowForm] = useState(!!painterIdFromUrl);
  const [form, setForm] = useState({
    painterId: painterIdFromUrl || "",
    scheduledDate: "",
    scheduledTime: "",
    area: "",
    address: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(null);

  useEffect(() => {
    if (painterIdFromUrl) setForm((f) => ({ ...f, painterId: painterIdFromUrl }));
  }, [painterIdFromUrl]);

  useEffect(() => {
    if (isPainter || isAdmin) {
      fetchVisitRequests({ forPainter: "1" }).catch(() => {});
    } else {
      fetchVisitRequests({ mine: "1" }).catch(() => {});
    }
  }, [isPainter, isAdmin, fetchVisitRequests]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.painterId || !form.scheduledDate || !form.scheduledTime || !form.address.trim()) {
      alert(t("visitRequests.fill_required"));
      return;
    }
    setSubmitting(true);
    const result = await createVisitRequest({
      painterId: Number(form.painterId),
      scheduledDate: form.scheduledDate,
      scheduledTime: form.scheduledTime,
      area: form.area ? parseFloat(form.area) : null,
      address: form.address.trim(),
      notes: form.notes.trim() || undefined,
    });
    setSubmitting(false);
    if (result.success) {
      setForm({ painterId: "", scheduledDate: "", scheduledTime: "", area: "", address: "", notes: "" });
      setShowForm(false);
      fetchVisitRequests({ mine: "1" });
      alert(t("visitRequests.request_sent"));
    } else {
      alert(result.error || t("visitRequests.error"));
    }
  };

  const handleStatus = async (id, status) => {
    setStatusUpdating(id);
    const result = await updateVisitRequestStatus(id, status);
    setStatusUpdating(null);
    if (result.success) {
      if (isPainter || isAdmin) fetchVisitRequests({ forPainter: "1" });
    } else {
      alert(result.error || t("visitRequests.error"));
    }
  };

  const loading = loadingStates.visits;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-2"
          >
            <ArrowLeft size={18} />
            {t("visitRequests.back")}
          </button>
          <h1 className="text-2xl font-bold text-slate-800">
            {isPainter ? t("visitRequests.title_for_painter") : t("visitRequests.title")}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isPainter ? t("visitRequests.subtitle_for_painter") : t("visitRequests.subtitle")}
          </p>
        </div>
        {!isPainter && (
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            {t("visitRequests.new_request")}
          </button>
        )}
      </div>

      {!isPainter && showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-8"
        >
          <h2 className="text-lg font-semibold text-slate-800 mb-4">{t("visitRequests.form_title")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("visitRequests.painter")} *</label>
              <select
                value={form.painterId}
                onChange={(e) => setForm((f) => ({ ...f, painterId: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                required
              >
                <option value="">{t("visitRequests.choose_painter")}</option>
                {painters.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.user?.name || p.name || `فني #${p.id}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("visitRequests.date")} *</label>
              <input
                type="date"
                value={form.scheduledDate}
                onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("visitRequests.time")} *</label>
              <input
                type="time"
                value={form.scheduledTime}
                onChange={(e) => setForm((f) => ({ ...f, scheduledTime: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("visitRequests.area")} (م²)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="مثال: 120"
                value={form.area}
                onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("visitRequests.address")} *</label>
              <input
                type="text"
                placeholder={t("visitRequests.address_placeholder")}
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("visitRequests.notes")}</label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                placeholder={t("visitRequests.notes_placeholder")}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Send size={16} />
              {submitting ? "..." : t("visitRequests.submit")}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
            >
              {t("visitRequests.cancel")}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {loading ? (
          <p className="text-slate-500 py-8 text-center">{t("visitRequests.loading")}</p>
        ) : visitRequests.length === 0 ? (
          <p className="text-slate-500 py-8 text-center bg-white rounded-xl border border-slate-200">
            {t("visitRequests.no_requests")}
          </p>
        ) : (
          visitRequests.map((vr) => (
            <div
              key={vr.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar size={18} className="text-slate-400" />
                  <span>{vr.scheduledDate}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock size={18} className="text-slate-400" />
                  <span>{vr.scheduledTime}</span>
                </div>
                {vr.area != null && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Ruler size={18} className="text-slate-400" />
                    <span>{vr.area} م²</span>
                  </div>
                )}
                <div className="flex items-start gap-2 text-slate-700 sm:col-span-2">
                  <MapPin size={18} className="text-slate-400 mt-0.5 shrink-0" />
                  <span>{vr.address}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    vr.status === "accepted"
                      ? "bg-green-100 text-green-800"
                      : vr.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : vr.status === "completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {t(`visitRequests.status_${vr.status}`)}
                </span>
                {(isPainter || isAdmin) && vr.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleStatus(vr.id, "accepted")}
                      disabled={statusUpdating === vr.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                    >
                      <CheckCircle size={16} />
                      {t("visitRequests.accept")}
                    </button>
                    <button
                      onClick={() => handleStatus(vr.id, "rejected")}
                      disabled={statusUpdating === vr.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
                    >
                      <XCircle size={16} />
                      {t("visitRequests.reject")}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VisitRequests;
