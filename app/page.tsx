"use client";

import Link from "next/link";
import { ArrowUpRight, ClipboardCheck, Plus, Radar } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { SignalTable } from "@/components/signal-table";
import { ActivityFeed } from "@/components/activity-feed";
import { getCurrentUser, getSignals, getWatchers } from "@/lib/storage";
import { useEffect, useState } from "react";
import type { Signal } from "@/lib/types";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-line bg-white p-4 shadow-panel">
      <p className="text-sm font-medium text-steel">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [countryFilter, setCountryFilter] = useState("All");
  const [companyFilter, setCompanyFilter] = useState("All");
  const [dashboardMode, setDashboardMode] = useState<"my" | "team">("my");

  useEffect(() => {
    setSignals(getSignals());
  }, []);

  const countryOptions = Array.from(new Set(signals.map((signal) => signal.company.country))).sort();
  const companyOptions = Array.from(new Set(signals.map((signal) => signal.company.name))).sort();
  const currentUser = getCurrentUser();
  const watchedCompanyIds = new Set(getWatchers().filter((watcher) => watcher.user_id === currentUser.id).map((watcher) => watcher.company_id));
  const scopedSignals = dashboardMode === "team"
    ? signals
    : signals.filter((signal) =>
        signal.owner_user_id === currentUser.id ||
        signal.assigned_to_user_id === currentUser.id ||
        signal.created_by_user_id === currentUser.id ||
        watchedCompanyIds.has(signal.company_id)
      );
  const filteredSignals = scopedSignals.filter((signal) => {
    const countryMatches = countryFilter === "All" || signal.company.country === countryFilter;
    const companyMatches = companyFilter === "All" || signal.company.name === companyFilter;
    return countryMatches && companyMatches;
  });
  const worthAction = filteredSignals.filter((signal) => signal.status === "Worth Action").length;
  const highScore = filteredSignals.filter((signal) => signal.opportunity_score >= 75).length;
  const latest = filteredSignals[0];

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-md border border-board/20 bg-board/10 px-2.5 py-1 text-sm font-medium text-board">
            <Radar size={15} aria-hidden />
            Global public signals
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal text-ink">Dashboard summary</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-steel">
            Public-source signals mapped to generic sales plays for team review.
          </p>
        </div>
        <Link
          href="/add"
          className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-md bg-board px-4 text-sm font-semibold text-white hover:bg-board/90"
        >
          <Plus size={17} aria-hidden />
          Add Signal
        </Link>
      </section>

      <section className="flex flex-wrap gap-2">
        {[
          ["my", "My Dashboard"],
          ["team", "Team Dashboard"]
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setDashboardMode(value as typeof dashboardMode)}
            className={`focus-ring h-10 rounded-md px-3 text-sm font-semibold ${
              dashboardMode === value ? "bg-board text-white" : "border border-line bg-white text-ink hover:border-board hover:text-board"
            }`}
          >
            {label}
          </button>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Stat label="Total signals" value={filteredSignals.length} />
        <Stat label="High priority" value={highScore} />
        <Stat label="Worth Action" value={worthAction} />
        <div className="rounded-md border border-line bg-white p-4 shadow-panel">
          <p className="text-sm font-medium text-steel">Top next action</p>
          {latest ? (
            <Link href={`/signals/${latest.id}`} className="mt-2 inline-flex items-start gap-2 text-sm font-semibold leading-6 text-ink hover:text-board">
              Review {latest.company.name}
              <ArrowUpRight className="mt-1 shrink-0" size={15} aria-hidden />
            </Link>
          ) : (
            <p className="mt-2 text-sm text-steel">Add the first signal</p>
          )}
        </div>
      </section>

      <section className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-ink">Prioritised signals</h2>
          <p className="text-sm text-steel">Review public signals, recommended plays, owner, and next action.</p>
        </div>
        <div className="hidden items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm text-steel md:flex">
          <ClipboardCheck size={16} aria-hidden />
          Public sources only
        </div>
      </section>

      <section className="grid gap-3 rounded-md border border-line bg-white p-4 shadow-panel md:grid-cols-3">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Country</span>
          <select
            value={countryFilter}
            onChange={(event) => setCountryFilter(event.target.value)}
            className="focus-ring h-10 w-full rounded-md border border-line px-3 text-sm text-ink"
          >
            <option>All</option>
            {countryOptions.map((country) => (
              <option key={country}>{country}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Company</span>
          <select
            value={companyFilter}
            onChange={(event) => setCompanyFilter(event.target.value)}
            className="focus-ring h-10 w-full rounded-md border border-line px-3 text-sm text-ink"
          >
            <option>All</option>
            {companyOptions.map((company) => (
              <option key={company}>{company}</option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => {
              setCountryFilter("All");
              setCompanyFilter("All");
            }}
            className="focus-ring h-10 rounded-md border border-line bg-white px-3 text-sm font-semibold text-ink hover:border-board hover:text-board"
          >
            Clear Filters
          </button>
        </div>
      </section>

      {filteredSignals.length ? <SignalTable signals={filteredSignals} /> : <EmptyState />}

      {dashboardMode === "team" ? <ActivityFeed title="Team activity" /> : null}
    </div>
  );
}
