import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  BookOpen,
} from "lucide-react";
import { Link } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function calculateReadTime(content) {
  if (!content) return "1 min read";

  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));

  return `${minutes} min read`;
}

function formatDate(dateString) {
  if (!dateString) return "Recently published";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Recently published";
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/blog`);

        if (!response.ok) {
          throw new Error("Failed to load blog posts.");
        }

        const data = await response.json();
        setBlogs(data);
      } catch (err) {
        console.error("Failed to load blog posts:", err);
        setError("Unable to load blog posts right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const publishedBlogs = useMemo(() => {
    return [...blogs].sort((a, b) => {
      const orderA = Number(a.display_order ?? 0);
      const orderB = Number(b.display_order ?? 0);

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return Number(b.id) - Number(a.id);
    });
  }, [blogs]);

  return (
    <div className="min-h-screen bg-white text-[#17213A]">
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#F5F8FC] pt-32 pb-20">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#EAF1FA]" />
        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-[#EDF3FA]" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-slate-500">
              Research Guru Blog
            </p>

            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Insights for Better
              <span className="block">
                Research & Publication
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Explore practical insights on research methodology, academic
              writing, implementation, publication, and the research journey.
            </p>
          </div>
        </div>
      </section>

      {/* BLOG GRID */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                Latest Articles
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                Research knowledge that moves you forward
              </h2>
            </div>

            <p className="max-w-xl text-slate-600">
              Guidance for scholars, researchers, students, and professionals
              working across technical and academic research.
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="py-20 text-center">
              <p className="text-slate-500">
                Loading articles...
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-12 text-center">
              <p className="font-semibold text-red-700">
                {error}
              </p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && publishedBlogs.length === 0 && (
            <div className="rounded-3xl border border-slate-200 bg-[#F8FAFC] px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#17213A] text-white">
                <BookOpen size={24} />
              </div>

              <h3 className="mt-5 text-xl font-bold text-[#17213A]">
                No articles published yet
              </h3>

              <p className="mt-2 text-slate-500">
                New research insights will appear here once they are published.
              </p>
            </div>
          )}

          {/* Posts */}
          {!loading && !error && publishedBlogs.length > 0 && (
            <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {publishedBlogs.map((blog) => (
                <article
                  key={blog.id}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* IMAGE */}
                  <div className="relative h-52 overflow-hidden bg-[#EAF1FA]">
                    {blog.featured_image ? (
                      <img
                        src={
                          blog.featured_image.startsWith("http")
                            ? blog.featured_image
                            : `${API_URL}${blog.featured_image}`
                        }
                        alt={blog.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-[#EAF1FA] to-[#F5F8FC]" />

                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#17213A] text-white shadow-lg">
                            <BookOpen size={27} strokeWidth={1.8} />
                          </div>
                        </div>
                      </>
                    )}

                    {blog.category && (
                      <div className="absolute left-5 top-5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#17213A] shadow-sm">
                        {blog.category}
                      </div>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="flex flex-1 flex-col p-7">
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={14} />
                        {formatDate(
                          blog.published_at || blog.created_at
                        )}
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Clock3 size={14} />
                        {calculateReadTime(blog.content)}
                      </span>
                    </div>

                    <h3 className="mt-5 text-xl font-bold leading-snug tracking-tight">
                      {blog.title}
                    </h3>

                    <p className="mt-4 flex-1 text-sm leading-7 text-slate-600">
                      {blog.excerpt}
                    </p>

                    <Link
                      to={`/blog/${blog.slug}`}
                      className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#17213A]"
                    >
                      Read Article

                      <ArrowRight
                        size={16}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#17213A] py-20">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-300">
            Need Research Support?
          </p>

          <h2 className="mt-4 text-3xl font-bold text-white md:text-5xl">
            Let’s turn your research idea into meaningful work.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-300">
            Discuss your research requirement with our team and identify the
            right support across implementation, publication, and writing.
          </p>

          <Link
            to="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-[#17213A] transition hover:bg-slate-100"
          >
            Discuss Your Requirement
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Blog;