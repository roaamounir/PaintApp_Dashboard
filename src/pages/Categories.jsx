import React, { useState } from "react";
import { useTranslation } from "react-i18next"; 
import {
  Trash2,
  Edit,
  Plus,
  Search,
  FolderTree,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

const Categories = () => {
  const { t } = useTranslation();
  const {
    categories,
    addCategory,
    deleteCategory,
    updateCategory,
    loadingStates,
  } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryAr, setNewCategoryAr] = useState("");
  const [newCategoryEn, setNewCategoryEn] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editNameAr, setEditNameAr] = useState("");
  const [editNameEn, setEditNameEn] = useState("");

  const filteredCategories = categories.filter((cat) =>
    [cat.name, cat.nameAr, cat.nameEn]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCategoryAr.trim() || !newCategoryEn.trim()) return;
    const res = await addCategory({ nameAr: newCategoryAr, nameEn: newCategoryEn });
    if (res.success) {
      setNewCategoryAr("");
      setNewCategoryEn("");
      setIsAdding(false);
    }
  };

  const handleUpdate = async (id) => {
    if (!editNameAr.trim() || !editNameEn.trim()) {
      setEditingId(null);
      return;
    }
    const res = await updateCategory(id, { nameAr: editNameAr, nameEn: editNameEn });
    if (res.success) {
      setEditingId(null);
      setEditNameAr("");
      setEditNameEn("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {t("categories.title")}
          </h1>
          <p className="text-slate-500 text-sm">{t("categories.subtitle")}</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition shadow-sm font-medium"
        >
          {isAdding ? (
            t("common.cancel")
          ) : (
            <>
              <Plus size={18} /> {t("categories.actions.new")}
            </>
          )}
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="bg-white p-4 rounded-2xl border border-blue-100 shadow-md flex gap-3 animate-in fade-in zoom-in duration-200"
        >
          <input
            type="text"
            placeholder={t("categories.fields.placeholder_ar")}
            value={newCategoryAr}
            onChange={(e) => setNewCategoryAr(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            autoFocus
          />
          <input
            type="text"
            placeholder={t("categories.fields.placeholder_en")}
            value={newCategoryEn}
            onChange={(e) => setNewCategoryEn(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            type="submit"
            disabled={loadingStates?.categories}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-medium"
          >
            {loadingStates?.categories ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              t("common.save")
            )}
          </button>
        </form>
      )}

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          type="text"
          placeholder={t("categories.fields.search")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">{t("categories.table.name_ar")}</th>
              <th className="px-6 py-4">{t("categories.table.name_en")}</th>
              <th className="px-6 py-4 text-center">
                {t("categories.table.count")}
              </th>
              <th className="px-6 py-4 text-center">
                {t("categories.table.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat) => (
                <tr
                  key={cat.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4 font-semibold text-slate-700 flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <FolderTree size={16} />
                    </div>
                    {editingId === cat.id ? (
                      <input
                        className="bg-slate-50 border-b-2 border-blue-500 outline-none px-2 py-1 rounded"
                        value={editNameAr}
                        onChange={(e) => setEditNameAr(e.target.value)}
                        autoFocus
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleUpdate(cat.id)
                        }
                      />
                    ) : (
                      cat.nameAr || cat.name
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">
                    {editingId === cat.id ? (
                      <input
                        className="bg-slate-50 border-b-2 border-blue-500 outline-none px-2 py-1 rounded w-full"
                        value={editNameEn}
                        onChange={(e) => setEditNameEn(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleUpdate(cat.id)
                        }
                      />
                    ) : (
                      cat.nameEn || cat.name
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-bold text-slate-700">
                    {cat._count?.paints || 0}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      {editingId === cat.id ? (
                        <>
                          <button
                            onClick={() => handleUpdate(cat.id)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-2 text-red-400 hover:bg-red-50 rounded-lg"
                          >
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingId(cat.id);
                              setEditNameAr(cat.nameAr || cat.name || "");
                              setEditNameEn(cat.nameEn || cat.name || "");
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => deleteCategory(cat.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-10 text-slate-400">
                  {t("categories.empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Categories;
