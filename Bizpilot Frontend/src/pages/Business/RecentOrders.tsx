import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import { getOrderStats, getRecentOrders, OrderStats, RecentOrder } from "../../services/orderService";

interface ParsedItem {
  name: string;
  price: number;
  qty: number;
}

export default function RecentOrders() {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [statsData, ordersData] = await Promise.all([getOrderStats(), getRecentOrders()]);
        setStats(statsData);
        setOrders(ordersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load orders");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const parseItems = (json: string): ParsedItem[] => {
    try {
      return JSON.parse(json) as ParsedItem[];
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500 text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-0">
      <PageMeta title="Orders" description="View your recent orders and revenue" />
      <PageBreadcrumb pageTitle="Orders" />

      {error && (
        <div className="mb-4 text-xs sm:text-sm text-error-500 bg-error-50 dark:bg-error-500/10 px-3 sm:px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* STATS */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Orders</p>
            <p className="mt-1 text-xl font-semibold text-gray-800 dark:text-white/90">{stats.totalOrders}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Revenue</p>
            <p className="mt-1 text-xl font-semibold text-gray-800 dark:text-white/90">₹{stats.totalRevenue}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <p className="text-xs text-gray-500 dark:text-gray-400">Today's Orders</p>
            <p className="mt-1 text-xl font-semibold text-gray-800 dark:text-white/90">{stats.todayOrders}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <p className="text-xs text-gray-500 dark:text-gray-400">Today's Revenue</p>
            <p className="mt-1 text-xl font-semibold text-gray-800 dark:text-white/90">₹{stats.todayRevenue}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Customers</p>
            <p className="mt-1 text-xl font-semibold text-gray-800 dark:text-white/90">{stats.totalCustomers}</p>
          </div>
        </div>
      )}

      {/* RECENT ORDERS TABLE */}
      <ComponentCard title="Recent Orders">
        {orders.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-left">
                  <th className="py-2 px-3 font-medium text-gray-600 dark:text-gray-300">Customer</th>
                  <th className="py-2 px-3 font-medium text-gray-600 dark:text-gray-300">Phone</th>
                  <th className="py-2 px-3 font-medium text-gray-600 dark:text-gray-300">Items</th>
                  <th className="py-2 px-3 font-medium text-gray-600 dark:text-gray-300">Table</th>
                  <th className="py-2 px-3 font-medium text-gray-600 dark:text-gray-300">Total</th>
                  <th className="py-2 px-3 font-medium text-gray-600 dark:text-gray-300">Time</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const items = parseItems(order.itemsJson);
                  return (
                    <tr key={order.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2 px-3 text-gray-700 dark:text-gray-300">{order.customerName}</td>
                      <td className="py-2 px-3 text-gray-700 dark:text-gray-300">{order.customerPhone}</td>
                      <td className="py-2 px-3 text-gray-700 dark:text-gray-300">
                        {items.map((i) => `${i.name} x${i.qty}`).join(", ")}
                      </td>
                      <td className="py-2 px-3 text-gray-700 dark:text-gray-300">
                        {order.diningIn ? (order.tableNumber || "Yes") : "—"}
                      </td>
                      <td className="py-2 px-3 font-medium text-gray-800 dark:text-white/90">₹{order.totalAmount}</td>
                      <td className="py-2 px-3 text-gray-500 dark:text-gray-400 text-xs">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </ComponentCard>
    </div>
  );
}