import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";

import { apiFetch, API_URL } from "./utils/api";

import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";

import Admin from "./pages/Admin";
import AdminBlog from "./pages/AdminBlog";
import AdminLogin from "./pages/AdminLogin";
import AdminUsers from "./pages/AdminUsers";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminSettings from "./pages/AdminSettings";
import AdminContact from "./pages/AdminContact";
import AdminServices from "./pages/AdminServices";
import AdminReviews from "./pages/AdminReviews";
import AdminClients from "./pages/AdminClients";

import NotFound from "./pages/NotFound";


/* =========================================================
   SCROLL TO TOP
========================================================= */

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [pathname]);

  return null;
}


/* =========================================================
   SEO MANAGER
========================================================= */

function SEOManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    async function loadSEO() {
      try {
        const response = await apiFetch(
          "/api/site-settings"
        );

        const settings = response.ok
          ? await response.json()
          : {};

        const siteName =
          settings.site_name || "Research Guru";

        const seo = {
          "/": {
            title: `${siteName} | Research & PhD Support`,
            description:
              `${siteName} provides research, PhD, technical implementation, academic writing, thesis, and publication support.`,
            robots: "index, follow",
          },

          "/about": {
            title: `About Us | ${siteName}`,
            description:
              `Learn about ${siteName} and our approach to supporting scholars, researchers, and PhD candidates.`,
            robots: "index, follow",
          },

          "/services": {
            title: `Research Services | ${siteName}`,
            description:
              `Explore research implementation, academic writing, thesis, publication, SCI, Scopus, Annexure, and related research support services from ${siteName}.`,
            robots: "index, follow",
          },

          "/contact": {
            title: `Contact Us | ${siteName}`,
            description:
              `Contact ${siteName} for research, PhD, thesis, publication, technical implementation, and academic support.`,
            robots: "index, follow",
          },

          "/blog": {
            title: `Research Blog | ${siteName}`,
            description:
              `Research guidance, technical perspectives, publication information, and practical insights for scholars from ${siteName}.`,
            robots: "index, follow",
          },

          "/login": {
            title: `Admin Login | ${siteName}`,
            description: "",
            robots: "noindex, nofollow",
          },

          "/admin/login": {
            title: `Admin Login | ${siteName}`,
            description: "",
            robots: "noindex, nofollow",
          },

          "/admin": {
            title: `Admin Dashboard | ${siteName}`,
            description: "",
            robots: "noindex, nofollow",
          },

          "/admin/services": {
            title: `Admin Services | ${siteName}`,
            description: "",
            robots: "noindex, nofollow",
          },

          "/admin/blog": {
            title: `Admin Blog | ${siteName}`,
            description: "",
            robots: "noindex, nofollow",
          },

          "/admin/contact": {
            title: `Admin Contact Enquiries | ${siteName}`,
            description: "",
            robots: "noindex, nofollow",
          },

          "/admin/users": {
            title: `Admin Management | ${siteName}`,
            description: "",
            robots: "noindex, nofollow",
          },

          "/admin/settings": {
            title: `Site Settings | ${siteName}`,
            description: "",
            robots: "noindex, nofollow",
          },
        };

        let pageSeo = seo[pathname];

        /* -------------------------------------------------------
           BLOG ARTICLE
        ------------------------------------------------------- */

        if (!pageSeo && pathname.startsWith("/blog/")) {
          pageSeo = {
            title: `Research Article | ${siteName}`,
            description:
              `Research insights, academic guidance, and practical perspectives from ${siteName}.`,
            robots: "index, follow",
          };
        }

        /* -------------------------------------------------------
           FALLBACK
        ------------------------------------------------------- */

        if (!pageSeo) {
          pageSeo = {
            title: siteName,
            description:
              `${siteName} provides research and PhD support for scholars, researchers, and academic professionals.`,
            robots: "index, follow",
          };
        }

        /* -------------------------------------------------------
           PAGE TITLE
        ------------------------------------------------------- */

        document.title = pageSeo.title;

        /* -------------------------------------------------------
           DESCRIPTION
        ------------------------------------------------------- */

        let descriptionTag = document.querySelector(
          'meta[name="description"]'
        );

        if (!descriptionTag) {
          descriptionTag =
            document.createElement("meta");

          descriptionTag.setAttribute(
            "name",
            "description"
          );

          document.head.appendChild(
            descriptionTag
          );
        }

        descriptionTag.setAttribute(
          "content",
          pageSeo.description
        );

        /* -------------------------------------------------------
           ROBOTS
        ------------------------------------------------------- */

        let robotsTag = document.querySelector(
          'meta[name="robots"]'
        );

        if (!robotsTag) {
          robotsTag =
            document.createElement("meta");

          robotsTag.setAttribute(
            "name",
            "robots"
          );

          document.head.appendChild(
            robotsTag
          );
        }

        robotsTag.setAttribute(
          "content",
          pageSeo.robots
        );

        /* -------------------------------------------------------
           META HELPERS
        ------------------------------------------------------- */

        function updateMeta(property, content) {
          let tag = document.querySelector(
            `meta[property="${property}"]`
          );

          if (!tag) {
            tag = document.createElement("meta");

            tag.setAttribute(
              "property",
              property
            );

            document.head.appendChild(tag);
          }

          tag.setAttribute(
            "content",
            content
          );
        }

        function updateMetaName(name, content) {
          let tag = document.querySelector(
            `meta[name="${name}"]`
          );

          if (!tag) {
            tag = document.createElement("meta");

            tag.setAttribute(
              "name",
              name
            );

            document.head.appendChild(tag);
          }

          tag.setAttribute(
            "content",
            content
          );
        }

        /* -------------------------------------------------------
           URLS
        ------------------------------------------------------- */

        const siteUrl =
          window.location.origin;

        const pageUrl =
          pathname === "/"
            ? siteUrl
            : `${siteUrl}${pathname}`;

        const ogImageUrl =
          `${siteUrl}/og-image.jpg`;

        /* -------------------------------------------------------
           OPEN GRAPH
        ------------------------------------------------------- */

        updateMeta(
          "og:title",
          pageSeo.title
        );

        updateMeta(
          "og:description",
          pageSeo.description
        );

        updateMeta(
          "og:type",
          pathname.startsWith("/blog/")
            ? "article"
            : "website"
        );

        updateMeta(
          "og:url",
          pageUrl
        );

        updateMeta(
          "og:image",
          ogImageUrl
        );

        /* -------------------------------------------------------
           TWITTER / X
        ------------------------------------------------------- */

        updateMetaName(
          "twitter:card",
          "summary_large_image"
        );

        updateMetaName(
          "twitter:title",
          pageSeo.title
        );

        updateMetaName(
          "twitter:description",
          pageSeo.description
        );

        updateMetaName(
          "twitter:image",
          ogImageUrl
        );

      } catch (error) {
        console.error(
          "Failed to load SEO settings:",
          error
        );
      }
    }

    loadSEO();
  }, [pathname]);

  return null;
}


/* =========================================================
   STRUCTURED DATA / JSON-LD
========================================================= */

function StructuredDataManager() {
  useEffect(() => {
    let cancelled = false;

    async function loadStructuredData() {
      try {
        const response = await apiFetch(
          "/api/site-settings"
        );

        if (cancelled) {
          return;
        }

        const settings = response.ok
          ? await response.json()
          : {};

        const siteName =
          settings.site_name || "Research Guru";

        const siteUrl = window.location.origin;

        const structuredData = {
          "@context": "https://schema.org",

          "@graph": [
            {
              "@type": "Organization",

              "@id": `${siteUrl}/#organization`,

              name: siteName,

              url: siteUrl,

              logo: `${siteUrl}/og-image.jpg`,

              description:
                `${siteName} provides research, PhD, technical implementation, academic writing, thesis, and publication support.`,
            },

            {
              "@type": "WebSite",

              "@id": `${siteUrl}/#website`,

              url: siteUrl,

              name: siteName,

              description:
                `${siteName} provides research and PhD support for scholars, researchers, and academic professionals.`,

              publisher: {
                "@id": `${siteUrl}/#organization`,
              },
            },
          ],
        };


        /* -------------------------------------------------------
           CREATE / UPDATE JSON-LD SCRIPT
        ------------------------------------------------------- */

        let script = document.querySelector(
          'script[data-structured-data="research-guru"]'
        );

        if (!script) {
          script = document.createElement("script");

          script.type = "application/ld+json";

          script.setAttribute(
            "data-structured-data",
            "research-guru"
          );

          document.head.appendChild(script);
        }

        script.textContent = JSON.stringify(
          structuredData
        );

      } catch (error) {
        console.error(
          "Failed to load structured data:",
          error
        );
      }
    }

    loadStructuredData();

    return () => {
      cancelled = true;
    };

  }, []);

  return null;
}


/* =========================================================
   FAVICON MANAGER
========================================================= */

function FaviconManager() {
  useEffect(() => {
    let cancelled = false;

    async function loadFavicon() {
      try {
        const response = await apiFetch(
          "/api/site-settings"
        );

        if (cancelled || !response.ok) {
          return;
        }

        const settings =
          await response.json();

        if (!settings.favicon_url) {
          return;
        }

        const faviconUrl =
          settings.favicon_url.startsWith(
            "http://"
          ) ||
          settings.favicon_url.startsWith(
            "https://"
          )
            ? settings.favicon_url
            : `${API_URL}${settings.favicon_url}`;


        /* -------------------------------------------------------
           FIND EXISTING FAVICON
        ------------------------------------------------------- */

        let favicon = document.querySelector(
          'link[rel="icon"]'
        );


        /* -------------------------------------------------------
           CREATE FAVICON LINK IF MISSING
        ------------------------------------------------------- */

        if (!favicon) {
          favicon =
            document.createElement("link");

          favicon.setAttribute(
            "rel",
            "icon"
          );

          document.head.appendChild(
            favicon
          );
        }


        /* -------------------------------------------------------
           UPDATE FAVICON
        ------------------------------------------------------- */

        favicon.setAttribute(
          "href",
          faviconUrl
        );

      } catch (error) {
        console.error(
          "Failed to load favicon:",
          error
        );
      }
    }

    loadFavicon();

    return () => {
      cancelled = true;
    };

  }, []);

  return null;
}


/* =========================================================
   APP
========================================================= */

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <FaviconManager />

      <SEOManager />

      <StructuredDataManager />

      <Routes>

        {/* =====================================================
            PUBLIC WEBSITE
        ====================================================== */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/services"
          element={<Services />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />


        {/* =====================================================
            PUBLIC BLOG
        ====================================================== */}

        <Route
          path="/blog"
          element={<Blog />}
        />

        <Route
          path="/blog/:slug"
          element={<BlogPost />}
        />


        {/* =====================================================
            ADMIN LOGIN
        ====================================================== */}

        <Route
          path="/login"
          element={<AdminLogin />}
        />

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />


        {/* =====================================================
            PROTECTED ADMIN AREA
        ====================================================== */}

        <Route
          element={<ProtectedRoute />}
        >
          <Route
            path="/admin"
            element={<Admin />}
          />

          <Route
            path="/admin/blog"
            element={<AdminBlog />}
          />

          <Route
            path="/admin/users"
            element={<AdminUsers />}
          />

          <Route
            path="/admin/contact"
            element={<AdminContact />}
          />

          <Route
            path="/admin/services"
            element={<AdminServices />}
          />

          <Route
            path="/admin/settings"
            element={<AdminSettings />}
          />

          <Route
            path="/admin/reviews"
            element={<AdminReviews />}
          />

          <Route
            path="/admin/clients"
            element={<AdminClients />}
          />
        </Route>

        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;