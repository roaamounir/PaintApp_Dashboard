import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Save,
  Image as ImageIcon,
  Globe,
  Info,
  Upload,
  Trash2,
} from "lucide-react";

const Settings = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [formData, setFormData] = useState({
    app_name: "",
    support_email: "",
    support_phone: "",
    onboarding_1: "",
    onboarding_2: "",
    app_logo_url: "",
  });
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/settings");
      const data = await response.json();
      if (data.settings) setFormData(data.settings);
      if (data.banners) setBanners(data.banners);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching settings:", err);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/settings/update",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ settings: formData }),
        },
      );
      if (response.ok) alert("✅ " + t("settings.save_success") || "Saved!");
      else alert("❌ " + t("settings.save_error"));
    } catch (err) {
      alert("❌ " + t("settings.connection_error"));
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append("banner", file);

    try {
      const response = await fetch(
        "http://localhost:5000/api/settings/upload-banner",
        {
          method: "POST",
          body: data,
        },
      );
      if (response.ok) {
        const newBanner = await response.json();
        setBanners([...banners, newBanner]);
        alert("✅ Banner uploaded!");
      }
    } catch (err) {
      alert("❌ Upload failed");
    }
  };

  
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append("logo", file);

    try {
      const response = await fetch(
        "http://localhost:5000/api/settings/upload-logo",
        {
          method: "POST",
          body: data,
        },
      );
      if (response.ok) {
        const result = await response.json();
        setFormData((prev) => ({ ...prev, app_logo_url: result.imageUrl }));
        alert("✅ Logo updated!");
      }
    } catch (err) {
      alert("❌ Logo upload failed");
    }
  };

  if (loading)
    return <div className="p-10 text-center font-bold">Loading...</div>;

  return (
    <div className="space-y-8 pb-10" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {t("settings.title")}
          </h1>
          <p className="text-slate-500 text-sm">{t("settings.subtitle")}</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl transition shadow-lg shadow-blue-200 font-bold"
        >
          <Save size={18} /> {t("settings.save")}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* General Info */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b pb-4">
              <Globe size={20} className="text-blue-500" />{" "}
              {t("settings.general.title")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">
                  {t("settings.general.app_name")}
                </label>
                <input
                  type="text"
                  name="app_name"
                  value={formData.app_name}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">
                  {t("settings.general.email")}
                </label>
                <input
                  type="email"
                  name="support_email"
                  value={formData.support_email}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">
                {t("settings.general.phone")}
              </label>
              <input
                type="text"
                name="support_phone"
                value={formData.support_phone}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Onboarding */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b pb-4">
              <Info size={20} className="text-orange-500" />{" "}
              {t("settings.onboarding.title")}
            </h3>
            <div className="space-y-4">
              <textarea
                name="onboarding_1"
                value={formData.onboarding_1}
                onChange={handleChange}
                placeholder={`${t("settings.onboarding.screen", { num: 1 })}: ...`}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 h-24 outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <textarea
                name="onboarding_2"
                value={formData.onboarding_2}
                onChange={handleChange}
                placeholder={`${t("settings.onboarding.screen", { num: 2 })}: ...`}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 h-24 outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>

        {/* Media Section */}
        <div className="space-y-6">
          {/* App Logo */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">
              {t("settings.media.logo")}
            </h3>
            <label className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition cursor-pointer relative overflow-hidden group">
              {formData.app_logo_url && (
                <img
                  src={formData.app_logo_url}
                  className="absolute inset-0 w-full h-full object-contain opacity-30 group-hover:opacity-10 transition"
                  alt="Logo"
                />
              )}
              <Upload
                className="text-slate-400 mb-2 group-hover:text-blue-500 transition"
                size={32}
              />
              <p className="text-xs text-slate-500 font-medium text-center">
                {t("settings.media.upload")}
              </p>
              <input
                type="file"
                className="hidden"
                onChange={handleLogoUpload}
                accept="image/*"
              />
            </label>
          </div>

          {/* Slider Banners */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                {t("settings.media.slider")}
              </h3>
              <label className="text-blue-600 text-xs font-bold hover:underline cursor-pointer">
                {t("settings.media.add")}
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="image/*"
                />
              </label>
            </div>
            <div className="space-y-3">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 overflow-hidden">
                    {banner.imageUrl ? (
                      <img
                        src={banner.imageUrl}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    ) : (
                      <ImageIcon size={20} />
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] font-bold text-slate-700 truncate">
                      {banner.title_ar || "Banner"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Active
                    </p>
                  </div>
                  <button className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
