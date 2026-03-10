import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, ArrowLeft, Wallet, ShieldCheck, User } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { useTranslation } from "react-i18next";

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const {
    users,
    updateUser,
    fetchWalletHistory,
    walletHistory,
    loading,
    getUserById,
  } = useAppContext();

  const [currentUser, setCurrentUser] = useState(null);

  const AVAILABLE_PERMISSIONS = [
    {
      id: "manage_users",
      label: t("userDetails.permissions.list.manage_users"),
    },
    {
      id: "manage_stock",
      label: t("userDetails.permissions.list.manage_stock"),
    },
    { id: "edit_prices", label: t("userDetails.permissions.list.edit_prices") },
    {
      id: "view_reports",
      label: t("userDetails.permissions.list.view_reports"),
    },
    {
      id: "manage_orders",
      label: t("userDetails.permissions.list.manage_orders"),
    },
    { id: "color_tools", label: t("userDetails.permissions.list.color_tools") },
  ];

  useEffect(() => {
    const loadUser = async () => {
      let user = users.find((u) => Number(u.id) === Number(id));
      if (!user) {
        user = await getUserById(id);
      }

      if (user) {
        setCurrentUser({
          ...user,
          balance: user.balance || 0,
          creditLimit: user.creditLimit || 0,
          permissions: user.permissions || {},
        });
        fetchWalletHistory(user.id);
      }
    };
    loadUser();
  }, [id, users]);

  const handleSave = async () => {
    try {
      const dataToSave = {
        name: currentUser.name,
        phone: currentUser.phone,
        role: currentUser.role,
        status: currentUser.status,
        permissions: currentUser.permissions,
        balance: parseFloat(currentUser.balance),
        creditLimit: parseFloat(currentUser.creditLimit),
      };

      const res = await updateUser(id, dataToSave);
      if (res.success) {
        setCurrentUser({ ...currentUser, ...dataToSave });
        alert(t("userDetails.update_success"));
      }
    } catch (error) {
      alert(t("userDetails.update_error"));
    }
  };

  if (!currentUser)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500 font-bold">
        {t("userDetails.loading")}
      </div>
    );

  return (
    <div
      className="p-6 space-y-6 max-w-7xl mx-auto mb-10"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 sticky top-4 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className={`p-2 hover:bg-gray-100 rounded-full transition text-gray-600 ${isRTL ? "rotate-180" : ""}`}
            title={isRTL ? "رجوع" : "Back"}
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {t("userDetails.edit_title")}
            </h1>
            <p className="text-sm text-blue-600 font-medium font-mono">
              {currentUser.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className={`flex items-center gap-2 ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          } text-white px-8 py-2.5 rounded-xl transition font-bold shadow-lg shadow-blue-100`}
        >
          <Save size={18} />{" "}
          {loading ? t("userDetails.saving") : t("userDetails.save")}
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Info */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-700">
            <User size={20} className="text-blue-500" />{" "}
            {t("userDetails.basic_info.title")}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">
                {t("userDetails.basic_info.full_name")}
              </label>
              <input
                type="text"
                value={currentUser.name || ""}
                onChange={(e) =>
                  setCurrentUser({ ...currentUser, name: e.target.value })
                }
                className="w-full border-gray-200 border rounded-xl p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-50 transition"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">
                {t("userDetails.basic_info.phone")}
              </label>
              <input
                type="text"
                value={currentUser.phone || ""}
                onChange={(e) =>
                  setCurrentUser({ ...currentUser, phone: e.target.value })
                }
                className={`w-full border-gray-200 border rounded-xl p-3 outline-none focus:border-blue-500 transition font-mono ${isRTL ? "text-right" : "text-left"}`}
              />
            </div>
          </div>
        </div>

        {/* Financial Info */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-700">
            <Wallet size={20} className="text-emerald-500" />{" "}
            {t("userDetails.financial.title")}
          </h3>
          <div className="space-y-4">
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
              <label className="text-xs font-bold text-emerald-600 block mb-1">
                {t("userDetails.financial.balance")}
              </label>
              <input
                type="number"
                value={currentUser.balance || 0}
                onChange={(e) =>
                  setCurrentUser({
                    ...currentUser,
                    balance: Number(e.target.value),
                  })
                }
                className="bg-transparent text-2xl font-black text-emerald-700 outline-none w-full font-mono"
              />
            </div>
            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
              <label className="text-xs font-bold text-rose-600 block mb-1">
                {t("userDetails.financial.credit_limit")}
              </label>
              <input
                type="number"
                value={currentUser.creditLimit || 0}
                onChange={(e) =>
                  setCurrentUser({
                    ...currentUser,
                    creditLimit: Number(e.target.value),
                  })
                }
                className="bg-transparent text-2xl font-black text-rose-700 outline-none w-full font-mono"
              />
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-700">
            <ShieldCheck size={20} className="text-purple-500" />{" "}
            {t("userDetails.permissions.title")}
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {AVAILABLE_PERMISSIONS.map((perm) => (
              <label
                key={perm.id}
                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                  currentUser.permissions?.[perm.id]
                    ? "bg-purple-50 border border-purple-100"
                    : "bg-gray-50 border border-transparent"
                }`}
              >
                <input
                  type="checkbox"
                  checked={!!currentUser.permissions?.[perm.id]}
                  onChange={(e) =>
                    setCurrentUser((prev) => ({
                      ...prev,
                      permissions: {
                        ...(prev.permissions || {}),
                        [perm.id]: e.target.checked,
                      },
                    }))
                  }
                  className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span
                  className={`text-sm font-bold ${currentUser.permissions?.[perm.id] ? "text-purple-700" : "text-gray-600"}`}
                >
                  {perm.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Wallet History Table */}
        <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Wallet size={20} className="text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">
                {t("userDetails.wallet.title")}
              </h3>
            </div>
            <span className="text-xs font-bold bg-gray-100 px-3 py-1 rounded-full text-gray-500">
              {t("userDetails.wallet.count", { count: walletHistory.length })}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className={`w-full ${isRTL ? "text-right" : "text-left"}`}>
              <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase">
                <tr>
                  <th className="px-6 py-4">
                    {t("userDetails.wallet.table.date")}
                  </th>
                  <th className="px-6 py-4">
                    {t("userDetails.wallet.table.type")}
                  </th>
                  <th className="px-6 py-4">
                    {t("userDetails.wallet.table.amount")}
                  </th>
                  <th className="px-6 py-4">
                    {t("userDetails.wallet.table.desc")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {walletHistory.length > 0 ? (
                  walletHistory.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-500 font-medium font-mono">
                        {new Date(log.createdAt).toLocaleDateString(
                          isRTL ? "ar-EG" : "en-GB",
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${log.type === "deposit" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                          {log.type === "deposit"
                            ? t("userDetails.wallet.table.deposit")
                            : t("userDetails.wallet.table.withdrawal")}
                        </span>
                      </td>
                      <td
                        className={`px-6 py-4 text-sm font-black font-mono ${log.amount >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                      >
                        {log.amount > 0 ? `+${log.amount}` : log.amount}{" "}
                        {isRTL ? "ج.م" : "EGP"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                        {log.description}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-16 text-center text-gray-400 italic"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Wallet size={40} className="text-gray-200" />
                        <p>{t("userDetails.wallet.no_records")}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
