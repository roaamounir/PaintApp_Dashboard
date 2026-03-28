import React, { useEffect, useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import {
  FiBox,
  FiActivity,
  FiAlertCircle,
  FiShoppingCart,
} from "react-icons/fi";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useTranslation } from "react-i18next";
import { getJwtRole } from "../utils/jwtUser.js";

const Overview = () => {
  const { t } = useTranslation();
  const { orders, paints, loadingStates, fetchOrders, fetchPaints } = useAppContext();
  const isVendor = getJwtRole() === "vendor";
  const pageLoading = Boolean(loadingStates?.orders || loadingStates?.paints);

  useEffect(() => {
    fetchOrders();
    fetchPaints();
  }, [fetchOrders, fetchPaints]);

  const salesChartData = useMemo(() => {
    return orders
      .slice(0, 7)
      .reverse()
      .map((order) => ({
        name: `#${order.id.toString().slice(-3)}`,
        amount: order.totalPrice || 0,
      }));
  }, [orders]);

  const sourceData = useMemo(() => {
    if (isVendor) {
      const pending = orders.filter((o) => o.status === "pending").length;
      const other = Math.max(0, orders.length - pending);
      return [
        { name: t("painters.status.pending"), value: pending },
        { name: t("overview.vendor.status_other"), value: other },
      ];
    }
    const appCount = orders.filter((o) => o.source === "APP").length;
    const posCount = orders.filter((o) => o.source !== "APP").length;
    return [
      { name: t("overview.charts.mobile_app"), value: appCount },
      { name: t("overview.charts.pos_system"), value: posCount },
    ];
  }, [orders, t, isVendor]);

  const COLORS = ["#6366f1", "#10b981"];
  const totalSales = orders.reduce(
    (sum, order) => sum + (order.totalPrice || 0),
    0,
  );

  const lowStockCount = paints.filter(
    (p) => p.stock <= (p.minStockLevel || 5),
  ).length;

  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  const immediateAlerts = paints.filter(
    (paint) =>
      paint.stock <= paint.minStockLevel ||
      paint.status === "low_stock" ||
      paint.status === "out_of_stock",
  );

  const openVendorOrders = orders.filter((o) =>
    ["pending", "processing"].includes(String(o.status || "").toLowerCase()),
  ).length;

  const stats = isVendor
    ? [
        {
          label: t("overview.vendor.stats_total_purchases"),
          value: `${totalSales.toLocaleString()} EGP`,
          icon: FiActivity,
          color: "text-blue-600",
          bg: "bg-blue-100",
        },
        {
          label: t("overview.vendor.stats_open_orders"),
          value: openVendorOrders,
          icon: FiShoppingCart,
          color: "text-purple-600",
          bg: "bg-purple-100",
        },
        {
          label: t("overview.vendor.stats_orders_count"),
          value: orders.length,
          icon: FiBox,
          color: "text-emerald-600",
          bg: "bg-emerald-100",
        },
        {
          label: t("overview.vendor.stats_catalog"),
          value: paints.length,
          icon: FiBox,
          color: "text-green-600",
          bg: "bg-green-100",
        },
      ]
    : [
        {
          label: t("overview.stats.today_sales"),
          value: `${totalSales.toLocaleString()} EGP`,
          icon: FiActivity,
          color: "text-blue-600",
          bg: "bg-blue-100",
        },
        {
          label: t("overview.stats.pending_orders"),
          value: pendingOrders,
          icon: FiShoppingCart,
          color: "text-purple-600",
          bg: "bg-purple-100",
        },
        {
          label: t("overview.stats.low_stock"),
          value: lowStockCount,
          icon: FiAlertCircle,
          color: "text-red-600",
          bg: "bg-red-100",
        },
        {
          label: t("overview.stats.total_products"),
          value: paints.length,
          icon: FiBox,
          color: "text-green-600",
          bg: "bg-green-100",
        },
      ];

  if (pageLoading)
    return (
      <div className="p-10 text-center text-gray-400 text-lg italic">
        {t("overview.loading")}
      </div>
    );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
          {isVendor ? t("overview.vendor.title") : t("overview.title")}
        </h1>
        <p className="text-gray-500 mt-1 text-lg max-w-3xl">
          {isVendor ? t("overview.vendor.subtitle") : t("overview.subtitle")}
        </p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center gap-4"
          >
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Sales Trend Chart */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            {isVendor ? t("overview.vendor.recent_order_totals") : t("overview.charts.sales_trend")}
          </h3>
          <div className="w-full" style={{ minHeight: 280, height: 300 }}>
            <ResponsiveContainer width="100%" height={300} minHeight={200}>
              <AreaChart data={salesChartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "15px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorSales)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Source Distribution Pie */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            {isVendor ? t("overview.vendor.chart_order_status") : t("overview.charts.sales_source")}
          </h3>
          <div className="w-full" style={{ minHeight: 280, height: 300 }}>
            <ResponsiveContainer width="100%" height={300} minHeight={200}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  iconType="circle"
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Transactions and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Latest Transactions */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-gray-800">
              {t("overview.transactions.title")}
            </h3>
            <button className="px-4 py-2 bg-slate-50 text-blue-600 rounded-xl font-bold">
              {t("overview.transactions.view_all")}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-gray-400 text-xs uppercase tracking-widest border-b border-gray-50">
                  <th className="text-start pb-4">
                    {t("overview.transactions.order_id")}
                  </th>
                  <th className="text-start pb-4">
                    {t("overview.transactions.customer")}
                  </th>
                  <th className="text-start pb-4">
                    {t("overview.transactions.source")}
                  </th>
                  <th className="text-start pb-4">
                    {t("overview.transactions.status")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.slice(0, 5).map((order) => (
                  <tr
                    key={order.id}
                    className="group hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-4 font-bold text-gray-700">
                      #{order.id.toString().slice(-5)}
                    </td>
                    <td className="py-4 text-gray-600 font-medium">
                      {order.user?.name || t("overview.transactions.walk_in")}
                    </td>
                    <td className="py-4">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          order.source === "wholesale"
                            ? "bg-amber-50 text-amber-700"
                            : order.source === "APP"
                              ? "bg-indigo-50 text-indigo-600"
                              : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {order.source === "wholesale"
                          ? t("overview.vendor.source_wholesale")
                          : order.source === "APP"
                            ? t("overview.charts.mobile_app")
                            : t("overview.charts.pos_system")}
                      </span>
                    </td>
                    <td className="py-4">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${order.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h3 className="font-bold text-gray-800 text-xl mb-6 flex items-center gap-2">
            <FiAlertCircle className={isVendor ? "text-amber-500" : "text-red-500"} />{" "}
            {isVendor ? t("overview.vendor.sidebar_hint_title") : t("overview.alerts.title")}
          </h3>
          {isVendor ? (
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <p>{t("overview.vendor.sidebar_hint")}</p>
              <p className="text-gray-400 text-xs">{t("overview.vendor.no_alerts_vendor")}</p>
            </div>
          ) : immediateAlerts.length > 0 ? (
            <div className="space-y-4">
              {immediateAlerts.map((paint) => (
                <div
                  key={paint.id}
                  className="p-4 bg-red-50/50 border border-red-100 rounded-2xl flex flex-col gap-3"
                >
                  <div>
                    <p className="font-bold text-gray-800">{paint.name}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-red-600 font-bold">
                        {t("overview.alerts.units")}: {paint.stock}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium italic">
                        {t("overview.alerts.limit")}: {paint.minStockLevel}
                      </span>
                    </div>
                  </div>
                  <button className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all">
                    {t("overview.alerts.order_stock")}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                ✔
              </div>
              <p className="text-sm text-gray-400 font-medium">
                {t("overview.alerts.healthy")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;
