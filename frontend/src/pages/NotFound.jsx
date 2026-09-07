import { Link } from "react-router-dom";
import { ArrowLeft, Home, SearchX } from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function NotFound() {
  return (
    <div className="min-h-screen bg-white text-[#17213A]">
      <Navbar />

      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-[#F5F8FC] px-6 py-20">
        <div className="mx-auto w-full max-w-3xl text-center">

          {/* Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF1FA] text-[#17213A]">
            <SearchX size={30} strokeWidth={1.8} />
          </div>

          {/* 404 */}
          <p className="mt-8 text-8xl font-bold tracking-tight text-[#17213A] sm:text-9xl">
            404
          </p>

          {/* Heading */}
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#17213A] sm:text-4xl">
            Page Not Found
          </h1>

          {/* Description */}
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            The page you are looking for may have been moved, removed, or
            doesn't exist anymore.
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#17213A] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0F172A] sm:w-auto"
            >
              <Home size={17} />
              Back to Home
            </Link>

            <Link
              to="/services"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#CBD7E6] bg-white px-6 py-3.5 text-sm font-semibold text-[#17213A] transition hover:border-[#17213A] sm:w-auto"
            >
              Explore Services
              <ArrowLeft
                size={17}
                className="rotate-180"
              />
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default NotFound;