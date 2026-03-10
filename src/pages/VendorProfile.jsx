import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  MapPin,
  Phone,
  FileText,
  Hash,
  ShieldCheck,
  Package,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Edit3,
  ExternalLink,
  Save,
  X,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

const VendorProfile = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    vendors,
    updateVendor,
    paints,
    processVendorPayout,
    fetchWalletHistory,
    walletHistory,
  } = useAppContext();
  const [activeTab, setActiveTab] = useState("overview");
  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  const vendorPaints = paints.filter(
    (paint) => paint.vendorId === vendorData?.userId,
  );

  const vendor = vendorData || vendors.find((v) => v.userId === parseInt(id));

  useEffect(() => {
    if (!id || id === "undefined") return;

    const fetchFullVendorData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:5000/vendors/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (response.ok) {
          const found = Array.isArray(data) ? data[0] : data;
          setVendorData(found);
          setFormData({
            shopName: found.shopName || "",
            taxRegistration: found.taxRegistration || "",
            companyType: found.companyType || "",
            city: found.city || "",
            address: found.address || "",
            phone: found.user?.phone || "",
            email: found.user?.email || "",
          });
          if (found?.userId) {
            fetchWalletHistory(found.userId);
          }
        }
      } catch {
        console.error("Fetch error:");
      } finally {
        setLoading(false);
      }
    };

    fetchFullVendorData();
  }, [id, fetchWalletHistory]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateVendor(vendorData.id, formData);
      setVendorData((prev) => ({
        ...prev,
        ...formData,
        user: { ...prev.user, phone: formData.phone, email: formData.email },
      }));
      setIsEditing(false);
      alert(t("vendorProfile.profileUpdated"));
    } catch {
      alert(t("vendorProfile.updateFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (vendorData) {
      setFormData({
        shopName: vendorData.shopName || "",
        taxRegistration: vendorData.taxRegistration || "",
        companyType: vendorData.companyType || "",
        city: vendorData.city || "",
        address: vendorData.address || "",
        phone: vendorData.user?.phone || "",
        email: vendorData.user?.email || "",
      });
    }
    setIsEditing(false);
  };

  const handleStatusToggle = async () => {
    if (!vendorData) return;
    if (!vendorData.isApproved) {
      const rate = prompt(t("requests.confirm_approve") + "\n" + t("vendorProfile.financials.commissionRate") + ":", "10");
      if (rate)
        await updateVendor(vendorData.id, {
          isApproved: true,
          commissionRate: parseFloat(rate),
        });
    } else {
      if (window.confirm(t("vendorProfile.suspendConfirm"))) {
        await updateVendor(vendorData.id, { isApproved: false });
      }
    }
  };

  const transactions = walletHistory || [];

  if (loading && !vendorData)
    return <div className="p-20 text-center font-black">{t("common.loading")}</div>;
  if (!vendorData)
    return (
      <div className="p-20 text-center font-black text-slate-400">
        {t("painterDetails.not_found")}
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:bg-slate-50 transition"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            {isEditing ? (
              <input
                name="shopName"
                value={formData.shopName || ""}
                onChange={handleInputChange}
                className="text-2xl font-black text-slate-800 bg-white px-4 py-2 rounded-xl border-2 border-blue-300 focus:border-blue-500 outline-none"
              />
            ) : (
              <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                {vendor.shopName}
                {vendor.isApproved && (
                  <ShieldCheck size={20} className="text-blue-500" />
                )}
              </h1>
            )}
            <p className="text-slate-400 text-sm font-medium">
              {t("vendorProfile.merchantId")}: #{vendor.userId}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition text-sm"
              >
                <X size={16} /> {t("vendorProfile.cancel")}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white border border-green-600 rounded-xl font-bold hover:bg-green-700 transition text-sm disabled:opacity-50"
              >
                <Save size={16} /> {saving ? t("vendorProfile.saving") : t("vendorProfile.save")}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition text-sm"
              >
                <Edit3 size={16} /> {t("vendorProfile.editProfile")}
              </button>
              <button
                onClick={handleStatusToggle}
                className={`px-6 py-2.5 rounded-xl font-black text-sm transition shadow-lg ${
                  vendor.isApproved
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100"
                }`}
              >
                {vendor.isApproved ? t("vendorProfile.suspendVendor") : t("vendorProfile.approveMerchant")}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          icon={<Package />}
          label={t("vendorProfile.stats.totalProducts")}
          value={vendorPaints.length}
          color="blue"
        />
        <DashboardCard
          icon={<DollarSign />}
          label={t("vendorProfile.stats.currentBalance")}
          value={`EGP ${vendor.walletBalance?.toLocaleString() || "0"}`}
          color="green"
        />
        <DashboardCard
          icon={<TrendingUp />}
          label={t("vendorProfile.stats.totalTransactions")}
          value={transactions.length}
          color="indigo"
        />
        <DashboardCard
          icon={<AlertTriangle />}
          label={t("vendorProfile.stats.lowStock")}
          value={`${vendorPaints.filter((p) => p.stock < 10).length} items`}
          color="amber"
        />
      </div>

      <div className="flex border-b border-slate-200 gap-8">
        {["overview", "inventory", "financials"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-sm font-black uppercase tracking-wider transition-colors relative ${activeTab === tab ? "text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            {t(`vendorProfile.tabs.${tab}`)}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2 underline decoration-blue-200 decoration-4 underline-offset-4">
                  {t("vendorProfile.overview.legalInfo")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <DetailBox
                    label={t("vendorProfile.fields.taxRegistration")}
                    value={vendor.taxRegistration}
                    name="taxRegistration"
                    isEditing={isEditing}
                    onChange={handleInputChange}
                    formData={formData}
                    notProvided={t("vendorProfile.fields.notProvided")}
                  />
                  <DetailBox
                    label={t("vendorProfile.fields.companyType")}
                    value={vendor.companyType}
                    name="companyType"
                    isEditing={isEditing}
                    onChange={handleInputChange}
                    formData={formData}
                    notProvided={t("vendorProfile.fields.notProvided")}
                  />
                  <DetailBox
                    label={t("vendorProfile.fields.cityRegion")}
                    value={vendor.city}
                    name="city"
                    isEditing={isEditing}
                    onChange={handleInputChange}
                    formData={formData}
                    notProvided={t("vendorProfile.fields.notProvided")}
                  />
                  <DetailBox
                    label={t("vendorProfile.fields.accountCreated")}
                    value={
                      vendor.createdAt
                        ? new Date(vendor.createdAt).toLocaleDateString()
                        : "---"
                    }
                    notProvided={t("vendorProfile.fields.notProvided")}
                  />
                </div>
              </div>
            </div>
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl">
              <h3 className="font-black mb-6">{t("vendorProfile.overview.contactDetails")}</h3>
              <div className="space-y-6">
                <ContactItem
                  icon={<Phone />}
                  label={t("vendorProfile.fields.phone")}
                  value={vendor.user?.phone}
                  name="phone"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  formData={formData}
                  notProvided={t("vendorProfile.fields.notProvided")}
                />
                <ContactItem
                  icon={<FileText />}
                  label={t("vendorProfile.fields.email")}
                  value={vendor.user?.email}
                  name="email"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  formData={formData}
                  notProvided={t("vendorProfile.fields.notProvided")}
                />
                <ContactItem
                  icon={<MapPin />}
                  label={t("vendorProfile.fields.address")}
                  value={vendor.address}
                  name="address"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  formData={formData}
                  notProvided={t("vendorProfile.fields.notProvided")}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "inventory" && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-5">{t("vendorProfile.inventory.productName")}</th>
                  <th className="px-8 py-5">{t("vendorProfile.inventory.price")}</th>
                  <th className="px-8 py-5">{t("vendorProfile.inventory.stock")}</th>
                  <th className="px-8 py-5">{t("vendorProfile.inventory.status")}</th>
                  <th className="px-8 py-5 text-right">{t("vendorProfile.inventory.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendorPaints.map((paint) => (
                  <tr
                    key={paint.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-8 py-5 font-bold text-slate-700">
                      {paint.name}
                    </td>
                    <td className="px-8 py-5 text-slate-600 font-medium">
                      EGP {paint.price}
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`font-bold ${paint.stock < 10 ? "text-red-500" : "text-slate-700"}`}
                      >
                        {paint.stock} units
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${paint.status === "available" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                      >
                        {paint.status}
                      </span>
                    </td>

                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => navigate(`/paint/${paint.id}`)} 
                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                        title={t("common.edit")}
                      >
                        <ExternalLink size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "financials" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-700">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="font-black text-slate-800 text-lg">
                    {t("vendorProfile.financials.walletLedger")}
                  </h3>
                  <p className="text-slate-400 text-xs font-medium">
                    {t("vendorProfile.financials.transactionsHistory")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase shadow-sm">
                    {t("vendorProfile.financials.totalRows")}: {transactions.length}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                      <th className="px-8 py-5 border-b border-slate-100">
                        {t("vendorProfile.table.dateTime")}
                      </th>
                      <th className="px-8 py-5 border-b border-slate-100">
                        {t("vendorProfile.table.reference")}
                      </th>
                      <th className="px-8 py-5 border-b border-slate-100">
                        {t("vendorProfile.table.type")}
                      </th>
                      <th className="px-8 py-5 border-b border-slate-100">
                        {t("vendorProfile.table.amount")}
                      </th>
                      <th className="px-8 py-5 border-b border-slate-100 text-right">
                        {t("vendorProfile.table.status")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {transactions.length > 0 ? (
                      transactions.map((trx) => (
                        <tr
                          key={trx.id}
                          className="hover:bg-slate-50/80 transition-all group"
                        >
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="text-slate-700 font-bold text-sm">
                                {new Date(trx.createdAt).toLocaleDateString(
                                  "en-EG",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                  },
                                )}
                              </span>
                              <span className="text-slate-400 text-[10px] font-medium">
                                {new Date(trx.createdAt).toLocaleTimeString(
                                  "en-EG",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                <Hash size={14} />
                              </div>
                              <span className="font-bold text-slate-600 text-xs tracking-wider">
                                {trx.order?.orderNumber || "SYSTEM_ADJ"}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span
                              className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                                trx.type === "SALE_PROFIT"
                                  ? "bg-blue-50 text-blue-600"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {trx.type.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <span className="font-black text-slate-800 text-sm">
                              + EGP {trx.amount.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex justify-end">
                              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-8 py-24 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200">
                              <DollarSign size={32} />
                            </div>
                            <p className="text-slate-400 font-black text-sm uppercase tracking-widest">
                              {t("vendorProfile.noTransactions")}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-[2rem] text-white shadow-xl">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                  {t("vendorProfile.financials.vendorWallet")}
                </p>
                <h4 className="text-3xl font-black">
                  EGP {vendor.walletBalance?.toLocaleString() || "0.00"}
                </h4>
                <div className="mt-4 flex items-center gap-2 text-green-400 text-xs font-bold">
                  <TrendingUp size={14} /> {t("vendorProfile.financials.availableForWithdrawal")}
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                  {t("vendorProfile.financials.commissionRate")}
                </p>
                <h4 className="text-3xl font-black text-blue-600">
                  {vendor.commissionRate || 0}%
                </h4>
                <p className="text-slate-400 text-xs mt-2 font-medium">
                  {t("vendorProfile.financials.commissionDescription")}
                </p>
              </div>

              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center">
                <button
                  onClick={() => processVendorPayout(vendor.userId)}
                  disabled={(vendor.walletBalance || 0) <= 0}
                  className={`w-full py-4 rounded-xl font-black text-xs uppercase transition shadow-lg ${
                    (vendor.walletBalance || 0) > 0
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {t("vendorProfile.financials.settlePayout")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DashboardCard = ({ icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
    <div
      className={`w-12 h-12 rounded-2xl bg-${color}-50 text-${color}-600 flex items-center justify-center mb-4`}
    >
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <p className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-1">
      {label}
    </p>
    <p className="text-2xl font-black text-slate-800">{value}</p>
  </div>
);

const DetailBox = ({ label, value, name, isEditing, onChange, formData, notProvided }) => (
  <div>
    <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">
      {label}
    </p>
    {isEditing && name ? (
      <input
        name={name}
        value={formData?.[name] || value || ""}
        onChange={onChange}
        className="w-full text-slate-700 font-bold bg-white p-3 rounded-xl border-2 border-blue-100 focus:border-blue-500 outline-none transition-all"
      />
    ) : (
      <p className="text-slate-700 font-bold bg-slate-50 p-4 rounded-2xl border border-slate-100">
        {value || notProvided || "---"}
      </p>
    )}
  </div>
);

const ContactItem = ({ icon, label, value, name, isEditing, onChange, formData, notProvided }) => (
  <div className="flex gap-4 items-start">
    <div className="p-3 bg-white/10 rounded-xl text-blue-400">
      {React.cloneElement(icon, { size: 18 })}
    </div>
    <div className="flex-1">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
        {label}
      </p>
      {isEditing && name ? (
        <input
          name={name}
          value={formData?.[name] || value || ""}
          onChange={onChange}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white font-bold outline-none focus:border-blue-400 mt-1"
        />
      ) : (
        <p className="font-bold text-slate-200">{value || notProvided || "Not provided"}</p>
      )}
    </div>
  </div>
);

export default VendorProfile;
