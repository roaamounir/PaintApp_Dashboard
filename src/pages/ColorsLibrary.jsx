import React, { useState, useEffect, useCallback } from "react"; 
import { useTranslation } from "react-i18next"; 
import { Trash2, Edit, Plus, Search, X } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const ColorsLibrary = () => {
  const { t } = useTranslation(); 
  const { colors, colorSystems, addColor, deleteColor, updateColor, fetchColors } = useAppContext();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingColor, setEditingColor] = useState(null);

  const [formData, setFormData] = useState({
    code: "",
    hex: "#000000",
    colorSystemId: "",
  });

  useEffect(() => {
    fetchColors(); 
  }, [fetchColors]);

  const filteredColors = colors?.filter(
    (c) =>
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.colorSystem?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      colorSystemId: Number(formData.colorSystemId),
    };

    if (editingColor) {
      await updateColor(editingColor.id, payload);
    } else {
      await addColor(payload);
    }
    closeModal();
  };

  const openModal = (color = null) => {
    if (color) {
      setEditingColor(color);
      setFormData({
        code: color.code,
        hex: color.hex,
        colorSystemId: color.colorSystemId,
      });
    } else {
      setEditingColor(null);
      setFormData({
        code: "",
        hex: "#000000",
        colorSystemId: colorSystems[0]?.id || "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingColor(null);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {t("colors.title")}
          </h1>
          <p className="text-slate-500 text-sm">{t("colors.subtitle")}</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl transition font-medium shadow-sm"
        >
          <Plus size={18} />
          <span>{t("colors.actions.add")}</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          type="text"
          placeholder={t("colors.fields.search")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-500 transition shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-widest">
            <tr>
              <th className="px-6 py-4">{t("colors.table.shade")}</th>
              <th className="px-6 py-4 text-center">{t("colors.table.hex")}</th>
              <th className="px-6 py-4 text-center">
                {t("colors.table.system")}
              </th>
              <th className="px-6 py-4 text-center">
                {t("colors.table.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredColors?.map((color) => (
              <tr
                key={color.id}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg shadow-inner border border-slate-200"
                      style={{ backgroundColor: color.hex }}
                    ></div>
                    <span className="font-semibold text-slate-700">
                      {color.code}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center font-mono text-xs text-slate-600 uppercase">
                  {color.hex}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">
                    {color.colorSystem?.name}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => openModal(color)}
                      className="p-2 text-slate-400 hover:text-blue-600 transition"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteColor(color.id)}
                      className="p-2 text-slate-400 hover:text-red-600 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">
                {editingColor
                  ? t("colors.modals.edit_title")
                  : t("colors.modals.add_title")}
              </h2>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t("colors.fields.code_label")}
                </label>
                <input
                  required
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder={t("colors.fields.code_placeholder")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t("colors.fields.pick_label")}
                  </label>
                  <input
                    type="color"
                    value={formData.hex}
                    onChange={(e) =>
                      setFormData({ ...formData, hex: e.target.value })
                    }
                    className="w-full h-10 border border-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t("colors.fields.hex_label")}
                  </label>
                  <input
                    type="text"
                    value={formData.hex}
                    onChange={(e) =>
                      setFormData({ ...formData, hex: e.target.value })
                    }
                    className="w-full border border-slate-200 rounded-lg p-2 outline-none font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t("colors.fields.system_label")}
                </label>
                <select
                  required
                  value={formData.colorSystemId}
                  onChange={(e) =>
                    setFormData({ ...formData, colorSystemId: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-lg p-2.5 outline-none"
                >
                  <option value="">{t("colors.fields.system_select")}</option>
                  {colorSystems.map((sys) => (
                    <option key={sys.id} value={sys.id}>
                      {sys.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition font-medium"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
                >
                  {editingColor
                    ? t("common.save")
                    : t("colors.actions.add_btn")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorsLibrary;
