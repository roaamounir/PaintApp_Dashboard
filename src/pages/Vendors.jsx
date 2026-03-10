import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; 
import {
  Trash2,
  Eye,
  CheckCircle,
  Search,
  Building2,
  Mail,
  Box,
  MapPin,
  Loader2,
  X,
  FileText,
  Phone,
  Hash,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

const Vendors = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { vendors, updateVendor, deleteVendor, loading } = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);

  const allVendors = vendors.map((v) => ({
    ...v,
    displayShopName:
      v.shopName ||
      v.user?.name ||
      v.user?.email?.split("@")[0] ||
      t("vendors.fields.new_vendor"),
  }));

  const filteredVendors = allVendors.filter(
    (v) =>
      v.displayShopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  console.log(
    "Vendors IDs:",
    filteredVendors.map((v) => ({ id: v.id, userId: v.userId })),
  );
  return (
    <div className="space-y-6 relative text-right" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800">
            {t("vendors.title")}
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            {t("vendors.subtitle")}
          </p>
        </div>
        {loading && (
          <Loader2 className="animate-spin text-blue-600" size={20} />
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          type="text"
          placeholder={t("vendors.search_placeholder")}
          className="w-full bg-white border border-slate-200 rounded-xl py-3 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-6 py-4">{t("vendors.table.company_info")}</th>
                <th className="px-6 py-4 text-center">
                  {t("vendors.table.status")}
                </th>
                <th className="px-6 py-4 text-center">
                  {t("vendors.table.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVendors.map((vendor, index) => (
                <tr
                  key={vendor.id || vendor.userId || index}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                        {vendor.displayShopName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-slate-800 font-bold text-sm">
                          {vendor.displayShopName}
                        </p>
                        <p className="text-slate-400 text-[11px] font-medium">
                          {vendor.user?.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        vendor.isApproved
                          ? "bg-green-100 text-green-600"
                          : "bg-amber-100 text-amber-600"
                      }`}
                    >
                      {vendor.isApproved
                        ? t("vendors.status.approved")
                        : t("vendors.status.pending")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() =>
                          navigate(`/vendors/${vendor.userId || vendor.id}`)
                        }
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        onClick={() =>
                          updateVendor(vendor.userId, {
                            isApproved: !vendor.isApproved,
                          })
                        }
                        className={`p-2 rounded-lg transition ${
                          vendor.isApproved
                            ? "text-green-600 bg-green-50 hover:bg-green-100"
                            : "text-slate-400 hover:text-green-600 hover:bg-green-50"
                        }`}
                        title={
                          vendor.isApproved
                            ? t("vendors.actions.revoke")
                            : t("vendors.actions.approve")
                        }
                      >
                        <CheckCircle size={18} />
                      </button>

                      <button
                        onClick={() => {
                          if (
                            window.confirm(t("vendors.alerts.confirm_delete"))
                          ) {
                            deleteVendor(vendor.userId);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Detailed Modal --- */}
      {selectedVendor && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-none">
                    {selectedVendor.shopName}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1 uppercase font-black tracking-widest">
                    {t("vendors.modals.profile_title")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVendor(null)}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                    <Hash size={10} /> {t("vendors.fields.tax_id")}
                  </p>
                  <p className="text-slate-700 font-bold bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {selectedVendor.taxRegistration}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                    <FileText size={10} /> {t("vendors.fields.company_type")}
                  </p>
                  <p className="text-slate-700 font-bold bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {selectedVendor.companyType}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                  <MapPin size={10} /> {t("vendors.fields.business_address")}
                </p>
                <p className="text-slate-700 font-bold bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedVendor.city} - {selectedVendor.address}
                </p>
              </div>

              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="p-3 bg-white text-blue-600 rounded-xl shadow-sm">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-400 uppercase">
                    {t("vendors.fields.contact_phone")}
                  </p>
                  <p className="text-blue-700 font-black" dir="ltr">
                    {selectedVendor.user?.phone || t("vendors.fields.no_phone")}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 border-t flex gap-3">
              {!selectedVendor.isApproved && (
                <button
                  onClick={async () => {
                    await updateVendor(selectedVendor.userId, {
                      isApproved: true,
                    });
                    setSelectedVendor(null);
                  }}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-200"
                >
                  {t("vendors.actions.approve_btn")}
                </button>
              )}
              <button
                onClick={() => setSelectedVendor(null)}
                className="flex-1 bg-white text-slate-600 border border-slate-200 py-3 rounded-xl font-bold hover:bg-slate-100 transition"
              >
                {t("vendors.actions.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendors;
