import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Upload,
  Loader2,
  Check,
  Image as ImageIcon,
} from "lucide-react";

import AdminSidebar from "../components/AdminSidebar";
import { apiFetch, API_URL } from "../utils/api";

function getImageUrl(path) {
  if (!path) return null;

  if (
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }

  return `${API_URL}${path}`;
}

const emptyForm = {
  name: "",
  logo_url: "",
  is_active: true,
  display_order: 0,
};

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // LOAD CLIENTS
  // =====================================================

  const loadClients = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch(
        "/api/admin/clients"
      );

      if (!response.ok) {
        throw new Error("Failed to load clients.");
      }

      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error(
        "Failed to load clients:",
        error
      );

      setError(
        error.message ||
          "Failed to load clients."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  // =====================================================
  // OPEN ADD FORM
  // =====================================================

  const handleAdd = () => {
    setEditingClient(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // =====================================================
  // OPEN EDIT FORM
  // =====================================================

  const handleEdit = (client) => {
    setEditingClient(client);

    setForm({
      name: client.name || "",
      logo_url: client.logo_url || "",
      is_active: client.is_active,
      display_order:
        client.display_order ?? 0,
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // =====================================================
  // CLOSE FORM
  // =====================================================

  const handleCloseForm = () => {
    if (saving || uploadingLogo) return;

    setShowForm(false);
    setEditingClient(null);
    setForm(emptyForm);
    setError("");
  };

  // =====================================================
  // LOGO UPLOAD
  // =====================================================

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setUploadingLogo(true);
      setError("");
      setSuccess("");

      const formData = new FormData();
      formData.append("file", file);

      const response = await apiFetch(
        "/api/admin/clients/upload-logo",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        let message =
          "Failed to upload logo.";

        try {
          const data = await response.json();

          if (data.detail) {
            message = data.detail;
          }
        } catch {
          // Ignore JSON parsing errors.
        }

        throw new Error(message);
      }

      const data = await response.json();

      setForm((previous) => ({
        ...previous,
        logo_url: data.image_url,
      }));

      setSuccess("Logo uploaded successfully.");
    } catch (error) {
      console.error(
        "Failed to upload client logo:",
        error
      );

      setError(
        error.message ||
          "Failed to upload logo."
      );
    } finally {
      setUploadingLogo(false);

      event.target.value = "";
    }
  };

  // =====================================================
  // SAVE CLIENT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Client name is required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        logo_url:
          form.logo_url.trim() || null,
        is_active: form.is_active,
        display_order:
          Number(form.display_order) || 0,
      };

      let response;

      if (editingClient) {
        response = await apiFetch(
          `/api/admin/clients/${editingClient.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
      } else {
        response = await apiFetch(
          "/api/admin/clients",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
      }

      if (!response.ok) {
        let message =
          "Failed to save client.";

        try {
          const data = await response.json();

          if (data.detail) {
            message = data.detail;
          }
        } catch {
          // Ignore JSON parsing errors.
        }

        throw new Error(message);
      }

      await loadClients();

      setShowForm(false);
      setEditingClient(null);
      setForm(emptyForm);

      setSuccess(
        editingClient
          ? "Client updated successfully."
          : "Client added successfully."
      );
    } catch (error) {
      console.error(
        "Failed to save client:",
        error
      );

      setError(
        error.message ||
          "Failed to save client."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // TOGGLE ACTIVE
  // =====================================================

  const handleToggleActive = async (client) => {
    try {
      setError("");
      setSuccess("");

      const response = await apiFetch(
        `/api/admin/clients/${client.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            is_active: !client.is_active,
          }),
        }
      );

      if (!response.ok) {
        let message =
          "Failed to update client.";

        try {
          const data = await response.json();

          if (data.detail) {
            message = data.detail;
          }
        } catch {
          // Ignore JSON parsing errors.
        }

        throw new Error(message);
      }

      await loadClients();

      setSuccess(
        !client.is_active
          ? "Client activated."
          : "Client hidden from the website."
      );
    } catch (error) {
      console.error(
        "Failed to toggle client:",
        error
      );

      setError(
        error.message ||
          "Failed to update client."
      );
    }
  };

  // =====================================================
  // DELETE CLIENT
  // =====================================================

  const handleDelete = async (client) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${client.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const response = await apiFetch(
        `/api/admin/clients/${client.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        let message =
          "Failed to delete client.";

        try {
          const data = await response.json();

          if (data.detail) {
            message = data.detail;
          }
        } catch {
          // Ignore JSON parsing errors.
        }

        throw new Error(message);
      }

      await loadClients();

      setSuccess(
        "Client deleted successfully."
      );
    } catch (error) {
      console.error(
        "Failed to delete client:",
        error
      );

      setError(
        error.message ||
          "Failed to delete client."
      );
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-[#F5F8FC]">
      {/* DESKTOP SIDEBAR */}

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <AdminSidebar
          currentPage="/admin/clients"
        />
      </aside>

      {/* MAIN */}

      <main className="min-h-screen lg:ml-64">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
          {/* HEADER */}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#17213A]/60">
                Website Management
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#17213A]">
                Our Clients
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Manage the client logos displayed
                on the public website.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#17213A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0F172A]"
            >
              <Plus size={18} />
              Add Client
            </button>
          </div>

          {/* MESSAGES */}

          {success && (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {success}
            </div>
          )}

          {error && !showForm && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {/* CLIENT LIST */}

          <div className="mt-8 overflow-hidden rounded-2xl border border-[#DCE5F0] bg-white shadow-sm">
            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <Loader2
                  size={28}
                  className="animate-spin text-[#17213A]"
                />
              </div>
            ) : clients.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF1FA] text-[#17213A]">
                  <ImageIcon size={25} />
                </div>

                <h2 className="mt-4 text-lg font-bold text-[#17213A]">
                  No clients added yet
                </h2>

                <p className="mt-1 max-w-md text-sm text-slate-500">
                  Add your first client to start
                  building the Our Clients section.
                </p>

                <button
                  type="button"
                  onClick={handleAdd}
                  className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#17213A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0F172A]"
                >
                  <Plus size={17} />
                  Add Client
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#E8EEF5]">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="flex flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-6"
                  >
                    {/* CLIENT INFO */}

                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E1E8F0] bg-white p-2">
                        {client.logo_url ? (
                          <img
                            src={getImageUrl(
                              client.logo_url
                            )}
                            alt={client.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <ImageIcon
                            size={24}
                            className="text-slate-300"
                          />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate text-base font-bold text-[#17213A]">
                          {client.name}
                        </h2>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-slate-400">
                            Order:{" "}
                            {client.display_order}
                          </span>

                          <span
                            className={
                              client.is_active
                                ? "inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700"
                                : "inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-500"
                            }
                          >
                            <span
                              className={
                                client.is_active
                                  ? "h-1.5 w-1.5 rounded-full bg-emerald-500"
                                  : "h-1.5 w-1.5 rounded-full bg-slate-400"
                              }
                            />

                            {client.is_active
                              ? "Active"
                              : "Hidden"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS */}

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleActive(
                            client
                          )
                        }
                        className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#DCE5F0] px-3.5 py-2 text-xs font-semibold text-[#17213A] transition hover:bg-[#F5F8FC]"
                      >
                        <Check size={15} />

                        {client.is_active
                          ? "Hide"
                          : "Activate"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(client)
                        }
                        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#DCE5F0] text-[#17213A] transition hover:bg-[#F5F8FC]"
                        aria-label="Edit client"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(client)
                        }
                        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-red-200 text-red-500 transition hover:bg-red-50"
                        aria-label="Delete client"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* FORM MODAL */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17213A]/40 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-[#E8EEF5] px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-[#17213A]">
                  {editingClient
                    ? "Edit Client"
                    : "Add Client"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add the organization name and
                  logo.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseForm}
                disabled={
                  saving || uploadingLogo
                }
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-6 px-6 py-6"
            >
              {/* ERROR */}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              {/* CLIENT NAME */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                  Client / Organization Name
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Enter client name"
                  disabled={saving}
                  className="w-full rounded-xl border border-[#CBD8E6] bg-white px-4 py-3 text-sm text-[#17213A] outline-none transition placeholder:text-slate-400 focus:border-[#17213A] focus:ring-2 focus:ring-[#17213A]/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* LOGO */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                  Client Logo
                </label>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-28 w-40 items-center justify-center overflow-hidden rounded-2xl border border-[#DCE5F0] bg-[#F8FAFC] p-4">
                    {form.logo_url ? (
                      <img
                        src={getImageUrl(
                          form.logo_url
                        )}
                        alt="Client logo preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <ImageIcon
                        size={30}
                        className="text-slate-300"
                      />
                    )}
                  </div>

                  <div>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#CBD8E6] bg-white px-4 py-2.5 text-sm font-semibold text-[#17213A] transition hover:bg-[#F5F8FC]">
                      {uploadingLogo ? (
                        <>
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={17} />
                          Upload Logo
                        </>
                      )}

                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.svg"
                        onChange={
                          handleLogoUpload
                        }
                        disabled={
                          saving ||
                          uploadingLogo
                        }
                        className="hidden"
                      />
                    </label>

                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      JPG, PNG, WEBP or SVG
                    </p>
                  </div>
                </div>
              </div>

              {/* ORDER + ACTIVE */}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                    Display Order
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.display_order}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        display_order:
                          event.target.value,
                      }))
                    }
                    disabled={saving}
                    className="w-full rounded-xl border border-[#CBD8E6] bg-white px-4 py-3 text-sm text-[#17213A] outline-none transition focus:border-[#17213A] focus:ring-2 focus:ring-[#17213A]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <p className="mt-1.5 text-xs text-slate-400">
                    Lower numbers appear first.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                    Website Visibility
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      setForm((previous) => ({
                        ...previous,
                        is_active:
                          !previous.is_active,
                      }))
                    }
                    disabled={saving}
                    className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-[#CBD8E6] px-4 py-3 text-sm font-semibold text-[#17213A] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span>
                      {form.is_active
                        ? "Visible on website"
                        : "Hidden from website"}
                    </span>

                    <span
                      className={
                        form.is_active
                          ? "relative h-6 w-11 rounded-full bg-[#17213A] transition"
                          : "relative h-6 w-11 rounded-full bg-slate-300 transition"
                      }
                    >
                      <span
                        className={
                          form.is_active
                            ? "absolute left-6 top-1 h-4 w-4 rounded-full bg-white transition"
                            : "absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition"
                        }
                      />
                    </span>
                  </button>
                </div>
              </div>

              {/* ACTIONS */}

              <div className="flex flex-col-reverse gap-3 border-t border-[#E8EEF5] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  disabled={
                    saving || uploadingLogo
                  }
                  className="cursor-pointer rounded-full border border-[#CBD8E6] px-5 py-2.5 text-sm font-semibold text-[#17213A] transition hover:bg-[#F5F8FC] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving || uploadingLogo
                  }
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#17213A] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0F172A] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  {saving
                    ? "Saving..."
                    : editingClient
                    ? "Update Client"
                    : "Add Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}