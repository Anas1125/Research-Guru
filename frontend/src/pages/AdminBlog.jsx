import { useEffect, useRef, useState } from "react";

import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Eye,
  EyeOff,
  Menu,
  FileImage,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import AdminSidebar from "../components/AdminSidebar";

import {
  apiFetch,
  API_URL,
} from "../utils/api";

/* =====================================================
   EMPTY FORM
===================================================== */

const emptyForm = {
  title: "",
  slug: "",
  category: "",
  excerpt: "",
  content: "",
  featured_image: "",
  is_published: false,
  display_order: "",
};

/* =====================================================
   ADMIN BLOG
===================================================== */

function AdminBlog() {
  const navigate = useNavigate();

  /* ===================================================
     STATE
  =================================================== */

  const [posts, setPosts] =
    useState([]);

  const [form, setForm] = useState({
    ...emptyForm,
  });

  const [editingId, setEditingId] =
    useState(null);

  const [showForm, setShowForm] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [postsLoading, setPostsLoading] =
    useState(true);

  const [selectedImage, setSelectedImage] =
    useState(null);

  const [imagePreview, setImagePreview] =
    useState(null);

  const [uploadingImage, setUploadingImage] =
    useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const fileInputRef =
    useRef(null);

  /* ===================================================
     LOAD POSTS
  =================================================== */

  const fetchPosts = async () => {
    try {
      setPostsLoading(true);

      const response =
        await apiFetch(
          "/api/admin/blog"
        );

      if (!response.ok) {
        const errorData =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          errorData?.detail ||
            "Failed to load blog posts."
        );
      }

      const data =
        await response.json();

      setPosts(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load blog posts:",
        error
      );
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  /* ===================================================
     FORM HELPERS
  =================================================== */

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9\s-]/g,
        ""
      )
      .replace(
        /\s+/g,
        "-"
      )
      .replace(
        /-+/g,
        "-"
      );
  };

  const handleTitleChange = (
    event
  ) => {
    const title =
      event.target.value;

    setForm((current) => ({
      ...current,
      title,

      slug: editingId
        ? current.slug
        : generateSlug(title),
    }));
  };

  /* ===================================================
     IMAGE PREVIEW
  =================================================== */

  useEffect(() => {
    if (!selectedImage) {
      setImagePreview(null);
      return;
    }

    const objectUrl =
      URL.createObjectURL(
        selectedImage
      );

    setImagePreview(objectUrl);

    return () => {
      URL.revokeObjectURL(
        objectUrl
      );
    };
  }, [selectedImage]);

  /* ===================================================
     CREATE
  =================================================== */

  const openCreate = () => {
    setEditingId(null);

    setForm({
      ...emptyForm,
    });

    setSelectedImage(null);
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }

    setShowForm(true);
  };

  /* ===================================================
     EDIT
  =================================================== */

  const openEdit = (post) => {
    setEditingId(post.id);

    setForm({
      title: post.title || "",
      slug: post.slug || "",
      category:
        post.category || "",
      excerpt:
        post.excerpt || "",
      content:
        post.content || "",
      featured_image:
        post.featured_image || "",
      is_published:
        Boolean(
          post.is_published
        ),
      display_order:
        post.display_order ?? 0,
    });

    setSelectedImage(null);
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }

    setShowForm(true);
  };

  /* ===================================================
     CLOSE
  =================================================== */

  const closeForm = () => {
    setEditingId(null);

    setForm({
      ...emptyForm,
    });

    setSelectedImage(null);
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }

    setShowForm(false);
  };

  /* ===================================================
     IMAGE SELECT
  =================================================== */

  const handleImageChange = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      alert(
        "Please select a JPG, PNG, or WEBP image."
      );

      event.target.value =
        "";

      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (
      file.size > maxSize
    ) {
      alert(
        "Image must be smaller than 5 MB."
      );

      event.target.value =
        "";

      return;
    }

    setSelectedImage(file);
  };

  /* ===================================================
     UPLOAD IMAGE
  =================================================== */

  const uploadImage = async () => {
    if (!selectedImage) {
      return (
        form.featured_image ||
        ""
      );
    }

    setUploadingImage(true);

    try {
      const imageFormData =
        new FormData();

      imageFormData.append(
        "file",
        selectedImage
      );

      const response =
        await apiFetch(
          "/api/admin/blog/upload-image",
          {
            method: "POST",
            body: imageFormData,
          }
        );

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Failed to upload image."
        );
      }

      if (!data?.image_url) {
        throw new Error(
          "The server did not return an image URL."
        );
      }

      return data.image_url;
    } finally {
      setUploadingImage(
        false
      );
    }
  };

  /* ===================================================
     SAVE POST
  =================================================== */

  const savePost = async (
    event
  ) => {
    event.preventDefault();

    if (
      !form.title.trim() ||
      !form.slug.trim() ||
      !form.content.trim()
    ) {
      alert(
        "Title, slug, and article content are required."
      );

      return;
    }

    setLoading(true);

    try {
      const featuredImage =
        await uploadImage();

      const url = editingId
        ? `/api/admin/blog/${editingId}`
        : "/api/admin/blog";

      const body = {
        title:
          form.title.trim(),

        slug:
          form.slug.trim(),

        category:
          form.category ||
          null,

        excerpt:
          form.excerpt.trim() ||
          null,

        content:
          form.content.trim(),

        featured_image:
          featuredImage || null,

        is_published:
          Boolean(
            form.is_published
          ),

        display_order:
          form.display_order === ""
            ? null
            : Number(form.display_order),
        };

      const response =
        await apiFetch(url, {
          method: editingId
            ? "PUT"
            : "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            body
          ),
        });

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Failed to save blog post."
        );
      }

      await fetchPosts();

      closeForm();
    } catch (error) {
      console.error(
        "Failed to save blog post:",
        error
      );

      alert(
        error.message ||
          "Failed to save blog post."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ===================================================
     DELETE POST
  =================================================== */

  const deletePost = async (
    id
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this blog post?"
      );

    if (!confirmed) {
      return;
    }

    try {
      const response =
        await apiFetch(
          `/api/admin/blog/${id}`,
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
            "Failed to delete blog post."
        );
      }

      await fetchPosts();
    } catch (error) {
      console.error(
        "Failed to delete blog post:",
        error
      );

      alert(
        error.message ||
          "Failed to delete blog post."
      );
    }
  };

  /* ===================================================
     IMAGE URL
  =================================================== */

  const getImageUrl = (
    imagePath
  ) => {
    if (!imagePath) {
      return null;
    }

    if (
      imagePath.startsWith(
        "http://"
      ) ||
      imagePath.startsWith(
        "https://"
      )
    ) {
      return imagePath;
    }

    return `${API_URL}${imagePath}`;
  };

  /* ===================================================
     LOGOUT
  =================================================== */

  const handleLogout = () => {
    localStorage.removeItem(
      "adminToken"
    );

    localStorage.removeItem(
      "adminUsername"
    );

    navigate(
      "/admin/login"
    );
  };

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <div className="min-h-screen bg-[#F5F8FC] text-slate-900">
      {/* =================================================
          DESKTOP SIDEBAR
      ================================================== */}

      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 bg-[#17213A] lg:block">
        <AdminSidebar
          currentPage="/admin/blog"
          onLogout={
            handleLogout
          }
        />
      </aside>

      {/* =================================================
          MOBILE SIDEBAR
      ================================================== */}

      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 cursor-pointer bg-black/40 lg:hidden"
            onClick={() =>
              setMobileMenuOpen(
                false
              )
            }
          />

          <aside className="fixed inset-y-0 left-0 z-[60] w-72 bg-[#17213A] lg:hidden">
            <AdminSidebar
              currentPage="/admin/blog"
              mobile
              onClose={() =>
                setMobileMenuOpen(
                  false
                )
              }
              onLogout={
                handleLogout
              }
            />
          </aside>
        </>
      )}

      {/* =================================================
          MOBILE HEADER
      ================================================== */}

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white lg:hidden">
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(true)
              }
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-[#17213A] transition hover:bg-[#EEF4FA]"
              aria-label="Open admin menu"
            >
              <Menu size={21} />
            </button>

            <div className="min-w-0">
              <p className="text-lg font-bold text-[#17213A]">
                Blog
              </p>

              <p className="text-xs text-slate-500">
                Blog Management
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* =================================================
          MAIN
      ================================================== */}

      <main className="lg:ml-64">
        {/* =================================================
            HEADER
        ================================================== */}

        <header className="border-b border-slate-200 bg-white">
          <div className="flex flex-col justify-between gap-4 px-5 py-5 sm:flex-row sm:items-center sm:px-6 lg:px-8">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Content Management
              </p>

              <h1 className="mt-1 text-2xl font-bold text-[#17213A]">
                Blog
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Create and manage Research Guru articles.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreate}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#17213A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0F172A]"
            >
              <Plus size={17} />
              Add Blog Post
            </button>
          </div>
        </header>

        <div className="p-5 sm:p-6 lg:p-8">
          {/* =================================================
              STATS
          ================================================== */}

          <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-sm text-slate-500">
                Total Posts
              </p>

              <p className="mt-2 text-3xl font-bold text-[#17213A]">
                {posts.length}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-sm text-slate-500">
                Published
              </p>

              <p className="mt-2 text-3xl font-bold text-[#17213A]">
                {
                  posts.filter(
                    (post) =>
                      post.is_published
                  ).length
                }
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-sm text-slate-500">
                Drafts
              </p>

              <p className="mt-2 text-3xl font-bold text-[#17213A]">
                {
                  posts.filter(
                    (post) =>
                      !post.is_published
                  ).length
                }
              </p>
            </div>
          </div>

          {/* =================================================
              POSTS
          ================================================== */}

          <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <h2 className="font-bold text-[#17213A]">
                Blog Posts
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Published articles appear on the public website.
              </p>
            </div>

            {postsLoading ? (
              <div className="px-6 py-14 text-center">
                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-[#17213A]" />

                <p className="mt-4 text-sm text-slate-500">
                  Loading blog posts...
                </p>
              </div>
            ) : posts.length ===
              0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF4FA] text-[#17213A]">
                  <Pencil size={24} />
                </div>

                <h3 className="mt-5 text-lg font-bold text-[#17213A]">
                  No blog posts yet
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Create your first article to get started.
                </p>

                <button
                  type="button"
                  onClick={
                    openCreate
                  }
                  className="mt-5 cursor-pointer font-semibold text-[#17213A]"
                >
                  Create your first post
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {posts.map(
                  (post) => {
                    const imageUrl =
                      getImageUrl(
                        post.featured_image
                      );

                    return (
                      <div
                        key={
                          post.id
                        }
                        className="flex flex-col gap-5 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between"
                      >
                        <div className="flex min-w-0 gap-4">
                          {/* IMAGE */}

                          <div className="hidden h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-[#EEF4FA] sm:block">
                            {imageUrl ? (
                              <img
                                src={
                                  imageUrl
                                }
                                alt={
                                  post.title
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-[#17213A]">
                                <FileImage
                                  size={
                                    24
                                  }
                                />
                              </div>
                            )}
                          </div>

                          {/* CONTENT */}

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              {post.category && (
                                <span className="rounded-full bg-[#EAF1FA] px-3 py-1 text-xs font-semibold text-[#17213A]">
                                  {
                                    post.category
                                  }
                                </span>
                              )}

                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                                  post.is_published
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                {post.is_published ? (
                                  <Eye
                                    size={
                                      13
                                    }
                                  />
                                ) : (
                                  <EyeOff
                                    size={
                                      13
                                    }
                                  />
                                )}

                                {post.is_published
                                  ? "Published"
                                  : "Draft"}
                              </span>
                            </div>

                            <h3 className="mt-3 break-words text-lg font-bold text-[#17213A]">
                              {
                                post.title
                              }
                            </h3>

                            <p className="mt-1 break-all text-sm text-slate-500">
                              /blog/
                              {
                                post.slug
                              }
                            </p>

                            {post.excerpt && (
                              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                                {
                                  post.excerpt
                                }
                              </p>
                            )}
                          </div>
                        </div>

                        {/* ACTIONS */}

                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEdit(
                                post
                              )
                            }
                            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-[#17213A] transition hover:bg-slate-50"
                          >
                            <Pencil
                              size={
                                15
                              }
                            />

                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deletePost(
                                post.id
                              )
                            }
                            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-red-200 px-3.5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            <Trash2
                              size={
                                15
                              }
                            />

                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* =====================================================
          CREATE / EDIT MODAL
      ====================================================== */}

      {showForm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#17213A]/50 p-3 sm:p-5">
          <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-5 sm:px-6">
              <div>
                <h2 className="text-xl font-bold text-[#17213A]">
                  {editingId
                    ? "Edit Blog Post"
                    : "Create Blog Post"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Manage the article content stored in the database.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeForm
                }
                className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-[#17213A]"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={savePost}
              className="space-y-6 p-5 sm:p-6"
            >
              {/* TITLE / SLUG */}

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                    Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={
                      form.title
                    }
                    onChange={
                      handleTitleChange
                    }
                    placeholder="How to Choose the Right Research Topic"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#17213A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                    Slug
                  </label>

                  <input
                    type="text"
                    name="slug"
                    value={
                      form.slug
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="how-to-choose-the-right-research-topic"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#17213A] focus:bg-white"
                  />
                </div>
              </div>

              {/* CATEGORY / IMAGE */}

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                    Category
                  </label>

                  <select
                    name="category"
                    value={
                      form.category
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#17213A] focus:bg-white"
                  >
                    <option value="">
                      Select category
                    </option>

                    <option value="Research">
                      Research
                    </option>

                    <option value="Writing">
                      Writing
                    </option>

                    <option value="Publication">
                      Publication
                    </option>

                    <option value="Implementation">
                      Implementation
                    </option>
                  </select>
                </div>

                {/* FEATURED IMAGE */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                    Featured Image
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 transition hover:border-[#17213A] hover:bg-white">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF1FA] text-[#17213A]">
                      <FileImage
                        size={20}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#17213A]">
                        {selectedImage
                          ? selectedImage.name
                          : form.featured_image
                          ? "Replace current image"
                          : "Choose an image from your computer"}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        JPG, PNG, or WEBP · Max 5 MB
                      </p>
                    </div>

                    <input
                      ref={
                        fileInputRef
                      }
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={
                        handleImageChange
                      }
                    />
                  </label>
                </div>
              </div>

              {/* IMAGE PREVIEW */}

              {(imagePreview ||
                form.featured_image) && (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[#F8FAFC]">
                  <div className="relative">
                    <img
                      src={
                        imagePreview ||
                        getImageUrl(
                          form.featured_image
                        )
                      }
                      alt="Featured preview"
                      className="max-h-72 w-full object-cover"
                    />

                    {selectedImage && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImage(
                            null
                          );

                          if (
                            fileInputRef.current
                          ) {
                            fileInputRef.current.value =
                              "";
                          }
                        }}
                        className="absolute right-3 top-3 cursor-pointer rounded-lg bg-white/95 p-2 text-slate-600 shadow-md transition hover:bg-white hover:text-red-600"
                        aria-label="Remove selected image"
                      >
                        <X size={17} />
                      </button>
                    )}
                  </div>

                  <div className="px-4 py-3">
                    <p className="text-xs text-slate-500">
                      {selectedImage
                        ? "New image selected. It will be uploaded when you save the article."
                        : "Current featured image"}
                    </p>
                  </div>
                </div>
              )}

              {/* EXCERPT */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                  Excerpt
                </label>

                <textarea
                  name="excerpt"
                  value={
                    form.excerpt
                  }
                  onChange={
                    handleChange
                  }
                  rows="3"
                  placeholder="Short description shown on blog cards..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#17213A] focus:bg-white"
                />
              </div>

              {/* CONTENT */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                  Article Content
                </label>

                <textarea
                  name="content"
                  value={
                    form.content
                  }
                  onChange={
                    handleChange
                  }
                  rows="16"
                  required
                  placeholder="Write the full article here..."
                  className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#17213A] focus:bg-white"
                />

                <p className="mt-2 text-xs text-slate-400">
                  The public blog calculates reading time from this content.
                </p>
              </div>

              {/* ORDER / PUBLISH */}

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                    Display Order
                  </label>

                  <input
                    type="number"
                    name="display_order"
                    value={
                      form.display_order
                    }
                    onChange={
                      handleChange
                    }
                    min="0"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#17213A] focus:bg-white"
                  />
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <input
                    type="checkbox"
                    name="is_published"
                    checked={
                      form.is_published
                    }
                    onChange={
                      handleChange
                    }
                    className="h-4 w-4 cursor-pointer"
                  />

                  <span>
                    <span className="block text-sm font-semibold text-[#17213A]">
                      Publish Article
                    </span>

                    <span className="block text-xs text-slate-500">
                      Published posts appear publicly.
                    </span>
                  </span>
                </label>
              </div>

              {/* ACTIONS */}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={
                    closeForm
                  }
                  disabled={
                    loading ||
                    uploadingImage
                  }
                  className="cursor-pointer rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    uploadingImage
                  }
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#17213A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0F172A] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={17} />

                  {uploadingImage
                    ? "Uploading Image..."
                    : loading
                    ? "Saving..."
                    : editingId
                    ? "Update Post"
                    : "Create Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBlog;