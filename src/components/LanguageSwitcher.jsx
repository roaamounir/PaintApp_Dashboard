import React from "react";
import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const { changeLanguage } = useAppContext(); 

  const toggleLanguage = () => {
    const newLang = i18n.language === "ar" ? "en" : "ar";

    i18n.changeLanguage(newLang);

    changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-all text-gray-700 font-bold text-sm"
      title={t("common.change_lang")}
    >
      <Languages size={18} className="text-blue-600" />
      <span>{t("common.language_name")}</span>
    </button>
  );
};

export default LanguageSwitcher;
