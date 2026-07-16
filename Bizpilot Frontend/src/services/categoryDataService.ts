import { API_BASE_URL } from "../config/api";

export interface CategoryField {
  key: string;
  label: string;
  type: string;
}

export interface CategoryConfigResponse {
  category: string;
  dashboardSectionLabel: string;
  fields: CategoryField[];
}

export interface CategoryRowResponse {
  rowId: string;
  sortOrder: number;
  fields: Record<string, string>;
}

function authHeaders() {
  const accessToken = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function uploadCategoryItemImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const accessToken = localStorage.getItem("access_token");

  const response = await fetch(`${API_BASE_URL}/business/category-data/image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      // Content-Type mat lagao — browser khud multipart boundary set karega
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to upload image");
  return data.path as string;
}

export async function getCategoryConfig(): Promise<CategoryConfigResponse> {
  const response = await fetch(`${API_BASE_URL}/business/category-data/config`, {
    headers: authHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to load category config");
  return data as CategoryConfigResponse;
}

export async function getCategoryRows(): Promise<CategoryRowResponse[]> {
  const response = await fetch(`${API_BASE_URL}/business/category-data/rows`, {
    headers: authHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to load rows");
  return data as CategoryRowResponse[];
}

export async function saveCategoryRow(
  fields: Record<string, string>
): Promise<CategoryRowResponse> {
  const response = await fetch(`${API_BASE_URL}/business/category-data/row`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ fields }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to save row");
  return data as CategoryRowResponse;
}

export async function updateCategoryRow(
  rowId: string,
  fields: Record<string, string>
): Promise<CategoryRowResponse> {
  const response = await fetch(`${API_BASE_URL}/business/category-data/row/${rowId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ fields }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update row");
  return data as CategoryRowResponse;
}

export async function deleteCategoryRow(rowId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/business/category-data/row/${rowId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Failed to delete row");
  }
}