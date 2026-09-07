import { Navigate, Outlet, useLocation } from "react-router-dom";

function isTokenValid() {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    return false;
  }

  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return false;
    }

    const payload = JSON.parse(
      atob(parts[1])
    );

    if (!payload.exp) {
      return false;
    }

    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function ProtectedRoute() {
  const location = useLocation();

  if (!isTokenValid()) {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUsername");

    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;