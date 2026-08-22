"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getSelectedSiteId,
  setSelectedSiteId,
} from "@/lib/sites/selected-site";

type Step =
  | 1
  | 2
  | 3
  | 4;

type WorkspaceResponse = {
  success: boolean;
  data?: {
    workspace: {
      id: string;
      name: string;
    };
  };
};

type SiteResponse = {
  success: boolean;
  data?: {
    site: {
      id: string;
      name: string;
    };
  };
  error?: string;
};

type SiteFormState = {
  name: string;
  siteType: string;
  latitude: string;
  longitude: string;
  timezone: string;
  operatingStart: string;
  operatingEnd: string;
};

const initialFormState: SiteFormState = {
  name: "",
  siteType: "warehouse",
  latitude: "",
  longitude: "",
  timezone:
    Intl.DateTimeFormat().resolvedOptions().timeZone ||
    "America/New_York",
  operatingStart: "06:00",
  operatingEnd: "18:00",
};

const steps = [
  {
    number: 1,
    label: "Site",
  },
  {
    number: 2,
    label: "Location",
  },
  {
    number: 3,
    label: "Hours",
  },
  {
    number: 4,
    label: "Review",
  },
];

export default function OnboardingFlow() {
  const [step, setStep] =
    useState<Step>(1);

  const [form, setForm] =
    useState<SiteFormState>(
      initialFormState,
    );

  const [workspaceId, setWorkspaceId] =
    useState<string | null>(null);

  const [isLoadingWorkspace, setIsLoadingWorkspace] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const selectedSiteId =
      getSelectedSiteId();

    if (selectedSiteId) {
      window.location.href = "/";
      return;
    }

    async function loadWorkspace() {
      try {
        const response =
          await fetch(
            "/api/workspace",
          );

        const result:
          WorkspaceResponse =
          await response.json();

        if (
          !response.ok ||
          !result.success ||
          !result.data?.workspace
        ) {
          throw new Error(
            "Unable to prepare your HeatOps workspace.",
          );
        }

        setWorkspaceId(
          result.data.workspace.id,
        );
      } catch (workspaceError) {
        setError(
          workspaceError instanceof Error
            ? workspaceError.message
            : "Unable to prepare your HeatOps workspace.",
        );
      } finally {
        setIsLoadingWorkspace(
          false,
        );
      }
    }

    loadWorkspace();
  }, []);

  const progress =
    useMemo(
      () => (step / steps.length) * 100,
      [step],
    );

  function updateField(
    field: keyof SiteFormState,
    value: string,
  ) {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      }),
    );

    setError(null);
  }

  function validateCurrentStep(): boolean {
    if (
      step === 1 &&
      form.name.trim().length === 0
    ) {
      setError(
        "Enter a name for this site before continuing.",
      );

      return false;
    }

    if (step === 2) {
      const latitude =
        Number(form.latitude);

      const longitude =
        Number(form.longitude);

      if (
        form.latitude.trim() === "" ||
        form.longitude.trim() === ""
      ) {
        setError(
          "Enter both latitude and longitude.",
        );

        return false;
      }

      if (
        Number.isNaN(latitude) ||
        latitude < -90 ||
        latitude > 90
      ) {
        setError(
          "Latitude must be between -90 and 90.",
        );

        return false;
      }

      if (
        Number.isNaN(longitude) ||
        longitude < -180 ||
        longitude > 180
      ) {
        setError(
          "Longitude must be between -180 and 180.",
        );

        return false;
      }

      if (
        form.timezone.trim().length === 0
      ) {
        setError(
          "Enter a timezone before continuing.",
        );

        return false;
      }
    }

    if (step === 3) {
      if (
        !form.operatingStart ||
        !form.operatingEnd
      ) {
        setError(
          "Enter both operating hours.",
        );

        return false;
      }
    }

    return true;
  }

  function goNext() {
    if (!validateCurrentStep()) {
      return;
    }

    setError(null);

    if (step < 4) {
      setStep(
        (step + 1) as Step,
      );
    }
  }

  function goBack() {
    setError(null);

    if (step > 1) {
      setStep(
        (step - 1) as Step,
      );
    }
  }

  async function handleSave(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!workspaceId) {
      setError(
        "Your workspace is not ready yet.",
      );

      return;
    }

    if (!validateCurrentStep()) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response =
        await fetch(
          "/api/sites",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              organizationId:
                workspaceId,

              name:
                form.name.trim(),

              siteType:
                form.siteType,

              latitude:
                Number(
                  form.latitude,
                ),

              longitude:
                Number(
                  form.longitude,
                ),

              timezone:
                form.timezone.trim(),

              operatingStart:
                form.operatingStart,

              operatingEnd:
                form.operatingEnd,
            }),
          },
        );

      const result:
        SiteResponse =
        await response.json();

      if (
        !response.ok ||
        !result.success ||
        !result.data?.site
      ) {
        throw new Error(
          result.error ??
            "Unable to create this site.",
        );
      }

      setSelectedSiteId(
        result.data.site.id,
      );

      window.location.href = "/";
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to create this site.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoadingWorkspace) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-orange-500" />

          <p className="text-sm text-slate-400">
            Preparing your HeatOps workspace...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-3xl flex-col">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
              HeatOps
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Set up your site
            </h1>
          </div>

          <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-400">
            Step {step} of 4
          </span>
        </header>

        <div className="mb-10">
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

        <form
          onSubmit={
            handleSave
          }
          className="flex flex-1 flex-col"
        >
          <section className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20 sm:p-8">
            {step === 1 && (
              <div>
                <p className="text-sm font-medium text-orange-400">
                  Site basics
                </p>

                <h2 className="mt-2 text-2xl font-semibold text-white">
                  What site will HeatOps help you manage?
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                  Start with one facility. You can add
                  and manage more sites later.
                </p>

                <div className="mt-8 space-y-6">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-200">
                      Site name
                    </span>

                    <input
                      value={
                        form.name
                      }
                      onChange={(event) =>
                        updateField(
                          "name",
                          event.target.value,
                        )
                      }
                      placeholder="Example: North Distribution Center"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-200">
                      Site type
                    </span>

                    <select
                      value={
                        form.siteType
                      }
                      onChange={(event) =>
                        updateField(
                          "siteType",
                          event.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                    >
                      <option value="warehouse">
                        Warehouse
                      </option>

                      <option value="distribution_center">
                        Distribution center
                      </option>

                      <option value="manufacturing">
                        Manufacturing facility
                      </option>

                      <option value="construction">
                        Construction site
                      </option>

                      <option value="other">
                        Other
                      </option>
                    </select>
                  </label>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <p className="text-sm font-medium text-orange-400">
                  Site location
                </p>

                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Where is this site located?
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                  HeatOps uses your exact location to
                  analyze local thermal conditions.
                  You can refine this later with place
                  search and the interactive map.
                </p>

                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-200">
                      Latitude
                    </span>

                    <input
                      type="number"
                      step="any"
                      value={
                        form.latitude
                      }
                      onChange={(event) =>
                        updateField(
                          "latitude",
                          event.target.value,
                        )
                      }
                      placeholder="32.7767"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-200">
                      Longitude
                    </span>

                    <input
                      type="number"
                      step="any"
                      value={
                        form.longitude
                      }
                      onChange={(event) =>
                        updateField(
                          "longitude",
                          event.target.value,
                        )
                      }
                      placeholder="-96.7970"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                    />
                  </label>
                </div>

                <label className="mt-6 block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">
                    Timezone
                  </span>

                  <input
                    value={
                      form.timezone
                    }
                    onChange={(event) =>
                      updateField(
                        "timezone",
                        event.target.value,
                      )
                    }
                    placeholder="America/Chicago"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                  />
                </label>
              </div>
            )}

            {step === 3 && (
              <div>
                <p className="text-sm font-medium text-orange-400">
                  Operating hours
                </p>

                <h2 className="mt-2 text-2xl font-semibold text-white">
                  When is this site operating?
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                  HeatOps uses operating hours to focus
                  analysis on the periods when your
                  operations are actually exposed.
                </p>

                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-200">
                      Operating start
                    </span>

                    <input
                      type="time"
                      value={
                        form.operatingStart
                      }
                      onChange={(event) =>
                        updateField(
                          "operatingStart",
                          event.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-200">
                      Operating end
                    </span>

                    <input
                      type="time"
                      value={
                        form.operatingEnd
                      }
                      onChange={(event) =>
                        updateField(
                          "operatingEnd",
                          event.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                    />
                  </label>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <p className="text-sm font-medium text-orange-400">
                  Review
                </p>

                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Your site is ready to configure
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                  Review the basics. You can edit these
                  settings later from HeatOps.
                </p>

                <div className="mt-8 divide-y divide-slate-800 overflow-hidden rounded-xl border border-slate-800">
                  <ReviewRow
                    label="Site name"
                    value={
                      form.name
                    }
                  />

                  <ReviewRow
                    label="Site type"
                    value={
                      form.siteType.replace(
                        /_/g,
                        " ",
                      )
                    }
                  />

                  <ReviewRow
                    label="Latitude"
                    value={
                      form.latitude
                    }
                  />

                  <ReviewRow
                    label="Longitude"
                    value={
                      form.longitude
                    }
                  />

                  <ReviewRow
                    label="Timezone"
                    value={
                      form.timezone
}
                            />

        <ReviewRow
          label="Operating hours"
          value={`${form.operatingStart} - ${form.operatingEnd}`}
        />
      </div>
    </div>
  )}
</section>

{error && (
  <div className="mt-5 rounded-xl border border-red-500/10 bg-red-500/10 px-4 py-3 text-sm text-red-300">
    {error}
  </div>
)}

<div className="mt-6 flex items-center justify-between gap-4">
  <button
    type="button"
    onClick={
      goBack
    }
    disabled={
      step === 1 ||
      isSaving
    }
    className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
  >
    Back
  </button>

  {step < 4 ? (
    <button
      type="button"
      onClick={
        goNext
      }
      className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-400"
    >
      Continue
    </button>
  ) : (
    <button
      type="submit"
      disabled={
        isSaving ||
        !workspaceId
      }
      className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isSaving
        ? "Creating site..."
        : "Create site"}
    </button>
  )}
</div>
</form>
</div>
</main>
);
}

type ReviewRowProps = {
  label: string;
  value: string;
};

function ReviewRow({
  label,
  value,
}: ReviewRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-400">
        {label}
      </span>

      <span className="text-right text-sm font-medium capitalize text-white">
        {value}
      </span>
    </div>
  );
  }
