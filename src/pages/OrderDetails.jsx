import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { useTranslation } from "react-i18next"; 
import {
  ArrowLeft,
  User,
  MapPin,
  Phone,
  Receipt,
  CreditCard,
} from "lucide-react";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getOrderDetails } = useAppContext();
  const [order, setOrder] = useState(null);

  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  useEffect(() => {
    const fetchOrder = async () => {
      const data = await getOrderDetails(id);
      setOrder(data);
    };
    fetchOrder();
  }, [id, getOrderDetails]);

  if (!order)
    return (
      <div
        className="p-10 text-center font-bold text-slate-500"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {t("order.loading")}
      </div>
    );

  const totalPrice = Number(order.totalPrice || 0);
  const subtotalPrice = Number(order.subtotalPrice ?? order.totalPrice ?? 0);
  const discountValue = Number(order.discountValue || 0);
  const couponCode = order.couponCode || null;
  const legacyStatusMap = {
    accepted: "confirmed",
    completed: "delivered",
    canceled: "cancelled",
  };
  const normalizedStatus =
    legacyStatusMap[String(order.status || "").toLowerCase()] ||
    String(order.status || "").toLowerCase();

  const vendorLocation =
    order.items?.[0]?.paint?.vendor?.city || t("common.not_specified");
  const shipping = order.shipping || {};

  return (
    <div
      className="p-8 bg-slate-50 min-h-screen font-sans"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* ================= Header ================= */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm text-slate-600 font-semibold hover:bg-slate-100 transition"
        >
          <ArrowLeft size={18} className={isRTL ? "rotate-180" : ""} />
          {t("order.back_to_list")}
        </button>

        <div className={isRTL ? "text-left" : "text-right"}>
          <h1 className="text-2xl font-bold text-slate-800">
            {t("order.title")} #{order.orderNumber || order.id}
          </h1>
          <p className="text-slate-400 text-sm">
            {new Date(order.createdAt).toLocaleString(
              isRTL ? "ar-EG" : "en-US",
            )}
          </p>
          <span className="inline-block mt-2 text-xs font-bold uppercase px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            {t(`orders.status.${normalizedStatus}`, { defaultValue: normalizedStatus || "-" })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ================= Customer Info ================= */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-4">
            <User className="text-blue-500" size={20} />
            {t("order.customer_info")}
          </h3>

          <div className="space-y-4">
            <InfoItem
              icon={<User size={18} />}
              label={t("order.full_name")}
              value={order.user?.name || t("order.guest_user")}
              color="blue"
            />

            <InfoItem
              icon={<Phone size={18} />}
              label={t("order.phone_number")}
              value={shipping.phone || order.user?.phone || t("common.not_available")}
              color="emerald"
            />

            <InfoItem
              icon={<MapPin size={18} />}
              label={t("order.location_label")}
              value={shipping.city || vendorLocation}
              color="amber"
            />
            <InfoItem
              icon={<MapPin size={18} />}
              label={t("order.address", { defaultValue: "Address" })}
              value={shipping.addressLine1 || t("common.not_available")}
              color="blue"
            />
            <InfoItem
              icon={<MapPin size={18} />}
              label={t("order.address_2", { defaultValue: "Address 2" })}
              value={shipping.addressLine2 || t("common.not_available")}
              color="blue"
            />
            <InfoItem
              icon={<Receipt size={18} />}
              label={t("order.postal_code", { defaultValue: "Postal Code" })}
              value={shipping.postalCode || t("common.not_available")}
              color="amber"
            />
          </div>
        </div>

        {/* ================= Products ================= */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-4">
            <Receipt className="text-blue-500" size={20} />
            {t("order.products_title")}
          </h3>

          <div className="overflow-x-auto">
            <table className={`w-full ${isRTL ? "text-right" : "text-left"}`}>
              <thead>
                <tr className="text-xs text-slate-400 uppercase font-semibold">
                  <th className="pb-4">{t("order.col_product")}</th>
                  <th className="pb-4">{t("order.col_vendor")}</th>
                  <th className="pb-4">{t("order.col_qty")}</th>
                  <th className="pb-4">{t("order.col_price")}</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {order.items?.map((item, idx) => {
                  const unitCharged =
                    item.unitPrice != null && item.unitPrice !== ""
                      ? Number(item.unitPrice)
                      : Number(item.paint?.price ?? 0);
                  return (
                    <tr key={idx} className="text-sm">
                      <td className="py-4 font-semibold text-slate-700">
                        {item.paint?.name}
                      </td>

                      <td className="py-4 text-slate-500">
                        <span className="bg-slate-100 px-2 py-1 rounded text-xs">
                          {item.paint?.vendor?.shopName || t("order.main_store")}
                        </span>
                      </td>

                      <td className="py-4 font-bold">x{item.quantity}</td>

                      <td className="py-4 text-blue-600 font-bold">
                        {unitCharged.toLocaleString()}{" "}
                        {t("common.currency")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= Invoice total ================= */}
        <div className="lg:col-span-3 bg-slate-900 text-white p-8 rounded-3xl shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <SummaryBox
              icon={<Receipt size={14} />}
              label={t("order.summary_subtotal", { defaultValue: "Subtotal" })}
              value={`${subtotalPrice.toLocaleString()} ${t("common.currency")}`}
            />
            <SummaryBox
              icon={<Receipt size={14} />}
              label={t("order.summary_discount", { defaultValue: "Discount" })}
              value={`-${discountValue.toLocaleString()} ${t("common.currency")}`}
              color="emerald"
            />
            <SummaryBox
              icon={<Receipt size={14} />}
              label={t("order.summary_coupon", { defaultValue: "Coupon" })}
              value={couponCode || t("common.not_available")}
            />
          </div>
          <SummaryBox
            icon={<CreditCard size={14} />}
            label={t("order.summary_total")}
            value={`${totalPrice.toLocaleString()} ${t("common.currency")}`}
            highlight
          />
        </div>
      </div>
    </div>
  );
};

/* ================= Small Components ================= */

const InfoItem = ({ icon, label, value, color }) => (
  <div className="flex items-center gap-3">
    <div className={`bg-${color}-50 p-2 rounded-lg text-${color}-600`}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-semibold text-slate-700">{value}</p>
    </div>
  </div>
);

const SummaryBox = ({ icon, label, value, color, highlight }) => (
  <div
    className={`p-4 rounded-2xl ${
      highlight ? "bg-emerald-500/10 border border-emerald-500/20" : ""
    }`}
  >
    <p
      className={`text-xs flex items-center gap-1 mb-2 uppercase font-bold ${
        color ? `text-${color}-400` : "text-slate-400"
      }`}
    >
      {icon} {label}
    </p>

    <p
      className={`text-2xl font-black ${
        color ? `text-${color}-400` : "text-white"
      }`}
    >
      {value}
    </p>
  </div>
);

export default OrderDetails;
