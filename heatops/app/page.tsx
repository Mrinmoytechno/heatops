"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  getSelectedSiteId,
} from "@/lib/sites/selected-site";

type PageState =
  | "loading"
  | "no-site"
  | "site-selected";

export default function Home() {
  const [state, setState] =
    useState<PageState>(
      "loading",
    );

  const [siteId, setSiteId] =
    useState<string | null>(null);

  useEffect(() => {
    const selectedSiteId =
      getSelectedSiteId();

    if (!selectedSiteId) {
      setState("no-site");
      return;
    }

    setSiteId(
      selectedSiteId,
    );

    setState(
      "site-selected",
    );
  }, []);

  if (state === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-orange-500" />
      </main>
    );
  }

  if (state === "no-site") {
    window.location.href =
      "/onboarding";

    return (
      <main className="min-h-screen bg-slate-950" />
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
          HeatOps
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          Your site is ready
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
          The HeatOps product shell is now connected to
          your selected site. The operational dashboard
          will be added in the next builds.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Selected site
          </p>

          <p className="mt-2 break-all font-mono text-sm text-slate-300">
            {siteId}
          </p>
        </div>
      </div>
    </main>
  );
          }
