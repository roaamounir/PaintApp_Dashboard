import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import {
  Trash2,
  CheckCircle,
  XCircle,
  Building2,
  Mail,
  Search,
  Clock,
  CreditCard,
  MapPin,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const Requests = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const {
    pendingVendors,
    fetchPendingVendors,
    updateVendorStatus,
    deleteVendor,
    loading,
  } = useAppContext();

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPendingVendors();
  }, [fetchPendingVendors]);

  const filteredRequests = (pendingVendors || []).filter(
    (req) =>
      req.shopName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleApprove = async (id) => {
    if (window.confirm(t("requests.confirm_approve"))) {
      await updateVendorStatus(id, { isApproved: true });
    }
  };

  const handleVerifyPayment = async (id) => {
    if (window.confirm(t("requests.confirm_payment"))) {
      await updateVendorStatus(id, { paymentStatus: true });
    }
  };

  return (
    <div className="space-y-6 p-4" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {t("requests.title")}
          </h1>
          <p className="text-slate-500 text-sm">{t("requests.subtitle")}</p>
        </div>
        <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-bold text-sm">
          {pendingVendors?.length || 0} {t("requests.pending")}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          type="text"
          placeholder={t("requests.search_placeholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm"
        />
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">{t("requests.table.company")}</th>
                <th className="px-6 py-4">{t("requests.table.contact")}</th>
                <th className="px-6 py-4 text-center">
                  {t("requests.table.payment")}
                </th>
                <th className="px-6 py-4 text-center">
                  {t("requests.table.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="py-10 text-center text-slate-400 animate-pulse"
                  >
                    {t("requests.loading")}
                  </td>
                </tr>
              ) : filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <tr
                    key={req.id || req.userId}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <p className="text-slate-800 font-bold text-sm leading-tight">
                            {req.shopName}
                          </p>
                          <p className="text-slate-400 text-xs flex items-center gap-1 mt-1">
                            <Mail size={12} /> {req.user?.email}
                          </p>
                          <div className="mt-1 text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded w-fit">
                            TAX: {req.taxRegistration}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-slate-300" />
                          {req.city} - {req.region}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Clock size={14} />
                          {t("requests.joined_user")}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      {req.paymentStatus ? (
                        <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center justify-center gap-1 w-fit mx-auto">
                          <CheckCircle size={12} /> {t("requests.status.paid")}
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center justify-center gap-1 w-fit mx-auto">
                          <CreditCard size={12} />{" "}
                          {t("requests.status.pending")}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        {!req.paymentStatus ? (
                          <button
                            onClick={() => handleVerifyPayment(req.id)}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                          >
                            {t("requests.verify_payment")}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApprove(req.id || req.userId)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                          >
                            <CheckCircle size={14} /> {t("requests.approve")}
                          </button>
                        )}

                        <button
                          onClick={() => deleteVendor(req.userId || req.id)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          title={t("requests.reject_delete")}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-10 text-center text-slate-400">
                    {t("requests.no_requests")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Requests;
