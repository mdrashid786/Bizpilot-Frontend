import { API_BASE_URL } from "../config/api";

export type BusinessCategory = "RESTAURANT" | "SALON" | "GYM" | "CLINIC";

export interface BusinessRegistrationPayload {
  businessName: string;
  phone: string;
  email: string;
  whatsapp?: string;
  address?: string;
  description?: string;
  category: BusinessCategory;
}

export interface BusinessUpdatePayload {
  businessName: string;
  phone: string;
  email: string;
  whatsapp?: string;
  address?: string;
  description?: string;
}

export interface BusinessResponse {
  id: number;
  businessName: string;
  slug: string;
  phone: string;
  email: string;
  whatsapp?: string;
  address?: string;
  description?: string;
  category: BusinessCategory;
  theme: string;
  published: boolean;
}

function authHeaders() {
  const accessToken = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function registerBusiness(
  payload: BusinessRegistrationPayload
): Promise<BusinessResponse> {
  const response = await fetch(`${API_BASE_URL}/business`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to register business");
  }

  return data as BusinessResponse;
}

export async function getMyBusiness(): Promise<BusinessResponse | null> {
  const response = await fetch(`${API_BASE_URL}/business/my`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (response.status === 204) {
    return null; // business abhi bana hi nahi
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch business");
  }

  return data as BusinessResponse;
}

export async function updateBusiness(
  id: number,
  payload: BusinessUpdatePayload
): Promise<BusinessResponse> {
  const response = await fetch(`${API_BASE_URL}/business/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update business");
  }

  return data as BusinessResponse;
}