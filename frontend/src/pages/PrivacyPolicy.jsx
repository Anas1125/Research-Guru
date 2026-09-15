import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  ArrowLeft,
} from "lucide-react";

import { Link } from "react-router-dom";

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white text-slate-900 transition-colors dark:bg-[#0B1220] dark:text-slate-100">
      <Navbar />

      <main>
        {/* HERO */}

        <section className="bg-[#F5F8FC] px-6 py-20 transition-colors dark:bg-[#0F172A] lg:py-28">
          <div className="mx-auto max-w-4xl">

            <Link
              to="/"
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#CBD7E6] bg-white px-5 py-2 text-sm font-semibold text-[#17213A] shadow-sm transition hover:border-[#17213A] hover:bg-[#F8FAFC] dark:border-white/10 dark:bg-[#111B2E] dark:text-white dark:hover:border-blue-400 dark:hover:bg-[#17213A]"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>

            <span className="block text-sm font-semibold uppercase tracking-[0.2em] text-[#17213A] dark:text-blue-400">
              Legal
            </span>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#17213A] dark:text-white md:text-5xl">
              Privacy Policy
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
              Your privacy is important to us. This Privacy Policy
              explains how Research Guru collects, uses, and protects
              information submitted through this website.
            </p>

          </div>
        </section>

        {/* CONTENT */}

        <section className="bg-white px-6 py-16 transition-colors dark:bg-[#0B1220] lg:py-20">
          <div className="mx-auto max-w-4xl space-y-10">

            {/* 1 */}

            <div>
              <h2 className="text-2xl font-bold text-[#17213A] dark:text-white">
                1. Information We Collect
              </h2>

              <p className="mt-4 leading-8 text-slate-600 dark:text-slate-300">
                When you contact us or submit an enquiry, we may
                collect information such as your name, phone number,
                email address, research area, service requirements,
                research stage, offer code, and the information you
                provide in your message.
              </p>
            </div>

            {/* 2 */}

            <div>
              <h2 className="text-2xl font-bold text-[#17213A] dark:text-white">
                2. How We Use Your Information
              </h2>

              <p className="mt-4 leading-8 text-slate-600 dark:text-slate-300">
                We use the information you provide to understand your
                research requirements, respond to enquiries, discuss
                requested services, and provide relevant support.
              </p>
            </div>

            {/* 3 */}

            <div>
              <h2 className="text-2xl font-bold text-[#17213A] dark:text-white">
                3. Information Security
              </h2>

              <p className="mt-4 leading-8 text-slate-600 dark:text-slate-300">
                We take reasonable measures to protect information
                submitted through the website from unauthorized access,
                use, or disclosure.
              </p>
            </div>

            {/* 4 */}

            <div>
              <h2 className="text-2xl font-bold text-[#17213A] dark:text-white">
                4. Information Sharing
              </h2>

              <p className="mt-4 leading-8 text-slate-600 dark:text-slate-300">
                We do not sell your personal information. Information
                may be used by Research Guru and relevant service
                providers where necessary to operate the website and
                respond to your enquiry.
              </p>
            </div>

            {/* 5 */}

            <div>
              <h2 className="text-2xl font-bold text-[#17213A] dark:text-white">
                5. Contact
              </h2>

              <p className="mt-4 leading-8 text-slate-600 dark:text-slate-300">
                If you have questions about this Privacy Policy or
                how your information is handled, please contact
                Research Guru through the contact information provided
                on this website.
              </p>
            </div>

            {/* LAST UPDATED */}

            <div className="border-t border-slate-200 pt-8 dark:border-white/10">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Last updated: September 2026
              </p>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default PrivacyPolicy;