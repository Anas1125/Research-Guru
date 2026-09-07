import { useEffect, useState } from "react";

import {
  Menu,
  X,
  Phone,
  Mail,
  Search,
  Trash2,
  ChevronRight,
  RefreshCw,
  FileText,
  Clock,
  MessageSquare,
  Wrench,
  Users,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import AdminSidebar from "../components/AdminSidebar";

import { apiFetch } from "../utils/api";

function AdminContact() {
  const navigate = useNavigate();

  /* =====================================================
     STATE
  ====================================================== */

  const [enquiries, setEnquiries] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [selectedEnquiry, setSelectedEnquiry] =
    useState(null);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [updatingId, setUpdatingId] =
    useState(null);

  const [deletingId, setDeletingId] =
    useState(null);

  const [error, setError] =
    useState("");

  /* =====================================================
     LOAD ENQUIRIES
  ====================================================== */

  useEffect(() => {
    loadEnquiries();
  }, []);

  async function loadEnquiries() {
    try {
      setLoading(true);
      setError("");

      const response =
        await apiFetch(
          "/api/admin/contact"
        );

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          data?.detail ||
            "Failed to load contact enquiries."
        );
      }

      const data =
        await response.json();

      setEnquiries(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load enquiries:",
        err
      );

      setError(
        err.message ||
          "Failed to load contact enquiries."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     UPDATE STATUS
  ====================================================== */

  async function updateStatus(
    enquiryId,
    status
  ) {
    try {
      setUpdatingId(
        enquiryId
      );

      setError("");

      const response =
        await apiFetch(
          `/api/admin/contact/${enquiryId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              status,
            }),
          }
        );

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Failed to update enquiry status."
        );
      }

      setEnquiries(
        (previous) =>
          previous.map((item) =>
            item.id === enquiryId
              ? data
              : item
          )
      );

      setSelectedEnquiry(
        (previous) =>
          previous?.id === enquiryId
            ? data
            : previous
      );
    } catch (err) {
      console.error(
        "Failed to update enquiry:",
        err
      );

      setError(
        err.message ||
          "Failed to update enquiry status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  /* =====================================================
     DELETE ENQUIRY
  ====================================================== */

  async function deleteEnquiry(
    enquiry
  ) {
    const confirmed =
      window.confirm(
        `Delete the enquiry from "${enquiry.name}"? This action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        enquiry.id
      );

      setError("");

      const response =
        await apiFetch(
          `/api/admin/contact/${enquiry.id}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Failed to delete enquiry."
        );
      }

      setEnquiries(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !==
              enquiry.id
          )
      );

      if (
        selectedEnquiry?.id ===
        enquiry.id
      ) {
        setSelectedEnquiry(null);
      }
    } catch (err) {
      console.error(
        "Failed to delete enquiry:",
        err
      );

      setError(
        err.message ||
          "Failed to delete enquiry."
      );
    } finally {
      setDeletingId(null);
    }
  }

  /* =====================================================
     LOGOUT
  ====================================================== */

  function handleLogout() {
    localStorage.removeItem(
      "adminToken"
    );

    localStorage.removeItem(
      "adminUsername"
    );

    navigate(
      "/admin/login"
    );
  }

  /* =====================================================
     HELPERS
  ====================================================== */

  function formatDate(
    dateString
  ) {
    if (!dateString) {
      return "—";
    }

    const date =
      new Date(dateString);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return dateString;
    }

    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  function getStatusClass(
    status
  ) {
    switch (status) {
      case "New":
        return "bg-blue-50 text-blue-700";

      case "Contacted":
        return "bg-amber-50 text-amber-700";

      case "In Progress":
        return "bg-violet-50 text-violet-700";

      case "Completed":
        return "bg-emerald-50 text-emerald-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  }

  /* =====================================================
     FILTER
  ====================================================== */

  const filteredEnquiries =
    enquiries.filter(
      (enquiry) => {
        const search =
          searchTerm
            .trim()
            .toLowerCase();

        const matchesSearch =
          !search ||
          enquiry.name
            ?.toLowerCase()
            .includes(search) ||
          enquiry.email
            ?.toLowerCase()
            .includes(search) ||
          enquiry.phone
            ?.toLowerCase()
            .includes(search) ||
          enquiry.research_area
            ?.toLowerCase()
            .includes(search) ||
          enquiry.service
            ?.toLowerCase()
            .includes(search) ||
          enquiry.research_stage
            ?.toLowerCase()
            .includes(search) ||
          enquiry.message
            ?.toLowerCase()
            .includes(search);

        const matchesStatus =
          statusFilter === "All" ||
          enquiry.status ===
            statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );

  /* =====================================================
     COUNTS
  ====================================================== */

  const totalCount =
    enquiries.length;

  const newCount =
    enquiries.filter(
      (item) =>
        item.status === "New"
    ).length;

  const contactedCount =
    enquiries.filter(
      (item) =>
        item.status ===
        "Contacted"
    ).length;

  const progressCount =
    enquiries.filter(
      (item) =>
        item.status ===
        "In Progress"
    ).length;

  const completedCount =
    enquiries.filter(
      (item) =>
        item.status ===
        "Completed"
    ).length;

  /* =====================================================
     RENDER
  ====================================================== */

  return (
    <div className="min-h-screen bg-[#F5F8FC] text-[#17213A]">
      {/* =================================================
          DESKTOP SIDEBAR
      ================================================== */}

      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 bg-[#17213A] lg:block">
        <AdminSidebar
          currentPage="/admin/contact"
          onLogout={handleLogout}
        />
      </aside>

      {/* =================================================
          MOBILE SIDEBAR
      ================================================== */}

      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 cursor-pointer bg-black/40 lg:hidden"
            onClick={() =>
              setSidebarOpen(false)
            }
          />

          <aside className="fixed inset-y-0 left-0 z-[60] w-72 bg-[#17213A] shadow-2xl lg:hidden">
            <AdminSidebar
              currentPage="/admin/contact"
              mobile
              onClose={() =>
                setSidebarOpen(false)
              }
              onLogout={handleLogout}
            />
          </aside>
        </>
      )}

      {/* =================================================
          MAIN
      ================================================== */}

      <main className="lg:ml-64">
        {/* =================================================
            HEADER
        ================================================== */}

        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-[76px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setSidebarOpen(true)
                }
                className="cursor-pointer rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
                aria-label="Open admin menu"
              >
                <Menu size={22} />
              </button>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Enquiries
                </p>

                <h1 className="mt-1 text-xl font-bold sm:text-2xl">
                  Contact Enquiries
                </h1>

                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  View and manage website enquiries.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadEnquiries}
              disabled={loading}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* =================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              <span>
                {error}
              </span>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
                className="cursor-pointer shrink-0"
                aria-label="Dismiss error"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {/* =================================================
              STATS
          ================================================== */}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
              label="Total"
              value={totalCount}
            />

            <StatCard
              label="New"
              value={newCount}
            />

            <StatCard
              label="Contacted"
              value={contactedCount}
            />

            <StatCard
              label="In Progress"
              value={progressCount}
            />

            <StatCard
              label="Completed"
              value={completedCount}
            />
          </div>

          {/* =================================================
              FILTERS
          ================================================== */}

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                  placeholder="Search enquiries..."
                  className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#17213A] focus:bg-white focus:ring-4 focus:ring-[#17213A]/10"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  "All",
                  "New",
                  "Contacted",
                  "In Progress",
                  "Completed",
                ].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() =>
                      setStatusFilter(
                        status
                      )
                    }
                    className={`cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      statusFilter ===
                      status
                        ? "bg-[#17213A] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* =================================================
              ENQUIRIES
          ================================================== */}

          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
              <h2 className="font-semibold text-[#17213A]">
                Enquiries
              </h2>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                {filteredEnquiries.length}{" "}
                {filteredEnquiries.length ===
                1
                  ? "enquiry"
                  : "enquiries"}{" "}
                shown
              </p>
            </div>

            {loading ? (
              <div className="flex min-h-[280px] items-center justify-center">
                <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-[#17213A]" />
                  Loading enquiries...
                </div>
              </div>
            ) : filteredEnquiries.length ===
              0 ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
                <MessageSquare
                  size={42}
                  className="mb-3 text-slate-300"
                />

                <h3 className="font-semibold text-[#17213A]">
                  No enquiries found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  New website contact submissions will appear here.
                </p>
              </div>
            ) : (
              <>
                {/* DESKTOP */}

                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[950px]">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Enquiry
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Research
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Service
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Status
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Date
                        </th>

                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredEnquiries.map(
                        (enquiry) => (
                          <tr
                            key={
                              enquiry.id
                            }
                            className="transition hover:bg-slate-50"
                          >
                            {/* ENQUIRY */}

                            <td className="px-6 py-5">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedEnquiry(
                                    enquiry
                                  )
                                }
                                className="cursor-pointer text-left"
                              >
                                <p className="font-semibold text-[#17213A] hover:underline">
                                  {
                                    enquiry.name
                                  }
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                  {
                                    enquiry.email
                                  }
                                </p>

                                <p className="mt-0.5 text-xs text-slate-400">
                                  {
                                    enquiry.phone
                                  }
                                </p>
                              </button>
                            </td>

                            {/* RESEARCH */}

                            <td className="px-6 py-5 text-sm text-slate-600">
                              {enquiry.research_area ||
                                "—"}
                            </td>

                            {/* SERVICE */}

                            <td className="px-6 py-5 text-sm text-slate-600">
                              {enquiry.service ||
                                "—"}
                            </td>

                            {/* STATUS */}

                            <td className="px-6 py-5">
                              <select
                                value={
                                  enquiry.status
                                }
                                disabled={
                                  updatingId ===
                                  enquiry.id
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateStatus(
                                    enquiry.id,
                                    event
                                      .target
                                      .value
                                  )
                                }
                                className={`cursor-pointer rounded-full border-0 px-3 py-1.5 text-xs font-semibold outline-none ${getStatusClass(
                                  enquiry.status
                                )}`}
                              >
                                <option>
                                  New
                                </option>

                                <option>
                                  Contacted
                                </option>

                                <option>
                                  In Progress
                                </option>

                                <option>
                                  Completed
                                </option>
                              </select>
                            </td>

                            {/* DATE */}

                            <td className="px-6 py-5 text-sm text-slate-500">
                              {formatDate(
                                enquiry.created_at
                              )}
                            </td>

                            {/* ACTION */}

                            <td className="px-6 py-5">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedEnquiry(
                                      enquiry
                                    )
                                  }
                                  className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-[#17213A]"
                                  title="View enquiry"
                                >
                                  <ChevronRight
                                    size={18}
                                  />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteEnquiry(
                                      enquiry
                                    )
                                  }
                                  disabled={
                                    deletingId ===
                                    enquiry.id
                                  }
                                  className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                  title="Delete enquiry"
                                >
                                  <Trash2
                                    size={18}
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE */}

                <div className="divide-y divide-slate-100 md:hidden">
                  {filteredEnquiries.map(
                    (enquiry) => (
                      <button
                        key={
                          enquiry.id
                        }
                        type="button"
                        onClick={() =>
                          setSelectedEnquiry(
                            enquiry
                          )
                        }
                        className="block w-full cursor-pointer p-5 text-left transition hover:bg-slate-50"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-[#17213A]">
                              {
                                enquiry.name
                              }
                            </p>

                            <p className="mt-1 truncate text-sm text-slate-500">
                              {
                                enquiry.email
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {formatDate(
                                enquiry.created_at
                              )}
                            </p>
                          </div>

                          <ChevronRight
                            size={19}
                            className="mt-1 shrink-0 text-slate-400"
                          />
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                              enquiry.status
                            )}`}
                          >
                            {
                              enquiry.status
                            }
                          </span>

                          {enquiry.research_area && (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                              {
                                enquiry.research_area
                              }
                            </span>
                          )}

                          {enquiry.service && (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                              {
                                enquiry.service
                              }
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      {/* =====================================================
          DETAIL MODAL
      ====================================================== */}

      {selectedEnquiry && (
        <div
          className="fixed inset-0 z-[100] flex cursor-pointer items-center justify-center bg-black/50 p-4"
          onClick={() =>
            setSelectedEnquiry(
              null
            )
          }
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl cursor-default overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* HEADER */}

            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-[#17213A]">
                  Enquiry Details
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Submitted{" "}
                  {formatDate(
                    selectedEnquiry.created_at
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedEnquiry(
                    null
                  )
                }
                className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close enquiry"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 sm:p-6">
              {/* CONTACT INFORMATION */}

              <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-5">
                <h3 className="font-semibold text-[#17213A]">
                  Contact Information
                </h3>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <InfoItem
                    icon={
                      <Users size={17} />
                    }
                    label="Name"
                    value={
                      selectedEnquiry.name
                    }
                  />

                  <InfoItem
                    icon={
                      <Phone size={17} />
                    }
                    label="Phone"
                    value={
                      selectedEnquiry.phone
                    }
                  />

                  <InfoItem
                    icon={
                      <Mail size={17} />
                    }
                    label="Email"
                    value={
                      selectedEnquiry.email
                    }
                  />

                  <InfoItem
                    icon={
                      <Clock size={17} />
                    }
                    label="Submitted"
                    value={formatDate(
                      selectedEnquiry.created_at
                    )}
                  />
                </div>
              </div>

              {/* RESEARCH REQUIREMENT */}

              <div className="mt-5 rounded-2xl border border-slate-200 p-5">
                <h3 className="font-semibold text-[#17213A]">
                  Research Requirement
                </h3>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <InfoItem
                    icon={
                      <Search size={17} />
                    }
                    label="Research Area"
                    value={
                      selectedEnquiry.research_area ||
                      "Not specified"
                    }
                  />

                  <InfoItem
                    icon={
                      <Wrench size={17} />
                    }
                    label="Service"
                    value={
                      selectedEnquiry.service ||
                      "Not specified"
                    }
                  />

                  <InfoItem
                    icon={
                      <FileText
                        size={17}
                      />
                    }
                    label="Research Stage"
                    value={
                      selectedEnquiry.research_stage ||
                      "Not specified"
                    }
                  />
                </div>
              </div>

              {/* MESSAGE */}

              <div className="mt-5 rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center gap-2">
                  <MessageSquare
                    size={18}
                  />

                  <h3 className="font-semibold text-[#17213A]">
                    Requirement Message
                  </h3>
                </div>

                <div className="mt-4 rounded-xl bg-[#F8FAFC] p-4">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
                    {selectedEnquiry.message ||
                      "No message provided."}
                  </p>
                </div>
              </div>

              {/* STATUS */}

              <div className="mt-5 rounded-2xl border border-slate-200 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-[#17213A]">
                      Enquiry Status
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Update this enquiry as you process it.
                    </p>
                  </div>

                  <select
                    value={
                      selectedEnquiry.status
                    }
                    disabled={
                      updatingId ===
                      selectedEnquiry.id
                    }
                    onChange={(event) =>
                      updateStatus(
                        selectedEnquiry.id,
                        event.target.value
                      )
                    }
                    className={`cursor-pointer rounded-xl border-0 px-4 py-2.5 text-sm font-semibold outline-none ${getStatusClass(
                      selectedEnquiry.status
                    )}`}
                  >
                    <option>
                      New
                    </option>

                    <option>
                      Contacted
                    </option>

                    <option>
                      In Progress
                    </option>

                    <option>
                      Completed
                    </option>
                  </select>
                </div>
              </div>

              {/* DELETE */}

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    deleteEnquiry(
                      selectedEnquiry
                    )
                  }
                  disabled={
                    deletingId ===
                    selectedEnquiry.id
                  }
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 size={17} />

                  {deletingId ===
                  selectedEnquiry.id
                    ? "Deleting..."
                    : "Delete Enquiry"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-[#17213A]">
        {value}
      </p>
    </div>
  );
}

/* =====================================================
   INFO ITEM
===================================================== */

function InfoItem({
  icon,
  label,
  value,
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </div>

      <p className="mt-1 break-words text-sm font-medium text-[#17213A]">
        {value}
      </p>
    </div>
  );
}

export default AdminContact;