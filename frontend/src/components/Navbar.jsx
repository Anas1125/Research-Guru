import { BookOpen, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import { apiFetch, API_URL } from "../utils/api";

function Navbar() {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const [showNavbar, setShowNavbar] =
    useState(true);

  const [lastScrollY, setLastScrollY] =
    useState(0);

  const [siteName, setSiteName] =
    useState("Research Guru");

  const [logoUrl, setLogoUrl] =
    useState("");

  const [hasLiveOffer, setHasLiveOffer] =
    useState(false);

  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Offers", path: "/offers" },
    { name: "Contact", path: "/contact" },
  ];

  /* =====================================================
     LOAD SITE SETTINGS
  ====================================================== */

  useEffect(() => {
    async function loadSiteSettings() {
      try {
        const response = await apiFetch(
          "/api/site-settings"
        );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        setSiteName(
          data.site_name ||
            "Research Guru"
        );

        setLogoUrl(
          data.logo_url || ""
        );

        /* =================================================
           UPDATE FAVICON
        ================================================== */

        if (data.favicon_url) {
          const faviconHref =
            data.favicon_url.startsWith(
              "http://"
            ) ||
            data.favicon_url.startsWith(
              "https://"
            )
              ? data.favicon_url
              : `${API_URL}${data.favicon_url}`;

          let favicon =
            document.querySelector(
              'link[rel="icon"]'
            );

          if (!favicon) {
            favicon =
              document.createElement(
                "link"
              );

            favicon.rel = "icon";

            document.head.appendChild(
              favicon
            );
          }

          favicon.href =
            faviconHref;
        }
      } catch (error) {
        console.error(
          "Failed to load site settings:",
          error
        );
      }
    }

    loadSiteSettings();
  }, []);

  /* =====================================================
     CHECK FOR LIVE OFFERS
  ====================================================== */

  useEffect(() => {
    let cancelled = false;

    async function checkLiveOffer() {
      try {
        const response = await apiFetch(
          "/api/offers"
        );

        if (!response.ok) {
          if (!cancelled) {
            setHasLiveOffer(false);
          }

          return;
        }

        const offers =
          await response.json();

        if (!Array.isArray(offers)) {
          if (!cancelled) {
            setHasLiveOffer(false);
          }

          return;
        }

        const now = new Date();

        const liveOffer =
          offers.some((offer) => {
            if (
              !offer.start_date ||
              !offer.end_date
            ) {
              return false;
            }

            const start =
              new Date(
                offer.start_date
              );

            const end =
              new Date(
                offer.end_date
              );

            if (
              Number.isNaN(
                start.getTime()
              ) ||
              Number.isNaN(
                end.getTime()
              )
            ) {
              return false;
            }

            return (
              now >= start &&
              now <= end
            );
          });

        if (!cancelled) {
          setHasLiveOffer(
            liveOffer
          );
        }
      } catch (error) {
        console.error(
          "Failed to check live offers:",
          error
        );

        if (!cancelled) {
          setHasLiveOffer(false);
        }
      }
    }

    /*
      Check immediately when Navbar loads.
    */
    checkLiveOffer();

    /*
      Re-check every 60 seconds so an
      upcoming offer automatically becomes
      green/blinking when it goes live.
    */
    const interval =
      setInterval(
        checkLiveOffer,
        60000
      );

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  /* =====================================================
     NAVBAR SCROLL BEHAVIOR
  ====================================================== */

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY =
        window.scrollY;

      if (currentScrollY <= 10) {
        setShowNavbar(true);
      } else if (
        currentScrollY >
        lastScrollY
      ) {
        setShowNavbar(false);
        setMenuOpen(false);
      } else if (
        currentScrollY <
        lastScrollY
      ) {
        setShowNavbar(true);
      }

      setLastScrollY(
        currentScrollY
      );
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, [lastScrollY]);

  /* =====================================================
     LOGO URL
  ====================================================== */

  function getLogoUrl() {
    if (!logoUrl) {
      return "";
    }

    if (
      logoUrl.startsWith(
        "http://"
      ) ||
      logoUrl.startsWith(
        "https://"
      )
    ) {
      return logoUrl;
    }

    return `${API_URL}${logoUrl}`;
  }

  /* =====================================================
     OFFERS NAV ITEM STYLE
  ====================================================== */

  function getNavItemTextClass(
    item,
    active
  ) {
    /*
      Only the Offers item becomes
      green + blinking when a live
      offer exists.
    */
    if (
      item.name === "Offers" &&
      hasLiveOffer
    ) {
      return "font-bold text-emerald-500 animate-pulse";
    }

    if (active) {
      return "font-semibold text-[#17213A]";
    }

    return "text-slate-600 hover:text-[#17213A]";
  }

  /* =====================================================
     RENDER
  ====================================================== */

  return (
    <header
      className={`fixed left-0 top-0 z-[100] w-full border-b border-slate-200/70 bg-white transition-transform duration-300 ${
        showNavbar
          ? "translate-y-0"
          : "-translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* =================================================
            LOGO / BRAND
        ================================================== */}

        <Link
          to="/"
          className="flex cursor-pointer items-center gap-3"
        >
          {logoUrl ? (
            <img
              src={getLogoUrl()}
              alt={siteName}
              className="h-10 w-10 rounded-md object-contain"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#17213A] text-white">
              <BookOpen
                size={21}
                strokeWidth={2}
              />
            </div>
          )}

          <span className="text-xl font-bold tracking-tight text-[#17213A]">
            {siteName}
          </span>
        </Link>

        {/* =================================================
            DESKTOP NAVIGATION
        ================================================== */}

        <nav className="hidden items-center gap-9 md:flex">
          {navItems.map((item) => {
            const active =
              location.pathname ===
              item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative py-2 text-sm transition ${getNavItemTextClass(
                  item,
                  active
                )}`}
              >
                {item.name}

                {/* Active Page Underline */}
                {active && (
                  <span className="nav-active-underline" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* =================================================
            CTA
        ================================================== */}

        <Link
          to="/contact"
          className="hidden rounded-full bg-[#17213A] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/10 transition hover:bg-[#0F172A] md:block"
        >
          Get Started
        </Link>

        {/* =================================================
            MOBILE BUTTON
        ================================================== */}

        <button
          type="button"
          onClick={() =>
            setMenuOpen(
              !menuOpen
            )
          }
          className="cursor-pointer text-[#17213A] md:hidden"
          aria-label="Toggle navigation"
        >
          {menuOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>

      </div>

      {/* =================================================
          MOBILE NAVIGATION
      ================================================== */}

      {menuOpen && (
        <nav className="border-t border-slate-100 bg-white px-6 py-5 md:hidden">
          <div className="flex flex-col gap-5">

            {navItems.map((item) => {
              const active =
                location.pathname ===
                item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() =>
                    setMenuOpen(false)
                  }
                  className={`transition ${getNavItemTextClass(
                    item,
                    active
                  )}`}
                >
                  {item.name}
                </Link>
              );
            })}

          </div>
        </nav>
      )}
    </header>
  );
}

export default Navbar;