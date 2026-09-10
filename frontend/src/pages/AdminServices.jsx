import { useEffect, useState } from "react";

import {
  Plus,
  Pencil,
  Trash2,
  X,
  Menu,
  Wrench,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import AdminSidebar from "../components/AdminSidebar";

import { apiFetch } from "../utils/api";

function AdminServices() {
  const navigate = useNavigate();

  /* =====================================================
     STATE
  ====================================================== */

  const [categories, setCategories] =
    useState([]);

  const [services, setServices] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [showCategoryForm, setShowCategoryForm] =
    useState(false);

  const [editingCategory, setEditingCategory] =
    useState(null);

  const [categoryName, setCategoryName] =
    useState("");

  const [categoryDescription, setCategoryDescription] =
    useState("");

  const [showServiceForm, setShowServiceForm] =
    useState(false);

  const [editingService, setEditingService] =
    useState(null);

  const [serviceName, setServiceName] =
    useState("");

  const [serviceDescription, setServiceDescription] =
    useState("");

  const [serviceCategory, setServiceCategory] =
    useState("");

  const [serviceDisplayOrder, setServiceDisplayOrder] =
    useState("");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  /* =====================================================
     FETCH DATA
  ====================================================== */

  async function fetchData() {
    try {
      setLoading(true);

      const [
        categoriesResponse,
        servicesResponse,
      ] = await Promise.all([
        apiFetch(
          "/api/admin/categories"
        ),
        apiFetch(
          "/api/admin/services"
        ),
      ]);

      if (
        !categoriesResponse.ok ||
        !servicesResponse.ok
      ) {
        const categoryError =
          await categoriesResponse
            .json()
            .catch(() => null);

        const serviceError =
          await servicesResponse
            .json()
            .catch(() => null);

        throw new Error(
          categoryError?.detail ||
            serviceError?.detail ||
            "Failed to fetch service data."
        );
      }

      const categoriesData =
        await categoriesResponse.json();

      const servicesData =
        await servicesResponse.json();

      setCategories(
        categoriesData
      );

      setServices(
        servicesData
      );

      if (
        categoriesData.length > 0 &&
        !serviceCategory
      ) {
        setServiceCategory(
          String(
            categoriesData[0].id
          )
        );
      }
    } catch (error) {
      console.error(
        "Failed to fetch service data:",
        error
      );

      alert(
        error.message ||
          "Failed to fetch service data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  /* =====================================================
     CATEGORY
  ====================================================== */

  function openAddCategory() {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryDescription("");

    setShowCategoryForm(true);
    setShowServiceForm(false);
  }

  function openEditCategory(
    category
  ) {
    setEditingCategory(
      category
    );

    setCategoryName(
      category.name || ""
    );

    setCategoryDescription(
      category.description || ""
    );

    setShowCategoryForm(true);
    setShowServiceForm(false);
  }

  function closeCategoryForm() {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryDescription("");
    setShowCategoryForm(false);
  }

  async function saveCategory(
    event
  ) {
    event.preventDefault();

    if (
      !categoryName.trim()
    ) {
      alert(
        "Category name is required."
      );

      return;
    }

    try {
      const url =
        editingCategory
          ? `/api/admin/categories/${editingCategory.id}`
          : "/api/admin/categories";

      const response =
        await apiFetch(url, {
          method:
            editingCategory
              ? "PUT"
              : "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name:
              categoryName.trim(),

            description:
              categoryDescription.trim() ||
              null,
          }),
        });

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Failed to save category."
        );
      }

      closeCategoryForm();

      await fetchData();
    } catch (error) {
      console.error(
        "Failed to save category:",
        error
      );

      alert(
        error.message ||
          "Failed to save category."
      );
    }
  }

  async function deleteCategory(
    category
  ) {
    const confirmed =
      window.confirm(
        `Delete "${category.name}"? This will also delete all services inside this category.`
      );

    if (!confirmed) {
      return;
    }

    try {
      const response =
        await apiFetch(
          `/api/admin/categories/${category.id}`,
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
            "Failed to delete category."
        );
      }

      await fetchData();
    } catch (error) {
      console.error(
        "Failed to delete category:",
        error
      );

      alert(
        error.message ||
          "Failed to delete category."
      );
    }
  }

  /* =====================================================
     SERVICE
  ====================================================== */

  function openAddService() {
    setEditingService(null);

    setServiceName("");
    setServiceDescription("");
    setServiceDisplayOrder("");

    if (categories.length > 0) {
      setServiceCategory(
        String(
          categories[0].id
        )
      );
    } else {
      setServiceCategory("");
    }

    setShowServiceForm(true);
    setShowCategoryForm(false);

    setTimeout(() => {
      document
        .getElementById("service-form")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);

  }

  function openEditService(
    service
  ) {
    setEditingService(
      service
    );

    setServiceName(
      service.name || ""
    );

    setServiceDescription(
      service.description || ""
    );

    setServiceCategory(
      String(
        service.category_id
      )
    );

    setServiceDisplayOrder(
      service.display_order ?? 0
    );

    setShowServiceForm(true);
    setShowCategoryForm(false);

    setTimeout(() => {
      document
        .getElementById("service-form")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
    }

  function closeServiceForm() {
    setEditingService(null);

    setServiceName("");
    setServiceDescription("");
    setServiceDisplayOrder(0);

    if (categories.length > 0) {
      setServiceCategory(
        String(
          categories[0].id
        )
      );
    } else {
      setServiceCategory("");
    }

    setShowServiceForm(false);
  }

  async function saveService(
    event
  ) {
    event.preventDefault();

    if (
      !serviceName.trim()
    ) {
      alert(
        "Service name is required."
      );

      return;
    }

    if (!serviceCategory) {
      alert(
        "Please select a category."
      );

      return;
    }

    try {
      const url =
        editingService
          ? `/api/admin/services/${editingService.id}`
          : "/api/admin/services";

      const body = {
        category_id:
          Number(
            serviceCategory
          ),

        name:
          serviceName.trim(),

        description:
          serviceDescription.trim() ||
          null,

        display_order:
          serviceDisplayOrder === ""
            ? null
            : Number(serviceDisplayOrder),
      };

      if (editingService) {
        body.is_active =
          editingService.is_active;
      }

      const response =
        await apiFetch(url, {
          method:
            editingService
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
            "Failed to save service."
        );
      }

      closeServiceForm();

      await fetchData();
    } catch (error) {
      console.error(
        "Failed to save service:",
        error
      );

      alert(
        error.message ||
          "Failed to save service."
      );
    }
  }

  async function deleteService(
    service
  ) {
    const confirmed =
      window.confirm(
        `Delete "${service.name}"? This action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      const response =
        await apiFetch(
          `/api/admin/services/${service.id}`,
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
            "Failed to delete service."
        );
      }

      await fetchData();
    } catch (error) {
      console.error(
        "Failed to delete service:",
        error
      );

      alert(
        error.message ||
          "Failed to delete service."
      );
    }
  }

  /* =====================================================
     HELPERS
  ====================================================== */

  function getCategoryName(
    categoryId
  ) {
    const category =
      categories.find(
        (item) =>
          item.id ===
          categoryId
      );

    return (
      category?.name ||
      "Unknown"
    );
  }

  function handleMobileClose() {
    setSidebarOpen(false);
  }

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
          currentPage="/admin/services"
        />
      </aside>

      {/* =================================================
          MOBILE SIDEBAR
      ================================================== */}

      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 cursor-pointer bg-black/40 lg:hidden"
            onClick={
              handleMobileClose
            }
          />

          <aside className="fixed inset-y-0 left-0 z-[60] w-72 bg-[#17213A] lg:hidden">
            <AdminSidebar
              currentPage="/admin/services"
              mobile
              onClose={
                handleMobileClose
              }
              onLogout={() => {
                localStorage.removeItem(
                  "adminToken"
                );

                localStorage.removeItem(
                  "adminUsername"
                );

                navigate(
                  "/admin/login"
                );
              }}
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
                  Content Management
                </p>

                <h1 className="mt-1 text-xl font-bold text-[#17213A] sm:text-2xl">
                  Services
                </h1>

                <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                  Manage service categories and individual services.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={
                  openAddCategory
                }
                className="hidden cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#17213A] transition hover:bg-slate-50 sm:inline-flex"
              >
                <Plus size={17} />
                Add Category
              </button>

              <button
                type="button"
                onClick={
                  openAddService
                }
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#17213A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0F172A]"
              >
                <Plus size={17} />

                <span className="hidden sm:inline">
                  Add Service
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* =================================================
            CONTENT
        ================================================== */}

        <div className="p-4 sm:p-6 lg:p-8">
          {/* SUMMARY */}

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Categories
              </p>

              <p className="mt-2 text-3xl font-bold text-[#17213A]">
                {loading
                  ? "—"
                  : categories.length}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Main service groups
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Services
              </p>

              <p className="mt-2 text-3xl font-bold text-[#17213A]">
                {loading
                  ? "—"
                  : services.length}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Individual services
              </p>
            </div>
          </div>

          {/* =================================================
              CATEGORY FORM
          ================================================== */}

          {showCategoryForm && (
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
                <div>
                  <h2 className="font-bold text-[#17213A]">
                    {editingCategory
                      ? "Edit Category"
                      : "Add Category"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Define the main group used to organize services.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeCategoryForm
                  }
                  className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close category form"
                >
                  <X size={19} />
                </button>
              </div>

              <form
                onSubmit={
                  saveCategory
                }
                className="p-5 sm:p-6"
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                      Category Name
                    </label>

                    <input
                      type="text"
                      value={
                        categoryName
                      }
                      onChange={(e) =>
                        setCategoryName(
                          e.target.value
                        )
                      }
                      placeholder="Implementation"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#17213A] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                      Description
                    </label>

                    <input
                      type="text"
                      value={
                        categoryDescription
                      }
                      onChange={(e) =>
                        setCategoryDescription(
                          e.target.value
                        )
                      }
                      placeholder="Short category description"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#17213A] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={
                      closeCategoryForm
                    }
                    className="cursor-pointer rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="cursor-pointer rounded-xl bg-[#17213A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0F172A]"
                  >
                    {editingCategory
                      ? "Update Category"
                      : "Save Category"}
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* =================================================
              SERVICE FORM
          ================================================== */}

          {showServiceForm && (
            <section
              id="service-form"
              className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
                <div>
                  <h2 className="font-bold text-[#17213A]">
                    {editingService
                      ? "Edit Service"
                      : "Add Service"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Add an individual service to a category.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeServiceForm
                  }
                  className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close service form"
                >
                  <X size={19} />
                </button>
              </div>

              <form
                onSubmit={
                  saveService
                }
                className="p-5 sm:p-6"
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                      Service Name
                    </label>

                    <input
                      type="text"
                      value={
                        serviceName
                      }
                      onChange={(e) =>
                        setServiceName(
                          e.target.value
                        )
                      }
                      placeholder="Research Paper Writing"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#17213A] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                      Category
                    </label>

                    <select
                      value={
                        serviceCategory
                      }
                      onChange={(e) =>
                        setServiceCategory(
                          e.target.value
                        )
                      }
                      className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#17213A] focus:bg-white"
                    >
                      <option value="">
                        Select category
                      </option>

                      {categories.map(
                        (category) => (
                          <option
                            key={
                              category.id
                            }
                            value={
                              category.id
                            }
                          >
                            {
                              category.name
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-[1fr_180px]">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                      Description
                    </label>

                    <textarea
                      value={
                        serviceDescription
                      }
                      onChange={(e) =>
                        setServiceDescription(
                          e.target.value
                        )
                      }
                      rows={4}
                      placeholder="Short description of this service"
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#17213A] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#17213A]">
                      Display Order
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        serviceDisplayOrder
                      }
                      onChange={(e) =>
                        setServiceDisplayOrder(
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#17213A] focus:bg-white"
                    />

                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      Lower numbers appear first.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={
                      closeServiceForm
                    }
                    className="cursor-pointer rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="cursor-pointer rounded-xl bg-[#17213A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0F172A]"
                  >
                    {editingService
                      ? "Update Service"
                      : "Save Service"}
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* =================================================
              CATEGORIES
          ================================================== */}

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-[#17213A]">
                  Service Categories
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Manage the main groups used throughout the public website.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  openAddCategory
                }
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#17213A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0F172A] sm:hidden"
              >
                <Plus size={17} />
                Add Category
              </button>
            </div>

            {loading ? (
              <div className="flex min-h-[180px] items-center justify-center">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-[#17213A]" />
                  Loading categories...
                </div>
              </div>
            ) : categories.length ===
              0 ? (
              <div className="px-6 py-12 text-center">
                <Wrench
                  size={32}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm text-slate-500">
                  No service categories found.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {categories.map(
                  (category) => {
                    const categoryServiceCount =
                      services.filter(
                        (service) =>
                          service.category_id ===
                          category.id
                      ).length;

                    return (
                      <div
                        key={
                          category.id
                        }
                        className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-[#17213A]">
                              {
                                category.name
                              }
                            </h3>

                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                              Active
                            </span>
                          </div>

                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            {category.description ||
                              "No description"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {
                              categoryServiceCount
                            }{" "}
                            service
                            {categoryServiceCount ===
                            1
                              ? ""
                              : "s"}
                          </p>
                        </div>

                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditCategory(
                                category
                              )
                            }
                            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-[#17213A] hover:bg-slate-50 hover:text-[#17213A]"
                          >
                            <Pencil
                              size={15}
                            />

                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteCategory(
                                category
                              )
                            }
                            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-red-200 px-3.5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            <Trash2
                              size={15}
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

          {/* =================================================
              INDIVIDUAL SERVICES
          ================================================== */}

          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <h2 className="text-lg font-bold text-[#17213A]">
                Individual Services
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage the individual services displayed under each category.
              </p>
            </div>

            {loading ? (
              <div className="flex min-h-[220px] items-center justify-center">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-[#17213A]" />
                  Loading services...
                </div>
              </div>
            ) : services.length ===
              0 ? (
              <div className="px-6 py-12 text-center">
                <Wrench
                  size={32}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm text-slate-500">
                  No services found.
                </p>

                <button
                  type="button"
                  onClick={
                    openAddService
                  }
                  className="mt-4 cursor-pointer font-semibold text-[#17213A]"
                >
                  Add your first service
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Service
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Category
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Order
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {services
                      .slice()
                      .sort(
                        (a, b) => {
                          const categoryA =
                            getCategoryName(
                              a.category_id
                            );

                          const categoryB =
                            getCategoryName(
                              b.category_id
                            );

                          if (
                            categoryA !==
                            categoryB
                          ) {
                            return categoryA.localeCompare(
                              categoryB
                            );
                          }

                          return (
                            Number(
                              a.display_order ??
                                0
                            ) -
                            Number(
                              b.display_order ??
                                0
                            )
                          );
                        }
                      )
                      .map(
                        (service) => (
                          <tr
                            key={
                              service.id
                            }
                            className="transition hover:bg-slate-50"
                          >
                            <td className="px-6 py-5">
                              <p className="font-semibold text-[#17213A]">
                                {
                                  service.name
                                }
                              </p>

                              {service.description && (
                                <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
                                  {
                                    service.description
                                  }
                                </p>
                              )}
                            </td>

                            <td className="px-6 py-5">
                              <span className="rounded-full bg-[#EAF1FA] px-3 py-1 text-xs font-semibold text-[#17213A]">
                                {getCategoryName(
                                  service.category_id
                                )}
                              </span>
                            </td>

                            <td className="px-6 py-5 text-sm text-slate-600">
                              {service.display_order ??
                                0}
                            </td>

                            <td className="px-6 py-5">
                              <span
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                                  service.is_active
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {service.is_active
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </td>

                            <td className="px-6 py-5">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditService(
                                      service
                                    )
                                  }
                                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-[#17213A] hover:bg-slate-50 hover:text-[#17213A]"
                                >
                                  <Pencil
                                    size={15}
                                  />

                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteService(
                                      service
                                    )
                                  }
                                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                >
                                  <Trash2
                                    size={15}
                                  />

                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* MOBILE CATEGORY ACTION */}

          <div className="mt-5 sm:hidden">
            <button
              type="button"
              onClick={
                openAddCategory
              }
              className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#17213A] transition hover:bg-slate-50"
            >
              + Add Another Category
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminServices;