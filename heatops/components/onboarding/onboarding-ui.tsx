type StepItem = {
  number: number;
  label: string;
};

type OnboardingProgressProps = {
  steps: StepItem[];
  step: number;
  progress: number;
};

type WelcomeScreenProps = {
  onStartSetup: () => void;
  onStartTour: () => void;
};

type ReviewRowProps = {
  label: string;
  value: string;
};

export function WelcomeScreen({
  onStartSetup,
  onStartTour,
}: WelcomeScreenProps) {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-3xl flex-col">
        <section className="flex flex-1 items-center">
          <div className="w-full rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-black/20 sm:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-400">
              HeatOps
            </p>

            <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Know the heat risk before it affects
              operations.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400">
              HeatOps turns upcoming weather conditions
              into clear operational signals for your
              site, helping you understand when heat may
              require attention.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onStartSetup}
                className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-400"
              >
                Set up my site
              </button>

              <button
                type="button"
                onClick={onStartTour}
                className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
              >
                Take a quick tour
              </button>
            </div>

            <p className="mt-5 text-xs leading-5 text-slate-500">
              Already know what you need? Start directly
              with site setup.
            </p>
          </div>
        </section>

        <OnboardingFooter />
      </div>
    </main>
  );
}

export function OnboardingProgress({
  steps,
  step,
  progress,
}: OnboardingProgressProps) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        {steps.map(
          (item) => (
            <div
              key={item.number}
              className="flex flex-1 flex-col gap-2"
            >
              <div className="flex items-center">
                <div
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold",
                    item.number <= step
                      ? "bg-orange-500 text-slate-950"
                      : "bg-slate-800 text-slate-500",
                  ].join(" ")}
                >
                  {item.number}
                </div>

                {item.number <
                  steps.length && (
                  <div
                    className={[
                      "h-px flex-1",
                      item.number < step
                        ? "bg-orange-500"
                        : "bg-slate-800",
                    ].join(" ")}
                  />
                )}
              </div>

              <span
                className={[
                  "text-xs",
                  item.number === step
                    ? "text-white"
                    : "text-slate-500",
                ].join(" ")}
              >
                {item.label}
              </span>
            </div>
          ),
        )}
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-slate-900">
        <div
          className="h-full bg-orange-500 transition-all duration-300"
          style={{
            width:
              `${progress}%`,
          }}
        />
      </div>
    </div>
  );
}

export function ReviewRow({
  label,
  value,
}: ReviewRowProps) {
  return (
    <div className="flex items-center justify-between gap-6 px-4 py-4">
      <span className="text-sm text-slate-400">
        {label}
      </span>

      <span className="text-right text-sm font-medium capitalize text-white">
        {value}
      </span>
    </div>
  );
}

export function OnboardingFooter() {
  return (
    <footer className="border-t border-slate-800 py-10">
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-white">
            About HeatOps
          </p>

          <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
            HeatOps helps operational teams understand
            upcoming heat conditions before they affect
            people and site operations.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">
            How it works
          </p>

          <ol className="mt-3 space-y-2 text-sm leading-6 text-slate-500">
            <li>
              1. Add your site.
            </li>

            <li>
              2. Set where and when it operates.
            </li>

            <li>
              3. HeatOps evaluates upcoming conditions.
            </li>

            <li>
              4. Receive clear operational signals.
            </li>
          </ol>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-6 text-xs text-slate-600">
        <span>
          HeatOps
        </span>

        <a
          href="/terms"
          className="transition hover:text-slate-300"
        >
          Terms and Conditions
        </a>
      </div>
    </footer>
  );
                      }
