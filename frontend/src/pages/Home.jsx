import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowDown,
  Award,
  BookOpen,
  CheckCircle2,
  Code2,
  FileText,
  FlaskConical,
  GraduationCap,
  Lightbulb,
  MapPin,
  PenTool,
  Phone,
  ShieldCheck,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LiveOfferBar from "../components/LiveOfferBar";

import { Link } from "react-router-dom";

import { apiFetch, API_URL } from "../utils/api";

function Home() {
  /* =========================================================
     SITE SETTINGS
  ========================================================== */

  const [siteSettings, setSiteSettings] = useState({
    site_name: "Research Guru",
    home_background: "",
    home_intro_image: "",
    contact_phone: "",
    contact_email: "",
  });

  /* =========================================================
     SERVICES
  ========================================================== */

  const [services, setServices] = useState([]);
  const [activeService, setActiveService] =
    useState("Implementation");

  const [loadingPageData, setLoadingPageData] =
    useState(true);

  /* =========================================================
     HERO RESEARCH AREA AUTOCOMPLETE
  ========================================================== */

  const researchAreaRef = useRef(null);

  const [researchArea, setResearchArea] =
    useState("");

  const [showResearchAreas, setShowResearchAreas] =
    useState(false);

  /* =========================================================
     HERO CONTACT FORM
  ========================================================== */

  const [heroForm, setHeroForm] = useState({
    name: "",
    phone: "",
    email: "",
    research_area: "",
    message: "",
  });

  const [heroSubmitting, setHeroSubmitting] =
    useState(false);

  const [heroSuccess, setHeroSuccess] =
    useState("");

  const [heroError, setHeroError] =
    useState("");

  /* =========================================================
     LOAD BACKEND DATA
  ========================================================== */

  useEffect(() => {
    async function loadPageData() {
      try {
        setLoadingPageData(true);

        const [
          settingsResponse,
          servicesResponse,
        ] = await Promise.all([
          apiFetch("/api/site-settings"),
          apiFetch("/api/services"),
        ]);

        /* -----------------------------
           SITE SETTINGS
        ----------------------------- */

        if (settingsResponse.ok) {
          const settings =
            await settingsResponse.json();

          setSiteSettings({
             site_name:
              settings.site_name || "Research Guru",
            home_background:
              settings.home_background || "",
            home_intro_image:
              settings.home_intro_image || "",
            contact_phone:
              settings.contact_phone || "",
            contact_email:
              settings.contact_email || "",
          });
        }

        /* -----------------------------
           SERVICES
        ----------------------------- */

        if (servicesResponse.ok) {
          const serviceData =
            await servicesResponse.json();

          setServices(serviceData);

          if (
            serviceData.length > 0 &&
            !serviceData.some(
              (service) =>
                service.name === activeService
            )
          ) {
            setActiveService(
              serviceData[0].name
            );
          }
        }
      } catch (error) {
        console.error(
          "Failed to load Home page data:",
          error
        );
      } finally {
        setLoadingPageData(false);
      }
    }

    loadPageData();
  }, []);

  /* =========================================================
     CLICK OUTSIDE RESEARCH AUTOCOMPLETE
  ========================================================== */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        researchAreaRef.current &&
        !researchAreaRef.current.contains(
          event.target
        )
      ) {
        setShowResearchAreas(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* =========================================================
     HELPERS
  ========================================================== */

  function getImageUrl(path) {
    if (!path) {
      return "";
    }

    if (
      path.startsWith("http://") ||
      path.startsWith("https://")
    ) {
      return path;
    }

    return `${API_URL}${path}`;
  }

  function getPhoneHref() {
    if (!siteSettings.contact_phone) {
      return "#";
    }

    const cleaned =
      siteSettings.contact_phone.replace(
        /[^0-9+]/g,
        ""
      );

    return `tel:${cleaned}`;
  }

  function getServiceIcon(serviceName) {
    switch (serviceName) {
      case "Implementation":
        return Code2;

      case "Writing":
        return PenTool;

      case "Publication":
        return Award;

      default:
        return BookOpen;
    }
  }

  function getServiceShortText(
    serviceName
  ) {
    switch (serviceName) {
      case "Implementation":
        return "Turn research concepts into working Technical Solutions, Prototypes, Experiments, and Deployable Systems.";

      case "Writing":
        return "Develop Clear, Structured academic content around your Research Objectives.";

      case "Publication":
        return "Prepare and Position your Research for suitable Publication Opportunities.";

      default:
        return (
          "Research support tailored to your Specific Requirements."
        );
    }
  }

  function getServiceDescription(
    serviceName
  ) {
    switch (serviceName) {
      case "Implementation":
        return "From Research Algorithms and Experimental Models to complete working Applications, we provide Technical Implementation support across multiple Research Domains.";

      case "Writing":
        return "Research Writing Support across Literature Reviews, Research Papers, Thesis Documentation, Review Papers, Conference Papers, and Technical Reports.";

      case "Publication":
        return "Support for Manuscript Preparation, Journal Selection, Formatting, Submission Readiness, and Publication-Focused Presentation of your Research.";

      default:
        return (
          "Research support Tailored to your Specific Requirements."
        );
    }
  }

  /* =========================================================
     BACKEND RESEARCH AREAS
  ========================================================== */

  const implementationCategory =
    services.find(
      (service) =>
        service.name === "Implementation"
    );

  const implementationOptions =
    implementationCategory?.services || [];

  const filteredResearchAreas =
    implementationOptions.filter((service) =>
      service.name
        .toLowerCase()
        .includes(
          researchArea.toLowerCase()
        )
    );

  /* =========================================================
     ACTIVE SERVICE
  ========================================================== */

  const activeServiceData =
    services.find(
      (service) =>
        service.name === activeService
    );

  /* =========================================================
     UPDATE HERO FORM
  ========================================================== */

  function updateHeroField(
    field,
    value
  ) {
    setHeroForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleResearchAreaSelect(
    value
  ) {
    setResearchArea(value);
    updateHeroField(
      "research_area",
      value
    );
    setShowResearchAreas(false);
  }

  /* =========================================================
     HERO FORM SUBMIT
  ========================================================== */

  async function handleHeroSubmit(
    event
  ) {
    event.preventDefault();

    setHeroSubmitting(true);
    setHeroSuccess("");
    setHeroError("");

    try {
      const response = await apiFetch(
        "/api/contact",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: heroForm.name,
            phone: heroForm.phone,
            email: heroForm.email,
            research_area:
              heroForm.research_area,
            service: "",
            research_stage: "",
            message:
              heroForm.message,
          }),
        }
      );

      const data =
        await response.json().catch(
          () => null
        );

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Failed to submit your enquiry."
        );
      }

      setHeroSuccess(
        "Thank you. Your enquiry has been submitted successfully."
      );

      setHeroError("");

      setHeroForm({
        name: "",
        phone: "",
        email: "",
        research_area: "",
        message: "",
      });

      setResearchArea("");
    } catch (error) {
      setHeroError(
        error.message ||
          "Failed to submit your enquiry."
      );
    } finally {
      setHeroSubmitting(false);
    }
  }

  /* =========================================================
     IMPACT
  ========================================================== */

  const impact = [
    {
      icon: GraduationCap,
      number: "PhD",
      label: "Research Support",
      text: "Structured assistance across the Research Lifecycle.",
    },
    {
      icon: FileText,
      number: "100+",
      label: "Research Outputs",
      text: "Support across Academic and Technical Research Work.",
    },
    {
      icon: BookOpen,
      number: "50+",
      label: "Publication Support",
      text: "Guidance for Publication-focused Research Projects.",
    },
    {
      icon: Code2,
      number: "100+",
      label: "Implementations",
      text: "Technical Solutions developed around Research Requirements.",
    },
  ];

  /* =========================================================
     PRESENCE
  ========================================================== */

  const presence = [
    {
      icon: MapPin,
      type: "RESEARCH HUB",
      city: "Nagercoil",
      text: "Our research support centre serving Scholars and Researchers across South India.",
    },
    {
      icon: MapPin,
      type: "MAIN OFFICE",
      city: "Chennai",
      text: "Connecting Researchers, Academic Institutions, and Technical Specialists across India.",
    },
    {
      icon: MapPin,
      type: "GLOBAL SUPPORT",
      city: "Singapore",
      text: "Supporting Researchers and Academic Collaborations beyond Geographical Boundaries.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <LiveOfferBar />
      <Navbar showLiveOfferBar />

      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative min-h-[calc(100vh-73px)] overflow-hidden pt-28 pb-10 lg:py-10">
        {/* Background image */}
        {siteSettings.home_background ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url("${getImageUrl(
                siteSettings.home_background
              )}")`,
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-[#F5F8FC]" />
        )}

        <div className="absolute inset-0 bg-white/45" />

        <div className="absolute inset-0 bg-gradient-to-r from-white/75 via-white/45 to-[#EAF1FA]/35" />

        {/* Background glow */}
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#DCE7F5]/30 blur-3xl" />

        <div className="absolute -right-32 top-0 h-[500px] w-[500px] rounded-full bg-[#CFE0F2]/30 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 py-10 lg:min-h-[calc(100vh-73px)] lg:grid-cols-[1fr_0.78fr] lg:py-12">
          {/* LEFT */}
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex rounded-full border border-[#CFDAE7] bg-white/90 px-4 py-2 text-sm font-semibold text-[#17213A] shadow-sm backdrop-blur">
              Research • Innovation • Excellence
            </div>

            <h1 className="text-5xl font-bold leading-[1.02] tracking-tight text-[#17213A] md:text-5xl lg:text-7xl">
              From Complex Data 
              <span className="block">
                to Published Reality
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 md:text-xl">
              Stop struggling with endless revisions and methodology roadblocks. We partner with PhD scholars and researchers to streamline everything from data analysis to high-impact journal publication.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#services"
                className="inline-flex items-center gap-2 rounded-full bg-[#17213A] px-6 py-3.5 font-semibold text-white shadow-lg shadow-[#17213A]/20 transition hover:bg-[#0F172A]"
              >
                View Details
                <ArrowDown className="animate-bounce" size={18} />
              </a>

              <a
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-[#C9D6E5] bg-white/90 px-6 py-3.5 font-semibold text-[#17213A] backdrop-blur transition hover:border-[#17213A]"
              >
                Talk to an Expert
              </a>
            </div>

            <div className="mt-9 grid gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <CheckCircle2
                  size={17}
                  className="shrink-0 text-[#17213A]"
                />
                PhD Research Support
              </div>

              <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <CheckCircle2
                  size={17}
                  className="shrink-0 text-[#17213A]"
                />
                Publication Assistance
              </div>

              <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <CheckCircle2
                  size={17}
                  className="shrink-0 text-[#17213A]"
                />
                Technical Implementation
              </div>
            </div>
          </div>

          {/* RIGHT FORM */}
          <div
            id="contact"
            className="w-full max-w-xl justify-self-end rounded-[2rem] border border-white/80 bg-white/95 p-6 shadow-2xl shadow-[#17213A]/15 backdrop-blur md:p-7"
          >
            <div className="mb-5">
              <div className="mb-3 h-1.5 w-14 rounded-full bg-[#17213A]" />

              <h2 className="text-2xl font-bold tracking-tight text-[#17213A]">
                Let's Discuss your Research
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Tell us about your requirement
                and our team will get back to
                you.
              </p>
            </div>

            <form
              onSubmit={handleHeroSubmit}
              className="space-y-3.5"
            >
              {/* Name + Phone */}
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <label 
                    htmlFor="hero-name"
                    className="mb-1.5 block text-sm font-semibold text-[#17213A]">
                      Name *
                  </label>

                  <input
                    id="hero-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={heroForm.name}
                    onChange={(e) =>
                      updateHeroField(
                        "name",
                        e.target.value
                      )
                    }
                    required
                    placeholder="Your full name"
                    className="w-full rounded-xl border border-[#D9E2ED] bg-[#F8FAFC] px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#17213A] focus:bg-white focus:ring-4 focus:ring-[#17213A]/10"
                  />
                </div>

                <div>
                  <label 
                     htmlFor="hero-phone"
                     className="mb-1.5 block text-sm font-semibold text-[#17213A]">
                      Phone *
                  </label>

                  <input
                    id="hero-phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={heroForm.phone}
                    onChange={(e) =>
                      updateHeroField(
                        "phone",
                        e.target.value.replace(/[^\d+]/g, "")
                      )
                    }
                    required
                    placeholder="00000 00000"
                    className="w-full rounded-xl border border-[#D9E2ED] bg-[#F8FAFC] px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#17213A] focus:bg-white focus:ring-4 focus:ring-[#17213A]/10"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label 
                  htmlFor="hero-email"
                  className="mb-1.5 block text-sm font-semibold text-[#17213A]">
                    Email *
                </label>

                <input
                  id="hero-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={heroForm.email}
                  onChange={(e) =>
                    updateHeroField(
                      "email",
                      e.target.value
                    )
                  }
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-[#D9E2ED] bg-[#F8FAFC] px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#17213A] focus:bg-white focus:ring-4 focus:ring-[#17213A]/10"
                />
              </div>

              {/* Research Area */}
              <div
                ref={researchAreaRef}
                className="relative"
              >
                <label 
                  htmlFor="hero-research-area"
                  className="mb-1.5 block text-sm font-semibold text-[#17213A]">
                    Research Area
                </label>

                <input
                  id="hero-research-area"
                  name="research_area"
                  type="text"
                  value={researchArea}
                  onChange={(event) => {
                    const value =
                      event.target.value;

                    setResearchArea(value);

                    updateHeroField(
                      "research_area",
                      value
                    );

                    setShowResearchAreas(
                      true
                    );
                  }}
                  onFocus={() =>
                    setShowResearchAreas(
                      true
                    )
                  }
                  placeholder="Your research area"
                  className="w-full rounded-xl border border-[#D9E2ED] bg-[#F8FAFC] px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#17213A] focus:bg-white focus:ring-4 focus:ring-[#17213A]/10"
                />

                {showResearchAreas &&
                  filteredResearchAreas.length >
                    0 && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-56 overflow-y-auto rounded-xl border border-[#D9E2ED] bg-white p-1 shadow-2xl shadow-[#17213A]/10">
                      {filteredResearchAreas.map(
                        (area) => (
                          <button
                            key={area.id}
                            type="button"
                            onClick={() =>
                              handleResearchAreaSelect(
                                area.name
                              )
                            }
                            className="block w-full cursor-pointer rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-[#F1F5F9] hover:text-[#17213A]"
                          >
                            {area.name}
                          </button>
                        )
                      )}
                    </div>
                  )}
              </div>

              {/* Message */}
              <div>
                <label 
                  htmlFor="hero-message"
                  className="mb-1.5 block text-sm font-semibold text-[#17213A]">
                    Message
                </label>

                <textarea
                  id="hero-message"
                  name="message"
                  rows="3"
                  value={heroForm.message}
                  onChange={(e) =>
                    updateHeroField(
                      "message",
                      e.target.value
                    )
                  }
                  placeholder="Tell us how we can help..."
                  className="w-full resize-none rounded-xl border border-[#D9E2ED] bg-[#F8FAFC] px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#17213A] focus:bg-white focus:ring-4 focus:ring-[#17213A]/10"
                />
              </div>

              {/* Messages */}
              {heroError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-700">
                  {heroError}
                </div>
              )}

              {heroSuccess && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium leading-6 text-emerald-700">
                  {heroSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={heroSubmitting}
                className="w-full cursor-pointer rounded-xl bg-[#17213A] px-6 py-3.5 font-semibold text-white shadow-lg shadow-[#17213A]/15 transition hover:bg-[#0F172A] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {heroSubmitting
                  ? "Sending..."
                  : "Submit Enquiry"}
              </button>
            </form>
          </div>
        </div>

        {/* Floating phone */}
        {siteSettings.contact_phone && (
          <a
            href={getPhoneHref()}
            className="fixed bottom-6 right-6 z-[100] group flex items-center gap-3.5 rounded-2xl border border-white/20 bg-[#17213A]/90 px-4 py-3 text-white shadow-2xl shadow-[#17213A]/40 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-[#17213A] md:bottom-8 md:right-8"
          >
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white transition-transform duration-300 group-hover:scale-105">
              <span className="absolute -inset-1 rounded-xl bg-white/20 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100 animate-pulse" />
              <Phone
                size={20}
                strokeWidth={2}
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                  Direct Line
                </p>
              </div>

              <p className="text-base font-bold tracking-wide text-white">
                {siteSettings.contact_phone}
              </p>
            </div>
          </a>
        )}
      </section>

      {/* =====================================================
          TRUST STRIP
      ====================================================== */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-slate-200 md:grid-cols-4">
          {[
            {
              icon: GraduationCap,
              title: "PhD Focused",
              text: "Research-Driven Support",
            },
            {
              icon: FlaskConical,
              title: "Technical",
              text: "Implementation Expertise",
            },
            {
              icon: FileText,
              title: "Academic",
              text: "Publication-Ready Support",
            },
            {
              icon: ShieldCheck,
              title: "Structured",
              text: "Project-Specific Approach",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex items-center gap-4 px-5 py-6"
              >
                <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF3F8] text-[#17213A] sm:flex">
                  <Icon size={19} />
                </div>

                <div>
                  <p className="text-sm font-bold text-[#17213A]">
                    {item.title}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

              {/* =====================================================
                  RESEARCH TIMELINE HIGHLIGHT
              ====================================================== */}
              <section className="border-b border-[#DCE5F0] bg-[#F5F8FC] px-6 py-12">
                <div className="mx-auto max-w-7xl">

                  <div className="relative overflow-hidden rounded-[2rem] bg-[#17213A] px-7 py-10 shadow-[0_20px_50px_rgba(23,33,58,0.18)] md:px-12 md:py-12">

                    {/* Background glow */}
                    <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#2563EB]/20 blur-3xl" />
                    <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-[#3B82F6]/10 blur-3xl" />

                    {/* Decorative line */}
                    <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-[#60A5FA] via-[#2563EB] to-transparent opacity-70" />

                    <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">

                      {/* Content */}
                      <div className="max-w-4xl">

                        <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#93C5FD] backdrop-blur-sm">
                          Research Support
                        </div>

                        <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl lg:text-[42px]">
                          Complete Your Research Work in{" "}
                          <span className="text-[#60A5FA]">
                            3–4 Months
                          </span>
                        </h2>

                        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
                          Get end-to-end support for{" "}
                          <span className="font-semibold text-white">
                            Annexure, SCI
                          </span>{" "}
                          and related Research Requirements.
                        </p>

                        {/* Small supporting highlight */}
                        <div className="mt-6 flex flex-wrap gap-3">
                          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200">
                            End-to-End Support
                          </span>

                          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200">
                            Research Assistance
                          </span>

                          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200">
                            Publication Support
                          </span>
                        </div>
                      </div>

                      {/* CTA */}
                      <Link
                        to="/contact"
                        className="inline-flex shrink-0 cursor-pointer items-center gap-3 rounded-full bg-white px-7 py-4 font-bold text-[#17213A] shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-[#EFF6FF] hover:shadow-2xl"
                      >
                        Discuss Your Requirement
                        <ArrowRight size={18} />
                      </Link>

                    </div>
                  </div>

                </div>
              </section>

      {/* =====================================================
          RESEARCH GURU INTRO
      ====================================================== */}
      <section className="bg-white px-6 py-24 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.95fr_1.05fr]">
          {/* IMAGE */}
          <div className="relative">
            <div className="absolute -left-4 -top-4 h-24 w-24 rounded-3xl bg-[#E8F0F7]" />

            <div className="relative overflow-hidden rounded-[2rem] border border-[#DCE5F0] bg-[#F5F8FC] shadow-xl shadow-[#17213A]/8">
              <img
                src={
                  siteSettings.home_intro_image
                    ? getImageUrl(siteSettings.home_intro_image)
                    : "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=85"
                }
                alt="Researchers collaborating"
                className="h-[460px] w-full object-cover"
              />
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/40 bg-white/90 p-5 shadow-lg backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#17213A] text-white">
                    <GraduationCap size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#17213A]">
                      Research-first Support
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Built around your Research Objectives
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -right-5 hidden rounded-2xl border border-[#DCE5F0] bg-white px-6 py-4 shadow-xl sm:block">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Research
              </p>

              <p className="mt-1 text-lg font-bold text-[#17213A]">
                Idea → Outcome
              </p>
            </div>
          </div>

          {/* CONTENT */}
          <div>
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#17213A]">
              {siteSettings.site_name || "Research Guru"}
            </span>

            <h2 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-[#17213A] md:text-5xl">
              Dedicated Support for Scholars and PhD Researchers.
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              Research is a journey that goes
              far beyond writing just a paper.
              Researchers often need to move
              between Literature, Methodology,
              Technical Implementation,
              Experimentation, Analysis,
              Documentation, and Publication.
            </p>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              {siteSettings.site_name || "Research Guru"} brings these needs
              together under one research
              support Ecosystem — helping
              researchers progress from an
              initial idea to a structured and
              meaningful outcome.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Research Planning",
                "Literature & Documentation",
                "Technical Implementation",
                "Publication Support",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-[#E1E8F0] bg-[#F8FAFC] px-4 py-3.5"
                >
                  <CheckCircle2
                    size={18}
                    className="shrink-0 text-[#17213A]"
                  />

                  <span className="text-sm font-semibold text-slate-700">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <Link
              to="/about"
              className="mt-8 inline-flex items-center gap-2 font-semibold text-[#17213A]"
            >
              Discover {siteSettings.site_name || "Research Guru"}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          SERVICES
      ====================================================== */}
      <section
        id="services"
        className="bg-[#F5F8FC] px-6 py-24 lg:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#17213A]">
              Our Services
            </span>

            <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#17213A] md:text-5xl">
              Everything you need to move your research forward.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Choose your area of need and
              explore the support available
              across Implementation, Writing,
              and Publication.
            </p>
          </div>

          {/* Service Categories */}
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {loadingPageData ? (
              <div className="md:col-span-3 rounded-3xl border border-[#DCE5F0] bg-white p-10 text-center text-sm text-slate-500">
                Loading Services...
              </div>
            ) : (
              services.map((service) => {
                const Icon = getServiceIcon(
                  service.name
                );

                const active =
                  activeService ===
                  service.name;

                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() =>
                      setActiveService(
                        service.name
                      )
                    }
                    className={`group cursor-pointer rounded-3xl border p-7 text-left transition duration-300 ${
                      active
                        ? "border-[#17213A] bg-[#17213A] shadow-xl shadow-[#17213A]/15"
                        : "border-[#DCE5F0] bg-white hover:-translate-y-1 hover:shadow-xl hover:shadow-[#17213A]/8"
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                        active
                          ? "bg-white text-[#17213A]"
                          : "bg-[#17213A] text-white"
                      }`}
                    >
                      <Icon size={22} />
                    </div>

                    <h3
                      className={`mt-6 text-2xl font-bold ${
                        active
                          ? "text-white"
                          : "text-[#17213A]"
                      }`}
                    >
                      {service.name}
                    </h3>

                    <p
                      className={`mt-3 text-sm leading-6 ${
                        active
                          ? "text-slate-300"
                          : "text-slate-600"
                      }`}
                    >
                      {getServiceShortText(
                        service.name
                      )}
                    </p>

                    <Link
                      to={`/services#service-categories`}
                      onClick={(event) =>
                        event.stopPropagation()
                      }
                      className={`mt-6 flex items-center gap-2 text-sm font-semibold ${
                        active
                          ? "text-white"
                          : "text-[#17213A]"
                      }`}
                    >
                      Explore Services
                      <ArrowRight
                        size={16}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </Link>
                  </button>
                );
              })
            )}
          </div>

          {/* Active Service Details */}
          {activeServiceData && (
            <div className="mt-6 rounded-[2rem] border border-[#DCE5F0] bg-white p-8 shadow-sm md:p-10">
              <div className="flex flex-col gap-8 lg:flex-row lg:justify-between">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF4FA] text-[#17213A]">
                      {(() => {
                        const Icon =
                          getServiceIcon(
                            activeServiceData.name
                          );

                        return (
                          <Icon size={22} />
                        );
                      })()}
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Selected Service
                      </p>

                      <h3 className="mt-1 text-2xl font-bold text-[#17213A]">
                        {activeServiceData.name}
                      </h3>
                    </div>
                  </div>

                  <p className="mt-5 text-base leading-7 text-slate-600">
                    {getServiceDescription(
                      activeServiceData.name
                    )}
                  </p>
                </div>

                <Link
                  to={`/contact?service=${encodeURIComponent(
                    activeServiceData.name
                  )}`}
                  className="inline-flex h-fit shrink-0 items-center justify-center gap-2 rounded-full bg-[#17213A] px-6 py-3.5 font-semibold text-white transition hover:bg-[#0F172A]"
                >
                  Discuss Your Requirement
                  <ArrowRight size={17} />
                </Link>
              </div>

              {/* Service options */}
              <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {activeServiceData.services?.map(
                  (option) => (
                    <Link
                      to={`/contact?research=${encodeURIComponent(
                        option.name
                      )}&service=${encodeURIComponent(
                        activeServiceData.name
                      )}`}
                      key={option.id}
                      className="group flex cursor-pointer items-center justify-between rounded-2xl border border-[#DCE5F0] bg-[#F8FAFC] px-5 py-4 transition hover:border-[#17213A] hover:bg-white"
                    >
                      <span className="text-sm font-medium text-slate-700 group-hover:text-[#17213A]">
                        {option.name}
                      </span>

                      <ArrowRight
                        size={16}
                        className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#17213A]"
                      />
                    </Link>
                  )
                )}
              </div>

              <div className="mt-8">
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 font-semibold text-[#17213A]"
                >
                  View all services
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          HOW WE HELP
      ====================================================== */}
      <section className="bg-white px-6 py-24 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#17213A]">
              How We Help
            </span>

            <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#17213A] md:text-5xl">
              From Research Idea to Research Outcome.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              A structured approach helps
              researchers focus on the actual
              research while receiving support at
              the stages where it matters most.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-4">
            {[
              {
                number: "01",
                icon: Lightbulb,
                title: "Define",
                text: "Define the Research Problem, Objectives, Requirements, and Intended Outcome.",
              },
              {
                number: "02",
                icon: BookOpen,
                title: "Research",
                text: "Review Relevant Work, Identify Gaps, and Establish a Suitable Research Direction.",
              },
              {
                number: "03",
                icon: Code2,
                title: "Implement",
                text: "Develop Experiments, Models, Applications, Algorithms, and Technical Solutions.",
              },
              {
                number: "04",
                icon: FileText,
                title: "Present",
                text: "Turn the work into Clear Documentation, Publications, Presentations, and Research Outputs.",
              },
            ].map((step) => {
              const Icon = step.icon;

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

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {step.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          IMPACT
      ====================================================== */}
      <section className="bg-[#F5F8FC] px-6 py-24 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
          <div>
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#17213A]">
              Our Impact
            </span>

            <h2 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-[#17213A] md:text-5xl">
              Supporting Researchers Across Disciplines.
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              {siteSettings.site_name || "Research Guru"} brings together
              Academic Understanding, Technical
              Expertise, and Practical Research
              support to help scholars move
              confidently from concepts to
              completed research outcomes.
            </p>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Our work spans Research Writing,
              Technical Implementation,
              Publication Preparation,
              Documentation, and
              Project-Specific Academic Support.
            </p>

            <Link
              to="/about"
              className="mt-8 inline-flex items-center gap-2 font-semibold text-[#17213A]"
            >
              Discover Our Approach
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {impact.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-3xl border border-[#DCE5F0] bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF4FA] text-[#17213A]">
                    <Icon size={22} />
                  </div>

                  <div className="mt-6 text-4xl font-bold tracking-tight text-[#17213A]">
                    {item.number}
                  </div>

                  <div className="mt-4 h-px w-12 bg-[#DCE5F0]" />

                  <h3 className="mt-5 text-lg font-bold text-[#17213A]">
                    {item.label}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          PRESENCE
      ====================================================== */}
      <section className="bg-white px-6 py-24 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#17213A]">
              Our Presence
            </span>

            <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#17213A] md:text-5xl">
              Research Support Without Boundaries.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Building a research support network
              that connects Scholars, Technical
              Experts, and Academic Opportunities
              across Regions.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {presence.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.city}
                  className={`min-h-[350px] rounded-[2rem] border p-9 transition hover:-translate-y-1 hover:shadow-xl ${
                    index === 2
                      ? "border-[#AFC5DE] bg-[#F8FAFC]"
                      : "border-[#DCE5F0] bg-white"
                  }`}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#CFE0F0] bg-[#F1F6FB] text-[#17213A]">
                    <Icon size={25} />
                  </div>

                  <p className="mt-12 text-sm font-bold tracking-[0.3em] text-[#17213A]">
                    {item.type}
                  </p>

                  <h3 className="mt-4 text-4xl font-bold tracking-tight text-[#17213A]">
                    {item.city}
                  </h3>

                  <p className="mt-6 text-lg leading-8 text-slate-600">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
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
              Have a research idea?
              <span className="block text-slate-300">
                Let's build it together.
              </span>
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Tell us about your research
              requirement and explore the right
              support for your project.
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

export default Home;