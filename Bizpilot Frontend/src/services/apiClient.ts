import { API_BASE_URL } from "../config/api";

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      // refresh token bhi invalid/expired hai — logout karna padega
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      window.location.href = "/signin";
      return null;
    }

    const data = await response.json();
    localStorage.setItem("access_token", data.accessToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

// Har protected API call isi function se karo
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const accessToken = localStorage.getItem("access_token");

  const doFetch = (token: string | null) =>
    fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });

  let response = await doFetch(accessToken);

  if (response.status === 401) {
    // Access token expire ho chuka — silently refresh karo
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshAccessToken().finally(() => {
        isRefreshing = false;
      });
    }

    const newToken = await refreshPromise;

    if (newToken) {
      response = await doFetch(newToken); // original request retry karo naye token se
    }
  }

  return response;
}