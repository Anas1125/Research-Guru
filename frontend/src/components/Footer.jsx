import {
  ArrowUpRight,
  BookOpen,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { apiFetch, API_URL } from "../utils/api";

function Footer() {
  const [settings, setSettings] = useState({
    site_name: "Research Guru",
    logo_url: "",
    contact_phone: "",
    contact_email: "",
    contact_address: "",
  });

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

        setSettings({
          site_name:
            data.site_name ||
            "Research Guru",

          logo_url:
            data.logo_url || "",

          contact_phone:
            data.contact_phone || "",

          contact_email:
            data.contact_email || "",

          contact_address:
            data.contact_address || "",
        });
      } catch (error) {
        console.error(
          "Failed to load footer settings:",
          error
        );
      }
    }

    loadSiteSettings();
  }, []);

  function getLogoUrl() {
    if (!settings.logo_url) {
      return "";
    }

    if (
      settings.logo_url.startsWith(
        "http://"
      ) ||
      settings.logo_url.startsWith(
        "https://"
      )
    ) {
      return settings.logo_url;
    }

    return `${API_URL}${settings.logo_url}`;
  }

  return (
    <footer className="bg-[#17213A] text-white">

      {/* MAIN FOOTER */}

      <div className="mx-auto max-w-7xl px-6 py-16">

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_1fr]">

          {/* BRAND */}

          <div>

            <Link
              to="/"
              className="flex cursor-pointer items-center gap-3"
            >
              {settings.logo_url ? (
                <img
                  src={getLogoUrl()}
                  alt={settings.site_name}
                  className="h-10 w-10 rounded-md object-contain"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#17213A]">
                  <BookOpen
                    size={21}
                  />
                </div>
              )}

              <span className="text-xl font-bold tracking-tight">
                {settings.site_name}
              </span>
            </Link>

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
              Supporting Scholars, Researchers, and PhD
              Candidates with Research Guidance, Technical
              Implementation, Documentation, and
              Publication Support.
            </p>

            <Link
              to="/contact"
              className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#17213A] transition hover:bg-slate-100"
            >
              Start a Conversation
              <ArrowUpRight size={16} />
            </Link>

          </div>

          {/* QUICK LINKS */}

          <div>

            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">
              Quick Links
            </h3>

            <div className="mt-5 flex flex-col gap-4">

              <Link
                to="/"
                className="group flex w-fit cursor-pointer items-center gap-1.5 text-sm text-slate-300 transition hover:text-white"
              >
                <span className="underline underline-offset-2">
                  Home
                </span>

                <ArrowUpRight
                  size={14}
                  className="opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                />
              </Link>

              <Link
                to="/about"
                className="group flex w-fit cursor-pointer items-center gap-1.5 text-sm text-slate-300 transition hover:text-white"
              >
                <span className="underline underline-offset-2">
                  About
                </span>

                <ArrowUpRight
                  size={14}
                  className="opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                />
              </Link>

              <Link
                to="/services"
                className="group flex w-fit cursor-pointer items-center gap-1.5 text-sm text-slate-300 transition hover:text-white"
              >
                <span className="underline underline-offset-2">
                  Services
                </span>

                <ArrowUpRight
                  size={14}
                  className="opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                />
              </Link>

              <Link
                to="/offers"
                className="group flex w-fit cursor-pointer items-center gap-1.5 text-sm text-slate-300 transition hover:text-white"
              >
                <span className="underline underline-offset-2">
                  Offers
                </span>

                <ArrowUpRight
                  size={14}
                  className="opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                />
              </Link>

              <Link
                to="/contact"
                className="group flex w-fit cursor-pointer items-center gap-1.5 text-sm text-slate-300 transition hover:text-white"
              >
                <span className="underline underline-offset-2">
                  Contact
                </span>

                <ArrowUpRight
                  size={14}
                  className="opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                />
              </Link>

            </div>

          </div>

          {/* CONTACT */}

          <div>

            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">
              Contact
            </h3>

            <div className="mt-5 space-y-5">

              {/* PHONE */}

              <div className="flex items-start gap-3">

                <Phone
                  size={18}
                  className="mt-0.5 shrink-0 text-slate-300"
                />

                <div>

                  <p className="text-sm text-slate-300">
                    Phone
                  </p>

                  {settings.contact_phone ? (
                    <a
                      href={`tel:${settings.contact_phone}`}
                      className="mt-1 block text-sm font-medium text-white underline underline-offset-2 transition hover:text-slate-300"
                    >
                      {settings.contact_phone}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm font-medium text-white">
                      Not provided
                    </p>
                  )}

                </div>

              </div>

              {/* EMAIL */}

              <div className="flex items-start gap-3">

                <Mail
                  size={18}
                  className="mt-0.5 shrink-0 text-slate-300"
                />

                <div>
                  <p className="text-sm text-slate-300">
                    Email
                  </p>

                  {settings.contact_email ? (
                    <a
                      href={`mailto:${settings.contact_email}`}
                      className="mt-1 block text-sm font-medium text-white underline underline-offset-2 transition hover:text-slate-300"
                    >
                      {settings.contact_email}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm font-medium text-white">
                      Not provided
                    </p>
                  )}
                </div>

              </div>

              {/* LOCATION */}

              <div className="flex items-start gap-3">

                <MapPin
                  size={18}
                  className="mt-0.5 shrink-0 text-slate-300"
                />

                <div>
                  <p className="text-sm text-slate-300">
                    Location
                  </p>

                  {settings.contact_address ? (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        settings.contact_address
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block text-sm font-medium text-white underline underline-offset-2 transition hover:text-slate-300"
                    >
                      {settings.contact_address}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm font-medium text-white">
                      India
                    </p>
                  )}
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* BOTTOM BAR */}

      <div className="border-t border-white/10">

        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">

          <p>
            © {new Date().getFullYear()}{" "}
            {settings.site_name}.
            All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">

            <Link
              to="/privacy-policy"
             className="underline underline-offset-2 transition hover:text-white"
            >
              Privacy Policy
            </Link>

            <Link
              to="/terms-and-conditions"
             className="underline underline-offset-2 transition hover:text-white"
            >
              Terms & Conditions
            </Link>

            <span className="hidden text-slate-600 md:inline">
              |
            </span>

            <p className="hidden md:block">
              Research • Innovation • Excellence
            </p>

          </div>

        </div>

      </div>

    </footer>
  );
}

export default Footer;