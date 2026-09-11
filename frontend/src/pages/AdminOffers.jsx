import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Check,
  Tag,
  Menu,
  CalendarDays,
} from "lucide-react";

import AdminSidebar from "../components/AdminSidebar";
import { apiFetch } from "../utils/api";

const emptyForm = {
  title: "",
  description: "",
  discount_type: "percentage",
  discount_value: "",
  offer_code: "",
  start_date: "",
  end_date: "",
  cta_text: "Get Started",
  cta_link: "/contact",
  is_active: true,
  display_order: '',
};

function getOfferStatus(offer) {
  const now = new Date();
  const start = new Date(offer.start_date);
  const end = new Date(offer.end_date);

  if (now < start) {
    return "UPCOMING";
  }

  if (now >= start && now <= end) {
    return "LIVE";
  }

  return "EXPIRED";
}

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toDateTimeLocal(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toISOString(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString();
}

export default function AdminOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  // =====================================================
  // LOAD OFFERS
  // =====================================================

  const loadOffers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch("/api/admin/offers");

      if (!response.ok) {
        throw new Error("Failed to load offers.");
      }

      const data = await response.json();

      setOffers(data);
    } catch (error) {
      console.error("Failed to load offers:", error);

      setError(
        error.message ||
          "Failed to load offers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  // =====================================================
  // OPEN ADD FORM
  // =====================================================

  const handleAdd = () => {
    const now = new Date();

    const start = new Date(now);
    start.setMinutes(
      start.getMinutes() -
        start.getTimezoneOffset()
    );

    const end = new Date(now);
    end.setDate(end.getDate() + 7);
    end.setMinutes(
      end.getMinutes() -
        end.getTimezoneOffset()
    );

    setEditingOffer(null);

    setForm({
      ...emptyForm,
      start_date: start
        .toISOString()
        .slice(0, 16),
      end_date: end
        .toISOString()
        .slice(0, 16),
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // =====================================================
  // OPEN EDIT FORM
  // =====================================================

  const handleEdit = (offer) => {
    setEditingOffer(offer);

    setForm({
      title: offer.title || "",
      description: offer.description || "",
      discount_type:
        offer.discount_type || "percentage",
      discount_value:
        offer.discount_value || "",
      offer_code: offer.offer_code || "",
      start_date: toDateTimeLocal(
        offer.start_date
      ),
      end_date: toDateTimeLocal(
        offer.end_date
      ),
      cta_text:
        offer.cta_text || "Get Started",
      cta_link:
        offer.cta_link || "/contact",
      is_active: offer.is_active,
      display_order:
        offer.display_order ?? 0,
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // =====================================================
  // CLOSE FORM
  // =====================================================

  const handleCloseForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingOffer(null);
    setForm(emptyForm);
    setError("");
  };

  // =====================================================
  // SAVE OFFER
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError("Offer title is required.");
      return;
    }

    if (!form.start_date) {
      setError("Start date is required.");
      return;
    }

    if (!form.end_date) {
      setError("End date is required.");
      return;
    }

    const startDate = new Date(
      form.start_date
    );

    const endDate = new Date(
      form.end_date
    );

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      setError("Please enter valid dates.");
      return;
    }

    if (startDate >= endDate) {
      setError(
        "End date must be after start date."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: form.title.trim(),
        description:
          form.description.trim() || null,
        discount_type:
          form.discount_type,
        discount_value:
          form.discount_value.trim() || null,
        offer_code:
          form.offer_code.trim() || null,
        start_date:
          toISOString(form.start_date),
        end_date:
          toISOString(form.end_date),
        cta_text:
          form.cta_text.trim() ||
          "Get Started",
        cta_link:
          form.cta_link.trim() ||
          "/contact",
        is_active: form.is_active,
        display_order:
          form.display_order === ""
            ? null
            : Number(form.display_order),
        };

      let response;

      if (editingOffer) {
        response = await apiFetch(
          `/api/admin/offers/${editingOffer.id}`,
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
          "/api/admin/offers",
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
          "Failed to save offer.";

        try {
          const data =
            await response.json();

          if (data.detail) {
            message = data.detail;
          }
        } catch {
          // Ignore JSON parsing errors.
        }

        throw new Error(message);
      }

      await loadOffers();

      setShowForm(false);
      setEditingOffer(null);
      setForm(emptyForm);

      setSuccess(
        editingOffer
          ? "Offer updated successfully."
          : "Offer added successfully."
      );
    } catch (error) {
      console.error(
        "Failed to save offer:",
        error
      );

      setError(
        error.message ||
          "Failed to save offer."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // TOGGLE ACTIVE
  // =====================================================

  const handleToggleActive = async (
    offer
  ) => {
    try {
      setError("");
      setSuccess("");

      const response = await apiFetch(
        `/api/admin/offers/${offer.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            is_active: !offer.is_active,
          }),
        }
      );

      if (!response.ok) {
        let message =
          "Failed to update offer.";

        try {
          const data =
            await response.json();

          if (data.detail) {
            message = data.detail;
          }
        } catch {
          // Ignore JSON parsing errors.
        }

        throw new Error(message);
      }

      await loadOffers();

      setSuccess(
        !offer.is_active
          ? "Offer activated."
          : "Offer hidden from the website."
      );
    } catch (error) {
      console.error(
        "Failed to toggle offer:",
        error
      );

      setError(
        error.message ||
          "Failed to update offer."
      );
    }
  };

  // =====================================================
  // DELETE OFFER
  // =====================================================

  const handleDelete = async (offer) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${offer.title}"?`
      );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const response = await apiFetch(
        `/api/admin/offers/${offer.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        let message =
          "Failed to delete offer.";

        try {
          const data =
            await response.json();

          if (data.detail) {
            message = data.detail;
          }
        } catch {
          // Ignore JSON parsing errors.
        }

        throw new Error(message);
      }

      await loadOffers();

      setSuccess(
        "Offer deleted successfully."
      );
    } catch (error) {
      console.error(
        "Failed to delete offer:",
        error
      );

      setError(
        error.message ||
          "Failed to delete offer."
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
          currentPage="/admin/offers"
        />
      </aside>

      {/* MAIN */}
      {/* MOBILE SIDEBAR */}

      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() =>
              setMobileSidebarOpen(false)
            }
          />

          <aside className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden">
            <AdminSidebar
              currentPage="/admin/offers"
              mobile
              onClose={() =>
                setMobileSidebarOpen(false)
              }
              onLogout={() => {
                localStorage.removeItem("adminToken");
                localStorage.removeItem("adminUsername");
                window.location.href = "/admin/login";
              }}
            />
          </aside>
        </>
      )}

      {/* MAIN */}

      <main className="min-h-screen lg:ml-64">

        {/* MOBILE HEADER */}

        <div className="sticky top-0 z-30 border-b border-[#DCE5F0] bg-white px-5 py-4 lg:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setMobileSidebarOpen(true)
              }
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[#D6E2EF] bg-white text-[#17213A] transition hover:bg-[#EEF4FA]"
              aria-label="Open admin menu"
            >
              <Menu size={21} />
            </button>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Admin
              </p>

              <h1 className="text-lg font-bold text-[#17213A]">
                Offers
              </h1>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
          {/* HEADER */}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#17213A]/60">
                Website Management
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#17213A]">
                Offers
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Manage live, upcoming and
                previous offers displayed on
                the website.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#17213A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0F172A]"
            >
              <Plus size={18} />
              Add Offer
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

          {/* OFFER LIST */}

          <div className="mt-8 overflow-hidden rounded-2xl border border-[#DCE5F0] bg-white shadow-sm">
            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <Loader2
                  size={28}
                  className="animate-spin text-[#17213A]"
                />
              </div>
            ) : offers.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF1FA] text-[#17213A]">
                  <Tag size={25} />
                </div>

                <h2 className="mt-4 text-lg font-bold text-[#17213A]">
                  No offers added yet
                </h2>

                <p className="mt-1 max-w-md text-sm text-slate-500">
                  Add your first offer to start
                  promoting special discounts
                  on the website.
                </p>

                <button
                  type="button"
                  onClick={handleAdd}
                  className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#17213A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0F172A]"
                >
                  <Plus size={17} />
                  Add Offer
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#E8EEF5]">
                {offers.map((offer) => {
                  const status =
                    getOfferStatus(offer);

                  return (
                    <div
                      key={offer.id}
                      className="flex flex-col gap-5 px-5 py-5 md:px-6"
                    >
                      {/* OFFER INFO */}

                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-base font-bold text-[#17213A]">
                              {offer.title}
                            </h2>

                            <span
                              className={
                                status ===
                                "LIVE"
                                  ? "inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                                  : status ===
                                    "UPCOMING"
                                  ? "inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700"
                                  : "inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500"
                              }
                            >
                              <span
                                className={
                                  status ===
                                  "LIVE"
                                    ? "h-1.5 w-1.5 rounded-full bg-emerald-500"
                                    : status ===
                                      "UPCOMING"
                                    ? "h-1.5 w-1.5 rounded-full bg-blue-500"
                                    : "h-1.5 w-1.5 rounded-full bg-slate-400"
                                }
                              />

                              {status}
                            </span>

                            {!offer.is_active && (
                              <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                                HIDDEN
                              </span>
                            )}
                          </div>

                          {offer.description && (
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                              {offer.description}
                            </p>
                          )}

                          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                            {offer.discount_value && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF1FA] px-3 py-1 font-semibold text-[#17213A]">
                                <Tag size={13} />

                                {offer.discount_type ===
                                "percentage"
                                  ? `${offer.discount_value}% OFF`
                                  : `${offer.discount_value} OFF`}
                              </span>
                            )}

                            {offer.offer_code && (
                              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
                                Code:{" "}
                                {offer.offer_code}
                              </span>
                            )}

                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-500">
                              <CalendarDays
                                size={13}
                              />

                              {formatDateTime(
                                offer.start_date
                              )}

                              {" → "}

                              {formatDateTime(
                                offer.end_date
                              )}
                            </span>

                            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-500">
                              Order:{" "}
                              {offer.display_order}
                            </span>
                          </div>
                        </div>

                        {/* ACTIONS */}

                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleActive(
                                offer
                              )
                            }
                            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#DCE5F0] px-3.5 py-2 text-xs font-semibold text-[#17213A] transition hover:bg-[#F5F8FC]"
                          >
                            <Check size={15} />

                            {offer.is_active
                              ? "Hide"
                              : "Activate"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(offer)
                            }
                            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#DCE5F0] text-[#17213A] transition hover:bg-[#F5F8FC]"
                            aria-label="Edit offer"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                offer
                              )
                            }
                            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-red-200 text-red-500 transition hover:bg-red-50"
                            aria-label="Delete offer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* FORM MODAL */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17213A]/40 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-[#E8EEF5] px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-[#17213A]">
                  {editingOffer
                    ? "Edit Offer"
                    : "Add Offer"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create a scheduled offer
                  with discount and validity
                  dates.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseForm}
                disabled={saving}
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

              {/* TITLE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                  Offer Title
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      title:
                        event.target.value,
                    }))
                  }
                  placeholder="e.g. Research Paper Publication Offer"
                  disabled={saving}
                  className="w-full rounded-xl border border-[#CBD8E6] bg-white px-4 py-3 text-sm text-[#17213A] outline-none transition placeholder:text-slate-400 focus:border-[#17213A] focus:ring-2 focus:ring-[#17213A]/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                  Description
                </label>

                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      description:
                        event.target.value,
                    }))
                  }
                  placeholder="Describe what this offer includes..."
                  disabled={saving}
                  className="w-full resize-none rounded-xl border border-[#CBD8E6] bg-white px-4 py-3 text-sm leading-6 text-[#17213A] outline-none transition placeholder:text-slate-400 focus:border-[#17213A] focus:ring-2 focus:ring-[#17213A]/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* DISCOUNT */}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                    Discount Type
                  </label>

                  <select
                    value={form.discount_type}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        discount_type:
                          event.target.value,
                      }))
                    }
                    disabled={saving}
                    className="w-full rounded-xl border border-[#CBD8E6] bg-white px-4 py-3 text-sm text-[#17213A] outline-none transition focus:border-[#17213A] focus:ring-2 focus:ring-[#17213A]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="percentage">
                      Percentage
                    </option>
                    <option value="fixed">
                      Fixed Amount
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                    Discount Value
                  </label>

                  <input
                    type="text"
                    value={
                      form.discount_value
                    }
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        discount_value:
                          event.target.value,
                      }))
                    }
                    placeholder={
                      form.discount_type ===
                      "percentage"
                        ? "e.g. 20"
                        : "e.g. ₹5,000"
                    }
                    disabled={saving}
                    className="w-full rounded-xl border border-[#CBD8E6] bg-white px-4 py-3 text-sm text-[#17213A] outline-none transition placeholder:text-slate-400 focus:border-[#17213A] focus:ring-2 focus:ring-[#17213A]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>

              {/* OFFER CODE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                  Offer Code
                </label>

                <input
                  type="text"
                  value={form.offer_code}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      offer_code:
                        event.target.value,
                    }))
                  }
                  placeholder="e.g. RESEARCH20"
                  disabled={saving}
                  className="w-full rounded-xl border border-[#CBD8E6] bg-white px-4 py-3 text-sm uppercase text-[#17213A] outline-none transition placeholder:text-slate-400 focus:border-[#17213A] focus:ring-2 focus:ring-[#17213A]/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* DATES */}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                    Start Date & Time
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    type="datetime-local"
                    value={form.start_date}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        start_date:
                          event.target.value,
                      }))
                    }
                    disabled={saving}
                    className="w-full rounded-xl border border-[#CBD8E6] bg-white px-4 py-3 text-sm text-[#17213A] outline-none transition focus:border-[#17213A] focus:ring-2 focus:ring-[#17213A]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                    End Date & Time
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    type="datetime-local"
                    value={form.end_date}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        end_date:
                          event.target.value,
                      }))
                    }
                    disabled={saving}
                    className="w-full rounded-xl border border-[#CBD8E6] bg-white px-4 py-3 text-sm text-[#17213A] outline-none transition focus:border-[#17213A] focus:ring-2 focus:ring-[#17213A]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>

              {/* CTA */}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                    CTA Text
                  </label>

                  <input
                    type="text"
                    value={form.cta_text}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        cta_text:
                          event.target.value,
                      }))
                    }
                    placeholder="Get Started"
                    disabled={saving}
                    className="w-full rounded-xl border border-[#CBD8E6] bg-white px-4 py-3 text-sm text-[#17213A] outline-none transition placeholder:text-slate-400 focus:border-[#17213A] focus:ring-2 focus:ring-[#17213A]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                    CTA Link
                  </label>

                  <input
                    type="text"
                    value={form.cta_link}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        cta_link:
                          event.target.value,
                      }))
                    }
                    placeholder="/contact"
                    disabled={saving}
                    className="w-full rounded-xl border border-[#CBD8E6] bg-white px-4 py-3 text-sm text-[#17213A] outline-none transition placeholder:text-slate-400 focus:border-[#17213A] focus:ring-2 focus:ring-[#17213A]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
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
                    value={
                      form.display_order
                    }
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
                  disabled={saving}
                  className="cursor-pointer rounded-full border border-[#CBD8E6] px-5 py-2.5 text-sm font-semibold text-[#17213A] transition hover:bg-[#F5F8FC] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
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
                    : editingOffer
                    ? "Update Offer"
                    : "Add Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}