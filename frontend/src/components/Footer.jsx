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

      {/* =================================================
          MAIN FOOTER
      ================================================== */}

      <div className="mx-auto max-w-7xl px-6 py-16">

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_1fr]">

          {/* =================================================
              BRAND
          ================================================== */}

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
              Supporting scholars, researchers, and PhD
              candidates with research guidance, technical
              implementation, documentation, and
              publication support.
            </p>

            <Link
              to="/contact"
              className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#17213A] transition hover:bg-slate-100"
            >
              Start a Conversation
              <ArrowUpRight size={16} />
            </Link>

          </div>

          {/* =================================================
              QUICK LINKS
          ================================================== */}

          <div>

            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">
              Quick Links
            </h3>

            <div className="mt-5 flex flex-col gap-4">

              <Link
                to="/"
                className="cursor-pointer text-sm text-slate-300 transition hover:text-white"
              >
                Home
              </Link>

              <Link
                to="/about"
                className="cursor-pointer text-sm text-slate-300 transition hover:text-white"
              >
                About
              </Link>

              <Link
                to="/services"
                className="cursor-pointer text-sm text-slate-300 transition hover:text-white"
              >
                Services
              </Link>

              <Link
                to="/contact"
                className="cursor-pointer text-sm text-slate-300 transition hover:text-white"
              >
                Contact
              </Link>

            </div>

          </div>

          {/* =================================================
              CONTACT
          ================================================== */}

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

                  <p className="mt-1 text-sm font-medium text-white">
                    {settings.contact_phone ||
                      "Not provided"}
                  </p>

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

                  <p className="mt-1 text-sm font-medium text-white">
                    {settings.contact_email ||
                      "Not provided"}
                  </p>

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

                  <p className="mt-1 text-sm font-medium text-white">
                    {settings.contact_address ||
                      "India"}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          BOTTOM BAR
      ================================================== */}

      <div className="border-t border-white/10">

        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-5 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">

          <p>
            © {new Date().getFullYear()}{" "}
            {settings.site_name}.
            All rights reserved.
          </p>

          <p>
            Research • Innovation • Excellence
          </p>

        </div>

      </div>

    </footer>
  );
}

export default Footer;