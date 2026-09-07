import { useEffect, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  BookOpen,
} from "lucide-react";

import { Link, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// =====================================================
// HELPERS
// =====================================================

const formatDate = (dateString) => {
  if (!dateString) {
    return "Recently published";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Recently published";
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const calculateReadTime = (content) => {
  if (!content || !content.trim()) {
    return "1 min read";
  }

  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));

  return `${minutes} min read`;
};

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

// =====================================================
// SEO HELPERS
// =====================================================

const setMetaTag = (attribute, key, content) => {
  if (!content) {
    return;
  }

  let element = document.head.querySelector(
    `meta[${attribute}="${key}"]`
  );

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
};

const setLinkTag = (rel, href) => {
  let element = document.head.querySelector(
    `link[rel="${rel}"]`
  );

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }

  element.setAttribute("href", href);
};

// =====================================================
// BLOG POST
// =====================================================

function BlogPost() {
  const { slug } = useParams();

  const [post, setPost] = useState(null);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // ===================================================
  // LOAD ARTICLE + SEO
  // ===================================================

  useEffect(() => {
    let cancelled = false;

    const loadPost = async () => {
      try {
        setLoading(true);
        setNotFound(false);

        if (!slug) {
          setNotFound(true);
          return;
        }

        const [postResponse, settingsResponse] =
          await Promise.all([
            fetch(
              `${API_URL}/api/blog/${encodeURIComponent(slug)}`
            ),
            fetch(`${API_URL}/api/site-settings`),
          ]);

        // -------------------------------------------------
        // ARTICLE NOT FOUND
        // -------------------------------------------------

        if (postResponse.status === 404) {
          if (!cancelled) {
            setNotFound(true);
            setPost(null);
          }

          document.title = "Article Not Found | Research Guru";

          setMetaTag(
            "name",
            "description",
            "The requested research article could not be found."
          );

          setMetaTag(
            "name",
            "robots",
            "noindex, nofollow"
          );

          return;
        }

        if (!postResponse.ok) {
          throw new Error("Failed to load article");
        }

        const data = await postResponse.json();

        if (cancelled) {
          return;
        }

        setPost(data);

        // -------------------------------------------------
        // SITE NAME
        // -------------------------------------------------

        let siteName = "Research Guru";

        if (settingsResponse.ok) {
          const settings =
            await settingsResponse.json();

          siteName =
            settings.site_name || "Research Guru";
        }

        // -------------------------------------------------
        // SEO DATA
        // -------------------------------------------------

        const articleTitle =
          data.title || "Research Article";

        const articleDescription =
          data.excerpt?.trim() ||
          `${articleTitle} - research guidance, academic insights, and practical information from ${siteName}.`;

        const siteUrl =
          window.location.origin;

        const articleUrl =
          `${siteUrl}/blog/${encodeURIComponent(slug)}`;

        const articleImage =
          getImageUrl(data.featured_image) ||
          `${siteUrl}/og-image.jpg`;

        // -------------------------------------------------
        // PAGE TITLE
        // -------------------------------------------------

        document.title =
          `${articleTitle} | ${siteName}`;

        // -------------------------------------------------
        // STANDARD SEO
        // -------------------------------------------------

        setMetaTag(
          "name",
          "description",
          articleDescription
        );

        setMetaTag(
          "name",
          "robots",
          "index, follow"
        );

        // -------------------------------------------------
        // OPEN GRAPH
        // -------------------------------------------------

        setMetaTag(
          "property",
          "og:title",
          `${articleTitle} | ${siteName}`
        );

        setMetaTag(
          "property",
          "og:description",
          articleDescription
        );

        setMetaTag(
          "property",
          "og:type",
          "article"
        );

        setMetaTag(
          "property",
          "og:url",
          articleUrl
        );

        setMetaTag(
          "property",
          "og:image",
          articleImage
        );

        // -------------------------------------------------
        // TWITTER / X
        // -------------------------------------------------

        setMetaTag(
          "name",
          "twitter:card",
          "summary_large_image"
        );

        setMetaTag(
          "name",
          "twitter:title",
          `${articleTitle} | ${siteName}`
        );

        setMetaTag(
          "name",
          "twitter:description",
          articleDescription
        );

        setMetaTag(
          "name",
          "twitter:image",
          articleImage
        );

        // -------------------------------------------------
        // CANONICAL URL
        // -------------------------------------------------

        setLinkTag(
          "canonical",
          articleUrl
        );

        // -------------------------------------------------
        // ARTICLE STRUCTURED DATA
        // -------------------------------------------------

        const publishedDate =
          data.published_at ||
          data.created_at ||
          undefined;

        const structuredData = {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: articleTitle,
          description: articleDescription,
          url: articleUrl,
          image: [articleImage],
          publisher: {
            "@type": "Organization",
            name: siteName,
            url: siteUrl,
            logo: {
              "@type": "ImageObject",
              url: `${siteUrl}/og-image.jpg`,
            },
          },
        };

        if (publishedDate) {
          structuredData.datePublished =
            publishedDate;
        }

        const existingStructuredData =
          document.head.querySelector(
            'script[data-blog-structured-data="research-guru"]'
          );

        const structuredDataScript =
          existingStructuredData ||
          document.createElement("script");

        structuredDataScript.type =
          "application/ld+json";

        structuredDataScript.setAttribute(
          "data-blog-structured-data",
          "research-guru"
        );

        structuredDataScript.textContent =
          JSON.stringify(structuredData);

        if (!existingStructuredData) {
          document.head.appendChild(
            structuredDataScript
          );
        }

        // -------------------------------------------------
        // LOAD ALL POSTS FOR NEXT ARTICLE
        // -------------------------------------------------

        const postsResponse = await fetch(
          `${API_URL}/api/blog`
        );

        if (postsResponse.ok && !cancelled) {
          const posts =
            await postsResponse.json();

          const sortedPosts = [...posts].sort(
            (a, b) => {
              const dateA = new Date(
                a.published_at ||
                  a.created_at ||
                  0
              ).getTime();

              const dateB = new Date(
                b.published_at ||
                  b.created_at ||
                  0
              ).getTime();

              return dateB - dateA;
            }
          );

          setAllPosts(sortedPosts);
        }
      } catch (error) {
        console.error(
          "Failed to load blog article:",
          error
        );

        if (!cancelled) {
          setNotFound(true);
          setPost(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPost();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />

        <main className="flex min-h-[65vh] items-center justify-center px-6 pt-28">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF4FA] text-[#17213A]">
              <BookOpen size={22} />
            </div>

            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading article...
            </p>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // ===================================================
  // NOT FOUND
  // ===================================================

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-white text-[#17213A]">
        <Navbar />

        <main className="flex min-h-[65vh] items-center justify-center px-6 pt-28">
          <div className="max-w-xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF4FA] text-[#17213A]">
              <BookOpen size={25} />
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              Research Blog
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Article not found
            </h1>

            <p className="mt-4 leading-7 text-slate-600">
              The article you're looking for may have
              been removed or is no longer published.
            </p>

            <Link
              to="/blog"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#17213A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0F172A]"
            >
              <ArrowLeft size={16} />
              Back to Blog
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // ===================================================
  // RELATED ARTICLE
  // ===================================================

  const currentIndex = allPosts.findIndex(
    (item) => item.slug === post.slug
  );

  const nextPost =
    currentIndex !== -1 &&
    allPosts.length > 1
      ? allPosts[
          (currentIndex + 1) %
            allPosts.length
        ]
      : null;

  const imageUrl = getImageUrl(
    post.featured_image
  );

  // ===================================================
  // ARTICLE
  // ===================================================

  return (
    <div className="min-h-screen bg-white text-[#17213A]">
      <Navbar />

      {/* =================================================
          ARTICLE HEADER
      ================================================== */}

      <header className="border-b border-slate-200 bg-[#F5F8FC] px-6 pb-12 pt-28 md:pb-14 md:pt-32">
        <div className="mx-auto max-w-4xl">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#17213A]"
          >
            <ArrowLeft size={16} />
            Back to Blog
          </Link>

          <div className="mt-8">
            {post.category && (
              <span className="inline-flex rounded-full bg-[#17213A] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                {post.category}
              </span>
            )}

            <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight md:text-5xl lg:text-6xl">
              {post.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <CalendarDays size={15} />

                {formatDate(
                  post.published_at ||
                    post.created_at
                )}
              </span>

              <span className="flex items-center gap-2">
                <Clock3 size={15} />

                {calculateReadTime(
                  post.content
                )}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* =================================================
          FEATURED IMAGE
      ================================================== */}

      {imageUrl && (
        <section className="px-6 pt-8 md:pt-10">
          <div className="mx-auto max-w-5xl">
            <div className="aspect-[16/8] overflow-hidden rounded-3xl border border-[#DCE5F0] bg-[#F5F8FC] shadow-lg shadow-[#17213A]/8">
              <img
                src={imageUrl}
                alt={post.title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>
      )}

      {/* =================================================
          ARTICLE CONTENT
      ================================================== */}

      <main className="px-6 py-12 md:py-16">
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-14">
          {/* ARTICLE */}

          <article className="min-w-0">
            {post.excerpt && (
              <p className="mb-9 border-l-4 border-[#17213A] pl-5 text-lg font-medium leading-8 text-slate-700 md:text-xl">
                {post.excerpt}
              </p>
            )}

            <div className="text-base leading-[1.9] text-slate-700 md:text-lg">
              {post.content
                .split(/\n\s*\n/)
                .filter(
                  (paragraph) =>
                    paragraph.trim()
                )
                .map(
                  (paragraph, index) => (
                    <p
                      key={index}
                      className="mb-7 whitespace-pre-wrap"
                    >
                      {paragraph.trim()}
                    </p>
                  )
                )}
            </div>
          </article>

          {/* ARTICLE INFO */}

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-[#DCE5F0] bg-[#F8FAFC] p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Article Details
              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Category
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#17213A]">
                    {post.category ||
                      "Research"}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Published
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#17213A]">
                    {formatDate(
                      post.published_at ||
                        post.created_at
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Reading Time
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#17213A]">
                    {calculateReadTime(
                      post.content
                    )}
                  </p>
                </div>
              </div>

              <Link
                to="/contact"
                className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-[#17213A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0F172A]"
              >
                Discuss Your Research
                <ArrowRight size={15} />
              </Link>
            </div>
          </aside>
        </div>
      </main>

      {/* =================================================
          NEXT ARTICLE
      ================================================== */}

      {nextPost &&
        nextPost.slug !== post.slug && (
          <section className="border-t border-slate-200 bg-[#F5F8FC] px-6 py-12 md:py-14">
            <div className="mx-auto max-w-5xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Continue Reading
              </p>

              <Link
                to={`/blog/${nextPost.slug}`}
                className="group mt-4 flex items-center justify-between gap-6 rounded-2xl border border-[#DCE5F0] bg-white p-6 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="min-w-0">
                  {nextPost.category && (
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#17213A]">
                      {nextPost.category}
                    </p>
                  )}

                  <h2 className="mt-2 text-xl font-bold leading-snug text-[#17213A] md:text-2xl">
                    {nextPost.title}
                  </h2>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#17213A] text-white transition group-hover:translate-x-1">
                  <ArrowRight size={18} />
                </div>
              </Link>
            </div>
          </section>
        )}

      {/* =================================================
          CTA
      ================================================== */}

      <section className="bg-[#17213A] px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-300">
            Research Support
          </p>

          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Need help with your research?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-300">
            Discuss your research objectives
            and find the right support across
            implementation, writing, analysis,
            and publication.
          </p>

          <Link
            to="/contact"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-[#17213A] transition hover:bg-slate-100"
          >
            Discuss Your Requirement
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default BlogPost;