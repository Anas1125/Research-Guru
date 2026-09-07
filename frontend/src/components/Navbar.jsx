import { BookOpen, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import { apiFetch, API_URL } from "../utils/api";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const [siteName, setSiteName] =
    useState("Research Guru");

  const [logoUrl, setLogoUrl] =
    useState("");

  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
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

      setLastScrollY(currentScrollY);
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
                className={`text-sm font-medium transition ${
                  active
                    ? "font-semibold text-[#17213A]"
                    : "text-slate-600 hover:text-[#17213A]"
                }`}
              >
                {item.name}
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
                  className={`font-medium ${
                    active
                      ? "font-semibold text-[#17213A]"
                      : "text-slate-600"
                  }`}
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