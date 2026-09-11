import { useEffect, useState } from "react";

import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Code2,
  FileText,
  FlaskConical,
  GraduationCap,
  Lightbulb,
  MessageSquare,
  PenTool,
  Quote,
  Search,
  Star,
  Target,
  Users,
} from "lucide-react";

import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  apiFetch,
  API_URL,
} from "../utils/api";

/* =====================================================
   ICONS
===================================================== */

const iconMap = {
  Implementation: Code2,
  Publication: Award,
  Writing: PenTool,
};

/* =====================================================
   RESEARCH LIFECYCLE
===================================================== */

const researchStages = [
  {
    number: "01",
    icon: Search,
    title: "Research Planning",
    text: "Define the Research Problem, Objectives, Scope, Questions, and Overall Direction.",
  },
  {
    number: "02",
    icon: BookOpen,
    title: "Literature & Gap Analysis",
    text: "Understand existing Research, Identify Relevant Work, and Establish Meaningful Research Gaps.",
  },
  {
    number: "03",
    icon: FlaskConical,
    title: "Methodology",
    text: "Develop appropriate Methodologies, Frameworks, Models, Experiments, and Evaluation Strategies.",
  },
  {
    number: "04",
    icon: Code2,
    title: "Implementation",
    text: "Translate research concepts into Technical Systems, Algorithms, Models, and Working Prototypes.",
  },
  {
    number: "05",
    icon: BarChart3,
    title: "Analysis",
    text: "Process Results, Evaluate Experiments, Visualize Findings, and Interpret Research Outcomes.",
  },
  {
    number: "06",
    icon: FileText,
    title: "Writing & Publication",
    text: "Organize findings into Research Papers, Thesis Documents, Presentations, and Publication-Ready Manuscripts.",
  },
];

/* =====================================================
   PRINCIPLES
===================================================== */

const principles = [
  {
    icon: Target,
    title: "Research-Driven",
    text: "Every engagement begins with understanding the actual research objective and expected outcome.",
  },
  {
    icon: Users,
    title: "Collaborative",
    text: "We work alongside researchers to understand their challenges and support their research journey.",
  },
  {
    icon: Lightbulb,
    title: "Practical",
    text: "Our approach focuses on turning concepts into structured, understandable, and usable outcomes.",
  },
  {
    icon: MessageSquare,
    title: "Clear Communication",
    text: "Research work becomes easier to manage when requirements, progress, and outcomes are communicated clearly.",
  },
];

/* =====================================================
   HELPERS
===================================================== */

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

const getCategoryIcon = (name) => {
  return iconMap[name] || BookOpen;
};

/* =====================================================
   ABOUT PAGE
===================================================== */

function About() {
  const [categories, setCategories] = useState([]);

  const [implementationDomains, setImplementationDomains] =
    useState([]);

  const [reviews, setReviews] = useState([]);

  const [reviewForm, setReviewForm] = useState({
    client_name: "",
    designation: "",
    rating: 5,
    review: "",
  });

  const [reviewSubmitting, setReviewSubmitting] =
    useState(false);

  const [reviewSuccess, setReviewSuccess] =
    useState("");

  const [reviewError, setReviewError] =
    useState("");

  const [loading, setLoading] = useState(true);

  const [siteName, setSiteName] =
    useState("{siteName}");

  const [aboutBackground, setAboutBackground] =
    useState("");

  /* ===================================================
     LOAD BACKEND DATA
  =================================================== */

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoading(true);

        const [
          servicesResponse,
          settingsResponse,
          reviewsResponse,
        ] = await Promise.all([
          apiFetch("/api/services"),
          apiFetch("/api/site-settings"),
          apiFetch("/api/reviews"),
        ]);

        /* -----------------------------
           SERVICES / CATEGORIES
        ----------------------------- */

        if (servicesResponse.ok) {
          const data =
            await servicesResponse.json();

          setCategories(data);

          const implementation =
            data.find(
              (category) =>
                category.name ===
                "Implementation"
            );

          setImplementationDomains(
            implementation?.services || []
          );
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

          setSiteName(
            settings.site_name ||
              "{siteName}"
          );

          setAboutBackground(
            settings.about_background ||
              ""
          );
        }

        /* -----------------------------
          CLIENT REVIEWS
        ----------------------------- */

        if (reviewsResponse.ok) {
          const reviewData =
            await reviewsResponse.json();

          setReviews(reviewData);
        }

      } catch (error) {
        console.error(
          "Failed to load About page data:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, []);

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    setReviewSuccess("");
    setReviewError("");

    if (!reviewForm.client_name.trim()) {
      setReviewError("Please enter your name.");
      return;
    }

    if (!reviewForm.review.trim()) {
      setReviewError("Please write your review.");
      return;
    }

    try {
      setReviewSubmitting(true);

      const response = await apiFetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_name:
            reviewForm.client_name.trim(),

          designation:
            reviewForm.designation.trim() || null,

          rating: reviewForm.rating,

          review:
            reviewForm.review.trim(),
        }),
      });

      if (!response.ok) {
        let message =
          "Failed to submit your review.";

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

      setReviewForm({
        client_name: "",
        designation: "",
        rating: 5,
        review: "",
      });

      setReviewSuccess(
        "Thank you for sharing your experience. Your review has been submitted for approval."
      );
    } catch (error) {
      console.error(
        "Failed to submit review:",
        error
      );

      setReviewError(
        error.message ||
          "Failed to submit your review. Please try again."
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      {/* =====================================================
          HERO
      ====================================================== */}

      <section
        className="relative min-h-[calc(100vh-73px)] overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage:
            aboutBackground
              ? `url("${getImageUrl(
                  aboutBackground
                )}")`
              : "linear-gradient(to bottom right, #ffffff, #F8FAFE, #EAF1FA)",
        }}
      >
        {aboutBackground && (
          <div className="absolute inset-0 bg-white/75" />
        )}

        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-[#DCE7F5]/40 blur-3xl" />

        <div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-[#E3ECF8]/50 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <div className="max-w-4xl">
            <span className="inline-flex rounded-full border border-[#D5E0EE] bg-white/90 px-4 py-2 text-sm font-semibold text-[#17213A] shadow-sm backdrop-blur">
              About {siteName}
            </span>

            <h1 className="mt-6 text-5xl font-bold leading-[1.03] tracking-tight text-[#17213A] md:text-6xl lg:text-7xl">
              Empowering Researchers  
              <span className="block">
                to Shape the Future.
              </span>
            </h1>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">
              {siteName} is a research
              support platform focused on
              helping Scholars, Researchers,
              and PhD Candidates navigate the
              Academic and Technical stages of
              their Research with greater
              Clarity, Structure, and Confidence.
            </p>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
              From Research Planning and
              Literature Analysis to
              Implementation, Academic Writing,
              Data Analysis, and Publication
              Support, our approach is designed
              around the specific requirements
              of each Research Project.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/services"
                className="inline-flex items-center gap-2 rounded-full bg-[#17213A] px-6 py-3.5 font-semibold text-white transition hover:bg-[#0F172A]"
              >
                Explore Services
                <ArrowRight size={18} />
              </Link>

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
          WHO WE ARE
      ====================================================== */}

      <section className="bg-white px-6 py-24 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          {/* LEFT */}

          <div>
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#17213A]">
              Who We Are
            </span>

            <h2 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-[#17213A] md:text-5xl">
              Research Support That 
              <span className="block">
                Moves Your Work Forward.
              </span>
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              Academic research can involve a
              combination of Conceptual
              Thinking, Extensive Literature
              Review, Technical Development,
              Experimentation, Analysis,
              Documentation, and Publication.
              Managing all of these stages can
              become challenging as a project
              grows.
            </p>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              {siteName} is built to provide
              structured support across these
              stages. We aim to understand the
              project first, identify where
              support is required, and then work
              toward a practical path forward.
            </p>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Whether the requirement is
              Academic Writing, Technical
              Implementation, Publication
              Preparation, or Research
              Documentation, our Focus remains
              on the underlying Research
              Objective.
            </p>
          </div>

          {/* RIGHT */}

          <div className="grid gap-5 sm:grid-cols-2">
            {[
              {
                icon: GraduationCap,
                title: "For Scholars",
                text: "Structured research assistance designed around the needs of Postgraduate and Doctoral Researchers.",
              },
              {
                icon: Code2,
                title: "For Technical Research",
                text: "Technical support for Algorithms, Models, Applications, Experiments, and Research Prototypes.",
              },
              {
                icon: FileText,
                title: "For Publications",
                text: "Support for preparing Research Content and Manuscripts for Publication-Oriented Outcomes.",
              },
              {
                icon: BarChart3,
                title: "For Research Analysis",
                text: "Assistance with Experiments, Data Analysis, Evaluation, Visualization, and Interpretation.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-[2rem] border border-[#DCE5F0] bg-[#F8FAFC] p-8"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#17213A] text-white">
                    <Icon size={22} />
                  </div>

                  <h3 className="mt-6 text-2xl font-bold text-[#17213A]">
                    {item.title}
                  </h3>

                  <p className="mt-3 leading-7 text-slate-600">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          CORE AREAS
      ====================================================== */}

      <section className="bg-[#F5F8FC] px-6 py-24 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#17213A]">
              What We Do
            </span>

            <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#17213A] md:text-5xl">
              Research Support Built Around The Work That Matters.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              {siteName} brings together the
              academic and technical support
              researchers commonly need as they
              progress through their work.
            </p>
          </div>

          {loading ? (
            <div className="mt-12 rounded-[2rem] border border-[#DCE5F0] bg-white p-12 text-center">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-[#17213A]" />

              <p className="mt-4 text-sm text-slate-500">
                Loading research areas...
              </p>
            </div>
          ) : categories.length === 0 ? (
            <div className="mt-12 rounded-[2rem] border border-[#DCE5F0] bg-white p-12 text-center">
              <p className="text-slate-500">
                No research areas available.
              </p>
            </div>
          ) : (
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {categories.map((category) => {
                const Icon =
                  getCategoryIcon(
                    category.name
                  );

                return (
                  <div
                    key={category.id}
                    className="flex h-full flex-col rounded-[2rem] border border-[#DCE5F0] bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#17213A]/8"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#17213A] text-white">
                      <Icon size={25} />
                    </div>

                    <h3 className="mt-7 text-2xl font-bold text-[#17213A]">
                      {category.name}
                    </h3>

                    <p className="mt-4 text-base leading-7 text-slate-600">
                      {category.description ||
                        "Research support tailored to the requirements of your project."}
                    </p>

                    <Link
                      to="/services#service-categories"
                      className="mt-auto pt-6 inline-flex items-center gap-2 font-semibold text-[#17213A]"
                    >
                      Explore Services
                      <ArrowRight size={17} />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          RESEARCH LIFECYCLE
      ====================================================== */}

      <section className="bg-white px-6 py-24 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#17213A]">
              The Research Journey
            </span>

            <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#17213A] md:text-5xl">
              Support Across The Research Lifecycle.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Every project follows its own path,
              but strong research often requires
              attention across several
              interconnected stages.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {researchStages.map(
              (stage) => {
                const Icon =
                  stage.icon;

                return (
                  <div
                    key={stage.number}
                    className="rounded-3xl border border-[#DCE5F0] bg-[#F8FAFC] p-7"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#17213A] text-white">
                        <Icon size={20} />
                      </div>

                      <span className="text-sm font-bold text-slate-300">
                        {stage.number}
                      </span>
                    </div>

                    <h3 className="mt-7 text-xl font-bold text-[#17213A]">
                      {stage.title}
                    </h3>

                    <p className="mt-3 leading-7 text-slate-600">
                      {stage.text}
                    </p>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          PRINCIPLES
      ====================================================== */}

      <section className="bg-white px-6 py-24 lg:py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#17213A]">
              Our Approach
            </span>

            <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#17213A] md:text-5xl">
              How we approach research support.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Our goal is not simply to complete
              a task, but to understand the purpose
              behind the work and provide useful,
              structured support.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {principles.map(
              (item) => {
                const Icon =
                  item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-3xl border border-[#DCE5F0] bg-[#F8FAFC] p-7"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#17213A] shadow-sm">
                      <Icon size={20} />
                    </div>

                    <h3 className="mt-6 text-xl font-bold text-[#17213A]">
                      {item.title}
                    </h3>

                    <p className="mt-3 leading-7 text-slate-600">
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
                CLIENT REVIEWS
            ====================================================== */}
            {reviews.length > 0 && (
              <section className="bg-[#F5F8FC] px-6 py-24 lg:py-15">
                <div className="mx-auto max-w-7xl">
                  <div className="mx-auto max-w-3xl text-center">
                    <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#17213A]">
                      Client Reviews
                    </span>

                    <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#17213A] md:text-5xl">
                      Trusted by Researchers.
                    </h2>

                    <p className="mt-5 text-lg leading-8 text-slate-600">
                      Real experiences from researchers who have worked
                      with {siteName}.
                    </p>
                  </div>

                  <div
                    className={`mx-auto mt-14 flex max-w-6xl gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:overflow-visible md:pb-0 md:snap-none ${
                      reviews.length === 1
                        ? "max-w-3xl"
                        : "md:grid-cols-2"
                    }`}
                  >
                    {reviews.map((item) => (
                      <div
                        key={item.id}
                        className="relative flex h-full w-[85%] shrink-0 snap-start flex-col rounded-[2rem] border border-[#DCE5F0] bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#17213A]/8 md:w-auto md:shrink md:p-9"
                      >
                        {/* QUOTE ICON */}
                        <div className="absolute right-7 top-7 flex h-11 w-11 items-center justify-center rounded-full bg-[#F5F8FC] text-[#17213A]">
                          <Quote size={22} />
                        </div>

                        {/* CLIENT */}
                        <div className="flex items-center gap-4 pr-12">
                          {item.photo_url ? (
                            <img
                              src={getImageUrl(item.photo_url)}
                              alt={item.client_name}
                              className="h-16 w-16 shrink-0 rounded-full border-2 border-white object-cover shadow-md ring-1 ring-[#DCE5F0]"
                            />
                          ) : (
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#EAF1FA] text-[#17213A] ring-1 ring-[#DCE5F0]">
                              <Users size={24} />
                            </div>
                          )}

                          <div className="min-w-0">
                            <h3 className="truncate text-lg font-bold text-[#17213A]">
                              {item.client_name}
                            </h3>

                            {item.designation && (
                              <p className="mt-1 truncate text-sm text-slate-500">
                                {item.designation}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* RATING */}
                        <div className="mt-6 flex items-center gap-1">
                          {Array.from({ length: 5 }).map(
                            (_, index) => (
                              <Star
                                key={index}
                                size={17}
                                className={
                                  index < item.rating
                                    ? "fill-[#F59E0B] text-[#F59E0B]"
                                    : "text-slate-300"
                                }
                              />
                            )
                          )}

                          <span className="ml-2 text-sm font-semibold text-slate-500">
                            {item.rating}/5
                          </span>
                        </div>

                        {/* REVIEW */}
                        <div className="mt-6">
                          <p className="text-lg leading-8 text-slate-600">
                            "{item.review}"
                          </p>
                        </div>
                        {/* DATE */}
                          {item.created_at && (
                            <p className="mt-3 text-xs font-medium text-slate-400">
                              {new Date(item.created_at).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

      {/* =====================================================
            SUBMIT A REVIEW
        ====================================================== */}
        <section className="bg-white px-6 py-14 lg:py-10">
          <div className="mx-auto max-w-5xl">
            <div className="rounded-[2rem] border border-[#DCE5F0] bg-[#F8FAFC] px-6 py-8 md:px-10">
              <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                
                {/* LEFT */}
                <div>
                  <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#17213A]">
                    Share Your Experience
                  </span>

                  <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#17213A]">
                    Worked with {siteName}?
                  </h2>

                  <p className="mt-3 max-w-md leading-7 text-slate-600">
                    We'd love to hear about your research experience.
                    Share your feedback with us.
                  </p>

                  <p className="mt-4 text-xs leading-5 text-slate-400">
                    Reviews are reviewed before being published.
                  </p>
                </div>

                {/* FORM */}
                <form
                  onSubmit={handleReviewSubmit}
                  className="rounded-2xl border border-[#DCE5F0] bg-white p-5 md:p-6"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* NAME */}
                    <div>
                      <label 
                        htmlFor="review-client-name"
                        className="mb-1.5 block text-sm font-semibold text-[#17213A]">
                          Your Name
                        <span className="ml-1 text-red-500">*</span>
                      </label>

                      <input
                        id="review-client-name"
                        name="client_name"
                        type="text"
                        autoComplete="name"
                        value={reviewForm.client_name}
                        onChange={(event) =>
                          setReviewForm((previous) => ({
                            ...previous,
                            client_name: event.target.value,
                          }))
                        }
                        placeholder="Enter your name"
                        disabled={reviewSubmitting}
                        className="w-full rounded-xl border border-[#CBD8E6] bg-white px-4 py-3 text-sm text-[#17213A] outline-none transition placeholder:text-slate-400 focus:border-[#17213A] focus:ring-2 focus:ring-[#17213A]/10 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>

                    {/* DESIGNATION */}
                    <div>
                      <label 
                        htmlFor="review-designation"
                        className="mb-1.5 block text-sm font-semibold text-[#17213A]">
                          Designation
                        <span className="ml-1 font-normal text-slate-400">
                          (optional)
                        </span>
                      </label>

                      <input
                        id="review-designation"
                        name="designation"
                        type="text"
                        autoComplete="organization-title"
                        value={reviewForm.designation}
                        onChange={(event) =>
                          setReviewForm((previous) => ({
                            ...previous,
                            designation: event.target.value,
                          }))
                        }
                        placeholder="PhD Scholar, Professor..."
                        disabled={reviewSubmitting}
                        className="w-full rounded-xl border border-[#CBD8E6] bg-white px-4 py-3 text-sm text-[#17213A] outline-none transition placeholder:text-slate-400 focus:border-[#17213A] focus:ring-2 focus:ring-[#17213A]/10 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </div>

                  {/* RATING */}
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-semibold text-[#17213A]">
                      Your Rating
                    </p>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map(
                        (_, index) => {
                          const ratingValue = index + 1;

                          return (
                            <button
                              key={ratingValue}
                              type="button"
                              onClick={() =>
                                setReviewForm((previous) => ({
                                  ...previous,
                                  rating: ratingValue,
                                }))
                              }
                              disabled={reviewSubmitting}
                              className="cursor-pointer rounded-md p-0.5 transition hover:bg-[#EAF1FA] disabled:cursor-not-allowed"
                              aria-label={`Rate ${ratingValue} out of 5`}
                            >
                              <Star
                                size={22}
                                className={
                                  ratingValue <= reviewForm.rating
                                    ? "fill-[#F59E0B] text-[#F59E0B]"
                                    : "text-slate-300"
                                }
                              />
                            </button>
                          );
                        }
                      )}

                      <span className="ml-2 text-xs font-semibold text-slate-500">
                        {reviewForm.rating}/5
                      </span>
                    </div>
                  </div>

                  {/* REVIEW */}
                  <div className="mt-4">
                    <label 
                      htmlFor="review-message"
                      className="mb-1.5 block text-sm font-semibold text-[#17213A]">
                        Your Review
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <textarea
                     id="review-message"
                    name="review"
                    autoComplete="off"
                      value={reviewForm.review}
                      onChange={(event) =>
                        setReviewForm((previous) => ({
                          ...previous,
                          review: event.target.value,
                        }))
                      }
                      placeholder="Tell us about your experience..."
                      rows={3}
                      disabled={reviewSubmitting}
                      className="w-full resize-none rounded-xl border border-[#CBD8E6] bg-white px-4 py-3 text-sm leading-6 text-[#17213A] outline-none transition placeholder:text-slate-400 focus:border-[#17213A] focus:ring-2 focus:ring-[#17213A]/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>

                  {/* MESSAGES */}
                  {reviewSuccess && (
                    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium leading-5 text-emerald-700">
                      {reviewSuccess}
                    </div>
                  )}

                  {reviewError && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-5 text-red-700">
                      {reviewError}
                    </div>
                  )}

                  {/* SUBMIT */}
                  <div className="mt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#17213A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0F172A] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {reviewSubmitting
                        ? "Submitting..."
                        : "Submit Review"}

                      {!reviewSubmitting && (
                        <ArrowRight size={17} />
                      )}
                    </button>
                  </div>
                </form>
              </div>
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
              Your Research Deserves
              <span className="block text-slate-300">
                The Right Support.
              </span>
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Tell us about your research
              requirement and let's explore how
              {siteName} can support your next
              step.
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

export default About;