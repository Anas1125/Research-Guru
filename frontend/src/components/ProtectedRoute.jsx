import { COOKIE_AUTH, sessionFetch, clearAdminStorage } from "../utils/api";
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

function LegacyProtectedRoute() {
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

function CookieProtectedRoute() {
  const location = useLocation();
  const [state, setState] = useState("loading");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    async function check() {
      try {
        localStorage.removeItem("adminToken");
        const response = await sessionFetch("/api/auth/session/me");
        if (!active) return;
        if (response.status === 401) {
          clearAdminStorage();
          setState("anonymous");
        } else if (response.ok) {
          const data = await response.json();
          if (!active) return;
          localStorage.setItem("adminUsername", data.username);
          setState("authenticated");
        } else setState("error");
      } catch { if (active) setState("error"); }
    }
    check();
    const timer = setInterval(check, 30000);
    window.addEventListener("focus", check);
    return () => { active = false; clearInterval(timer); window.removeEventListener("focus", check); };
  }, [retry]);
  if (state === "anonymous") return <Navigate to="/admin/login" replace state={{from:location}} />;
  if (state === "error") return <div className="p-8">Unable to verify session. <button onClick={()=>{setState("loading");setRetry(x=>x+1);}}>Retry</button></div>;
  if (state !== "authenticated") return <div className="p-8">Checking session…</div>;
  return <Outlet />;
}
function ProtectedRoute() {
  return COOKIE_AUTH ? <CookieProtectedRoute /> : <LegacyProtectedRoute />;
}
export default ProtectedRoute;