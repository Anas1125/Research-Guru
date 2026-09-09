import { useEffect, useMemo, useState } from "react";

import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Copy,
  Gift,
  Tag,
} from "lucide-react";

import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  apiFetch,
  API_URL,
} from "../utils/api";

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

/* =====================================================
   OFFER STATUS
===================================================== */

const getOfferStatus = (
  startDate,
  endDate,
  now = new Date()
) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return "expired";
  }

  if (now < start) {
    return "upcoming";
  }

  if (now <= end) {
    return "live";
  }

  return "expired";
};

/* =====================================================
   DATE FORMAT
===================================================== */

const formatDateTime = (dateString) => {
  if (!dateString) {
    return "—";
  }

  const date = new Date(dateString);

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
};

/* =====================================================
   COUNTDOWN FORMAT
===================================================== */

const formatCountdown = (
  targetDate,
  currentTime
) => {
  const target = new Date(targetDate);

  if (Number.isNaN(target.getTime())) {
    return "00d 00h 00m 00s";
  }

  const difference =
    target.getTime() -
    currentTime.getTime();

  if (difference <= 0) {
    return "00d 00h 00m 00s";
  }

  const totalSeconds = Math.floor(
    difference / 1000
  );

  const days = Math.floor(
    totalSeconds / 86400
  );

  const hours = Math.floor(
    (totalSeconds % 86400) / 3600
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );

  const seconds =
    totalSeconds % 60;

  return `${String(days).padStart(
    2,
    "0"
  )}d ${String(hours).padStart(
    2,
    "0"
  )}h ${String(minutes).padStart(
    2,
    "0"
  )}m ${String(seconds).padStart(
    2,
    "0"
  )}s`;
};

/* =====================================================
   DISCOUNT
===================================================== */

const getDiscountText = (offer) => {
  if (!offer.discount_value) {
    return null;
  }

  if (
    offer.discount_type ===
    "percentage"
  ) {
    return `${offer.discount_value}% OFF`;
  }

  if (
    offer.discount_type ===
    "fixed"
  ) {
    return `₹${offer.discount_value} OFF`;
  }

  return offer.discount_value;
};

/* =====================================================
   OFFER CARD
===================================================== */

function OfferCard({
  offer,
  status,
  currentTime,
}) {
  const [copied, setCopied] =
    useState(false);

  const discountText =
    getDiscountText(offer);

  /* ===================================================
     COUNTDOWN
  =================================================== */

  const countdown =
    status === "live"
      ? formatCountdown(
          offer.end_date,
          currentTime
        )
      : status === "upcoming"
      ? formatCountdown(
          offer.start_date,
          currentTime
        )
      : null;

  /* ===================================================
     COPY PROMO CODE
  =================================================== */

  const handleCopyCode = async () => {
    if (!offer.offer_code) {
      return;
    }

    const promoCode =
      offer.offer_code.toUpperCase();

    try {
      await navigator.clipboard.writeText(
        promoCode
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (error) {
      console.error(
        "Failed to copy offer code:",
        error
      );
    }
  };

  return (
    <div
      className={`group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border p-6 transition duration-300 ${
        status === "live"
          ? "border-[#17213A] bg-[#17213A] shadow-lg shadow-[#17213A]/15"
          : "border-[#DCE5F0] bg-white hover:-translate-y-1 hover:shadow-lg hover:shadow-[#17213A]/8"
      }`}
    >
      {/* =================================================
          DIAGONAL CUT
          ONLY FOR EXPIRED CARDS
      ================================================== */}

      {status === "expired" && (
        <div className="pointer-events-none absolute left-[-35%] top-1/2 z-0 h-px w-[170%] rotate-[58deg] bg-[#DCE5F0]" />
      )}

      {/* =================================================
          CARD CONTENT
      ================================================== */}

      <div className="relative z-10 flex h-full flex-col">

        {/* =================================================
            HEADER
        ================================================== */}

        <div className="flex items-start justify-between gap-3">

          {/* Gift Icon */}
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${
              status === "live"
                ? "bg-white text-[#17213A]"
                : "bg-[#17213A] text-white"
            }`}
          >
            <Gift size={21} />
          </div>

          {/* =================================================
              LIVE
          ================================================== */}

          {status === "live" && (
            <span className="inline-flex animate-pulse items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm shadow-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              LIVE
            </span>
          )}

          {/* =================================================
              UPCOMING
          ================================================== */}

          {status === "upcoming" && (
            <span className="inline-flex animate-pulse items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm shadow-amber-500/30">
              <Clock3 size={12} />
              UPCOMING
            </span>
          )}

          {/* =================================================
              EXPIRED
          ================================================== */}

          {status === "expired" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm shadow-red-500/20">
              EXPIRED
            </span>
          )}

        </div>

        {/* =================================================
            TITLE
        ================================================== */}

        <h3
          className={`mt-5 text-xl font-bold leading-tight ${
            status === "live"
              ? "text-white"
              : "text-[#17213A]"
          }`}
        >
          {offer.title}
        </h3>

        {/* =================================================
            DISCOUNT
        ================================================== */}

        {discountText && (
          <div
            className={`mt-3 inline-flex w-fit items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold ${
              status === "live"
                ? "bg-white text-[#17213A]"
                : "bg-[#17213A] text-white"
            }`}
          >
            <Tag size={13} />
            {discountText}
          </div>
        )}

        {/* =================================================
            DESCRIPTION
        ================================================== */}

        {offer.description && (
          <p
            className={`mt-4 text-sm leading-6 ${
              status === "live"
                ? "text-slate-300"
                : "text-slate-600"
            }`}
          >
            {offer.description}
          </p>
        )}

        {/* =================================================
            DATES
        ================================================== */}

        <div className="mt-5 space-y-2.5">

          {/* START DATE */}
          <div
            className={`flex items-start gap-3 rounded-xl p-3 ${
              status === "live"
                ? "bg-white/10"
                : "bg-[#F8FAFC]"
            }`}
          >
            <CalendarDays
              size={17}
              className={`mt-0.5 shrink-0 ${
                status === "live"
                  ? "text-white"
                  : "text-[#17213A]"
              }`}
            />

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Starts
              </p>

              <p
                className={`mt-1 text-xs font-semibold ${
                  status === "live"
                    ? "text-white"
                    : "text-[#17213A]"
                }`}
              >
                {formatDateTime(
                  offer.start_date
                )}
              </p>
            </div>
          </div>

          {/* END DATE */}
          <div
            className={`flex items-start gap-3 rounded-xl p-3 ${
              status === "live"
                ? "bg-white/10"
                : "bg-[#F8FAFC]"
            }`}
          >
            <CalendarDays
              size={17}
              className={`mt-0.5 shrink-0 ${
                status === "live"
                  ? "text-white"
                  : "text-[#17213A]"
              }`}
            />

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Ends
              </p>

              <p
                className={`mt-1 text-xs font-semibold ${
                  status === "live"
                    ? "text-white"
                    : "text-[#17213A]"
                }`}
              >
                {formatDateTime(
                  offer.end_date
                )}
              </p>
            </div>
          </div>

        </div>

        {/* =================================================
            COUNTDOWN
        ================================================== */}

        {countdown && (
          <div
            className={`mt-4 flex items-center justify-between gap-3 rounded-xl px-3.5 py-3 ${
              status === "live"
                ? "bg-emerald-500/10 text-emerald-300"
                : "bg-amber-500/10 text-amber-600"
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock3 size={16} />

              <span className="text-[11px] font-bold uppercase tracking-[0.12em]">
                {status === "live"
                  ? "Ends in"
                  : "Starts in"}
              </span>
            </div>

            <span className="font-mono text-xs font-bold tabular-nums">
              {countdown}
            </span>
          </div>
        )}

        {/* =================================================
            OFFER CODE
        ================================================== */}

        {offer.offer_code && status === "live" && (
          <div className="mt-5">

            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Offer Code
            </p>

            <div
              className={`flex items-center justify-between gap-2 rounded-xl border border-dashed px-3 py-2.5 ${
                status === "live"
                  ? "border-white/20 bg-white/10"
                  : "border-[#C9D6E5] bg-[#F8FAFC]"
              }`}
            >

              <span
                className={`min-w-0 truncate font-mono text-xs font-bold tracking-wide ${
                  status === "live"
                    ? "text-white"
                    : "text-[#17213A]"
                }`}
              >
                {offer.offer_code.toUpperCase()}
              </span>

              {status !== "expired" && (
                <button
                  type="button"
                  onClick={
                    handleCopyCode
                  }
                  className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition ${
                    status === "live"
                      ? "bg-white text-[#17213A] hover:bg-slate-100"
                      : "bg-white text-[#17213A] shadow-sm hover:bg-[#EEF4FA]"
                  }`}
                >
                  {copied ? (
                    <>
                      <CheckCircle2
                        size={13}
                      />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      Copy
                    </>
                  )}
                </button>
              )}

            </div>
          </div>
        )}

        {/* =================================================
            CTA
        ================================================== */}

        <div className="mt-auto pt-6">

          {status === "expired" ? (
            <div className="flex items-center gap-2 text-xs font-medium text-red-400">
              <Clock3 size={16} />
              This offer has ended.
            </div>
          ) : status === "upcoming" ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-600">
              <Clock3 size={16} />
              Available when the offer starts.
            </div>
          ) : (
            <Link
              to={
                offer.offer_code
                  ? `/contact?coupon=${encodeURIComponent(
                      offer.offer_code.toUpperCase()
                    )}`
                  : offer.cta_link || "/contact"
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#17213A] transition hover:bg-slate-100"
            >
              {offer.cta_text || "Get Started"}

              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          )}

        </div>

      </div>
    </div>
  );
}

/* =====================================================
   OFFER SECTION
===================================================== */

function OfferSection({
  eyebrow,
  title,
  description,
  offers,
  status,
  background = "white",
  currentTime,
}) {
  if (offers.length === 0) {
    return null;
  }

  return (
    <section
      className={`relative overflow-hidden px-6 py-20 lg:py-18 ${
        background === "light"
          ? "bg-[#F5F8FC]"
          : "bg-white"
      }`}
    >
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            SECTION HEADING
        ================================================== */}

        <div className="max-w-3xl">

          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#17213A]">
            {eyebrow}
          </span>

          <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#17213A] md:text-5xl">
            {title}
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            {description}
          </p>

        </div>

        {/* =================================================
            OFFER GRID
        ================================================== */}

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          {offers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              status={status}
              currentTime={currentTime}
            />
          ))}

        </div>

      </div>
    </section>
  );
}

/* =====================================================
   OFFERS PAGE
===================================================== */

function Offers() {
  const [offers, setOffers] =
    useState([]);

  const [offersBackground, setOffersBackground] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* ===================================================
     LIVE CLOCK
  =================================================== */

  const [currentTime, setCurrentTime] =
    useState(new Date());

  /* ===================================================
     UPDATE CLOCK EVERY SECOND
  =================================================== */

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date()
      );
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  /* ===================================================
     LOAD OFFERS + SITE SETTINGS
  =================================================== */

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          offersResponse,
          settingsResponse,
        ] = await Promise.all([
          apiFetch("/api/offers"),
          apiFetch(
            "/api/site-settings"
          ),
        ]);

        if (!offersResponse.ok) {
          throw new Error(
            "Failed to load offers"
          );
        }

        const offerData =
          await offersResponse.json();

        setOffers(
          Array.isArray(offerData)
            ? offerData
            : []
        );

        if (settingsResponse.ok) {
          const settings =
            await settingsResponse.json();

          setOffersBackground(
            settings.offers_background ||
              ""
          );
        }
      } catch (error) {
        console.error(
          "Failed to load Offers page data:",
          error
        );

        setError(
          "Unable to load offers right now."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, []);

  /* ===================================================
     CATEGORIZE OFFERS
  =================================================== */

  const categorizedOffers =
    useMemo(() => {
      const live = [];
      const upcoming = [];
      const expired = [];

      offers.forEach((offer) => {
        const status =
          getOfferStatus(
            offer.start_date,
            offer.end_date,
            currentTime
          );

        if (status === "live") {
          live.push(offer);
        }

        if (status === "upcoming") {
          upcoming.push(offer);
        }

        if (status === "expired") {
          expired.push(offer);
        }
      });

      return {
        live,
        upcoming,
        expired,
      };
    }, [
      offers,
      currentTime,
    ]);

  /* ===================================================
     HERO BACKGROUND
  =================================================== */

  const heroBackground =
    getImageUrl(
      offersBackground
    );

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <div className="min-h-screen bg-white text-slate-900">

      <Navbar />

      {/* =================================================
          HERO
      ================================================== */}

      <section
        className="relative h-[calc(110vh-73px)] overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage:
            heroBackground
              ? `url("${heroBackground}")`
              : "linear-gradient(to bottom right, #ffffff, #F8FAFE, #EAF1FA)",
        }}
      >

        {heroBackground && (
          <div className="absolute inset-0 bg-white/75" />
        )}

        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-[#DCE7F5]/45 blur-3xl" />

        <div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-[#E3ECF8]/55 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">

          <div className="max-w-4xl">

            <span className="inline-flex rounded-full border border-[#D5E0EE] bg-white/90 px-4 py-2 text-sm font-semibold text-[#17213A] shadow-sm backdrop-blur">
              Special Offers
            </span>

            <h1 className="mt-6 text-5xl font-bold leading-[1.03] tracking-tight text-[#17213A] md:text-6xl lg:text-7xl">
              Research offers

              <span className="block">
                designed around your needs.
              </span>
            </h1>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">
              Explore our current and upcoming
              offers across research support,
              academic writing, technical
              implementation, and publication.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">

              <a
                href="#offers"
                className="inline-flex items-center gap-2 rounded-full bg-[#17213A] px-6 py-3.5 font-semibold text-white transition hover:bg-[#0F172A]"
              >
                Explore Offers

                <ArrowDown
                  className="animate-bounce"
                  size={18}
                />
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

      {/* =================================================
          INTRO STRIP
      ================================================== */}

      <section className="border-b border-slate-100 bg-white">

        <div className="mx-auto grid max-w-7xl divide-y divide-slate-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">

          {[
            {
              icon: Gift,
              title: "Live Offers",
              text: "Offers currently available.",
            },
            {
              icon: Clock3,
              title: "Coming Soon",
              text: "Scheduled future offers.",
            },
            {
              icon: Tag,
              title: "Discounts",
              text: "Special pricing opportunities.",
            },
            {
              icon: CalendarDays,
              title: "Time Limited",
              text: "Available for a defined period.",
            },
          ].map((item) => {
            const Icon =
              item.icon;

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

      {/* =================================================
          OFFERS
      ================================================== */}

      <div id="offers">

        {/* =================================================
            LOADING
        ================================================== */}

        {loading ? (
          <section className="bg-[#F5F8FC] px-6 py-24">

            <div className="mx-auto max-w-7xl">

              <div className="rounded-[2rem] border border-[#DCE5F0] bg-white p-12 text-center">

                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-[#17213A]" />

                <p className="mt-4 text-sm text-slate-500">
                  Loading offers...
                </p>

              </div>

            </div>

          </section>

        ) : error ? (

          /* =================================================
             ERROR
          ================================================== */

          <section className="bg-[#F5F8FC] px-6 py-24">

            <div className="mx-auto max-w-3xl">

              <div className="rounded-[2rem] border border-[#DCE5F0] bg-white p-12 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF4FA] text-[#17213A]">
                  <Gift size={24} />
                </div>

                <h2 className="mt-5 text-2xl font-bold text-[#17213A]">
                  Unable to load offers.
                </h2>

                <p className="mt-3 text-slate-500">
                  {error}
                </p>

              </div>

            </div>

          </section>

        ) : offers.length === 0 ? (

          /* =================================================
             NO OFFERS
          ================================================== */

          <section className="bg-[#F5F8FC] px-6 py-28">

            <div className="mx-auto max-w-3xl text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#17213A] shadow-sm">
                <Gift size={28} />
              </div>

              <span className="mt-7 block text-sm font-semibold uppercase tracking-[0.2em] text-[#17213A]">
                Special Offers
              </span>

              <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#17213A]">
                No offers available right now.
              </h2>

              <p className="mt-5 text-lg leading-8 text-slate-600">
                New offers and research support
                opportunities will appear here when
                they become available.
              </p>

              <Link
                to="/contact"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#17213A] px-6 py-3.5 font-semibold text-white transition hover:bg-[#0F172A]"
              >
                Discuss Your Requirement
                <ArrowRight size={18} />
              </Link>

            </div>

          </section>

        ) : (

          /* =================================================
             OFFER SECTIONS
          ================================================== */

          <>

            {/* LIVE OFFERS */}

            <OfferSection
              eyebrow="Current Offers"
              title="Live Offers"
              description="Take advantage of our currently available research support offers while they are active."
              offers={
                categorizedOffers.live
              }
              status="live"
              background="light"
              currentTime={
                currentTime
              }
            />

            {/* UPCOMING OFFERS */}

            <OfferSection
              eyebrow="Coming Next"
              title="Coming Soon"
              description="Upcoming offers that will become available according to their scheduled start date."
              offers={
                categorizedOffers.upcoming
              }
              status="upcoming"
              background="white"
              currentTime={
                currentTime
              }
            />

            {/* EXPIRED OFFERS */}

            <OfferSection
              eyebrow="Offer History"
              title="Previous Offers"
              description="Previously available offers that have now reached their end date."
              offers={
                categorizedOffers.expired
              }
              status="expired"
              background="light"
              currentTime={
                currentTime
              }
            />

          </>

        )}

      </div>

      {/* =================================================
          HOW OFFERS WORK
      ================================================== */}

      <section className="bg-white px-6 py-24 lg:py-20">

        <div className="mx-auto max-w-7xl">

          <div className="max-w-3xl">

            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#17213A]">
              How It Works
            </span>

            <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#17213A] md:text-5xl">
              Simple Offers. Clear Requirements.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Every offer has a defined Period,
              Eligibility Details, and a clear way
              to discuss your Research Requirement.
            </p>

          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">

            {[
              {
                number: "01",
                icon: Tag,
                title: "Choose an Offer",
                text: "Review the available offer and check its discount, dates, and requirements.",
              },
              {
                number: "02",
                icon: CalendarDays,
                title: "Check the Dates",
                text: "Make sure the offer is currently live or note when an upcoming offer begins.",
              },
              {
                number: "03",
                icon: CheckCircle2,
                title: "Discuss Your Requirement",
                text: "Contact our team with your research requirement and the offer you are interested in.",
              },
            ].map((item) => {
              const Icon =
                item.icon;

              return (
                <div
                  key={item.number}
                  className="rounded-3xl border border-[#DCE5F0] bg-[#F8FAFC] p-7"
                >

                  <div className="flex items-center justify-between">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#17213A] text-white">
                      <Icon size={20} />
                    </div>

                    <span className="text-sm font-bold text-slate-300">
                      {item.number}
                    </span>

                  </div>

                  <h3 className="mt-7 text-xl font-bold text-[#17213A]">
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

      {/* =================================================
          RESEARCH SUPPORT
      ================================================== */}

      <section className="bg-[#F5F8FC] px-6 py-24 lg:py-20">

        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">

          <div>

            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#17213A]">
              Research Support
            </span>

            <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#17213A] md:text-5xl">
              Offers across the research lifecycle.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Our research support covers multiple
              stages of academic and technical work,
              from implementation and writing to
              analysis, documentation, and
              publication.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">

              {[
                "Research Implementation",
                "Academic Writing",
                "Thesis & Dissertation",
                "Literature Review",
                "Publication Support",
                "Journal Selection",
              ].map((item) => (
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
              ))}

            </div>

          </div>

          <div className="rounded-[2rem] border border-[#DCE5F0] bg-white p-8 shadow-sm md:p-10">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#17213A] text-white">
              <Gift size={25} />
            </div>

            <h3 className="mt-7 text-2xl font-bold text-[#17213A]">
              Have a research requirement?
            </h3>

            <p className="mt-4 leading-7 text-slate-600">
              Tell us about your research stage,
              objectives, and the support you need.
              Our team can help you understand the
              appropriate next step.
            </p>

            <Link
              to="/contact"
              className="mt-7 inline-flex items-center gap-2 font-semibold text-[#17213A]"
            >
              Discuss Your Requirement
              <ArrowRight size={17} />
            </Link>

          </div>

        </div>
      </section>

      {/* =================================================
          FINAL CTA
      ================================================== */}

      <section className="relative overflow-hidden bg-[#17213A] px-6 py-20">

        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-white/5 blur-3xl" />

        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/5 blur-3xl" />

        <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-10 md:flex-row md:items-center">

          <div>

            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-300">
              Start Your Research
            </p>

            <h2 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-white md:text-5xl">
              Found an offer that fits?

              <span className="block text-slate-300">
                Let's discuss your requirement.
              </span>
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Share your research requirement
              with our team and discuss the support
              you are looking for.
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

export default Offers;