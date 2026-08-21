import { API_BASE_URL } from "../config/api";

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
  totalCustomers: number;
}

export interface RecentOrder {
  id: number;
  customerName: string;
  customerPhone: string;
  itemsJson: string;
  totalAmount: number;
  diningIn: boolean | null;
  tableNumber: string | null;
  createdAt: string;
}

export async function getOrderStats(): Promise<OrderStats> {
  const response = await apiFetch(`${API_BASE_URL}/business/orders/stats`, { method: "GET" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to load stats");
  return data as OrderStats;
}

export async function getRecentOrders(): Promise<RecentOrder[]> {
  const response = await apiFetch(`${API_BASE_URL}/business/orders/recent`, { method: "GET" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to load orders");
  return data as RecentOrder[];
}

// apiFetch import karna (jo auto-refresh handle karta hai)
import { apiFetch } from "./apiClient";