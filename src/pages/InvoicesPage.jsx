import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { FiFileText, FiCheckCircle, FiClock, FiUser } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { getJwtRole } from "../utils/jwtUser.js";

const InvoicesPage = () => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "ar" ? "ar-EG" : "en-GB";
  const isRtl = i18n.language === "ar";
  const isVendor = getJwtRole() === "vendor";

  const { invoices, loadingStates, fetchInvoices } = useAppContext();

  // Fetch invoices when page loads
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  if (loadingStates?.invoices && invoices.length === 0) {
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
            {isVendor ? t("invoices.vendor_title") : t("invoices.title")}
          </h1>
          <p className="text-slate-500 text-sm">
            {isVendor ? t("invoices.vendor_subtitle") : t("invoices.subtitle")}
          </p>
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
                {t("invoices.table.subtotal", { defaultValue: "Subtotal" })}
              </th>
              <th className="p-4 text-slate-600 font-semibold">
                {t("invoices.table.discount", { defaultValue: "Discount" })}
              </th>
              <th className="p-4 text-slate-600 font-semibold">
                {t("invoices.table.coupon", { defaultValue: "Coupon" })}
              </th>
              <th className="p-4 text-slate-600 font-semibold">
                {t("invoices.table.amount")}
              </th>
              <th className="p-4 text-slate-600 font-semibold">
                {t("invoices.table.final_total", { defaultValue: "Final Total" })}
              </th>
              <th className="p-4 text-slate-600 font-semibold">
                {t("invoices.table.status")}
              </th>
              <th className="p-4 text-slate-600 font-semibold">
                {t("invoices.table.source")}
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
                    <Link
                      to={`/orders/${invoice.id}`}
                      className="hover:underline"
                      title={t("order.view_details", { defaultValue: "عرض التفاصيل" })}
                    >
                      #{invoice.invoiceNumber}
                    </Link>
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
                    {(Number(invoice.subtotalPrice ?? invoice.amount) || 0).toLocaleString(locale)}{" "}
                    {t("invoices.currency")}
                  </td>
                  <td className="p-4 font-bold text-emerald-700">
                    -{(Number(invoice.discountValue || 0) || 0).toLocaleString(locale)} {t("invoices.currency")}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-mono">
                      {invoice.couponCode || "-"}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-slate-800">
                    {invoice.amount?.toLocaleString(locale)}{" "}
                    {t("invoices.currency")}
                  </td>
                  <td className="p-4 font-bold text-blue-700">
                    {invoice.amount?.toLocaleString(locale)} {t("invoices.currency")}
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
                  <td className="p-4 font-bold text-slate-800">
                    {invoice.order?.source || t("invoices.unknown_source")}
                  </td>
                  <td className="p-4 text-slate-500 text-sm">
                    {new Date(invoice.createdAt).toLocaleDateString(locale)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="p-10 text-center text-slate-400">
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
