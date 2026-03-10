import React, { useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { FiFileText, FiCheckCircle, FiClock, FiUser } from "react-icons/fi";
import { useTranslation } from "react-i18next";

const InvoicesPage = () => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "ar" ? "ar-EG" : "en-GB";
  const isRtl = i18n.language === "ar";

  const { invoices, loading, fetchInvoices } = useAppContext();

  // Fetch invoices when page loads
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  if (loading && invoices.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {t("invoices.title")}
          </h1>
          <p className="text-slate-500 text-sm">{t("invoices.subtitle")}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-slate-600 font-semibold">
                {t("invoices.table.invoice")}
              </th>
              <th className="p-4 text-slate-600 font-semibold">
                {t("invoices.table.customer")}
              </th>
              <th className="p-4 text-slate-600 font-semibold">
                {t("invoices.table.amount")}
              </th>
              <th className="p-4 text-slate-600 font-semibold">
                {t("invoices.table.source")}
              </th>
              <th className="p-4 text-slate-600 font-semibold">
                {t("invoices.table.status")}
              </th>
              <th className="p-4 text-slate-600 font-semibold">
                {t("invoices.table.date")}
              </th>
            </tr>
          </thead>
          <tbody>
            {invoices.length > 0 ? (
              invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b border-slate-50 hover:bg-slate-50 transition-all"
                >
                  <td className="p-4 font-mono font-bold text-blue-600">
                    #{invoice.invoiceNumber}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <FiUser className="text-slate-400" />
                      <span className="text-slate-700 font-medium">
                        {invoice.customer?.name ||
                          t("invoices.unknown_customer")}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-slate-800">
                    {invoice.amount?.toLocaleString(locale)}{" "}
                    {t("invoices.currency")}
                  </td>
                  <td className="p-4 font-bold text-slate-800">
                    {invoice.order?.source || t("invoices.unknown_source")}
                  </td>
                  <td className="p-4">
                    <span
                      className={`flex items-center gap-1 w-fit px-3 py-1 rounded-full text-xs font-bold ${
                        invoice.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {invoice.status === "paid" ? (
                        <FiCheckCircle />
                      ) : (
                        <FiClock />
                      )}
                      {invoice.status === "paid"
                        ? t("invoices.status.paid")
                        : t("invoices.status.pending")}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 text-sm">
                    {new Date(invoice.createdAt).toLocaleDateString(locale)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-10 text-center text-slate-400">
                  {t("invoices.no_invoices")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoicesPage;
