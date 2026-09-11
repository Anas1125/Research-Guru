import { useEffect, useState } from "react";
import {
  Star,
  Plus,
  Pencil,
  Trash2,
  Check,
  EyeOff,
  X,
  User,
  Loader2,
  Menu,
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
  client_name: "",
  designation: "",
  rating: 5,
  review: "",
  photo_url: "",
  is_published: false,
  display_order: 0,
  created_at: new Date().toISOString(),
};


function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);


  async function loadReviews() {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch(
        "/api/admin/reviews"
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load reviews."
        );
      }

      const data = await response.json();
      setReviews(data);
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Failed to load reviews."
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadReviews();
  }, []);


  const openCreateForm = () => {
    setEditingReview(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  };


  const openEditForm = (review) => {
    setEditingReview(review);

    setForm({
      client_name: review.client_name || "",
      designation: review.designation || "",
      rating: review.rating || 5,
      review: review.review || "",
      photo_url: review.photo_url || "",
      is_published: review.is_published || false,
      display_order: review.display_order || 0,
      created_at:
        review.created_at || new Date().toISOString(),
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };


  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingReview(null);
    setForm(emptyForm);
  };


  const handleChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : name === "rating" ||
            name === "display_order"
          ? Number(value)
          : value,
    }));
  };

  const handlePhotoChange = async (event) => {
  const file = event.target.files?.[0];

  if (!file) return;

  setError("");
  setSuccess("");

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    setError(
      "Only JPG, PNG, and WEBP images are allowed."
    );
    event.target.value = "";
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    setError(
      "Image must be smaller than 10 MB."
    );
    event.target.value = "";
    return;
  }

  try {
    setSaving(true);

    const formData = new FormData();
    formData.append("file", file);

    const response = await apiFetch(
      "/api/admin/reviews/upload-photo",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      let message =
        "Failed to upload photo.";

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

    const data = await response.json();

    setForm((previous) => ({
      ...previous,
      photo_url: data.image_url,
    }));

    setSuccess(
      "Photo uploaded successfully."
    );
  } catch (err) {
    console.error(err);

    setError(
      err.message ||
        "Failed to upload photo."
    );
  } finally {
    setSaving(false);
  }
};

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.client_name.trim()) {
      setError("Client name is required.");
      return;
    }

    if (!form.review.trim()) {
      setError("Review text is required.");
      return;
    }

    if (
      form.rating < 1 ||
      form.rating > 5
    ) {
      setError(
        "Rating must be between 1 and 5."
      );
      return;
    }

    try {
      setSaving(true);

      const endpoint = editingReview
        ? `/api/admin/reviews/${editingReview.id}`
        : "/api/admin/reviews";

      const method = editingReview
        ? "PUT"
        : "POST";

      const response = await apiFetch(
        endpoint,
        {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_name:
              form.client_name.trim(),

            designation:
              form.designation.trim() || null,

            rating: form.rating,

            review:
              form.review.trim(),

            photo_url:
              form.photo_url.trim() || null,

            is_published:
              form.is_published,

            display_order:
              form.display_order,

            created_at:
              form.created_at,
          }),
        }
      );

      if (!response.ok) {
        let message =
          "Failed to save review.";

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

      setSuccess(
        editingReview
          ? "Review updated successfully."
          : "Review created successfully."
      );

      setShowForm(false);
      setEditingReview(null);
      setForm(emptyForm);

      await loadReviews();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Failed to save review."
      );
    } finally {
      setSaving(false);
    }
  };


  const togglePublished = async (review) => {
    setError("");
    setSuccess("");

    try {
      const response = await apiFetch(
        `/api/admin/reviews/${review.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_published:
              !review.is_published,
          }),
        }
      );

      if (!response.ok) {
        let message =
          "Failed to update review.";

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

      setSuccess(
        review.is_published
          ? "Review unpublished."
          : "Review published."
      );

      await loadReviews();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Failed to update review."
      );
    }
  };


  const deleteReview = async (review) => {
    const confirmed = window.confirm(
      `Delete the review from ${review.client_name}?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const response = await apiFetch(
        `/api/admin/reviews/${review.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        let message =
          "Failed to delete review.";

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

      setSuccess(
        "Review deleted successfully."
      );

      await loadReviews();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Failed to delete review."
      );
    }
  };


  const publishedCount =
    reviews.filter(
      (review) => review.is_published
    ).length;

  const pendingCount =
    reviews.filter(
      (review) => !review.is_published
    ).length;


  return (
    <div className="min-h-screen bg-[#F5F8FC] text-[#17213A]">

        {/* Desktop Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <AdminSidebar
            currentPage="/admin/reviews"
            onLogout={() => {
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminUsername");
            window.location.href = "/admin/login";
            }}
        />
        </aside>

        {/* Mobile Sidebar */}
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
                currentPage="/admin/reviews"
                mobile={true}
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

        <main className="min-h-screen lg:ml-64">

        {/* Mobile Header */}
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
                Client Reviews
              </h1>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-7 lg:px-10 lg:py-10">

          {/* Header */}
          <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Testimonials
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#17213A]">
                Client Reviews
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Review, approve, edit, and manage client testimonials displayed on the website.
              </p>
            </div>


            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#17213A] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0F172A] cursor-pointer"
            >
              <Plus size={17} />
              Add Review
            </button>

          </div>


          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">

            <div className="rounded-2xl border border-[#DCE5F0] bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Total Reviews
              </p>

              <p className="mt-2 text-3xl font-bold text-[#17213A]">
                {reviews.length}
              </p>
            </div>


            <div className="rounded-2xl border border-[#DCE5F0] bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Published
              </p>

              <p className="mt-2 text-3xl font-bold text-emerald-600">
                {publishedCount}
              </p>
            </div>


            <div className="rounded-2xl border border-[#DCE5F0] bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Pending
              </p>

              <p className="mt-2 text-3xl font-bold text-amber-600">
                {pendingCount}
              </p>
            </div>

          </div>


          {/* Messages */}
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <X size={17} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}


          {success && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <Check size={17} className="mt-0.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}


          {/* Loading */}
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-[#DCE5F0] bg-white">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                <Loader2
                  size={20}
                  className="animate-spin"
                />
                Loading reviews...
              </div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#C9D7E6] bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF1FA] text-[#17213A]">
                <Star size={24} />
              </div>

              <h2 className="mt-5 text-lg font-bold text-[#17213A]">
                No reviews yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Client submissions and reviews you add manually will appear here.
              </p>

              <button
                type="button"
                onClick={openCreateForm}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#17213A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0F172A] cursor-pointer"
              >
                <Plus size={17} />
                Add First Review
              </button>
            </div>
          ) : (
            <div className="space-y-4">

              {reviews.map((review) => {

                const photo =
                  getImageUrl(
                    review.photo_url
                  );

                return (
                  <div
                    key={review.id}
                    className="rounded-2xl border border-[#DCE5F0] bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                  >

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                      {/* Review Content */}
                      <div className="flex min-w-0 gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EAF1FA] text-[#17213A]">

                          {photo ? (
                            <img
                              src={photo}
                              alt={review.client_name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <User size={20} />
                          )}

                        </div>


                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <h2 className="font-bold text-[#17213A]">
                              {review.client_name}
                            </h2>

                            {review.designation && (
                              <>
                                <span className="text-slate-300">
                                  •
                                </span>

                                <span className="text-sm text-slate-500">
                                  {review.designation}
                                </span>
                              </>
                            )}

                          </div>


                          <div className="mt-2 flex items-center gap-1">

                            {[1, 2, 3, 4, 5].map(
                              (star) => (
                                <Star
                                  key={star}
                                  size={15}
                                  className={
                                    star <=
                                    review.rating
                                      ? "fill-current text-amber-500"
                                      : "text-slate-300"
                                  }
                                />
                              )
                            )}

                            <span className="ml-2 text-xs font-semibold text-slate-500">
                              {review.rating}/5
                            </span>

                          </div>


                          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
                            {review.review}
                          </p>


                          <div className="mt-4 flex flex-wrap items-center gap-2">

                            {review.is_published ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                <Check size={13} />
                                Published
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                Pending
                              </span>
                            )}

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                              Order: {review.display_order}
                            </span>

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                              Date:{" "}
                              {review.created_at
                                ? new Date(review.created_at).toLocaleString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "—"}
                            </span>

                          </div>

                        </div>

                      </div>


                      {/* Actions */}
                      <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">

                        <button
                          type="button"
                          onClick={() =>
                            togglePublished(
                              review
                            )
                          }
                          className={
                            review.is_published
                              ? "inline-flex items-center gap-2 rounded-xl border border-[#D6E2EF] bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                              : "inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                          }
                        >
                          {review.is_published ? (
                            <>
                              <EyeOff size={15} />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <Check size={15} />
                              Publish
                            </>
                          )}
                        </button>


                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(
                              review
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-[#D6E2EF] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#17213A] transition hover:bg-[#F5F8FC]"
                        >
                          <Pencil size={15} />
                          Edit
                        </button>


                        <button
                          type="button"
                          onClick={() =>
                            deleteReview(
                              review
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 size={15} />
                          Delete
                        </button>

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </div>
      </main>


      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17213A]/40 px-4 py-6">

          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#DCE5F0] bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#DCE5F0] px-5 py-4 sm:px-6">

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {editingReview
                    ? "Edit testimonial"
                    : "New testimonial"}
                </p>

                <h2 className="mt-1 text-xl font-bold text-[#17213A]">
                  {editingReview
                    ? "Edit Client Review"
                    : "Add Client Review"}
                </h2>
              </div>


              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-[#17213A] disabled:cursor-not-allowed"
              >
                <X size={20} />
              </button>

            </div>


            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto"
            >

              <div className="space-y-5 px-5 py-6 sm:px-6">

                {/* Client Name */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                    Client Name
                  </label>

                  <input
                    type="text"
                    name="client_name"
                    value={form.client_name}
                    onChange={handleChange}
                    placeholder="Enter client name"
                    className="w-full rounded-xl border border-[#CBD8E6] bg-white px-4 py-3 text-sm text-[#17213A] outline-none transition placeholder:text-slate-400 focus:border-[#17213A] focus:ring-2 focus:ring-[#17213A]/10"
                  />
                </div>


                {/* Designation */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                    Designation
                    <span className="ml-1 font-normal text-slate-400">
                      (optional)
                    </span>
                  </label>

                  <input
                    type="text"
                    name="designation"
                    value={form.designation}
                    onChange={handleChange}
                    placeholder="e.g. PhD Scholar, Researcher"
                    className="w-full rounded-xl border border-[#CBD8E6] bg-white px-4 py-3 text-sm text-[#17213A] outline-none transition placeholder:text-slate-400 focus:border-[#17213A] focus:ring-2 focus:ring-[#17213A]/10"
                  />
                </div>


                {/* Rating + Order */}
                <div className="grid gap-5 sm:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                      Rating
                    </label>

                    <select
                      name="rating"
                      value={form.rating}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[#CBD8E6] bg-white px-4 py-3 text-sm text-[#17213A] outline-none focus:border-[#17213A] focus:ring-2 focus:ring-[#17213A]/10"
                    >
                      <option value={5}>
                        5 Stars
                      </option>
                      <option value={4}>
                        4 Stars
                      </option>
                      <option value={3}>
                        3 Stars
                      </option>
                      <option value={2}>
                        2 Stars
                      </option>
                      <option value={1}>
                        1 Star
                      </option>
                    </select>
                  </div>


                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                      Display Order
                    </label>

                    <input
                      type="number"
                      name="display_order"
                      min="0"
                      value={form.display_order}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[#CBD8E6] bg-white px-4 py-3 text-sm text-[#17213A] outline-none focus:border-[#17213A] focus:ring-2 focus:ring-[#17213A]/10"
                    />
                  </div>

                </div>

                {/* Review Date */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                    Review Date
                  </label>

                  <input
                    type="datetime-local"
                    name="created_at"
                    value={
                      form.created_at
                        ? new Date(form.created_at)
                            .toISOString()
                            .slice(0, 16)
                        : ""
                    }
                    onChange={(event) => {
                      const value = event.target.value;

                      setForm((previous) => ({
                        ...previous,
                        created_at: value
                          ? new Date(value).toISOString()
                          : "",
                      }));
                    }}
                    className="w-full rounded-xl border border-[#CBD8E6] bg-white px-4 py-3 text-sm text-[#17213A] outline-none transition focus:border-[#17213A] focus:ring-2 focus:ring-[#17213A]/10"
                  />

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Automatically set to the current date and time. You can change it manually.
                  </p>
                </div>

                {/* Review */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                    Review
                  </label>

                  <textarea
                    name="review"
                    value={form.review}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Enter the client's review..."
                    className="w-full resize-none rounded-xl border border-[#CBD8E6] bg-white px-4 py-3 text-sm leading-6 text-[#17213A] outline-none transition placeholder:text-slate-400 focus:border-[#17213A] focus:ring-2 focus:ring-[#17213A]/10"
                  />
                </div>


                {/* Client Photo */}
                <div>
                <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                    Client Photo
                    <span className="ml-1 font-normal text-slate-400">
                    (optional)
                    </span>
                </label>

                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    disabled={saving}
                    className="w-full cursor-pointer rounded-xl border border-[#CBD8E6] bg-white px-4 py-3 text-sm text-[#17213A] file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#EAF1FA] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[#17213A]"
                />

                {form.photo_url && (
                    <div className="mt-4 flex items-center gap-4 rounded-xl border border-[#DCE5F0] bg-[#F8FAFD] p-3">
                    <img
                        src={getImageUrl(form.photo_url)}
                        alt="Client"
                        className="h-16 w-16 rounded-full border border-[#DCE5F0] object-cover"
                    />

                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#17213A]">
                        Photo selected
                        </p>

                        <button
                        type="button"
                        onClick={() =>
                            setForm((previous) => ({
                            ...previous,
                            photo_url: "",
                            }))
                        }
                        className="mt-1 cursor-pointer text-xs font-semibold text-red-600 hover:text-red-700"
                        >
                        Remove photo
                        </button>
                    </div>
                    </div>
                )}

                <p className="mt-2 text-xs leading-5 text-slate-400">
                    JPG, PNG, or WEBP · Maximum 10 MB
                </p>
                </div>


                {/* Publish */}
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#DCE5F0] bg-[#F5F8FC] p-4">

                  <input
                    type="checkbox"
                    name="is_published"
                    checked={form.is_published}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-[#17213A] focus:ring-[#17213A]"
                  />

                  <span>
                    <span className="block text-sm font-semibold text-[#17213A]">
                      Publish this review
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      Published reviews will appear on the public About page.
                    </span>
                  </span>

                </label>

              </div>

              {/* Footer */}
              <div className="flex flex-col-reverse gap-3 border-t border-[#DCE5F0] bg-[#F8FAFD] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-[#CBD8E6] bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#17213A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0F172A] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {editingReview
                    ? "Save Changes"
                    : "Add Review"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}


export default AdminReviews;