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

function getOfferStatus(startDate, endDate, now = new Date()) {
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

function formatCountdown(targetDate, currentTime) {
  const target = new Date(targetDate);

  if (Number.isNaN(target.getTime())) {
    return "00d 00h 00m 00s";
  }

  const difference =
    target.getTime() - currentTime.getTime();

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

  const [offers, setOffers] = useState([]);
  const [currentTime, setCurrentTime] =
    useState(new Date());

  const [copied, setCopied] =
    useState(false);

  const [dismissed, setDismissed] =
    useState(false);

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
      clearInterval(refreshTimer);
    };
  }, []);

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

  const liveOffer = useMemo(() => {
    const liveOffers = offers
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
      });

    return liveOffers[0] || null;
  }, [offers, currentTime]);

  useEffect(() => {
    if (!liveOffer) {
      setDismissed(false);
    }
  }, [liveOffer]);

  if (!liveOffer || dismissed) {
    return null;
  }

  const endTime =
    new Date(
      liveOffer.end_date
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
      liveOffer.end_date,
      currentTime
    );

  const discountText =
    liveOffer.discount_value
      ? liveOffer.discount_type ===
        "percentage"
        ? `${liveOffer.discount_value}% OFF`
        : `₹${liveOffer.discount_value} OFF`
      : "";

  const promoCode =
    liveOffer.offer_code
      ? liveOffer.offer_code.toUpperCase()
      : "";

  async function handleCopy() {
    if (!promoCode) {
      return;
    }

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
  }

  return (
    <>
      {/* Fixed offer bar */}
      <div
        onClick={() => navigate("/offers")}
        className={`fixed left-0 right-0 top-0 z-[250] border-b bg-white/95 px-3 py-2.5 backdrop-blur-xl transition ${
          endingSoon
            ? "border-red-400 offer-ending-soon"
            : "border-[#DCE5F0] shadow-md shadow-[#17213A]/10"
        }`}
      >
        <div className="mx-auto flex max-w-[1500px] items-center gap-3 lg:gap-5">
          {/* Live badge */}
          <div className="hidden shrink-0 items-center gap-2 rounded-full bg-red-500 px-3 py-2 text-xs font-bold text-white shadow-sm sm:flex cursor-pointer">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            LIVE OFFERS
          </div>

          {/* Mobile live indicator */}
          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-red-500 px-2.5 py-1.5 text-[10px] font-bold text-white sm:hidden">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            LIVE
          </div>

          {/* Divider */}
          <div className="hidden h-7 w-px bg-[#DCE5F0] sm:block" />

          {/* Offer title */}
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Tag
              size={18}
              className="hidden shrink-0 text-[#17213A] sm:block"
            />

            <span className="truncate text-sm font-bold text-[#17213A] sm:text-base cursor-pointer">
              {liveOffer.title}
            </span>

            {discountText && (
              <span className="hidden shrink-0 rounded-full bg-red-50 px-2.5 py-1 text-xs font-extrabold text-red-600 sm:inline-flex">
                {discountText}
              </span>
            )}
          </div>

          {/* Countdown */}
          <div
            className={`hidden shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-bold sm:flex ${
              endingSoon
                ? "bg-red-50 text-red-600"
                : "bg-[#EEF4FA] text-[#17213A]"
            }`}
          >
            <Clock3 size={15} />

            <span>
              Ends in
            </span>

            <span className="font-mono tabular-nums">
              {countdown}
            </span>
          </div>

          {/* Promo code */}
          {promoCode && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleCopy();
               }}
              className={`hidden shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition sm:flex ${
                endingSoon
                  ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                  : "border-[#CBD7E6] bg-white text-[#17213A] hover:border-[#17213A]"
              }`}
            >
              <span>
                CODE: {promoCode}
              </span>

              {copied ? (
                <Check size={14} />
              ) : (
                <Copy size={14} />
              )}
            </button>
          )}

          {/* CTA */}
          {liveOffer.cta_link && (
            <a
                href={liveOffer.cta_link}
                onClick={(event) => {
                    event.stopPropagation();
                }}
              className="hidden shrink-0 items-center gap-2 rounded-full bg-[#17213A] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#0F172A] sm:inline-flex"
            >
              {liveOffer.cta_text ||
                "Get Started"}

              <ArrowRight size={15} />
            </a>
          )}
        </div>

        {/* Mobile second row */}
        <div className="mx-auto mt-2 flex max-w-[1500px] items-center justify-between gap-2 sm:hidden">
          <div className="flex min-w-0 items-center gap-2">
            {discountText && (
              <span className="shrink-0 rounded-full bg-red-50 px-2 py-1 text-[10px] font-extrabold text-red-600">
                {discountText}
              </span>
            )}

            <span
              className={`truncate text-[10px] font-bold ${
                endingSoon
                  ? "text-red-600"
                  : "text-slate-600"
              }`}
            >
              Ends in {countdown}
            </span>
          </div>

          {promoCode && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleCopy();
              }}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#CBD7E6] bg-white px-2.5 py-1.5 text-[10px] font-bold text-[#17213A]"
            >
              {copied ? (
                <>
                  <Check size={12} />
                  Copied
                </>
              ) : (
                <>
                  CODE: {promoCode}
                  <Copy size={12} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default LiveOfferBar;