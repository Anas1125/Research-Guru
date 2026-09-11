import { useEffect, useMemo, useState } from "react";
import {
  Tag,
  Clock3,
  Copy,
  Check,
  ArrowRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";

function getOfferStatus(
  startDate,
  endDate,
  now = new Date()
) {
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
}

function formatCountdown(
  targetDate,
  currentTime
) {
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
}

function LiveOfferBar() {
  const navigate = useNavigate();

  const [offers, setOffers] =
    useState([]);

  const [currentTime, setCurrentTime] =
    useState(new Date());

  const [copiedCode, setCopiedCode] =
    useState("");

  /* =====================================================
     LOAD OFFERS
  ====================================================== */

  useEffect(() => {
    let cancelled = false;

    async function loadOffers() {
      try {
        const response =
          await apiFetch("/api/offers");

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        if (!cancelled) {
          setOffers(
            Array.isArray(data)
              ? data
              : []
          );
        }
      } catch (error) {
        console.error(
          "Failed to load live offers:",
          error
        );
      }
    }

    loadOffers();

    const refreshTimer =
      setInterval(
        loadOffers,
        60000
      );

    return () => {
      cancelled = true;
      clearInterval(
        refreshTimer
      );
    };
  }, []);

  /* =====================================================
     LIVE CLOCK
  ====================================================== */

  useEffect(() => {
    const timer =
      setInterval(() => {
        setCurrentTime(
          new Date()
        );
      }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  /* =====================================================
     GET ALL LIVE OFFERS
  ====================================================== */

  const liveOffers = useMemo(() => {
  return offers
    .filter((offer) => {
      if (
        !offer.start_date ||
        !offer.end_date
      ) {
        return false;
      }

      return (
        getOfferStatus(
          offer.start_date,
          offer.end_date,
          currentTime
        ) === "live"
      );
    })
    .sort((a, b) => {
      const orderA =
        Number(a.display_order) || 0;

      const orderB =
        Number(b.display_order) || 0;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return (
        Number(a.id) -
        Number(b.id)
      );
    })
    .slice(0, 3);
}, [
  offers,
  currentTime,
]);

  if (liveOffers.length === 0) {
    return null;
  }

  /* =====================================================
     COPY PROMO CODE
  ====================================================== */

  async function handleCopy(
    promoCode
  ) {
    if (!promoCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        promoCode
      );

      setCopiedCode(promoCode);

      setTimeout(() => {
        setCopiedCode("");
      }, 1800);
    } catch (error) {
      console.error(
        "Failed to copy offer code:",
        error
      );
    }
  }

  /* =====================================================
     OFFER ITEM
  ====================================================== */

  function OfferItem({
    offer,
  }) {
    const endTime =
      new Date(
        offer.end_date
      ).getTime();

    const remainingTime =
      endTime -
      currentTime.getTime();

    const oneDay =
      24 * 60 * 60 * 1000;

    const endingSoon =
      remainingTime > 0 &&
      remainingTime <= oneDay;

    const countdown =
      formatCountdown(
        offer.end_date,
        currentTime
      );

    const discountText =
      offer.discount_value
        ? offer.discount_type ===
          "percentage"
          ? `${offer.discount_value}% OFF`
          : `₹${offer.discount_value} OFF`
        : "";

    const promoCode =
      offer.offer_code
        ? offer.offer_code.toUpperCase()
        : "";

    const description =
      offer.description?.trim() ||
      "Special pricing for professional research support.";

    return (
      <div
        className="flex shrink-0 items-center gap-3 lg:gap-4"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        {/* Offer icon */}

        <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF4FA] sm:flex">
          <Tag
            size={18}
            className="text-[#17213A]"
          />
        </div>

        {/* Title */}

        <span className="max-w-[220px] truncate text-sm font-extrabold text-[#17213A] sm:max-w-[260px] sm:text-base">
          {offer.title}
        </span>

        {/* Discount */}

        {discountText && (
          <span className="shrink-0 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-extrabold text-red-600">
            {discountText}
          </span>
        )}

        {/* Description */}

        {description && (
          <>
            <span className="shrink-0 text-slate-300">
              |
            </span>

            <span className="hidden max-w-[260px] truncate text-xs font-medium text-slate-500 lg:block">
              {description}
            </span>
          </>
        )}

        {/* Countdown */}

        <span className="shrink-0 text-slate-300">
          |
        </span>

        <div
          className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${
            endingSoon
              ? "bg-red-50 text-red-600"
              : "bg-[#EEF4FA] text-[#17213A]"
          }`}
        >
          <Clock3
            size={14}
          />

          <span className="hidden xl:inline">
            Ends in
          </span>

          <span className="font-mono tabular-nums">
            {countdown}
          </span>
        </div>

        {/* Promo code */}

        {promoCode && (
          <>
            <span className="shrink-0 text-slate-300">
              |
            </span>

            <button
              type="button"
              onClick={() =>
                handleCopy(
                  promoCode
                )
              }
              className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold transition ${
                endingSoon
                  ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                  : "border-[#CBD7E6] bg-white text-[#17213A] hover:border-[#17213A]"
              }`}
            >
              <span>
                {copiedCode ===
                promoCode
                  ? "COPIED"
                  : `CODE: ${promoCode}`}
              </span>

              {copiedCode ===
              promoCode ? (
                <Check
                  size={14}
                />
              ) : (
                <Copy
                  size={14}
                />
              )}
            </button>
          </>
        )}

        {/* CTA */}

        <a
          href={
            promoCode
              ? `/contact?coupon=${encodeURIComponent(
                  promoCode
                )}`
              : "/contact"
          }
          onClick={(event) => {
            event.stopPropagation();
          }}
          className="flex shrink-0 items-center gap-2 rounded-full bg-[#17213A] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#0F172A]"
        >
          {offer.cta_text ||
            "Get Started"}

          <ArrowRight
            size={15}
          />
        </a>
      </div>
    );
  }

  return (
    <div
      className="fixed left-0 right-0 top-0 z-[250] border-b border-[#DCE5F0] bg-white/95 shadow-md shadow-[#17213A]/10 backdrop-blur-xl"
      onClick={() =>
        navigate("/offers")
      }
    >
      <div className="flex w-full items-center">

        {/* =================================================
            FIXED LIVE OFFERS BADGE
        ================================================== */}

        <div className="relative z-10 flex shrink-0 items-center bg-white px-4 py-2.5 sm:px-5">
          <div className="flex items-center gap-2.5 rounded-full bg-red-500 px-4 py-2.5 text-xs font-extrabold tracking-wide text-white shadow-sm">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />

            <span className="hidden sm:inline">
              LIVE OFFERS
            </span>

            <span className="sm:hidden">
              LIVE
            </span>
          </div>
        </div>

        {/* =================================================
            FIXED DIVIDER
        ================================================== */}

        <div className="relative z-10 h-8 w-px shrink-0 bg-[#DCE5F0]" />

        {/* =================================================
            MARQUEE VIEWPORT
        ================================================== */}

        <div
          className="min-w-0 flex-1 overflow-hidden"
          onMouseEnter={(event) => {
            event.stopPropagation();
            event.currentTarget
              .querySelector(
                ".offer-marquee-track"
              )
              ?.classList.add(
                "offer-marquee-paused"
              );
          }}
          onMouseLeave={(event) => {
            event.stopPropagation();
            event.currentTarget
              .querySelector(
                ".offer-marquee-track"
              )
              ?.classList.remove(
                "offer-marquee-paused"
              );
          }}
        >
          <div className="offer-marquee-track flex w-max items-center">

            {/* FIRST COPY */}

            <div className="flex shrink-0 items-center gap-5 px-5 lg:gap-6 lg:px-6">
              {liveOffers.map(
                (offer, index) => (
                  <div
                    key={`first-${offer.id}`}
                    className="flex shrink-0 items-center gap-5 lg:gap-6"
                  >
                    <OfferItem
                      offer={offer}
                    />

                    {index <
                      liveOffers.length -
                        1 && (
                      <span className="shrink-0 text-lg font-light text-slate-300">
                        |
                      </span>
                    )}
                  </div>
                )
              )}

              <span className="shrink-0 text-lg font-light text-slate-300">
                |
              </span>
            </div>

            {/* SECOND COPY
                Makes the marquee seamless.
            */}

            <div className="flex shrink-0 items-center gap-5 px-5 lg:gap-6 lg:px-6">
              {liveOffers.map(
                (offer, index) => (
                  <div
                    key={`second-${offer.id}`}
                    className="flex shrink-0 items-center gap-5 lg:gap-6"
                  >
                    <OfferItem
                      offer={offer}
                    />

                    {index <
                      liveOffers.length -
                        1 && (
                      <span className="shrink-0 text-lg font-light text-slate-300">
                        |
                      </span>
                    )}
                  </div>
                )
              )}

              <span className="shrink-0 text-lg font-light text-slate-300">
                |
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveOfferBar;