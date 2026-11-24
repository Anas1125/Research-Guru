import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useEffect, useLayoutEffect } from "react";
import { applySeo, pageSeo } from "./utils/seo";

import { apiFetch, API_URL } from "./utils/api";

import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Offers from "./pages/Offers";

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
import AdminOffers from "./pages/AdminOffers";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";

import NotFound from "./pages/NotFound";

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

function SEOManager() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    applySeo(pageSeo(pathname));
  }, [pathname]);
  return null;
}

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

        let favicon = document.querySelector(
          'link[rel="icon"]'
        );

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

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <FaviconManager />

      <SEOManager />


      <Routes>

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

        <Route
          path="/blog"
          element={<Blog />}
        />

        <Route
          path="/blog/:slug"
          element={<BlogPost />}
        />

        <Route
          path="/terms-and-conditions"
          element={<TermsAndConditions />}
        />

        <Route
          path="/offers"
          element={<Offers />}
        />

        <Route
          path="/privacy-policy"
          element={<PrivacyPolicy />}
        />

        <Route
          path="/login"
          element={<AdminLogin />}
        />

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

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

          <Route
            path="/admin/offers"
            element={<AdminOffers />}
          />

        </Route>

        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;