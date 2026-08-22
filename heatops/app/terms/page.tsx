export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <a
          href="/onboarding"
          className="text-sm font-medium text-orange-400 transition hover:text-orange-300"
        >
          ← Back to HeatOps
        </a>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
            HeatOps
          </p>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">
            Terms and Conditions
          </h1>

          <p className="mt-4 text-sm leading-6 text-slate-500">
            Last updated: August 22, 2026
          </p>

          <div className="mt-10 space-y-8 text-sm leading-7 text-slate-400">
            <section>
              <h2 className="text-lg font-semibold text-white">
                1. Acceptance of these terms
              </h2>

              <p className="mt-3">
                By accessing or using HeatOps, you agree
                to these Terms and Conditions. If you do
                not agree, do not use the service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">
                2. HeatOps service
              </h2>

              <p className="mt-3">
                HeatOps provides operational heat
                monitoring and decision-support
                information based on site details,
                weather data, and related analytical
                systems.
              </p>

              <p className="mt-3">
                HeatOps provides informational and
                decision-support signals and does not
                replace professional safety,
                operational, medical, or emergency
                judgment.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">
                3. Site information
              </h2>

              <p className="mt-3">
                You are responsible for providing
                accurate site information, including
                location, timezone, and operating hours.
                Incorrect information may affect the
                accuracy or relevance of HeatOps
                signals.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">
                4. Current coverage
              </h2>

              <p className="mt-3">
                HeatOps currently supports sites
                located in the United States. Coverage,
                functionality, and availability may
                change as the service evolves.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">
                5. Weather and external data
              </h2>

              <p className="mt-3">
                HeatOps may rely on third-party and
                external data sources. Weather
                conditions and forecasts can change,
                and data may contain delays,
                inaccuracies, or interruptions.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">
                6. No guarantee of uninterrupted service
              </h2>

              <p className="mt-3">
                We do not guarantee that HeatOps will
                always be available, uninterrupted,
                error-free, or suitable for every
                operational situation.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">
                7. Appropriate use
              </h2>

              <p className="mt-3">
                You agree not to misuse the service,
                interfere with its operation, attempt
                unauthorized access, or use HeatOps in
                violation of applicable laws.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">
                8. Changes to HeatOps or these terms
              </h2>

              <p className="mt-3">
                HeatOps may update the service or these
                Terms and Conditions as the product
                develops. Continued use after updated
                terms take effect constitutes acceptance
                of those terms where permitted by law.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">
                9. Contact
              </h2>

              <p className="mt-3">
                For questions about these Terms and
                Conditions, contact HeatOps through the
                available project contact channels.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
                }
