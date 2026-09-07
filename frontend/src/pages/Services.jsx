import { useEffect, useState } from "react";

import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Code2,
  FileCheck2,
  FileText,
  FlaskConical,
  GraduationCap,
  Lightbulb,
  MessageSquare,
  PenTool,
  Search,
  Target,
  Users,
  Clock3,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  apiFetch,
  API_URL,
} from "../utils/api";

/* =====================================================
   SERVICE ICONS
===================================================== */

const iconMap = {
  Implementation: Code2,
  Writing: PenTool,
  Publication: Award,
};

/* =====================================================
   STATIC PROCESS CONTENT
===================================================== */

const processSteps = [
  {
    number: "01",
    icon: MessageSquare,
    title: "Understand",
    text: "We begin by understanding your research problem, objectives, existing work, and the support you require.",
  },
  {
    number: "02",
    icon: Search,
    title: "Plan",
    text: "We identify the appropriate research direction, methodology, technical approach, and expected deliverables.",
  },
  {
    number: "03",
    icon: FlaskConical,
    title: "Develop",
    text: "The required writing, implementation, analysis, documentation, or publication support is carried out around the project.",
  },
  {
    number: "04",
    icon: FileCheck2,
    title: "Review",
    text: "The work is reviewed against the research objectives, technical requirements, and intended academic outcome.",
  },
];

/* =====================================================
   STATIC HELP CONTENT
===================================================== */

const receiveItems = [
  {
    icon: Target,
    title: "Requirement Analysis",
    text: "Understand the research problem, objectives, scope, and expected deliverables.",
  },
  {
    icon: Lightbulb,
    title: "Research Direction",
    text: "Develop a clearer path for methodology, implementation, documentation, or publication.",
  },
  {
    icon: Code2,
    title: "Technical Support",
    text: "Build and refine technical components required for experiments and research implementation.",
  },
  {
    icon: FileText,
    title: "Academic Documentation",
    text: "Present methodology, results, discussions, and technical work in a structured format.",
  },
  {
    icon: BarChart3,
    title: "Analysis & Evaluation",
    text: "Support data analysis, experimentation, evaluation, interpretation, and visualization.",
  },
  {
    icon: Award,
    title: "Publication Readiness",
    text: "Prepare research content for appropriate journal and publication requirements.",
  },
];

/* =====================================================
   HELPERS
===================================================== */

const formatDate = (dateString) => {
  if (!dateString) {
    return "Recently published";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Recently published";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const calculateReadTime = (content) => {
  if (!content || !content.trim()) {
    return "1 min read";
  }

  const wordCount =
    content.trim().split(/\s+/).length;

  const minutes = Math.max(
    1,
    Math.ceil(wordCount / 200)
  );

  return `${minutes} min read`;
};

const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return null;
  }

  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://")
  ) {
    return imagePath;
  }

  return `${API_URL}${imagePath}`;
};

function getServiceIcon(name) {
  return iconMap[name] || BookOpen;
}

/* =====================================================
   SERVICES PAGE
===================================================== */

function Services() {
  const [categories, setCategories] =
    useState([]);

  const [activeCategory, setActiveCategory] =
    useState("");

  const [clients, setClients] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [blogs, setBlogs] =
    useState([]);

  const [blogsLoading, setBlogsLoading] =
    useState(true);

  const [openFaq, setOpenFaq] =
    useState(null);

  const [servicesBackground, setServicesBackground] =
    useState("");

  /* ===================================================
     LOAD SERVICES + SITE SETTINGS
  =================================================== */

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoading(true);

        const [
          servicesResponse,
          settingsResponse,
          clientsResponse,
        ] = await Promise.all([
          apiFetch("/api/services"),
          apiFetch("/api/site-settings"),
          apiFetch("/api/clients"),
        ]);

        /* -----------------------------
           SERVICES
        ----------------------------- */

        if (servicesResponse.ok) {
          const data =
            await servicesResponse.json();

          setCategories(data);

          if (data.length > 0) {
            setActiveCategory(
              data[0].name
            );
          }
        } else {
          throw new Error(
            "Failed to load services"
          );
        }

        /* -----------------------------
           SITE SETTINGS
        ----------------------------- */

        if (settingsResponse.ok) {
          const settings =
            await settingsResponse.json();

          setServicesBackground(
            settings.services_background ||
              ""
          );
        }

        /* -----------------------------
          OUR CLIENTS
        ----------------------------- */

        if (clientsResponse.ok) {
          const clientData =
            await clientsResponse.json();

          setClients(clientData);
        }

      } catch (error) {
        console.error(
          "Failed to load Services page data:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, []);

  /* ===================================================
     LOAD BLOG
  =================================================== */

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        setBlogsLoading(true);

        const response = await apiFetch(
          "/api/blog"
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load blog posts"
          );
        }

        const data =
          await response.json();

        const latestPosts = [...data]
          .sort((a, b) => {
            const orderA = Number(
              a.display_order ?? 0
            );

            const orderB = Number(
              b.display_order ?? 0
            );

            if (orderA !== orderB) {
              return orderA - orderB;
            }

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
          })
          .slice(0, 3);

        setBlogs(latestPosts);
      } catch (error) {
        console.error(
          "Failed to load blog posts:",
          error
        );
      } finally {
        setBlogsLoading(false);
      }
    };

    loadBlogs();
  }, []);

  /* ===================================================
     ACTIVE CATEGORY
  =================================================== */

  const activeData =
    categories.find(
      (category) =>
        category.name ===
        activeCategory
    );

  /* ===================================================
     IMPLEMENTATION DOMAINS
  =================================================== */

  const implementationCategory =
    categories.find(
      (category) =>
        category.name ===
        "Implementation"
    );

  const implementationDomains =
    implementationCategory?.services || [];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      {/* =====================================================
          HERO
      ====================================================== */}

      <section
        className="relative h-[calc(110vh-73px)] overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage:
            servicesBackground
              ? `url("${getImageUrl(
                  servicesBackground
                )}")`
              : "linear-gradient(to bottom right, #ffffff, #F8FAFE, #EAF1FA)",
        }}
      >
        {servicesBackground && (
          <div className="absolute inset-0 bg-white/75" />
        )}

        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-[#DCE7F5]/45 blur-3xl" />

        <div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-[#E3ECF8]/55 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <div className="max-w-4xl">
            <span className="inline-flex rounded-full border border-[#D5E0EE] bg-white/90 px-4 py-2 text-sm font-semibold text-[#17213A] shadow-sm backdrop-blur">
              Our Services
            </span>

            <h1 className="mt-6 text-5xl font-bold leading-[1.03] tracking-tight text-[#17213A] md:text-6xl lg:text-7xl">
              Research support
              <span className="block">
                built around your goals.
              </span>
            </h1>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">
              From academic writing and
              publication support to technical
              implementation and research
              analysis, Research Guru helps
              scholars move through the research
              lifecycle with greater structure and
              clarity.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#service-categories"
                className="inline-flex items-center gap-2 rounded-full bg-[#17213A] px-6 py-3.5 font-semibold text-white transition hover:bg-[#0F172A]"
              >
                Explore Services
                <ArrowRight size={18} />
              </a>

              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-[#CBD7E6] bg-white/90 px-6 py-3.5 font-semibold text-[#17213A] backdrop-blur transition hover:border-[#17213A]"
              >
                Discuss Your Research
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          INTRO STRIP
      ====================================================== */}

      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto grid max-w-7xl divide-y divide-slate-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {[
            {
              icon: GraduationCap,
              title: "PhD Focused",
              text: "Support built around academic research.",
            },
            {
              icon: Code2,
              title: "Technical",
              text: "Implementation for research projects.",
            },
            {
              icon: FileText,
              title: "Publication",
              text: "Research-to-publication support.",
            },
            {
              icon: Users,
              title: "Project Specific",
              text: "Support tailored to your requirements.",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex items-center gap-4 px-6 py-6"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF4FA] text-[#17213A]">
                  <Icon size={20} />
                </div>

                <div>
                  <p className="font-bold text-[#17213A]">
                    {item.title}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =====================================================
          SERVICE CATEGORIES
      ====================================================== */}

      <section
        id="service-categories"
        className="bg-[#F5F8FC] px-6 py-24 lg:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#17213A]">
              Core Services
            </span>

            <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#17213A] md:text-5xl">
              Three core areas. One research ecosystem.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Explore our main research support
              areas and the specific services
              available under each category.
            </p>
          </div>

          {loading ? (
            <div className="mt-12 rounded-[2rem] border border-[#DCE5F0] bg-white p-12 text-center">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-[#17213A]" />

              <p className="mt-4 text-sm text-slate-500">
                Loading services...
              </p>
            </div>
          ) : categories.length === 0 ? (
            <div className="mt-12 rounded-[2rem] border border-[#DCE5F0] bg-white p-12 text-center">
              <p className="text-slate-500">
                No services available.
              </p>
            </div>
          ) : (
            <>
              {/* Main Categories */}

              <div className="mt-12 grid gap-5 md:grid-cols-3">
                {categories.map(
                  (category) => {
                    const Icon =
                      getServiceIcon(
                        category.name
                      );

                    const active =
                      category.name ===
                      activeCategory;

                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() =>
                          setActiveCategory(
                            category.name
                          )
                        }
                        className={`group cursor-pointer rounded-[2rem] border p-8 text-left transition duration-300 ${
                          active
                            ? "border-[#17213A] bg-[#17213A] shadow-xl shadow-[#17213A]/15"
                            : "border-[#DCE5F0] bg-white hover:-translate-y-1 hover:shadow-xl hover:shadow-[#17213A]/8"
                        }`}
                      >
                        <div
                          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                            active
                              ? "bg-white text-[#17213A]"
                              : "bg-[#17213A] text-white"
                          }`}
                        >
                          <Icon size={25} />
                        </div>

                        <h3
                          className={`mt-7 text-2xl font-bold ${
                            active
                              ? "text-white"
                              : "text-[#17213A]"
                          }`}
                        >
                          {category.name}
                        </h3>

                        <p
                          className={`mt-3 leading-7 ${
                            active
                              ? "text-slate-300"
                              : "text-slate-600"
                          }`}
                        >
                          {category.description ||
                            "Research support tailored to your requirements."}
                        </p>

                        <span
                          className={`mt-6 inline-flex items-center gap-2 text-sm font-semibold ${
                            active
                              ? "text-white"
                              : "text-[#17213A]"
                          }`}
                        >
                          Explore
                          <ArrowRight
                            size={16}
                            className="transition-transform group-hover:translate-x-1"
                          />
                        </span>
                      </button>
                    );
                  }
                )}
              </div>

              {/* Detailed Active Category */}

              {activeData && (
                <div className="mt-6 overflow-hidden rounded-[2rem] border border-[#DCE5F0] bg-white shadow-sm">
                  <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
                    {/* Content */}

                    <div className="bg-[#17213A] p-8 text-white md:p-10">
                      <p className="text-xs font-bold tracking-[0.22em] text-slate-300">
                        {activeData.name ===
                        "Implementation"
                          ? "TECHNICAL RESEARCH IMPLEMENTATION"
                          : activeData.name ===
                            "Writing"
                          ? "ACADEMIC & RESEARCH WRITING"
                          : activeData.name ===
                            "Publication"
                          ? "RESEARCH PUBLICATION SUPPORT"
                          : "RESEARCH SUPPORT"}
                      </p>

                      <h3 className="mt-5 text-3xl font-bold leading-tight md:text-4xl">
                        {activeData.name ===
                        "Implementation"
                          ? "Turn research concepts into working solutions."
                          : activeData.name ===
                            "Writing"
                          ? "Build clear and structured research documents."
                          : activeData.name ===
                            "Publication"
                          ? "Prepare your research for the right publication pathway."
                          : activeData.name}
                      </h3>

                      <p className="mt-5 leading-8 text-slate-300">
                        {activeData.description ||
                          "Research support tailored to the requirements of your project."}
                      </p>

                      <Link
                        to={`/contact?service=${encodeURIComponent(
                          activeData.name
                        )}`}
                        className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-semibold text-[#17213A] transition hover:bg-slate-100"
                      >
                        Discuss Your Requirement
                        <ArrowRight size={17} />
                      </Link>
                    </div>

                    {/* Services */}

                    <div className="p-8 md:p-10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Available Services
                          </p>

                          <h3 className="mt-2 text-2xl font-bold text-[#17213A]">
                            {activeData.name}
                          </h3>
                        </div>

                        <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF4FA] text-[#17213A] sm:flex">
                          {(() => {
                            const Icon =
                              getServiceIcon(
                                activeData.name
                              );

                            return (
                              <Icon size={22} />
                            );
                          })()}
                        </div>
                      </div>

                      <div className="mt-8 grid gap-3 sm:grid-cols-2">
                        {(
                          activeData.services ||
                          []
                        )
                          .slice()
                          .sort(
                            (a, b) =>
                              Number(
                                a.display_order ??
                                  0
                              ) -
                              Number(
                                b.display_order ??
                                  0
                              )
                          )
                          .map(
                            (service) => (
                              <Link
                                to={`/contact?research=${encodeURIComponent(
                                  service.name
                                )}&service=${encodeURIComponent(
                                  activeData.name
                                )}`}
                                key={
                                  service.id
                                }
                                className="group rounded-2xl border border-[#DCE5F0] bg-[#F8FAFC] p-5 transition hover:border-[#17213A] hover:bg-white hover:shadow-sm"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <h4 className="font-semibold text-[#17213A]">
                                      {
                                        service.name
                                      }
                                    </h4>

                                    {service.description && (
                                      <p className="mt-2 text-sm leading-6 text-slate-500">
                                        {
                                          service.description
                                        }
                                      </p>
                                    )}
                                  </div>

                                  <ArrowRight
                                    size={17}
                                    className="mt-1 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#17213A]"
                                  />
                                </div>
                              </Link>
                            )
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* =====================================================
          WHAT YOU RECEIVE
      ====================================================== */}

      <section className="bg-white px-6 py-24 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#17213A]">
              What You Receive
            </span>

            <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#17213A] md:text-5xl">
              Support that follows the research requirement.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Research projects differ in scope,
              methodology, technology, and
              expected outcomes. Our services are
              structured so that support can be
              aligned with the stage and
              requirements of the project.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {receiveItems.map(
              (item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-3xl border border-[#DCE5F0] bg-[#F8FAFC] p-6"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#17213A] shadow-sm">
                      <Icon size={20} />
                    </div>

                    <h3 className="mt-5 text-lg font-bold text-[#17213A]">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {item.text}
                    </p>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          BLOG
      ====================================================== */}

      <section className="bg-[#F5F8FC] px-6 py-24 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#17213A]">
                Research Blog
              </span>

              <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#17213A] md:text-5xl">
                Insights for researchers.
              </h2>

              <p className="mt-5 text-lg leading-8 text-slate-600">
                Research guidance, technical
                perspectives, publication
                information, and practical insights
                for scholars.
              </p>
            </div>

            <Link
              to="/blog"
              className="inline-flex shrink-0 items-center gap-2 font-semibold text-[#17213A]"
            >
              View All Articles
              <ArrowRight size={18} />
            </Link>
          </div>

          {blogsLoading ? (
            <div className="mt-14 rounded-3xl border border-[#DCE5F0] bg-white p-12 text-center">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-[#17213A]" />

              <p className="mt-4 text-sm text-slate-500">
                Loading articles...
              </p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="mt-14 rounded-3xl border border-[#DCE5F0] bg-white p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF4FA] text-[#17213A]">
                <BookOpen size={24} />
              </div>

              <h3 className="mt-5 text-xl font-bold text-[#17213A]">
                No articles published yet.
              </h3>

              <p className="mt-2 text-slate-500">
                Published research insights
                will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {blogs.map(
                (blog) => {
                  const imageUrl =
                    getImageUrl(
                      blog.featured_image
                    );

                  return (
                    <article
                      key={blog.id}
                      className="group overflow-hidden rounded-3xl border border-[#DCE5F0] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#17213A]/8"
                    >
                      <div className="h-56 overflow-hidden bg-[#EAF1FA]">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={blog.title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#EAF1FA] to-[#F5F8FC]">
                            <BookOpen
                              size={42}
                              strokeWidth={1.5}
                              className="text-[#17213A]"
                            />
                          </div>
                        )}
                      </div>

                      <div className="p-7">
                        {blog.category && (
                          <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#17213A]">
                            {
                              blog.category
                            }
                          </span>
                        )}

                        <h3 className="mt-3 text-xl font-bold leading-snug text-[#17213A]">
                          {blog.title}
                        </h3>

                        {blog.excerpt && (
                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            {
                              blog.excerpt
                            }
                          </p>
                        )}

                        <div className="mt-5 flex flex-wrap items-center gap-5 text-xs text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <CalendarDays
                              size={14}
                            />

                            {formatDate(
                              blog.published_at ||
                                blog.created_at
                            )}
                          </span>

                          <span className="flex items-center gap-1.5">
                            <Clock3
                              size={14}
                            />

                            {calculateReadTime(
                              blog.content
                            )}
                          </span>
                        </div>

                        <Link
                          to={`/blog/${blog.slug}`}
                          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#17213A]"
                        >
                          Read Article

                          <ArrowRight
                            size={16}
                            className="transition-transform duration-200 group-hover:translate-x-1"
                          />
                        </Link>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          RESEARCH DOMAINS
      ====================================================== */}

      <section className="bg-[#F5F8FC] px-6 py-24 lg:py-15">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
          <div>
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#17213A]">
              Research Domains
            </span>

            <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#17213A] md:text-5xl">
              Implementation support across research disciplines.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Our implementation services can
              be adapted to the research domains
              and requirements managed through
              our service platform.
            </p>

            <Link
              to="/contact?service=Implementation"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#17213A] px-6 py-3.5 font-semibold text-white transition hover:bg-[#0F172A]"
            >
              Discuss Your Domain
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {implementationDomains.length >
            0 ? (
              implementationDomains
                .slice()
                .sort(
                  (a, b) =>
                    Number(
                      a.display_order ??
                        0
                    ) -
                    Number(
                      b.display_order ??
                        0
                    )
                )
                .map((domain) => (
                  <Link
                    key={domain.id}
                    to={`/contact?research=${encodeURIComponent(
                      domain.name
                    )}&service=${encodeURIComponent(
                      "Implementation"
                    )}`}
                    className="group flex items-center justify-between gap-3 rounded-2xl border border-[#DCE5F0] bg-white px-5 py-4 transition hover:border-[#17213A] hover:bg-[#F8FAFC]"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2
                        size={19}
                        className="shrink-0 text-[#17213A]"
                      />

                      <span className="text-sm font-medium text-slate-700 group-hover:text-[#17213A]">
                        {domain.name}
                      </span>
                    </div>

                    <ArrowRight
                      size={16}
                      className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#17213A]"
                    />
                  </Link>
                ))
            ) : (
              <div className="sm:col-span-2 rounded-2xl border border-[#DCE5F0] bg-white p-6 text-sm text-slate-500">
                No implementation
                domains are currently
                available.
              </div>
            )}
          </div>
        </div>
      </section>


      {/* =========================
          INSTITUTIONS & ORGANIZATIONS
      ========================= */}

      {clients.length > 0 && (
        <section className="bg-[#F5F8FC] py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">

            {/* Heading */}
            <div className="mx-auto max-w-3xl text-center mb-10">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#2563EB]">
                Institutions & Organizations
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-[#17213A] sm:text-4xl">
                Institutions & Organizations We Work With
              </h2>

              <p className="mt-4 text-base leading-7 text-slate-600">
                Supporting researchers and organizations across diverse academic
                and professional fields.
              </p>
            </div>

            {/* Client Logos */}
            <div className="flex flex-wrap justify-center gap-6">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="group flex w-[240px] min-h-[170px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  {/* Logo */}
                  {client.logo_url && (
                    <div className="flex h-[85px] w-full items-center justify-center">
                      <img
                        src={getImageUrl(client.logo_url)}
                        alt={client.name}
                        className="max-h-[80px] max-w-[170px] object-contain"
                      />
                    </div>
                  )}

                  {/* Client Name */}
                  <p className="mt-5 text-center text-base font-semibold text-[#17213A]">
                    {client.name}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* =====================================================
          PROCESS
      ====================================================== */}

      <section className="bg-white px-6 py-24 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#17213A]">
              Our Process
            </span>

            <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#17213A] md:text-5xl">
              A structured approach to research support.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              A clear process helps us understand
              what the project needs before the
              actual work begins.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {processSteps.map(
              (step) => {
                const Icon =
                  step.icon;

                return (
                  <div
                    key={step.number}
                    className="rounded-3xl border border-[#DCE5F0] bg-[#F8FAFC] p-7"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#17213A] text-white">
                        <Icon size={20} />
                      </div>

                      <span className="text-sm font-bold text-slate-300">
                        {step.number}
                      </span>
                    </div>

                    <h3 className="mt-7 text-xl font-bold text-[#17213A]">
                      {step.title}
                    </h3>

                    <p className="mt-3 leading-7 text-slate-600">
                      {step.text}
                    </p>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          PUBLICATION SUPPORT
      ====================================================== */}

      <section className="bg-[#F5F8FC] px-6 py-24 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#17213A]">
              Publication Support
            </span>

            <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#17213A] md:text-5xl">
              Move from completed research to publication-ready work.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Publication involves decisions
              about journal scope, manuscript
              structure, formatting, presentation,
              and submission. Our publication
              support is designed to help
              researchers organize these
              requirements more effectively.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "SCI publication pathways",
                "Scopus publication pathways",
                "Annexure-oriented journals",
                "Journal selection support",
                "Manuscript preparation",
                "Submission readiness",
              ].map(
                (item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl bg-white px-4 py-3.5"
                  >
                    <CheckCircle2
                      size={18}
                      className="shrink-0 text-[#17213A]"
                    />

                    <span className="text-sm font-semibold text-slate-700">
                      {item}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#DCE5F0] bg-white p-8 shadow-sm md:p-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#17213A] text-white">
              <Award size={25} />
            </div>

            <h3 className="mt-7 text-2xl font-bold text-[#17213A]">
              Publication-focused support
            </h3>

            <p className="mt-4 leading-7 text-slate-600">
              A publication strategy should
              begin with understanding the
              research contribution, intended
              audience, journal scope, and
              submission requirements.
            </p>

            <Link
              to="/contact?service=Publication"
              className="mt-7 inline-flex items-center gap-2 font-semibold text-[#17213A]"
            >
              Discuss Publication
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          FAQ
      ====================================================== */}

      <section className="bg-white px-6 py-24 lg:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#17213A]">
              Frequently Asked Questions
            </span>

            <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#17213A] md:text-5xl">
              Questions researchers often ask.
            </h2>
          </div>

          <div className="mt-12 space-y-3">
            {[
              {
                question:
                  "Can I request only implementation support?",
                answer:
                  "Yes. Support can be focused on a specific part of the research project such as implementation, experiments, analysis, documentation, or another defined requirement.",
              },
              {
                question:
                  "Do you support PhD thesis and dissertation work?",
                answer:
                  "Yes. Thesis and dissertation support can cover research structure, documentation, methodology, technical implementation, analysis, and related academic requirements.",
              },
              {
                question:
                  "Can publication support be requested separately?",
                answer:
                  "Yes. Publication support can be requested independently based on the stage of the manuscript and the researcher's publication requirements.",
              },
              {
                question:
                  "Can the technical implementation be based on a specific research domain?",
                answer:
                  "Yes. Implementation requirements can be discussed around the specific technology, domain, research problem, and expected technical outcome.",
              },
              {
                question:
                  "How do I explain my research requirement?",
                answer:
                  "You can provide your research area, current stage, objective, and the specific support you need. The contact form is designed to capture those details.",
              },
            ].map(
              (faq, index) => {
                const open =
                  openFaq === index;

                return (
                  <div
                    key={
                      faq.question
                    }
                    className="overflow-hidden rounded-2xl border border-[#DCE5F0]"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenFaq(
                          open
                            ? null
                            : index
                        )
                      }
                      className="flex w-full cursor-pointer items-center justify-between gap-6 px-6 py-5 text-left"
                    >
                      <span className="font-semibold text-[#17213A]">
                        {
                          faq.question
                        }
                      </span>

                      <ChevronDown
                        size={19}
                        className={`shrink-0 text-[#17213A] transition-transform ${
                          open
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>

                    {open && (
                      <div className="border-t border-[#DCE5F0] px-6 py-5">
                        <p className="leading-7 text-slate-600">
                          {
                            faq.answer
                          }
                        </p>
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
      ====================================================== */}

      <section className="relative overflow-hidden bg-[#17213A] px-6 py-20">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-white/5 blur-3xl" />

        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/5 blur-3xl" />

        <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-10 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-300">
              Start Your Research
            </p>

            <h2 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-white md:text-5xl">
              Have a research requirement?
              <span className="block text-slate-300">
                Let's discuss it.
              </span>
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Tell us where you are in your
              research journey and what kind of
              support you need.
            </p>
          </div>

          <Link
            to="/contact"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-7 py-4 font-semibold text-[#17213A] shadow-lg transition hover:bg-slate-100"
          >
            Talk to an Expert
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Services;