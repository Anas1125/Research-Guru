import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  Send,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  apiFetch,
  API_URL,
} from "../utils/api";

function Contact() {
  const [searchParams] =
    useSearchParams();

  /* =========================================================
     SITE SETTINGS
  ========================================================== */

  const [siteSettings, setSiteSettings] =
    useState({
      site_name: "Research Guru",
      contact_phone: "",
      contact_email: "",
      contact_address: "",
      contact_whatsapp: "",
      contact_hours: "",
      contact_background: "",
    });

  /* =========================================================
     SERVICES / RESEARCH AREAS
  ========================================================== */

  const [researchAreas, setResearchAreas] =
    useState([]);

  const [serviceCategories, setServiceCategories] =
    useState([]);

  const [loadingData, setLoadingData] =
    useState(true);

  /* =========================================================
     FORM
  ========================================================== */

  const selectedCoupon =
    searchParams.get("coupon") || "";

  const selectedResearch =
    searchParams.get("research") || "";

  const selectedService =
    searchParams.get("service") || "";

  const [formData, setFormData] =
    useState({
      name: "",
      phone: "",
      email: "",
      research_area:
        selectedResearch,
      service: selectedService,
      research_stage: "",
      message: "",
      coupon: selectedCoupon.toUpperCase(),
    });

  const [submitting, setSubmitting] =
    useState(false);

  const [submitMessage, setSubmitMessage] =
    useState("");

  const [submitError, setSubmitError] =
    useState("");

  /* =========================================================
     LOAD BACKEND DATA
  ========================================================== */

  useEffect(() => {
    async function loadContactData() {
      try {
        setLoadingData(true);

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
              settings.site_name ||
              "Research Guru",

            contact_phone:
              settings.contact_phone ||
              "",

            contact_email:
              settings.contact_email ||
              "",

            contact_address:
              settings.contact_address ||
              "",

            contact_whatsapp:
              settings.contact_whatsapp ||
              "",

            contact_hours:
              settings.contact_hours ||
              "",

            contact_background:
              settings.contact_background ||
              "",
          });
        }

        /* -----------------------------
           SERVICES
        ----------------------------- */

        if (servicesResponse.ok) {
          const categories =
            await servicesResponse.json();

          setServiceCategories(
            categories
          );

          const implementation =
            categories.find(
              (category) =>
                category.name ===
                "Implementation"
            );

          setResearchAreas(
            implementation?.services ||
              []
          );
        }
      } catch (error) {
        console.error(
          "Failed to load contact data:",
          error
        );
      } finally {
        setLoadingData(false);
      }
    }

    loadContactData();
  }, []);

  /* =========================================================
     UPDATE FORM WHEN URL QUERY CHANGES
  ========================================================== */

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,

      research_area:
        selectedResearch ||
        prev.research_area,

      service:
        selectedService ||
        prev.service,

        coupon:
          selectedCoupon
            ? selectedCoupon.toUpperCase()
            : prev.coupon,
    }));
  }, [
    selectedResearch,
    selectedService,
  ]);

  /* =========================================================
     FORM HELPERS
  ========================================================== */

  function updateFormField(
    field,
    value
  ) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

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

  function getPhoneNumber() {
    return (
      siteSettings.contact_phone ||
      "Phone number not available"
    );
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

  /* =========================================================
     SUBMIT CONTACT ENQUIRY
  ========================================================== */

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setSubmitting(true);
    setSubmitMessage("");
    setSubmitError("");

    try {
      const response =
        await apiFetch(
          "/api/contact",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              formData
            ),
          }
        );

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Failed to submit your enquiry."
        );
      }

      setSubmitMessage(
        "Thank you. Your research enquiry has been submitted successfully. Our team will get back to you."
      );

      setSubmitError("");

      setFormData({
        name: "",
        phone: "",
        email: "",
        research_area:
          selectedResearch || "",
        service:
          selectedService || "",
        research_stage: "",
        message: "",
      });
    } catch (error) {
      setSubmitError(
        error.message ||
          "Failed to submit your enquiry."
      );

      setSubmitMessage("");
    } finally {
      setSubmitting(false);
    }
  }

  /* =========================================================
     STATIC CONTENT
  ========================================================== */

  const waysToConnect = [
    {
      icon: MessageSquare,
      title: "Research Discussion",
      text: "Share your Research Idea, Challenge, or Current Stage with our team.",
    },
    {
      icon: Search,
      title: "Requirement Review",
      text: "Tell us what kind of Writing, Publication, or Implementation Support you need.",
    },
    {
      icon: GraduationCap,
      title: "PhD Support",
      text: "Discuss Thesis, Dissertation, Technical Research, and Publication Requirements.",
    },
  ];

  const process = [
    {
      number: "01",
      icon: Send,
      title: "Send Your Requirement",
      text: "Tell us about your Research Area, Current Stage, and the Support you are looking for.",
    },
    {
      number: "02",
      icon: MessageSquare,
      title: "Discuss Your Project",
      text: "Our team reviews your Requirement and Discusses the appropriate way forward.",
    },
    {
      number: "03",
      icon: FileText,
      title: "Define the Scope",
      text: "The Research Requirement, Expected Work, and Deliverables are clearly understood.",
    },
    {
      number: "04",
      icon: CheckCircle2,
      title: "Get Started",
      text: "Once the scope is clear, the required research support can begin.",
    },
  ];

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
            siteSettings.contact_background
              ? `url("${getImageUrl(
                  siteSettings.contact_background
                )}")`
              : "linear-gradient(to bottom right, #ffffff, #F8FAFE, #EAF1FA)",
        }}
      >
        {siteSettings.contact_background && (
          <div className="absolute inset-0 bg-white/75" />
        )}

        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-[#DCE7F5]/40 blur-3xl" />

        <div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-[#E3ECF8]/50 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">

          <div className="max-w-4xl">

            <span className="inline-flex rounded-full border border-[#D5E0EE] bg-white/90 px-4 py-2 text-sm font-semibold text-[#17213A] shadow-sm backdrop-blur">
              Contact{" "}
              {siteSettings.site_name ||
                "Research Guru"}
            </span>

            <h1 className="mt-6 text-5xl font-bold leading-[1.03] tracking-tight text-[#17213A] md:text-6xl lg:text-7xl">
              Let's Talk About
              <span className="block">
                Your Research.
              </span>
            </h1>

            <p className="mt-7 max-w-3xl text-lg font-medium leading-8 text-slate-600 md:text-xl">
              Whether you are planning a new
              Research Project, Developing a
              Technical Implementation, Preparing
              a Manuscript, or looking for
              Publication Support, tell us what
              you are working on.
            </p>

            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3">

              {[
                "Research Support",
                "Technical Implementation",
                "Publication Assistance",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-sm font-medium text-slate-600"
                >
                  <CheckCircle2
                    size={18}
                    className="text-[#17213A]"
                  />

                  {item}
                </div>
              ))}

            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          CONTACT INFORMATION STRIP
      ====================================================== */}

      <section className="border-b border-slate-100 bg-white">

        <div className="mx-auto grid max-w-7xl divide-y divide-slate-200 md:grid-cols-3 md:divide-x md:divide-y-0">

          {/* PHONE */}

          <a
            href={getPhoneHref()}
            className="group flex items-center gap-4 px-6 py-7 transition hover:bg-[#F8FAFC]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#17213A] text-white">
              <Phone size={20} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Call Us
              </p>

              <p className="mt-1 font-bold text-[#17213A] group-hover:underline">
                {getPhoneNumber()}
              </p>
            </div>
          </a>

          {/* EMAIL */}

          <a
            href={
              siteSettings.contact_email
                ? `mailto:${siteSettings.contact_email}`
                : "#"
            }
            className="group flex items-center gap-4 px-6 py-7 transition hover:bg-[#F8FAFC]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#17213A] text-white">
              <Mail size={20} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Email Us
              </p>

              <p className="mt-1 font-bold text-[#17213A] group-hover:underline">
                {siteSettings.contact_email ||
                  "Email not available"}
              </p>
            </div>
          </a>

          {/* LOCATION */}

          <div className="flex items-center gap-4 px-6 py-7">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#17213A] text-white">
              <MapPin size={20} />
            </div>

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Location
              </p>

              <p className="mt-1 font-bold leading-6 text-[#17213A]">
                {siteSettings.contact_address ||
                  "Location not available"}
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          MAIN CONTACT AREA
      ====================================================== */}

      <section className="bg-white px-6 py-24 lg:py-28">

        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">

          {/* LEFT */}

          <div>

            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#17213A]">
              Get In Touch
            </span>

            <h2 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-[#17213A] md:text-4xl">
              Tell Us Where You Are In Your
              Research Journey.
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              You do not need to have everything
              figured out before contacting us.
              Share the Research Area, the current
              stage of your work, and the specific
              challenge or requirement you are
              facing.
            </p>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              This helps us understand whether you
              need support with Research Writing,
              Technical Implementation, Publication,
              Analysis, or another part of your
              Project.
            </p>

            {/* WHAT TO INCLUDE */}

            <div className="mt-10 rounded-[2rem] border border-[#DCE5F0] bg-[#F8FAFC] p-7">

              <h3 className="text-xl font-bold text-[#17213A]">
                What can you tell us?
              </h3>

              <div className="mt-6 space-y-4">

                {[
                  "Your research topic or domain",
                  "Your current research stage",
                  "The specific support you require",
                  "Any technical or publication requirements",
                  "Your expected research outcome",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0 text-[#17213A]"
                    />

                    <span className="text-sm leading-7 text-slate-600">
                      {item}
                    </span>
                  </div>
                ))}

              </div>

            </div>

            {/* RESPONSE */}
          <div className="mt-6 rounded-2xl border border-[#D6E2EF] bg-[#F8FAFC] p-6 shadow-sm">
            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#17213A] text-white">
                <Clock3 size={21} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#17213A]">
                  Discuss your requirement
                </h3>

                <p className="mt-2 text-base leading-7 text-slate-600">
                  Provide enough detail for our team to understand your research
                  requirement clearly.
                </p>

                {siteSettings.contact_hours && (
                  <div className="mt-4 inline-flex items-center rounded-lg bg-white px-4 py-2.5 border border-[#DCE5F0]">
                    <Clock3
                      size={16}
                      className="mr-2 text-[#2563EB]"
                    />

                    <p className="text-base font-bold text-[#17213A]">
                      {siteSettings.contact_hours}
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>

          </div>

          {/* RIGHT FORM */}

          <div className="rounded-[2rem] border border-[#D9E4F1] bg-white p-7 shadow-2xl shadow-[#17213A]/10 md:p-9">

            <div className="mb-7">

              <div className="mb-3 h-1.5 w-14 rounded-full bg-[#17213A]" />

              <h2 className="text-2xl font-bold tracking-tight text-[#17213A] md:text-3xl">
                Send us your requirement
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Fill in the form below and tell us
                about your research.
              </p>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              {/* NAME + PHONE */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* NAME */}
                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-1.5 block text-sm font-semibold text-[#17213A]"
                  >
                    Name *
                  </label>

                  <input
                    id="contact-name"
                    name="name"
                    autoComplete="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      updateFormField(
                        "name",
                        e.target.value
                      )
                    }
                    required
                    placeholder="Your full name"
                    className="w-full rounded-xl border border-[#D9E2ED] bg-[#F8FAFC] px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#17213A] focus:bg-white focus:ring-4 focus:ring-[#17213A]/10"
                  />
                </div>

                {/* PHONE */}
                <div>
                  <label
                    htmlFor="contact-phone"
                    className="mb-1.5 block text-sm font-semibold text-[#17213A]"
                  >
                    Phone *
                  </label>

                  <input
                    id="contact-phone"
                    name="phone"
                    autoComplete="tel"
                    type="tel"
                    inputMode="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      updateFormField(
                        "phone",
                        e.target.value
                          .replace(/[^\d+]/g, "")
                          .replace(/(?!^)\+/g, "")
                      )
                    }
                    required
                    placeholder="+91 00000 00000"
                    className="w-full rounded-xl border border-[#D9E2ED] bg-[#F8FAFC] px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#17213A] focus:bg-white focus:ring-4 focus:ring-[#17213A]/10"
                  />
                </div>

              </div>

              {/* EMAIL */}

              <div>

                <label
                  htmlFor="contact-email"
                  className="mb-1.5 block text-sm font-semibold text-[#17213A]"
                >
                  Email *
                </label>

                <input
                  id="contact-email"
                  name="email"
                  autoComplete="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    updateFormField(
                      "email",
                      e.target.value
                    )
                  }
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-[#D9E2ED] bg-[#F8FAFC] px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#17213A] focus:bg-white focus:ring-4 focus:ring-[#17213A]/10"
                />

              </div>

              {/* RESEARCH AREA */}

              <div>

                <label
                  htmlFor="contact-research-area"
                  className="mb-1.5 block text-sm font-semibold text-[#17213A]"
                >
                  Research Area
                </label>

                <select
                  id="contact-research-area"
                  name="research_area"
                  autoComplete="off"
                  value={
                    formData.research_area
                  }
                  onChange={(e) =>
                    updateFormField(
                      "research_area",
                      e.target.value
                    )
                  }
                  disabled={loadingData}
                  className="w-full cursor-pointer rounded-xl border border-[#D9E2ED] bg-[#F8FAFC] px-4 py-3.5 text-sm text-slate-600 outline-none transition focus:border-[#17213A] focus:bg-white focus:ring-4 focus:ring-[#17213A]/10 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  <option value="">
                    {loadingData
                      ? "Loading research areas..."
                      : "Select your research area"}
                  </option>

                  {researchAreas.map(
                    (area) => (
                      <option
                        key={area.id}
                        value={area.name}
                      >
                        {area.name}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* SERVICE */}

              <div>

                <label
                  htmlFor="contact-service"
                  className="mb-1.5 block text-sm font-semibold text-[#17213A]"
                >
                  Service Required
                </label>

                <select
                  id="contact-service"
                  name="service"
                  autoComplete="off"
                  value={
                    formData.service
                  }
                  onChange={(e) =>
                    updateFormField(
                      "service",
                      e.target.value
                    )
                  }
                  disabled={loadingData}
                  className="w-full cursor-pointer rounded-xl border border-[#D9E2ED] bg-[#F8FAFC] px-4 py-3.5 text-sm text-slate-600 outline-none transition focus:border-[#17213A] focus:bg-white focus:ring-4 focus:ring-[#17213A]/10 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  <option value="">
                    {loadingData
                      ? "Loading services..."
                      : "Select a service"}
                  </option>

                  {serviceCategories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.name}
                      >
                        {category.name}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* CURRENT STAGE */}

              <div>

                <label
                  htmlFor="contact-research-stage"
                  className="mb-1.5 block text-sm font-semibold text-[#17213A]"
                >
                  Current Research Stage
                </label>

                <select
                  id="contact-research-stage"
                  name="research_stage"
                  autoComplete="off"
                  value={
                    formData.research_stage
                  }
                  onChange={(e) =>
                    updateFormField(
                      "research_stage",
                      e.target.value
                    )
                  }
                  className="w-full cursor-pointer rounded-xl border border-[#D9E2ED] bg-[#F8FAFC] px-4 py-3.5 text-sm text-slate-600 outline-none transition focus:border-[#17213A] focus:bg-white focus:ring-4 focus:ring-[#17213A]/10"
                >

                  <option value="">
                    Select current stage
                  </option>

                  <option>
                    Research Idea
                  </option>

                  <option>
                    Topic / Problem Identification
                  </option>

                  <option>
                    Literature Review
                  </option>

                  <option>
                    Methodology
                  </option>

                  <option>
                    Implementation
                  </option>

                  <option>
                    Data Analysis
                  </option>

                  <option>
                    Paper Writing
                  </option>

                  <option>
                    Publication
                  </option>

                  <option>
                    Thesis / Dissertation
                  </option>

                  <option>
                    Not sure
                  </option>

                </select>

              </div>

              {formData.coupon && (
                <div>
                  <label
                    htmlFor="contact-coupon"
                    className="mb-1.5 block text-sm font-semibold text-[#17213A]"
                  >
                    Offer Code
                  </label>

                  <input
                    id="contact-coupon"
                    name="coupon"
                    type="text"
                    value={formData.coupon}
                    readOnly
                    className="w-full rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-bold tracking-wide text-emerald-700 outline-none"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    This offer code was automatically added from the offer you selected.
                  </p>
                </div>
              )}

              {/* MESSAGE */}

              <div>

                <label
                  htmlFor="contact-message"
                  className="mb-1.5 block text-sm font-semibold text-[#17213A]"
                >
                  Tell us about your requirement
                </label>

                <textarea
                  id="contact-message"
                  name="message"
                  autoComplete="off"
                  rows="5"
                  value={formData.message}
                  onChange={(e) =>
                    updateFormField(
                      "message",
                      e.target.value
                    )
                  }
                  placeholder="Describe your research, requirements, current challenges, or the support you are looking for..."
                  className="w-full resize-none rounded-xl border border-[#D9E2ED] bg-[#F8FAFC] px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#17213A] focus:bg-white focus:ring-4 focus:ring-[#17213A]/10"
                />

              </div>

              {/* ERROR */}

              {submitError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-700">
                  {submitError}
                </div>
              )}

              {/* SUCCESS */}

              {submitMessage && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium leading-6 text-emerald-700">
                  {submitMessage}
                </div>
              )}

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#17213A] px-6 py-4 font-semibold text-white shadow-lg shadow-[#17213A]/15 transition hover:bg-[#0F172A] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Sending..."
                  : "Send Research Enquiry"}

                {!submitting && (
                  <ArrowRight
                    size={18}
                  />
                )}
              </button>

              <p className="text-center text-xs leading-5 text-slate-400">
                Your information will be used to
                understand and respond to your
                research enquiry.
              </p>

            </form>

          </div>

        </div>

      </section>

      {/* =====================================================
          WAYS TO CONNECT
      ====================================================== */}

      <section className="bg-[#F5F8FC] px-6 py-24 lg:py-15">

        <div className="mx-auto max-w-7xl">

          <div className="mx-auto max-w-3xl text-center">

            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#17213A]">
              Start With A Conversation
            </span>

            <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#17213A] md:text-5xl">
              What happens when you contact us?
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              A clear initial discussion helps us
              understand what your research actually
              needs.
            </p>

          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-3">

            {waysToConnect.map(
              (item) => {
                const Icon =
                  item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-3xl border border-[#DCE5F0] bg-white p-8"
                  >

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#17213A] text-white">
                      <Icon size={21} />
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
          CONTACT PROCESS
      ====================================================== */}

      <section className="bg-white px-6 py-24 lg:py-15">

        <div className="mx-auto max-w-7xl">

          <div className="max-w-3xl">

            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#17213A]">
              Our Process
            </span>

            <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#17213A] md:text-5xl">
              From your enquiry to the next step.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              We keep the initial process simple so
              the research requirement can be
              understood before moving forward.
            </p>

          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

            {process.map(
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
      <Footer />

    </div>
  );
}

export default Contact;