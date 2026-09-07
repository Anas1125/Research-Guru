const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

export async function apiFetch(
  endpoint,
  options = {}
) {
  const token =
    localStorage.getItem(
      "adminToken"
    );

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  const response =
    await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,
        headers,
      }
    );

  if (response.status === 401) {
    localStorage.removeItem(
      "adminToken"
    );

    localStorage.removeItem(
      "adminUsername"
    );

    if (
      window.location.pathname.startsWith(
        "/admin"
      ) &&
      window.location.pathname !==
        "/admin/login"
    ) {
      window.location.href =
        "/admin/login";
    }

    throw new Error(
      "Your session has expired."
    );
  }

  return response;
}


export { API_URL };