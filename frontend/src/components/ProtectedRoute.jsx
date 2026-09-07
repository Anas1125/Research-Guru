import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function getTokenExpiry() {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    return null;
  }

  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(atob(parts[1]));

    if (!payload.exp) {
      return null;
    }

    return payload.exp * 1000;
  } catch {
    return null;
  }
}

function isTokenValid() {
  const expiry = getTokenExpiry();

  if (!expiry) {
    return false;
  }

  return expiry > Date.now();
}

function logout() {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUsername");
}

function ProtectedRoute() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(
    isTokenValid()
  );

  useEffect(() => {
    const expiry = getTokenExpiry();

    if (!expiry) {
      logout();
      setIsAuthenticated(false);
      return;
    }

    const remainingTime = expiry - Date.now();

    if (remainingTime <= 0) {
      logout();
      setIsAuthenticated(false);
      navigate("/admin/login", {
        replace: true,
        state: {
          from: location,
        },
      });
      return;
    }

    const timer = setTimeout(() => {
      logout();
      setIsAuthenticated(false);

      navigate("/admin/login", {
        replace: true,
        state: {
          from: location,
        },
      });
    }, remainingTime);

    return () => clearTimeout(timer);
  }, [navigate, location]);

  useEffect(() => {
    const handlePopState = () => {
      if (!isTokenValid()) {
        logout();

        navigate("/admin/login", {
          replace: true,
        });
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  if (!isAuthenticated) {
    logout();

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