"use client";

import Link from "next/link";
import { ActivityFeed } from "@/components/activity-feed";
import { ScorePill } from "@/components/score-pill";
import { StatusBadge } from "@/components/status-badge";
import { TeamNotes } from "@/components/team-notes";
import { WatchCompanyButton } from "@/components/watch-company-button";
import { getCompanies, getProfileName, getSignals, getWatchers } from "@/lib/storage";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Company, Signal } from "@/lib/types";

export default function CompanyDetailPage() {
  const params = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [watcherCount, setWatcherCount] = useState(0);

  useEffect(() => {
    setCompany(getCompanies().find((item) => item.id === params.id) ?? null);
    setSignals(getSignals().filter((signal) => signal.company_id === params.id));
    setWatcherCount(getWatchers(params.id).length);
  }, [params.id]);

  if (!company) {
    return (
      <div className="rounded-md border border-line bg-white p-8 text-center shadow-panel">
        <h1 className="text-xl font-semibold text-ink">Company not found</h1>
        <Link href="/companies" className="mt-5 inline-flex rounded-md bg-board px-4 py-2 text-sm font-semibold text-white">
          Back to companies
        </Link>
      </div>
    );
  }

  const highestScore = Math.max(0, ...signals.map((signal) => signal.opportunity_score));

  return (
    <div className="space-y-6">
      <Link href="/companies" className="focus-ring inline-flex items-center gap-2 rounded-md text-sm font-medium text-board hover:underline">
        <ArrowLeft size={16} aria-hidden />
        Back to companies
      </Link>

      <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal text-ink">{company.name}</h1>
          <p className="mt-2 text-sm leading-6 text-steel">
            {company.country} · {company.industry} · {company.visibility ?? "Shared"}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm text-steel">
            <span className="rounded-md border border-line bg-white px-2.5 py-1">Owner: {getProfileName(company.owner_user_id)}</span>
            <span className="rounded-md border border-line bg-white px-2.5 py-1">BDR: {getProfileName(company.assigned_bdr_user_id)}</span>
            <span className="rounded-md border border-line bg-white px-2.5 py-1">Sales: {getProfileName(company.assigned_sales_user_id)}</span>
            <span className="rounded-md border border-line bg-white px-2.5 py-1">Watchers: {watcherCount}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ScorePill score={highestScore} />
          <WatchCompanyButton companyId={company.id} />
        </div>
      </section>

      <section className="rounded-md border border-line bg-white p-5 shadow-panel">
        <h2 className="text-sm font-semibold uppercase text-steel">Signals</h2>
        <div className="mt-4 space-y-3">
          {signals.length ? (
            signals.map((signal) => (
              <div key={signal.id} className="grid gap-3 border-b border-line pb-3 last:border-0 last:pb-0 md:grid-cols-[1fr_120px_160px_90px] md:items-start">
                <Link href={`/signals/${signal.id}`} className="text-sm font-semibold leading-6 text-ink hover:text-board">
                  {signal.source_title}
                </Link>
                <StatusBadge status={signal.status} />
                <span className="text-sm text-steel">{signal.recommended_play_name}</span>
                <a href={signal.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-board hover:underline">
                  Source <ArrowUpRight size={14} aria-hidden />
                </a>
              </div>
            ))
          ) : (
            <p className="text-sm text-steel">No signals yet.</p>
          )}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <TeamNotes companyId={company.id} />
        <ActivityFeed companyId={company.id} />
      </section>
    </div>
  );
}
