import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, ArrowLeft, ShieldCheck, User, Trash2, Ban } from "lucide-react";
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
    loading,
    getUserById,
    uploadUserAvatarForUser,
    deleteUser,
  } = useAppContext();

  const [currentUser, setCurrentUser] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

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
      let user = users.find((u) => String(u.id) === String(id));
      if (!user) {
        user = await getUserById(id);
      }

      if (user) {
        const active =
          user.status !== undefined
            ? user.status
            : user.isActive !== false && user.isActive !== 0;
        setCurrentUser({
          ...user,
          status: active,
          permissions: user.permissions || {},
        });
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
      };

      if (avatarFile) {
        const uploadRes = await uploadUserAvatarForUser(id, avatarFile);
        if (!uploadRes.success) {
          alert(uploadRes.error || t("userDetails.update_error"));
          return;
        }
        if (uploadRes.avatarUrl) {
          dataToSave.avatarUrl = uploadRes.avatarUrl;
        }
      }

      const res = await updateUser(id, dataToSave);
      if (res.success) {
        setCurrentUser({ ...currentUser, ...dataToSave });
        setAvatarFile(null);
        alert(t("userDetails.update_success"));
      }
    } catch (error) {
      alert(t("userDetails.update_error"));
    }
  };
  const getAvatarSrc = () => {
    if (avatarPreview) return avatarPreview;
    if (!currentUser?.avatarUrl) return "https://placehold.co/96x96?text=User";
    if (currentUser.avatarUrl.startsWith("http")) return currentUser.avatarUrl;
    return `http://localhost:5000${currentUser.avatarUrl}`;
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
      <div className="flex justify-between items-center bg-linear-to-r from-white to-slate-50 p-5 rounded-2xl shadow-sm border border-gray-100">
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
        <button
          onClick={async () => {
            const res = await deleteUser(id, "soft");
            if (res?.success) navigate("/users");
          }}
          className="p-2.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
          title="Soft Delete (Block)"
          aria-label="Soft Delete (Block)"
        >
          <Ban size={18} />
        </button>
        <button
          onClick={async () => {
            const res = await deleteUser(id, "hard");
            if (res?.success) navigate("/users");
          }}
          className="p-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
          title="Hard Delete"
          aria-label="Hard Delete"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-700">
            <User size={20} className="text-blue-500" />{" "}
            {t("userDetails.basic_info.title")}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">
                الصورة الشخصية
              </label>
              <div className="flex items-center gap-4">
                <img
                  src={getAvatarSrc()}
                  alt="avatar"
                  className="w-24 h-24 rounded-2xl object-cover border border-gray-200"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setAvatarFile(file);
                    if (file) {
                      setAvatarPreview(URL.createObjectURL(file));
                    } else {
                      setAvatarPreview("");
                    }
                  }}
                  className="text-sm"
                />
              </div>
            </div>
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
      </div>
    </div>
  );
};

export default UserDetails;
