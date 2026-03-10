import React, { useState } from "react";
import { Trash2, Edit, Plus, Search, Loader2, X } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; 

const Users = () => {
  const { t } = useTranslation(); 
  const { users, deleteUser, updateUser, loading, addUser } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "user",
    password: "",
    status: true,
  });

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase().trim();
    return (
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.phone?.includes(search)
    );
  });

  const openEditModal = (user) => {
    navigate(`/users/${user.id}`);
  };

  const handleUpdate = async () => {
    const res = await updateUser(currentUser.id, currentUser);
    if (res.success) setIsEditOpen(false);
  };

  const handleAddUser = async () => {
    if (
      !newUser.name ||
      !newUser.email ||
      !newUser.password ||
      !newUser.phone
    ) {
      alert(t("users.alerts.fill_all_fields"));
      return;
    }

    const res = await addUser(newUser);
    if (res.success) {
      setIsAddOpen(false);
      setNewUser({
        name: "",
        email: "",
        phone: "",
        role: "user",
        password: "",
        status: true,
      });
    }
  };

  const AVAILABLE_PERMISSIONS = [
    { id: "manage_users", label: t("users.permissions.manage_users") },
    { id: "manage_stock", label: t("users.permissions.manage_stock") },
    { id: "edit_prices", label: t("users.permissions.edit_prices") },
    { id: "view_reports", label: t("users.permissions.view_reports") },
    { id: "manage_orders", label: t("users.permissions.manage_orders") },
    { id: "color_tools", label: t("users.permissions.color_tools") },
  ];

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {t("users.title")}
          </h1>
          <p className="text-slate-500 text-sm">{t("users.subtitle")}</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition shadow-md font-bold text-sm"
        >
          <Plus size={18} /> {t("users.actions.add_new")}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t("users.search_placeholder")}
          className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition shadow-sm"
        />
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-800">
            {t("users.table.list_title")}
          </h2>
          {loading && (
            <Loader2 className="animate-spin text-blue-500" size={20} />
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[11px] tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">{t("users.table.profile")}</th>
                <th className="px-6 py-4">{t("users.table.role")}</th>
                <th className="px-6 py-4">{t("users.table.status")}</th>
                <th className="px-6 py-4 text-center">
                  {t("users.table.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-700">
                        {user.name}
                      </div>
                      <div className="text-slate-400 text-xs">{user.email}</div>
                      <div className="text-blue-500 text-[10px] font-medium">
                        {user.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          updateUser(user.id, { role: e.target.value })
                        }
                        className="bg-white border border-slate-200 text-slate-600 text-[11px] font-bold rounded-lg px-2 py-1 outline-none"
                      >
                        <option value="user">
                          {t("users.roles.user").toUpperCase()}
                        </option>
                        <option value="admin">
                          {t("users.roles.admin").toUpperCase()}
                        </option>
                        <option value="painter">
                          {t("users.roles.painter").toUpperCase()}
                        </option>
                        <option value="vendor">
                          {t("users.roles.vendor").toUpperCase()}
                        </option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          updateUser(user.id, { status: !user.status })
                        }
                        className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                          user.status
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {user.status
                          ? `● ${t("users.status.active")}`
                          : `○ ${t("users.status.inactive")}`}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 text-slate-400 hover:text-blue-600 transition"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(t("users.alerts.confirm_delete"))
                            )
                              deleteUser(user.id);
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-12 text-center text-slate-400 italic"
                  >
                    {loading ? t("users.loading") : t("users.no_results")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditOpen && currentUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">
                {t("users.modals.edit_title")}
              </h3>
              <button onClick={() => setIsEditOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">
                  {t("users.fields.name")}
                </label>
                <input
                  type="text"
                  value={currentUser.name}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, name: e.target.value })
                  }
                  className="w-full border rounded-lg p-2.5 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">
                  {t("users.fields.email")}
                </label>
                <input
                  type="email"
                  value={currentUser.email}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, email: e.target.value })
                  }
                  className="w-full border rounded-lg p-2.5 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">
                  {t("users.fields.phone")}
                </label>
                <input
                  type="text"
                  value={currentUser.phone}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, phone: e.target.value })
                  }
                  className="w-full border rounded-lg p-2.5 outline-none focus:border-blue-500"
                />
              </div>
              <div className="mt-4 border-t pt-4">
                <h4 className="text-sm font-bold text-slate-700 mb-3">
                  {t("users.permissions.title")}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {AVAILABLE_PERMISSIONS.map((perm) => (
                    <label
                      key={perm.id}
                      className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={currentUser?.permissions?.[perm.id] || false}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setCurrentUser((prev) => ({
                            ...prev,
                            permissions: {
                              ...(prev?.permissions || {}),
                              [perm.id]: isChecked,
                            },
                          }));
                        }}
                        className="w-4 h-4 rounded text-blue-600"
                      />
                      <span className="text-[11px] font-medium text-slate-600">
                        {perm.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-slate-500 text-sm font-semibold px-4"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleUpdate}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-sm"
              >
                {t("users.actions.save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-blue-600 text-white">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Plus size={20} /> {t("users.modals.add_title")}
              </h3>
              <button onClick={() => setIsAddOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <input
                type="text"
                placeholder={t("users.fields.name")}
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
                className="w-full border rounded-xl p-3 text-sm outline-none focus:border-blue-500"
              />
              <input
                type="email"
                placeholder={t("users.fields.email")}
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                className="w-full border rounded-xl p-3 text-sm outline-none focus:border-blue-500"
              />
              <input
                type="text"
                placeholder={t("users.fields.phone_req")}
                value={newUser.phone}
                onChange={(e) =>
                  setNewUser({ ...newUser, phone: e.target.value })
                }
                className="w-full border rounded-xl p-3 text-sm outline-none focus:border-blue-500"
              />
              <input
                type="password"
                placeholder={t("users.fields.password")}
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                className="w-full border rounded-xl p-3 text-sm outline-none focus:border-blue-500"
              />
              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
                className="w-full border rounded-xl p-3 text-sm font-bold text-slate-600"
              >
                <option value="user">{t("users.roles.user")}</option>
                <option value="admin">{t("users.roles.admin")}</option>
                <option value="painter">{t("users.roles.painter")}</option>
                <option value="vendor">{t("users.roles.vendor")}</option>
              </select>
            </div>
            <div className="p-6 bg-slate-50 flex flex-col gap-3">
              <button
                onClick={handleAddUser}
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg flex justify-center items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  t("users.actions.create_now")
                )}
              </button>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 text-xs font-semibold"
              >
                {t("common.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
