import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Star,
  Info,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  Trash2,
} from "lucide-react";

const PainterDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const {
    painters,
    orders,
    updatePainter,
    verifyPainter,
    loading,
    updatePainterFinancials,
    painterGallery,
    fetchPainterGallery,
  } = useAppContext();

  const [activeTab, setActiveTab] = useState("info");
  const [financialData, setFinancialData] = useState({
    wallet: 0,
    commissionRate: 10,
    debt: 0,
  });

  const painter = painters.find((p) => p.id === parseInt(id));
  const API_URL = "http://localhost:5000";

  useEffect(() => {
    if (painter) {
      setFinancialData({
        wallet: painter.user?.balance || 0,
        commissionRate: painter.commissionRate || 10,
        debt: painter.debt || 0,
      });
      fetchPainterGallery(painter.id);
    }
  }, [painter, fetchPainterGallery]);

  if (!painter)
    return (
      <div className="p-20 flex flex-col items-center gap-4 text-center">
        <div className="text-gray-400">{t("painterDetails.not_found")}</div>
        <button
          onClick={() => navigate("/painters")}
          className="flex items-center gap-2 text-blue-600 font-bold hover:underline"
        >
          <ArrowLeft size={16} className={isRTL ? "rotate-180" : ""} />
          {t("common.back_to_list")}
        </button>
      </div>
    );

  const handleStatusUpdate = async (newStatus) => {
    const statusText =
      newStatus === "accepted" ? t("status.accepted") : t("status.rejected");
    if (
      window.confirm(
        t("messages.confirm_status_change", { status: statusText }),
      )
    ) {
      const res = await updatePainter(painter.id, { status: newStatus });
      if (res.success) navigate("/painters");
    }
  };

  const handleVerifyIdentity = async () => {
    if (window.confirm(t("messages.confirm_verify"))) {
      const res = await verifyPainter(painter.id, true);
      if (res.success) alert(t("messages.verify_success"));
      else alert(t("messages.verify_error"));
    }
  };

  const handleFinancialUpdate = async () => {
    const res = await updatePainterFinancials(painter.id, financialData);
    if (res.success) alert(t("messages.update_success"));
  };

  return (
    <div
      className="space-y-6 p-6 max-w-6xl mx-auto animate-in fade-in duration-500"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold transition-colors"
        >
          <ArrowLeft size={20} className={isRTL ? "rotate-180" : ""} />
          {t("common.back")}
        </button>
        <div className="flex gap-3">
          <button
            disabled={loading || painter.status === "accepted"}
            onClick={() => handleStatusUpdate("accepted")}
            className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 text-sm disabled:opacity-50 hover:bg-green-700 transition shadow-lg"
          >
            <CheckCircle size={16} /> {t("actions.accept_account")}
          </button>
          <button
            disabled={loading || painter.status === "rejected"}
            onClick={() => handleStatusUpdate("rejected")}
            className="bg-red-50 text-red-600 px-6 py-2 rounded-xl font-bold flex items-center gap-2 text-sm border border-red-100 hover:bg-red-100 transition"
          >
            <XCircle size={16} /> {t("actions.reject_account")}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title={t("stats.profile_visits")}
          value={painter._count?.visits || 0}
          color="text-gray-800"
        />
        <StatCard
          title={t("stats.total_reviews")}
          value={painter._count?.reviews || 0}
          color="text-blue-600"
        />
        <StatCard
          title={t("stats.wallet_balance")}
          value={`${painter.user?.balance || 0} ${t("common.currency")}`}
          color="text-green-600"
        />
        <StatCard
          title={t("stats.debt")}
          value={`${painter.debt || 0} ${t("common.currency")}`}
          color="text-red-500"
        />
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-900 p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-3xl font-bold border-4 border-gray-800 shadow-xl">
              {painter.user?.name?.charAt(0)}
            </div>
            <div
              className={
                isRTL ? "text-center md:text-right" : "text-center md:text-left"
              }
            >
              <h1 className="text-2xl font-bold">{painter.user?.name}</h1>
              <p className="text-gray-400 text-sm flex items-center justify-center md:justify-start gap-2 mt-1">
                <MapPin size={14} /> {painter.city} • {painter.experience}{" "}
                {t("common.years_exp")}
              </p>
            </div>
          </div>
          <div className="bg-blue-600/20 px-6 py-4 rounded-2xl text-center border border-blue-500/30">
            <div className="text-yellow-400 flex justify-center gap-1 mb-1 font-mono">
              <Star fill="currentColor" size={20} />
              <span className="text-2xl font-black text-white">
                {painter.rating || "0.0"}
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold text-blue-200">
              {t("stats.overall_rating")}
            </span>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex overflow-x-auto border-b bg-gray-50/50 px-4 scrollbar-hide">
          {[
            { id: "info", label: t("tabs.verification_info") },
            { id: "financial", label: t("tabs.wallet_financials") },
            { id: "gallery", label: t("tabs.portfolio") },
            {
              id: "disputes",
              label: `${t("tabs.disputes")} (${painter.disputes?.length || 0})`,
            },
            { id: "reviews", label: t("tabs.reviews") },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-6 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Rendering */}
        <div className="p-8">
          {activeTab === "info" && (
            <InfoTab
              painter={painter}
              API_URL={API_URL}
              loading={loading}
              handleVerifyIdentity={handleVerifyIdentity}
              handleStatusUpdate={handleStatusUpdate}
              t={t}
              isRTL={isRTL}
            />
          )}
          {activeTab === "financial" && (
            <FinancialTab
              financialData={financialData}
              setFinancialData={setFinancialData}
              handleFinancialUpdate={handleFinancialUpdate}
              orders={orders}
              painterUserId={painter.userId}
              t={t}
              isRTL={isRTL}
            />
          )}
          {activeTab === "disputes" && (
            <DisputesTab disputes={painter.disputes} t={t} isRTL={isRTL} />
          )}
          {activeTab === "gallery" && (
            <GalleryTab gallery={painterGallery} t={t} />
          )}
          {activeTab === "reviews" && (
            <div className="text-center py-10 text-gray-400">
              {t("tabs.reviews_placeholder") || "Reviews coming soon..."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Sub-Components ---

const StatCard = ({ title, value, color }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  return (
    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
      <span
        className={`text-gray-400 text-[10px] font-black uppercase ${isRTL ? "mb-0.5" : "mb-1"}`}
      >
        {title}
      </span>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
    </div>
  );
};

const InfoItem = ({ label, value }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  return (
    <div className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-xl text-sm shadow-sm">
      <span className="text-gray-400 font-bold">
        {label}
        {isRTL ? " :" : ":"}
      </span>
      <span className="text-gray-700 font-semibold">
        {value || t("common.not_provided")}
      </span>
    </div>
  );
};

const InfoTab = ({
  painter,
  API_URL,
  loading,
  handleVerifyIdentity,
  handleStatusUpdate,
  t,
  isRTL,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-2">
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <ShieldCheck className="text-blue-600" size={20} />{" "}
          {t("infoTab.verification_docs_title")}
        </h4>
        <div className="space-y-4">
          <InfoItem label={t("infoTab.full_name")} value={painter.user?.name} />
          <InfoItem label={t("infoTab.id_number")} value={painter.idNumber} />
          <InfoItem
            label={t("infoTab.request_date")}
            value={new Date(painter.createdAt).toLocaleDateString(
              isRTL ? "ar-EG" : "en-US",
            )}
          />
        </div>
        <div className="mt-6 space-y-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {t("infoTab.id_front_image")}
          </span>
          <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 group relative">
            {painter.idCardFront ? (
              <img
                src={`${API_URL}/${painter.idCardFront}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                alt={t("infoTab.id_front_alt")}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                {t("common.no_image")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    <div
      className={`p-8 rounded-3xl border-2 flex flex-col items-center justify-center text-center ${painter.verificationStatus === "verified" ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}`}
    >
      <div
        className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-lg ${painter.verificationStatus === "verified" ? "bg-green-600 text-white" : "bg-orange-500 text-white"}`}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={40} />
        ) : painter.verificationStatus === "verified" ? (
          <CheckCircle size={40} />
        ) : (
          <AlertTriangle size={40} />
        )}
      </div>
      <h3 className="text-xl font-black text-gray-800">
        {painter.verificationStatus === "verified"
          ? t("infoTab.status_verified")
          : t("infoTab.status_pending")}
      </h3>
      <p className="text-gray-500 text-sm mt-2 max-w-[250px]">
        {painter.verificationStatus === "verified"
          ? t("infoTab.verified_desc")
          : t("infoTab.pending_desc")}
      </p>
      {painter.verificationStatus !== "verified" && (
        <div className="mt-8 flex flex-col gap-3 w-full">
          <button
            onClick={handleVerifyIdentity}
            disabled={loading}
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition flex items-center justify-center gap-2"
          >
            {loading ? t("common.updating") : t("infoTab.btn_verify_accept")}
          </button>
          <button
            onClick={() => handleStatusUpdate("rejected")}
            className="text-red-500 text-sm font-bold hover:underline"
          >
            {t("infoTab.btn_reject_unclear")}
          </button>
        </div>
      )}
    </div>
  </div>
);

const GalleryTab = ({ gallery, t }) => {
  const { deleteGalleryItem } = useAppContext();
  const handleDelete = async (id) => {
    if (
      window.confirm(t("messages.confirm_delete_photo") || "Delete this photo?")
    ) {
      const res = await deleteGalleryItem(id);
      if (res.success) alert(t("messages.delete_success"));
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 animate-in zoom-in-95 duration-300">
      {gallery?.length > 0 ? (
        gallery.map((item) => (
          <div
            key={item.id}
            className="group relative bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-md transition-all"
          >
            <img
              src={item.url}
              alt="Portfolio"
              className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-xl transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white text-[10px] font-bold">
                {item.title_ar || t("common.no_title")}
              </p>
              <p className="text-gray-300 text-[9px]">
                {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full text-center py-20 text-gray-400 italic bg-gray-50 rounded-3xl border-2 border-dashed">
          <ImageIcon className="mx-auto mb-3 opacity-20" size={48} />
          <p>{t("tabs.no_images_found")}</p>
        </div>
      )}
    </div>
  );
};

const FinancialTab = ({
  financialData,
  setFinancialData,
  handleFinancialUpdate,
  orders,
  painterUserId,
  t,
  isRTL,
}) => (
  <div className="space-y-8 animate-in fade-in">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <FinancialInput
        label={`${t("financials.wallet_balance")} (${t("common.currency")})`}
        value={financialData.wallet}
        onChange={(val) => setFinancialData({ ...financialData, wallet: val })}
        color="blue"
        isRTL={isRTL}
      />
      <FinancialInput
        label={`${t("financials.commission_rate")} (%)`}
        value={financialData.commissionRate}
        onChange={(val) =>
          setFinancialData({ ...financialData, commissionRate: val })
        }
        color="gray"
        isRTL={isRTL}
      />
      <FinancialInput
        label={t("financials.current_debt")}
        value={financialData.debt}
        onChange={(val) => setFinancialData({ ...financialData, debt: val })}
        color="red"
        isRTL={isRTL}
      />
    </div>
    <button
      onClick={handleFinancialUpdate}
      className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
    >
      {t("financials.btn_update")}
    </button>
    <hr className="border-gray-100" />
    <OrdersTable
      orders={orders}
      painterUserId={painterUserId}
      t={t}
      isRTL={isRTL}
    />
  </div>
);

const FinancialInput = ({ label, value, onChange, color, isRTL }) => (
  <div className={`bg-${color}-50 p-6 rounded-2xl border border-${color}-100`}>
    <label
      className={`text-xs font-bold text-${color}-600 mb-2 block ${isRTL ? "text-right" : "text-left"}`}
    >
      {label}
    </label>
    <input
      type="number"
      step="any"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full p-3 rounded-xl border-none font-bold text-xl text-${color}-700 focus:ring-2 focus:ring-${color}-500 bg-white shadow-inner ${isRTL ? "text-right" : "text-left"}`}
      dir="ltr"
    />
  </div>
);

const OrdersTable = ({ orders, painterUserId, t, isRTL }) => {
  const filteredOrders =
    orders?.filter((o) => o.userId === painterUserId) || [];
  return (
    <div className="space-y-4">
      <h4 className="font-bold text-gray-800 flex items-center gap-2">
        <Briefcase size={18} className="text-blue-600" />{" "}
        {t("orders.history_title")}
      </h4>
      <div className="border rounded-2xl overflow-hidden bg-white">
        <table
          className={`w-full ${isRTL ? "text-right" : "text-left"} text-sm`}
        >
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">{t("orders.col_id")}</th>
              <th className="p-4">{t("orders.col_items")}</th>
              <th className="p-4">{t("orders.col_date")}</th>
              <th className="p-4">{t("orders.col_status")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b hover:bg-gray-50/50 transition-colors"
                >
                  <td className="p-4 font-bold">#{order.id}</td>
                  <td className="p-4">
                    {order.items?.map((i) => (
                      <div key={i.id} className="text-xs">
                        {i.paint?.name} ({i.quantity} {t("common.unit_liter")})
                      </div>
                    ))}
                  </td>
                  <td className="p-4 text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString(
                      isRTL ? "ar-EG" : "en-US",
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-md text-[10px] font-bold ${order.status === "completed" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}
                    >
                      {order.status === "completed"
                        ? t("status.completed")
                        : t("status.processing")}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="p-8 text-center text-gray-400 italic"
                >
                  {t("orders.no_orders")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DisputesTab = ({ disputes, t, isRTL }) => (
  <div className="space-y-6 animate-in slide-in-from-bottom-4">
    {disputes?.length > 0 ? (
      disputes.map((dispute) => (
        <div
          key={dispute.id}
          className="p-6 bg-white border rounded-2xl shadow-sm"
        >
          <div className="flex justify-between mb-4">
            <span className="text-red-600 font-bold text-xs bg-red-50 px-3 py-1 rounded-lg">
              {t("disputes.id_label", { id: dispute.id })}
            </span>
            <button className="text-blue-600 text-xs font-bold underline">
              {t("disputes.btn_view_conversation")}
            </button>
          </div>
          <p
            className={`text-gray-700 text-sm mb-4 ${isRTL ? "text-right" : "text-left"}`}
          >
            {dispute.reason}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <img
                src={dispute.clientPhoto}
                className="rounded-xl h-40 w-full object-cover border"
                alt={t("disputes.alt_client_proof")}
              />
              <span className="text-[10px] text-gray-400 block text-center uppercase font-bold">
                {t("disputes.label_client_photo")}
              </span>
            </div>
            <div className="space-y-2">
              <img
                src={dispute.painterPhoto}
                className="rounded-xl h-40 w-full object-cover border"
                alt={t("disputes.alt_painter_proof")}
              />
              <span className="text-[10px] text-gray-400 block text-center uppercase font-bold">
                {t("disputes.label_painter_photo")}
              </span>
            </div>
          </div>
        </div>
      ))
    ) : (
      <div className="text-center py-20 text-gray-400 italic">
        {t("disputes.no_disputes")}
      </div>
    )}
  </div>
);

export default PainterDetails;
