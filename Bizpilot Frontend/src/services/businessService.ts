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
  googleMap?: string;
}

export interface BusinessResponse {
  id: number;
  businessName: string;
  slug: string;
  description?: string;
  phone: string;
  email: string;
  whatsapp?: string;
  address?: string;
  googleMap?: string;
  logo?: string;
  coverImage?: string;
  category: BusinessCategory;
  theme: string;
  published: boolean;
}

export async function toggleBusinessPublish(id: number): Promise<BusinessResponse> {
  const response = await fetch(`${API_BASE_URL}/business/${id}/publish`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update publish status");
  return data as BusinessResponse;
}

function authHeaders() {
  const accessToken = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
}

function authHeadersForFile() {
  const accessToken = localStorage.getItem("access_token");
  return {
    Authorization: `Bearer ${accessToken}`,
    // Content-Type mat set karo — browser khud multipart boundary set karega
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
  if (!response.ok) throw new Error(data.message || "Failed to register business");
  return data as BusinessResponse;
}

export async function getMyBusiness(): Promise<BusinessResponse | null> {
  const response = await fetch(`${API_BASE_URL}/business/my`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch business");
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
  if (!response.ok) throw new Error(data.message || "Failed to update business");
  return data as BusinessResponse;
}

export async function uploadLogo(id: number, file: File): Promise<BusinessResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/business/${id}/logo`, {
    method: "POST",
    headers: authHeadersForFile(),
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to upload logo");
  return data as BusinessResponse;
}

export async function uploadCoverImage(id: number, file: File): Promise<BusinessResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/business/${id}/cover-image`, {
    method: "POST",
    headers: authHeadersForFile(),
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to upload cover image");
  return data as BusinessResponse;
}