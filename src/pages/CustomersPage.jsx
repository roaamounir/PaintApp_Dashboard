import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { useTranslation } from "react-i18next"; 
import {
  FiDollarSign,
  FiUser,
  FiPhone,
  FiSearch,
  FiUsers,
  FiTrendingUp,
} from "react-icons/fi";

const CustomersPage = () => {
  const { t } = useTranslation(); 
  const { customers, loading, updateCreditLimit } = useAppContext();
  const [search, setSearch] = useState("");

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const totalCustomers = customers.length;
  const customersWithDebt = customers.filter((c) => c.balance < 0).length;

  return (
    <div className="p-8 bg-slate-50 min-h-screen text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800">
            {t("customers.title")}
          </h1>
          <p className="text-slate-500 text-sm">{t("customers.subtitle")}</p>
        </div>

        <div className="relative">
          <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t("customers.search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10 pl-4 py-2 border rounded-xl w-64 focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={<FiUsers size={22} />}
          label={t("customers.stats.total_customers")}
          value={totalCustomers}
          color="blue"
        />

        <StatCard
          icon={<FiTrendingUp size={22} />}
          label={t("customers.stats.debt_customers")}
          value={customersWithDebt}
          color="red"
        />

        <StatCard
          icon={<FiDollarSign size={22} />}
          label={t("customers.stats.total_exposure")}
          value={`${customers
            .reduce((acc, c) => acc + (c.balance || 0), 0)
            .toLocaleString()} ${t("customers.fields.egp")}`}
          color="emerald"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-100 border-b">
            <tr>
              <th className="p-5 text-slate-500 font-bold">
                {t("customers.table.customer")}
              </th>
              <th className="p-5 text-slate-500 font-bold">
                {t("customers.table.phone")}
              </th>
              <th className="p-5 text-slate-500 font-bold">
                {t("customers.table.balance")}
              </th>
              <th className="p-5 text-slate-500 font-bold">
                {t("customers.table.credit_limit")}
              </th>
              <th className="p-5 text-slate-500 font-bold text-center">
                {t("customers.table.orders")}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50 transition">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                        <FiUser />
                      </div>
                      <div>
                        <p className="font-bold text-slate-700">
                          {customer.name}
                        </p>
                        <p
                          className="text-xs text-slate-400 text-left"
                          dir="ltr"
                        >
                          {customer.email || t("customers.fields.no_email")}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td
                    className="p-5 text-slate-600 font-mono text-left"
                    dir="ltr"
                  >
                    <div className="flex items-center justify-end gap-2">
                      <FiPhone className="text-slate-400" />
                      {customer.phone || t("customers.fields.no_phone")}
                    </div>
                  </td>

                  <td className="p-5 font-bold font-mono">
                    <span
                      className={
                        customer.balance < 0
                          ? "text-red-500"
                          : "text-emerald-600"
                      }
                    >
                      {customer.balance?.toLocaleString() || 0}{" "}
                      {t("customers.fields.egp")}
                    </span>
                  </td>

                  <td className="p-5">
                    <div className="flex items-center gap-2 group">
                      <FiDollarSign className="text-slate-400" />
                      <span className="font-medium">
                        {customer.creditLimit?.toLocaleString() || 0}
                      </span>
                      <button
                        onClick={() => {
                          const newLimit = prompt(
                            t("customers.modals.edit_limit_prompt"),
                            customer.creditLimit,
                          );
                          if (newLimit !== null && !isNaN(newLimit)) {
                            updateCreditLimit(customer.id, Number(newLimit));
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 text-xs bg-slate-100 px-2 py-1 rounded transition-opacity"
                      >
                        {t("common.edit")}
                      </button>
                    </div>
                  </td>

                  <td className="p-5 text-center">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                      {customer.totalOrders || 0}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-10 text-center text-slate-400">
                  {t("customers.empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* =========================
    Stat Card
========================= */
const StatCard = ({ icon, label, value, color }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    red: "bg-red-100 text-red-600",
    emerald: "bg-emerald-100 text-emerald-600",
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-4">
      <div className={`p-4 rounded-xl ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-slate-400 text-sm">{label}</p>
        <p className="text-2xl font-black">{value}</p>
      </div>
    </div>
  );
};

export default CustomersPage;
