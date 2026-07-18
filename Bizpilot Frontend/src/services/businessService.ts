import { API_BASE_URL } from "../config/api";
import { apiFetch } from "./apiClient";

export type BusinessCategory = "RESTAURANT" | "SALON" | "GYM" | "CLINIC";

export interface BusinessRegistrationPayload {
  businessName: string;
  phone: string;
  email: string;
  whatsapp?: string;
  address?: string;
  description?: string;
  category: BusinessCategory;
  googleMap?: string;
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

export interface ThemeOption {
  key: string;
  name: string;
  description: string;
}

export async function registerBusiness(
  payload: BusinessRegistrationPayload
): Promise<BusinessResponse> {
  const response = await apiFetch(`${API_BASE_URL}/business`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to register business");
  return data as BusinessResponse;
}

export async function getMyBusiness(): Promise<BusinessResponse | null> {
  const response = await apiFetch(`${API_BASE_URL}/business/my`, { method: "GET" });
  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch business");
  return data as BusinessResponse;
}

export async function updateBusiness(
  id: number,
  payload: BusinessUpdatePayload
): Promise<BusinessResponse> {
  const response = await apiFetch(`${API_BASE_URL}/business/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update business");
  return data as BusinessResponse;
}

export async function uploadLogo(id: number, file: File): Promise<BusinessResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiFetch(`${API_BASE_URL}/business/${id}/logo`, {
    method: "POST",
    body: formData, // Content-Type mat lagao, browser khud multipart boundary set karega
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to upload logo");
  return data as BusinessResponse;
}

export async function uploadCoverImage(id: number, file: File): Promise<BusinessResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiFetch(`${API_BASE_URL}/business/${id}/cover-image`, {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to upload cover image");
  return data as BusinessResponse;
}

export async function toggleBusinessPublish(id: number): Promise<BusinessResponse> {
  const response = await apiFetch(`${API_BASE_URL}/business/${id}/publish`, {
    method: "PATCH",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update publish status");
  return data as BusinessResponse;
}

export async function getAvailableThemes(): Promise<ThemeOption[]> {
  const response = await apiFetch(`${API_BASE_URL}/business/themes`, { method: "GET" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to load themes");
  return data as ThemeOption[];
}

export async function selectTheme(id: number, theme: string): Promise<BusinessResponse> {
  const response = await apiFetch(`${API_BASE_URL}/business/${id}/theme`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ theme }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to select theme");
  return data as BusinessResponse;
}


// import { API_BASE_URL } from "../config/api";
// import { apiFetch } from "./apiClient";


// export type BusinessCategory = "RESTAURANT" | "SALON" | "GYM" | "CLINIC";

// export interface BusinessRegistrationPayload {
//   businessName: string;
//   phone: string;
//   email: string;
//   whatsapp?: string;
//   address?: string;
//   description?: string;
//   category: BusinessCategory;
//   googleMap: string;
// }

// export interface BusinessUpdatePayload {
//   businessName: string;
//   phone: string;
//   email: string;
//   whatsapp?: string;
//   address?: string;
//   description?: string;
//   googleMap?: string;
// }

// export interface BusinessResponse {
//   id: number;
//   businessName: string;
//   slug: string;
//   description?: string;
//   phone: string;
//   email: string;
//   whatsapp?: string;
//   address?: string;
//   googleMap?: string;
//   logo?: string;
//   coverImage?: string;
//   category: BusinessCategory;
//   theme: string;
//   published: boolean;
// }

// export async function toggleBusinessPublish(id: number): Promise<BusinessResponse> {
//   const response = await fetch(`${API_BASE_URL}/business/${id}/publish`, {
//     method: "PATCH",
//     headers: authHeaders(),
//   });
//   const data = await response.json();
//   if (!response.ok) throw new Error(data.message || "Failed to update publish status");
//   return data as BusinessResponse;
// }

// function authHeaders() {
//   const accessToken = localStorage.getItem("access_token");
//   return {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${accessToken}`,
//   };
// }

// function authHeadersForFile() {
//   const accessToken = localStorage.getItem("access_token");
//   return {
//     Authorization: `Bearer ${accessToken}`,
//     // Content-Type mat set karo — browser khud multipart boundary set karega
//   };
// }

// export async function registerBusiness(
//   payload: BusinessRegistrationPayload
// ): Promise<BusinessResponse> {
//   const response = await fetch(`${API_BASE_URL}/business`, {
//     method: "POST",
//     headers: authHeaders(),
//     body: JSON.stringify(payload),
//   });
//   const data = await response.json();
//   if (!response.ok) throw new Error(data.message || "Failed to register business");
//   return data as BusinessResponse;
// }

// export async function getMyBusiness(): Promise<BusinessResponse | null> {
//   const response = await apiFetch(`${API_BASE_URL}/business/my`, { 
//     method: "GET" });
//   if (response.status === 204) return null;
//   const data = await response.json();
//   if (!response.ok) throw new Error(data.message || "Failed to fetch business");
//   return data as BusinessResponse;
// }

// export async function updateBusiness(
//   id: number,
//   payload: BusinessUpdatePayload
// ): Promise<BusinessResponse> {
//   const response = await fetch(`${API_BASE_URL}/business/${id}`, {
//     method: "PUT",
//     headers: authHeaders(),
//     body: JSON.stringify(payload),
//   });
//   const data = await response.json();
//   if (!response.ok) throw new Error(data.message || "Failed to update business");
//   return data as BusinessResponse;
// }

// export async function uploadLogo(id: number, file: File): Promise<BusinessResponse> {
//   const formData = new FormData();
//   formData.append("file", file);

//   const response = await fetch(`${API_BASE_URL}/business/${id}/logo`, {
//     method: "POST",
//     headers: authHeadersForFile(),
//     body: formData,
//   });
//   const data = await response.json();
//   if (!response.ok) throw new Error(data.message || "Failed to upload logo");
//   return data as BusinessResponse;
// }

// export async function uploadCoverImage(id: number, file: File): Promise<BusinessResponse> {
//   const formData = new FormData();
//   formData.append("file", file);

//   const response = await fetch(`${API_BASE_URL}/business/${id}/cover-image`, {
//     method: "POST",
//     headers: authHeadersForFile(),
//     body: formData,
//   });
//   const data = await response.json();
//   if (!response.ok) throw new Error(data.message || "Failed to upload cover image");
//   return data as BusinessResponse;
// }

// export interface ThemeOption {
//   key: string;
//   name: string;
//   description: string;
// }

// export async function getAvailableThemes(): Promise<ThemeOption[]> {
//   const response = await fetch(`${API_BASE_URL}/business/themes`, {
//     headers: authHeaders(),
//   });
//   const data = await response.json();
//   if (!response.ok) throw new Error(data.message || "Failed to load themes");
//   return data as ThemeOption[];
// }

// export async function selectTheme(id: number, theme: string): Promise<BusinessResponse> {
//   const response = await fetch(`${API_BASE_URL}/business/${id}/theme`, {
//     method: "PUT",
//     headers: authHeaders(),
//     body: JSON.stringify({ theme }),
//   });
//   const data = await response.json();
//   if (!response.ok) throw new Error(data.message || "Failed to select theme");
//   return data as BusinessResponse;
// }