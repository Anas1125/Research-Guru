const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
export const COOKIE_AUTH = import.meta.env.VITE_COOKIE_AUTH === "true";

export function clearAdminStorage() {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUsername");
}

export async function sessionFetch(endpoint, options = {}) {
  const headers = new Headers(options.headers);
  headers.set("X-RG-CSRF", "1");
  return fetch(endpoint, {...options, headers, credentials:"same-origin", cache:"no-store"});
}

export async function adminLogout() {
  try {
    if (COOKIE_AUTH) {
      const response = await sessionFetch("/api/auth/session/logout", {method:"POST"});
      if (!response.ok) throw new Error("Sign out failed");
    }
    clearAdminStorage();
    window.location.assign("/admin/login");
  } catch {
    window.alert("Could not sign out securely. Please retry.");
  }
}

export async function apiFetch(endpoint, options = {}) {
  const admin = endpoint.startsWith("/api/admin/");
  const headers = new Headers(options.headers);
  const token = !COOKIE_AUTH && admin ? localStorage.getItem("adminToken") : null;
  if (token) headers.set("Authorization", "Bearer " + token);
  const response = COOKIE_AUTH && admin
    ? await sessionFetch(endpoint, {...options, headers})
    : await fetch(API_URL + endpoint, {...options, headers, credentials:"omit"});
  if (admin && response.status === 401) {
    clearAdminStorage();
    if (window.location.pathname.startsWith("/admin") && !window.location.pathname.startsWith("/admin/login")) {
      window.location.assign("/admin/login");
    }
    throw new Error("Your session has expired.");
  }
  return response;
}

export { API_URL };
