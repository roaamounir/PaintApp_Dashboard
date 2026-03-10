import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import {
  Search,
  RefreshCw,
  Filter,
  ShieldAlert,
  User,
  Clock,
  FileText,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const AuditLogs = () => {
  const { t, i18n } = useTranslation();
  const { auditLogs, loading, fetchAuditLogs } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("ALL");

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const filteredLogs = auditLogs
    .filter((log) => {
      const matchesSearch =
        log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAction =
        filterAction === "ALL" || log.action === filterAction;
      return matchesSearch && matchesAction;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const getActionStyle = (action) => {
    if (action.includes("DELETE"))
      return "bg-red-100 text-red-700 border-red-200";
    if (action.includes("CREATE") || action.includes("ADD"))
      return "bg-green-100 text-green-700 border-green-200";
    if (action.includes("UPDATE") || action.includes("EDIT"))
      return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex flex-col items-start">
            <h2 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
              <ShieldAlert className="text-blue-600" size={32} />
              {t("audit.title")}
            </h2>
            <p className="text-gray-500 mt-1 text-sm">{t("audit.subtitle")}</p>
          </div>

          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-200">
            <span className="text-xs font-bold text-gray-400 px-2">
              {t("audit.total_logs")}: {filteredLogs.length}
            </span>
            <button
              onClick={fetchAuditLogs}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-xl transition text-blue-600"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative col-span-2">
            <Search
              className={`absolute ${i18n.language === "ar" ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 text-gray-400`}
              size={18}
            />
            <input
              type="text"
              placeholder={t("audit.search_placeholder")}
              className={`w-full bg-white border border-gray-200 rounded-2xl py-3 ${i18n.language === "ar" ? "pr-12 pl-4" : "pl-12 pr-4"} focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm`}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <Filter
              className={`absolute ${i18n.language === "ar" ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 text-gray-400`}
              size={18}
            />
            <select
              className={`w-full bg-white border border-gray-200 rounded-2xl py-3 ${i18n.language === "ar" ? "pr-12 pl-4" : "pl-12 pr-4"} appearance-none outline-none focus:ring-4 focus:ring-blue-500/10 shadow-sm font-bold text-gray-600`}
              onChange={(e) => setFilterAction(e.target.value)}
            >
              <option value="ALL">{t("audit.filter_all")}</option>
              <option value="CREATE_USER">
                {t("audit.actions.CREATE_USER")}
              </option>
              <option value="UPDATE_PRICE">
                {t("audit.actions.UPDATE_PRICE")}
              </option>
              <option value="DELETE_PRODUCT">
                {t("audit.actions.DELETE_PRODUCT")}
              </option>
              <option value="LOGIN">{t("audit.actions.LOGIN")}</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-wider border-b">
                  <th className="p-5 text-start">{t("audit.table.date")}</th>
                  <th className="p-5 text-start">{t("audit.table.user")}</th>
                  <th className="p-5 text-start">{t("audit.table.action")}</th>
                  <th className="p-5 text-start">{t("audit.table.details")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50 transition-all group"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-2 text-gray-500 font-medium">
                        <Clock size={14} className="text-blue-400" />
                        <span className="text-xs">
                          {new Date(log.createdAt).toLocaleString(
                            i18n.language === "ar" ? "ar-EG" : "en-US",
                            {
                              dateStyle: "medium",
                              timeStyle: "short",
                            },
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                          <User size={16} />
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="font-bold text-gray-700 text-sm">
                            {log.user?.name || t("audit.table.system_auto")}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold">
                            ID: #{log.userId || "System"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span
                        className={`px-3 py-1 rounded-lg text-[10px] font-black border ${getActionStyle(log.action)}`}
                      >
                        {t(`audit.actions.${log.action}`, {
                          defaultValue: log.action,
                        })}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-xl border border-dashed border-gray-200 group-hover:bg-white transition-all text-start">
                        <FileText
                          size={14}
                          className="text-gray-400 mt-1 flex-shrink-0"
                        />
                        <p className="text-gray-600 leading-relaxed text-xs font-medium">
                          {log.details}
                        </p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && !loading && (
            <div className="py-20 text-center">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-gray-300" />
              </div>
              <h3 className="text-gray-800 font-bold">
                {t("audit.empty.title")}
              </h3>
              <p className="text-gray-400 text-sm">
                {t("audit.empty.description")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
