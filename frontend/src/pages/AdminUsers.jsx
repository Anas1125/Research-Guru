import { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Menu,
  Eye,
  EyeOff,
  UserCog,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import AdminSidebar from "../components/AdminSidebar";

function AdminUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    username: "",
    password: "",
    is_active: true,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const currentUsername =
    localStorage.getItem("adminUsername") || "Admin";

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch("/api/admin/users");

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.detail || "Failed to load admin users."
        );
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(
        err.message || "Failed to load admin users."
      );
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingUser(null);

    setForm({
      username: "",
      password: "",
      is_active: true,
    });

    setError("");
    setSuccess("");
    setShowPassword(false);
    setModalOpen(true);
  }

  function openEditModal(user) {
    setEditingUser(user);

    setForm({
      username: user.username || "",
      password: "",
      is_active: user.is_active,
    });

    setError("");
    setSuccess("");
    setShowPassword(false);
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingUser(null);

    setForm({
      username: "",
      password: "",
      is_active: true,
    });

    setShowPassword(false);
  }

  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const username = form.username.trim();
    const password = form.password;

    if (!username) {
      setError("Username is required.");
      return;
    }

    if (!editingUser && password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (
      editingUser &&
      password &&
      password.length < 8
    ) {
      setError(
        "New password must be at least 8 characters."
      );
      return;
    }

    try {
      setSaving(true);

      let response;

      if (editingUser) {
        const payload = {
          username,
          is_active: form.is_active,
        };

        if (password) {
          payload.password = password;
        }

        response = await apiFetch(
          `/api/admin/users/${editingUser.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
      } else {
        response = await apiFetch(
          "/api/admin/users",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username,
              password,
            }),
          }
        );
      }

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            `Failed to ${
              editingUser ? "update" : "create"
            } admin user.`
        );
      }

      setSuccess(
        editingUser
          ? "Admin user updated successfully."
          : "Admin user created successfully."
      );

      await loadUsers();

      setTimeout(() => {
        closeModal();
      }, 600);
    } catch (err) {
      setError(
        err.message ||
          `Failed to ${
            editingUser ? "update" : "create"
          } admin user.`
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user) {
    if (deletingId) {
      return;
    }

    const isCurrentUser =
      user.username === currentUsername;

    if (isCurrentUser) {
      setError(
        "You cannot delete your own admin account."
      );
      setSuccess("");
      return;
    }

    const confirmed = window.confirm(
      `Delete admin user "${user.username}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(user.id);
      setError("");
      setSuccess("");

      const response = await apiFetch(
        `/api/admin/users/${user.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Failed to delete admin user."
        );
      }

      setSuccess(
        "Admin user deleted successfully."
      );

      await loadUsers();
    } catch (err) {
      setError(
        err.message ||
          "Failed to delete admin user."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function handleLogout() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUsername");
    navigate("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#F5F8FC] text-[#17213A]">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 cursor-pointer bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 bg-[#17213A] lg:block">
        <AdminSidebar
          currentPage="/admin/users"
          onLogout={handleLogout}
        />
      </aside>

      {/* MOBILE SIDEBAR */}
      {sidebarOpen && (
        <aside className="fixed inset-y-0 left-0 z-[60] w-72 bg-[#17213A] shadow-2xl lg:hidden">
          <AdminSidebar
            currentPage="/admin/users"
            mobile
            onClose={() => setSidebarOpen(false)}
            onLogout={handleLogout}
          />
        </aside>
      )}

      {/* MAIN */}
      <main className="lg:ml-64">
        {/* HEADER */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-[76px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="cursor-pointer rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
                aria-label="Open admin menu"
              >
                <Menu size={22} />
              </button>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Administration
                </p>

                <h1 className="mt-1 text-xl font-bold text-[#17213A] sm:text-2xl">
                  Admin Management
                </h1>

                <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                  Manage administrator accounts and access.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#17213A] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0F172A]"
            >
              <Plus size={18} />

              <span className="hidden sm:inline">
                Add Admin
              </span>
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* ALERTS */}
          {error && (
            <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              <span>{error}</span>

              <button
                type="button"
                onClick={() => setError("")}
                className="shrink-0 cursor-pointer"
                aria-label="Dismiss error"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {success && (
            <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              <span>{success}</span>

              <button
                type="button"
                onClick={() => setSuccess("")}
                className="shrink-0 cursor-pointer"
                aria-label="Dismiss success"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {/* SUMMARY */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            {/* TOTAL */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Admins
                  </p>

                  <p className="mt-2 text-3xl font-bold text-[#17213A]">
                    {loading ? "—" : users.length}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF1FA] text-[#17213A]">
                  <Users size={22} />
                </div>
              </div>
            </div>

            {/* ACTIVE */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Active Admins
                  </p>

                  <p className="mt-2 text-3xl font-bold text-[#17213A]">
                    {loading
                      ? "—"
                      : users.filter(
                          (user) => user.is_active
                        ).length}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Check size={22} />
                </div>
              </div>
            </div>
          </div>

          {/* ADMIN ACCOUNTS */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF1FA] text-[#17213A]">
                  <UserCog size={20} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-[#17213A]">
                    Administrator Accounts
                  </h2>

                  <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                    Accounts with access to the Research Guru admin panel.
                  </p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-[#17213A]" />
                  Loading administrators...
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF1FA] text-[#17213A]">
                  <Users size={25} />
                </div>

                <h3 className="mt-5 font-semibold text-[#17213A]">
                  No administrators found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Add an administrator to manage the website.
                </p>

                <button
                  type="button"
                  onClick={openAddModal}
                  className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#17213A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0F172A]"
                >
                  <Plus size={17} />
                  Add Administrator
                </button>
              </div>
            ) : (
              <>
                {/* DESKTOP TABLE */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Username
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Status
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Account
                        </th>

                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {users.map((user) => {
                        const isCurrentUser =
                          user.username === currentUsername;

                        return (
                          <tr
                            key={user.id}
                            className="transition hover:bg-slate-50"
                          >
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAF1FA] text-sm font-bold text-[#17213A]">
                                  {user.username
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>

                                <div className="min-w-0">
                                  <p className="font-semibold text-[#17213A]">
                                    {user.username}
                                  </p>

                                  {isCurrentUser && (
                                    <p className="mt-0.5 text-xs font-medium text-slate-500">
                                      Current account
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-5">
                              {user.is_active ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                  Inactive
                                </span>
                              )}
                            </td>

                            <td className="px-6 py-5 text-sm text-slate-500">
                              Administrator
                            </td>

                            <td className="px-6 py-5">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditModal(user)
                                  }
                                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-[#17213A] hover:bg-[#F8FAFC] hover:text-[#17213A]"
                                >
                                  <Pencil size={16} />
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(user)
                                  }
                                  disabled={
                                    deletingId === user.id ||
                                    isCurrentUser
                                  }
                                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-red-200 px-3.5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                                  title={
                                    isCurrentUser
                                      ? "You cannot delete your own account"
                                      : "Delete admin"
                                  }
                                >
                                  <Trash2 size={16} />

                                  {deletingId === user.id
                                    ? "Deleting..."
                                    : "Delete"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE */}
                <div className="divide-y divide-slate-100 md:hidden">
                  {users.map((user) => {
                    const isCurrentUser =
                      user.username === currentUsername;

                    return (
                      <div
                        key={user.id}
                        className="p-5"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EAF1FA] text-sm font-bold text-[#17213A]">
                            {user.username
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-[#17213A]">
                              {user.username}
                            </p>

                            {isCurrentUser && (
                              <p className="mt-0.5 text-xs font-medium text-slate-500">
                                Current account
                              </p>
                            )}

                            <div className="mt-2">
                              {user.is_active ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                  Inactive
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(user)
                            }
                            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-[#17213A] hover:bg-[#F8FAFC] hover:text-[#17213A]"
                          >
                            <Pencil size={16} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(user)
                            }
                            disabled={
                              deletingId === user.id ||
                              isCurrentUser
                            }
                            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>

          {/* SECURITY NOTE */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold text-[#17213A]">
              Administrator access
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Only active administrator accounts can access
              the Research Guru admin panel. Your current
              account cannot be deleted from this screen.
            </p>
          </div>
        </div>
      </main>

      {/* ADD / EDIT MODAL */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            if (!saving) {
              closeModal();
            }
          }}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-[#17213A]">
                  {editingUser
                    ? "Edit Admin"
                    : "Add Admin"}
                </h2>

                <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                  {editingUser
                    ? "Update administrator account details."
                    : "Create a new administrator account."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="p-5 sm:p-6"
            >
              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {success}
                </div>
              )}

              <div className="space-y-5">
                {/* USERNAME */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                    Username
                  </label>

                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Enter username"
                    autoComplete="username"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#17213A] outline-none transition placeholder:text-slate-400 focus:border-[#17213A] focus:ring-2 focus:ring-[#17213A]/10"
                  />
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                    Password

                    {editingUser && (
                      <span className="ml-1 font-normal text-slate-400">
                        (leave blank to keep current)
                      </span>
                    )}
                  </label>

                  <div className="relative">
                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder={
                        editingUser
                          ? "Enter new password"
                          : "Minimum 8 characters"
                      }
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-[#17213A] outline-none transition placeholder:text-slate-400 focus:border-[#17213A] focus:ring-2 focus:ring-[#17213A]/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (prev) => !prev
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
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

                {/* ACTIVE */}
                {editingUser && (
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={form.is_active}
                      onChange={handleChange}
                      className="h-4 w-4 cursor-pointer rounded border-slate-300"
                    />

                    <div>
                      <div className="text-sm font-semibold text-[#17213A]">
                        Active account
                      </div>

                      <div className="text-xs text-slate-500">
                        Inactive administrators cannot log in.
                      </div>
                    </div>
                  </label>
                )}
              </div>

              {/* ACTIONS */}
              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="cursor-pointer rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="cursor-pointer rounded-xl bg-[#17213A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0F172A] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingUser
                    ? "Save Changes"
                    : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;