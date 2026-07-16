import { API_BASE_URL } from "../config/api";

export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
}

export interface UpdateProfilePayload {
  fullName: string;
  phone: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

function authHeaders() {
  const accessToken = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function getCurrentUser(): Promise<UserResponse> {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    headers: authHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to load profile");
  return data as UserResponse;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<UserResponse> {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update profile");

  // localStorage mein bhi user data sync karo, taaki UserDropdown bhi turant update ho
  localStorage.setItem("user", JSON.stringify(data));

  return data as UserResponse;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/me/password`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Failed to change password");
  }
}