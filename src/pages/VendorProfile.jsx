import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  MapPin,
  Phone,
  FileText,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

const VendorProfile = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    vendors,
    paints,
    orders,
  } = useAppContext();
  const [activeTab, setActiveTab] = useState("overview");
  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({});

  const vendorPaints = paints.filter(
    (paint) => paint.vendorId === vendorData?.userId,
  );
  const vendorOrders = (orders || []).filter((o) => {
    const byUserId = String(o.userId || "") === String(vendorData?.userId || "");
    const byUserObj = String(o.user?.id || "") === String(vendorData?.userId || "");
    return byUserId || byUserObj;
  });

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
        }
      } catch {
        console.error("Fetch error:");
      } finally {
        setLoading(false);
      }
    };

    fetchFullVendorData();
  }, [id]);

  const cleanTax = (rawValue) => {
    if (!rawValue) return "";
    const raw = String(rawValue);
    if (!raw.startsWith("__REQ_TYPE__:")) return raw;
    const parts = raw.split("|");
    return parts[1] || "";
  };

  const readCompanyType = (regionValue) => {
    const value = String(regionValue || "");
    if (value.startsWith("type:")) return value.slice(5);
    return value;
  };

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
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              {vendor.shopName}
              {vendor.isApproved && (
                <ShieldCheck size={20} className="text-blue-500" />
              )}
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              {t("vendorProfile.merchantId")}: #{vendor.userId}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <span
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide ${
              vendor.isApproved
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : "bg-amber-50 text-amber-700 border border-amber-100"
            }`}
          >
            {vendor.isApproved ? "Approved" : "Pending"}
          </span>
        </div>
      </div>

      <div className="flex border-b border-slate-200 gap-8">
        <button
          key="overview"
          onClick={() => setActiveTab("overview")}
          className="pb-4 text-sm font-black uppercase tracking-wider transition-colors relative text-blue-600"
        >
          {t("vendorProfile.tabs.overview")}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full" />
        </button>
      </div>

      <div className="min-h-[400px]">
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2 underline decoration-blue-200 decoration-4 underline-offset-4">
                    {t("vendorProfile.overview.legalInfo")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <DetailBox
                      label={t("vendorProfile.fields.taxRegistration")}
                      value={cleanTax(vendor.taxRegistration)}
                      name="taxRegistration"
                      isEditing={false}
                      onChange={null}
                      formData={formData}
                      notProvided={t("vendorProfile.fields.notProvided")}
                    />
                    <DetailBox
                      label={t("vendorProfile.fields.companyType")}
                      value={readCompanyType(vendor.region || vendor.companyType)}
                      name="companyType"
                      isEditing={false}
                      onChange={null}
                      formData={formData}
                      notProvided={t("vendorProfile.fields.notProvided")}
                    />
                    <DetailBox
                      label={t("vendorProfile.fields.cityRegion")}
                      value={vendor.city}
                      name="city"
                      isEditing={false}
                      onChange={null}
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
                    isEditing={false}
                    onChange={null}
                    formData={formData}
                    notProvided={t("vendorProfile.fields.notProvided")}
                  />
                  <ContactItem
                    icon={<FileText />}
                    label={t("vendorProfile.fields.email")}
                    value={vendor.user?.email}
                    name="email"
                    isEditing={false}
                    onChange={null}
                    formData={formData}
                    notProvided={t("vendorProfile.fields.notProvided")}
                  />
                  <ContactItem
                    icon={<MapPin />}
                    label={t("vendorProfile.fields.address")}
                    value={vendor.address}
                    name="address"
                    isEditing={false}
                    onChange={null}
                    formData={formData}
                    notProvided={t("vendorProfile.fields.notProvided")}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100">
                <h3 className="font-black text-slate-800">طلبات هذا التاجر</h3>
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-4">Order</th>
                    <th className="px-8 py-4">Date</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4">Total</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vendorOrders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-8 py-8 text-center text-slate-400">
                        لا توجد طلبات لهذا التاجر
                      </td>
                    </tr>
                  ) : (
                    vendorOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-4 font-bold text-slate-700">{o.orderNumber || `ORD-${o.id}`}</td>
                        <td className="px-8 py-4 text-slate-600">
                          {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "---"}
                        </td>
                        <td className="px-8 py-4 text-slate-600">{o.status || "pending"}</td>
                        <td className="px-8 py-4 text-slate-700 font-bold">{Number(o.totalPrice || 0).toFixed(2)} EGP</td>
                        <td className="px-8 py-4 text-right">
                          <button
                            onClick={() => navigate(`/orders/${o.id}`)}
                            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                            title={t("common.edit")}
                          >
                            <ExternalLink size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

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
