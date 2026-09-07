import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LockKeyhole, Eye, EyeOff } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }

    setLoading(true);

    try {
      const body = new URLSearchParams();

      body.append("grant_type", "password");
      body.append("username", username.trim());
      body.append("password", password);

      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Invalid username or password."
        );
      }

      localStorage.setItem(
        "adminToken",
        data.access_token
      );

      localStorage.setItem(
        "adminUsername",
        data.username
      );

      const redirectPath =
        location.state?.from?.pathname ||
        "/admin";

      navigate(redirectPath, {
        replace: true,
      });
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-[#DCE5F0] bg-white p-8 shadow-xl shadow-[#17213A]/5 sm:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#17213A] text-white">
              <LockKeyhole size={25} />
            </div>

            <h1 className="mt-6 text-3xl font-bold tracking-tight text-[#17213A]">
              Admin Login
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Sign in to manage Research Guru.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                Username
              </label>

              <input
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                placeholder="Enter username"
                autoComplete="username"
                className="w-full rounded-xl border border-[#D9E2ED] bg-[#F8FAFC] px-4 py-3.5 text-sm outline-none transition focus:border-[#17213A] focus:bg-white focus:ring-4 focus:ring-[#17213A]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                Password
              </label>

              <div className="relative">
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-[#D9E2ED] bg-[#F8FAFC] px-4 py-3.5 pr-12 text-sm outline-none transition focus:border-[#17213A] focus:bg-white focus:ring-4 focus:ring-[#17213A]/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:text-[#17213A]"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#17213A] px-5 py-3.5 font-semibold text-white transition hover:bg-[#0F172A] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Signing in..."
                : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;