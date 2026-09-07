import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PenLine,
  Settings,
  Users,
  Wrench,
} from "lucide-react";

import { Link } from "react-router-dom";
import { apiFetch } from "../utils/api";
import AdminSidebar from "../components/AdminSidebar";

function Admin() {
  const [stats, setStats] = useState({
    categories: 0,
    services: 0,
    enquiries: 0,
    blogPosts: 0,
    newEnquiries: 0,
  });

  const [recentEnquiries, setRecentEnquiries] =
    useState([]);

  const [recentBlogs, setRecentBlogs] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  /* =====================================================
     FETCH DASHBOARD DATA
  ====================================================== */

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [
          categoriesResponse,
          servicesResponse,
          enquiriesResponse,
          blogResponse,
        ] = await Promise.all([
          apiFetch("/api/admin/categories"),
          apiFetch("/api/admin/services"),
          apiFetch("/api/admin/contact"),
          apiFetch("/api/admin/blog"),
        ]);

        /* -----------------------------
           CATEGORIES
        ----------------------------- */

        let categoriesData = [];

        if (categoriesResponse.ok) {
          categoriesData =
            await categoriesResponse.json();
        }

        /* -----------------------------
           SERVICES
        ----------------------------- */

        let servicesData = [];

        if (servicesResponse.ok) {
          servicesData =
            await servicesResponse.json();
        }

        /* -----------------------------
           ENQUIRIES
        ----------------------------- */

        let enquiriesData = [];

        if (enquiriesResponse.ok) {
          enquiriesData =
            await enquiriesResponse.json();
        }

        /* -----------------------------
           BLOG
        ----------------------------- */

        let blogData = [];

        if (blogResponse.ok) {
          blogData =
            await blogResponse.json();
        }

        /* -----------------------------
           SORT ENQUIRIES
        ----------------------------- */

        const sortedEnquiries =
          [...enquiriesData].sort(
            (a, b) => {
              const dateA = new Date(
                a.created_at || 0
              ).getTime();

              const dateB = new Date(
                b.created_at || 0
              ).getTime();

              return dateB - dateA;
            }
          );

        /* -----------------------------
           SORT BLOG
        ----------------------------- */

        const sortedBlogs =
          [...blogData].sort(
            (a, b) => {
              const dateA = new Date(
                a.published_at ||
                  a.created_at ||
                  0
              ).getTime();

              const dateB = new Date(
                b.published_at ||
                  b.created_at ||
                  0
              ).getTime();

              return dateB - dateA;
            }
          );

        const newEnquiries =
          enquiriesData.filter(
            (item) =>
              String(item.status).toLowerCase() ===
              "new"
          ).length;

        setStats({
          categories:
            categoriesData.length,
          services:
            servicesData.length,
          enquiries:
            enquiriesData.length,
          blogPosts:
            blogData.length,
          newEnquiries,
        });

        setRecentEnquiries(
          sortedEnquiries.slice(0, 5)
        );

        setRecentBlogs(
          sortedBlogs.slice(0, 5)
        );
      } catch (error) {
        console.error(
          "Failed to load dashboard:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  /* =====================================================
     HELPERS
  ====================================================== */

  const formatDate = (dateString) => {
    if (!dateString) {
      return "—";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  const getStatusClasses = (status) => {
    switch (
      String(status).toLowerCase()
    ) {
      case "new":
        return "bg-blue-50 text-blue-700";

      case "contacted":
        return "bg-amber-50 text-amber-700";

      case "in progress":
        return "bg-purple-50 text-purple-700";

      case "completed":
        return "bg-green-50 text-green-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  /* =====================================================
     LOGOUT
  ====================================================== */

  const handleLogout = () => {
    localStorage.removeItem(
      "adminToken"
    );

    localStorage.removeItem(
      "adminUsername"
    );

    window.location.href =
      "/admin/login";
  };

  const username =
    localStorage.getItem(
      "adminUsername"
    ) || "Admin";

  /* =====================================================
     RENDER
  ====================================================== */

  return (
    <div className="min-h-screen bg-[#F5F8FC] text-slate-900">
      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 bg-[#17213A] lg:block">
          <AdminSidebar currentPage="/admin" />
      </aside>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="lg:ml-64">
        {/* HEADER */}

        <header className="border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-4 px-6 py-5 lg:px-8">
            <div>
              <h1 className="text-2xl font-bold text-[#17213A]">
                Dashboard
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage and monitor your Research
                Guru website.
              </p>
            </div>

            <div className="rounded-full bg-[#EEF4FA] px-4 py-2 text-sm font-medium text-[#17213A]">
              {username}
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-8">
          {/* =====================================================
              WELCOME
          ====================================================== */}

          <section className="rounded-[2rem] bg-[#17213A] p-7 text-white shadow-sm lg:p-9">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">
                Welcome back
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                Good to see you,{" "}
                {username}.
              </h2>

              <p className="mt-4 max-w-2xl leading-7 text-slate-300">
                Keep your services, enquiries,
                publications, and website settings
                organized from one place.
              </p>
            </div>
          </section>

          {/* =====================================================
              STATS
          ====================================================== */}

          <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {/* CATEGORIES */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Categories
                  </p>

                  <p className="mt-2 text-3xl font-bold text-[#17213A]">
                    {loading
                      ? "—"
                      : stats.categories}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF4FA] text-[#17213A]">
                  <LayoutDashboard
                    size={20}
                  />
                </div>
              </div>

              <Link
                to="/admin/services"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#17213A]"
              >
                Manage Categories
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* SERVICES */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Services
                  </p>

                  <p className="mt-2 text-3xl font-bold text-[#17213A]">
                    {loading
                      ? "—"
                      : stats.services}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF4FA] text-[#17213A]">
                  <Wrench size={20} />
                </div>
              </div>

              <Link
                to="/admin/services"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#17213A]"
              >
                Manage Services
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* ENQUIRIES */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Enquiries
                  </p>

                  <p className="mt-2 text-3xl font-bold text-[#17213A]">
                    {loading
                      ? "—"
                      : stats.enquiries}
                  </p>

                  {!loading &&
                    stats.newEnquiries >
                      0 && (
                      <p className="mt-1 text-xs font-semibold text-blue-600">
                        {stats.newEnquiries} new
                      </p>
                    )}
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF4FA] text-[#17213A]">
                  <MessageSquare
                    size={20}
                  />
                </div>
              </div>

              <Link
                to="/admin/contact"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#17213A]"
              >
                View Enquiries
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* BLOG */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Blog Posts
                  </p>

                  <p className="mt-2 text-3xl font-bold text-[#17213A]">
                    {loading
                      ? "—"
                      : stats.blogPosts}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF4FA] text-[#17213A]">
                  <BookOpen
                    size={20}
                  />
                </div>
              </div>

              <Link
                to="/admin/blog"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#17213A]"
              >
                Manage Blog
                <ArrowRight size={15} />
              </Link>
            </div>
          </section>

          {/* =====================================================
              QUICK ACTIONS
          ====================================================== */}

          <section className="mt-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#17213A]">
                Quick Actions
              </p>

              <h2 className="mt-2 text-2xl font-bold text-[#17213A]">
                Manage your website
              </h2>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Link
                to="/admin/services"
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-[#17213A] hover:shadow-lg"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF4FA] text-[#17213A]">
                  <Wrench size={20} />
                </div>

                <h3 className="mt-5 font-bold text-[#17213A]">
                  Manage Services
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Manage categories and individual
                  services shown across the website.
                </p>

                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#17213A]">
                  Open
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </Link>

              <Link
                to="/admin/blog"
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-[#17213A] hover:shadow-lg"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF4FA] text-[#17213A]">
                  <PenLine size={20} />
                </div>

                <h3 className="mt-5 font-bold text-[#17213A]">
                  Manage Blog
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Create, edit, publish, and manage
                  research articles.
                </p>

                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#17213A]">
                  Open
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </Link>

              <Link
                to="/admin/contact"
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-[#17213A] hover:shadow-lg"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF4FA] text-[#17213A]">
                  <MessageSquare
                    size={20}
                  />
                </div>

                <h3 className="mt-5 font-bold text-[#17213A]">
                  Contact Enquiries
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Review incoming research enquiries
                  and update their status.
                </p>

                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#17213A]">
                  Open
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </Link>

              <Link
                to="/admin/settings"
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-[#17213A] hover:shadow-lg"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF4FA] text-[#17213A]">
                  <Settings size={20} />
                </div>

                <h3 className="mt-5 font-bold text-[#17213A]">
                  Site Settings
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Manage logo, favicon, backgrounds,
                  and contact information.
                </p>

                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#17213A]">
                  Open
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </Link>
            </div>
          </section>

          {/* =====================================================
              RECENT ACTIVITY
          ====================================================== */}

          <section className="mt-8 grid gap-6 xl:grid-cols-2">
            {/* RECENT ENQUIRIES */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <h2 className="font-bold text-[#17213A]">
                    Recent Enquiries
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Latest contact form submissions.
                  </p>
                </div>

                <Link
                  to="/admin/contact"
                  className="text-sm font-semibold text-[#17213A]"
                >
                  View All
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {loading ? (
                  <div className="px-6 py-10 text-center text-sm text-slate-500">
                    Loading enquiries...
                  </div>
                ) : recentEnquiries.length ===
                  0 ? (
                  <div className="px-6 py-10 text-center">
                    <MessageSquare
                      size={28}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                      No enquiries yet.
                    </p>
                  </div>
                ) : (
                  recentEnquiries.map(
                    (enquiry) => (
                      <Link
                        key={
                          enquiry.id
                        }
                        to="/admin/contact"
                        className="block px-6 py-4 transition hover:bg-[#F8FAFC]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-[#17213A]">
                              {enquiry.name}
                            </p>

                            <p className="mt-1 truncate text-sm text-slate-500">
                              {enquiry.email}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {formatDate(
                                enquiry.created_at
                              )}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                              enquiry.status
                            )}`}
                          >
                            {enquiry.status ||
                              "New"}
                          </span>
                        </div>
                      </Link>
                    )
                  )
                )}
              </div>
            </div>

            {/* RECENT BLOG */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <h2 className="font-bold text-[#17213A]">
                    Recent Blog Posts
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Latest research articles.
                  </p>
                </div>

                <Link
                  to="/admin/blog"
                  className="text-sm font-semibold text-[#17213A]"
                >
                  View All
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {loading ? (
                  <div className="px-6 py-10 text-center text-sm text-slate-500">
                    Loading blog posts...
                  </div>
                ) : recentBlogs.length ===
                  0 ? (
                  <div className="px-6 py-10 text-center">
                    <BookOpen
                      size={28}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                      No blog posts yet.
                    </p>
                  </div>
                ) : (
                  recentBlogs.map(
                    (blog) => (
                      <Link
                        key={blog.id}
                        to="/admin/blog"
                        className="block px-6 py-4 transition hover:bg-[#F8FAFC]"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF4FA] text-[#17213A]">
                            <FileText
                              size={18}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-[#17213A]">
                              {blog.title}
                            </p>

                            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                              {blog.category && (
                                <span>
                                  {
                                    blog.category
                                  }
                                </span>
                              )}

                              <span>
                                {formatDate(
                                  blog.published_at ||
                                    blog.created_at
                                )}
                              </span>
                            </div>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                              blog.is_published
                                ? "bg-green-50 text-green-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {blog.is_published
                              ? "Published"
                              : "Draft"}
                          </span>
                        </div>
                      </Link>
                    )
                  )
                )}
              </div>
            </div>
          </section>

          {/* =====================================================
              SYSTEM STATUS
          ====================================================== */}

          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-bold text-[#17213A]">
                  System Status
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Current administration status.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Backend Connected
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Admin;