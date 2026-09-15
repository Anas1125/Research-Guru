import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ArrowLeft } from "lucide-react";

import { Link } from "react-router-dom";

function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-white text-slate-900 transition-colors duration-300 dark:bg-[#0B1220] dark:text-slate-100">
      <Navbar />

      <main>
        {/* HERO */}
        <section className="bg-[#F5F8FC] px-6 py-20 dark:bg-[#0F172A] lg:py-28">
          <div className="mx-auto max-w-4xl">
            <Link
              to="/"
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#CBD7E6] bg-white px-5 py-2 text-sm font-semibold text-[#17213A] shadow-sm transition hover:border-[#17213A] hover:bg-[#F8FAFC] dark:border-white/10 dark:bg-[#111B2E] dark:text-white dark:hover:border-blue-400 dark:hover:bg-[#162238]"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#17213A] dark:text-white md:text-5xl">
              Terms & Conditions
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
              These Terms & Conditions explain the general terms
              applicable to using the Research Guru website and
              enquiring about our research-related services.
            </p>
          </div>
        </section>

        {/* CONTENT */}
        <section className="bg-white px-6 py-16 dark:bg-[#0B1220] lg:py-20">
          <div className="mx-auto max-w-4xl space-y-10">
            <div>
              <h2 className="text-2xl font-bold text-[#17213A] dark:text-white">
                1. Use of This Website
              </h2>

              <p className="mt-4 leading-8 text-slate-600 dark:text-slate-300">
                You may use this website for lawful purposes and to
                learn about or enquire about the research-related
                services offered by Research Guru.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#17213A] dark:text-white">
                2. Enquiries and Service Requests
              </h2>

              <p className="mt-4 leading-8 text-slate-600 dark:text-slate-300">
                Submitting an enquiry through this website does not
                automatically create a service agreement. Any service,
                scope of work, pricing, timeline, and other applicable
                conditions will be discussed and agreed upon separately
                before work begins.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#17213A] dark:text-white">
                3. Payments and Fees
              </h2>

              <p className="mt-4 leading-8 text-slate-600 dark:text-slate-300">
                Where a service involves payment, applicable fees and
                payment terms will be communicated to the client before
                the service is confirmed.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#17213A] dark:text-white">
                4. Client Information
              </h2>

              <p className="mt-4 leading-8 text-slate-600 dark:text-slate-300">
                Clients are responsible for providing accurate and
                appropriate information required for their requested
                services. Research Guru may rely on information supplied
                by the client when providing services.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#17213A] dark:text-white">
                5. Intellectual Property
              </h2>

              <p className="mt-4 leading-8 text-slate-600 dark:text-slate-300">
                Website content, branding, graphics, text, and other
                materials belonging to Research Guru may not be copied,
                reproduced, or redistributed without appropriate
                permission.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#17213A] dark:text-white">
                6. Website Availability
              </h2>

              <p className="mt-4 leading-8 text-slate-600 dark:text-slate-300">
                We aim to keep the website available and functional,
                but we do not guarantee that the website will always be
                available, uninterrupted, or free from technical issues.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#17213A] dark:text-white">
                7. Changes to These Terms
              </h2>

              <p className="mt-4 leading-8 text-slate-600 dark:text-slate-300">
                Research Guru may update these Terms & Conditions from
                time to time. Updated terms will be published on this
                page with the corresponding revision date.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#17213A] dark:text-white">
                8. Contact
              </h2>

              <p className="mt-4 leading-8 text-slate-600 dark:text-slate-300">
                If you have questions regarding these Terms &
                Conditions, please contact Research Guru using the
                contact information available on this website.
              </p>
            </div>

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

export default TermsAndConditions;