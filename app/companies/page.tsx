"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { ScorePill } from "@/components/score-pill";
import { StatusBadge } from "@/components/status-badge";
import { statuses } from "@/lib/constants";
import { getSignals, updateSignalStatus } from "@/lib/storage";
import type { Signal, SignalStatus } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";

function sourceHost(sourceUrl: string) {
  try {
    return new URL(sourceUrl).hostname.replace(/^www\./, "");
  } catch {
    return "Source";
  }
}

export default function CompaniesPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<SignalStatus[]>(
    statuses.filter((status) => status !== "Dismissed")
  );
  const [countryFilter, setCountryFilter] = useState("All");
  const [companyFilter, setCompanyFilter] = useState("");

  useEffect(() => {
    setSignals(getSignals());
  }, []);

  const filteredSignals = useMemo(() => {
    return signals.filter((signal) => {
      const statusMatches = selectedStatuses.includes(signal.status);
      const countryMatches = countryFilter === "All" || signal.company.country === countryFilter;
      const companyMatches =
        !companyFilter.trim() || signal.company.name.toLowerCase().includes(companyFilter.trim().toLowerCase());
      return statusMatches && countryMatches && companyMatches;
    });
  }, [signals, selectedStatuses, countryFilter, companyFilter]);

  const countryOptions = Array.from(new Set(signals.map((signal) => signal.company.country))).sort();

  function toggleStatus(status: SignalStatus) {
    setSelectedStatuses((current) =>
      current.includes(status) ? current.filter((item) => item !== status) : [...current, status]
    );
  }

  function changeStatus(signalId: string, status: SignalStatus) {
    updateSignalStatus(signalId, status);
    setSignals((current) => current.map((signal) => (signal.id === signalId ? { ...signal, status } : signal)));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal text-ink">My signals</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-steel">
          Track the signals you have added, review matched terms and labels, and move each item through the workflow.
        </p>
      </div>

      <section className="rounded-md border border-line bg-white p-4 shadow-panel">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px]">
          <div>
            <p className="text-sm font-semibold text-ink">Workflow status</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {statuses.map((status) => (
                <label key={status} className="flex items-center gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(status)}
                    onChange={() => toggleStatus(status)}
                    className="h-4 w-4 accent-board"
                  />
                  {status}
                </label>
              ))}
            </div>
          </div>
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
            <input
              value={companyFilter}
              onChange={(event) => setCompanyFilter(event.target.value)}
              className="focus-ring h-10 w-full rounded-md border border-line px-3 text-sm text-ink"
              placeholder="Filter company"
            />
          </label>
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-line bg-white shadow-panel">
        <div className="overflow-x-auto">
          <table className="min-w-[1320px] table-fixed divide-y divide-line">
            <thead className="bg-mist/70">
              <tr>
                {[
                  "Company",
                  "Country",
                  "Signal",
                  "Opportunity score",
                  "Workflow status",
                  "Labels",
                  "Matched words",
                  "Source",
                  "Date found"
                ].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase text-steel">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredSignals.map((signal) => (
                <tr key={signal.id} className="align-top hover:bg-mist/35">
                  <td className="w-44 px-4 py-4">
                    <Link href={`/signals/${signal.id}`} className="font-semibold text-ink hover:text-board">
                      {signal.company.name}
                    </Link>
                    <p className="mt-1 text-xs text-steel">{signal.company.industry}</p>
                  </td>
                  <td className="w-32 px-4 py-4 text-sm text-steel">{signal.company.country}</td>
                  <td className="w-72 px-4 py-4">
                    <p className="text-sm font-medium text-ink">{signal.signal_type}</p>
                    <p className="mt-1 text-sm leading-6 text-steel">{signal.summary}</p>
                  </td>
                  <td className="w-28 px-4 py-4">
                    <ScorePill score={signal.opportunity_score} />
                  </td>
                  <td className="w-56 px-4 py-4">
                    <div className="space-y-2">
                      <StatusBadge status={signal.status} />
                      <select
                        value={signal.status}
                        onChange={(event) => changeStatus(signal.id, event.target.value as SignalStatus)}
                        className="focus-ring h-10 w-full rounded-md border border-line px-3 text-sm text-ink"
                      >
                        {statuses.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="w-64 px-4 py-4 text-sm leading-6 text-steel">
                    {(signal.associated_labels ?? [signal.signal_type, signal.board_use_case, signal.intent_source])
                      .slice(0, 5)
                      .join(", ")}
                  </td>
                  <td className="w-52 px-4 py-4 text-sm leading-6 text-steel">
                    {signal.matched_terms?.length ? signal.matched_terms.slice(0, 8).join(", ") : "No matches captured"}
                  </td>
                  <td className="w-28 px-4 py-4">
                    <a
                      href={signal.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="focus-ring inline-flex max-w-28 items-center gap-1 rounded-md text-sm font-medium text-board hover:underline"
                      title={signal.source_url}
                    >
                      <span className="truncate">{sourceHost(signal.source_url)}</span>
                      <ExternalLink size={14} aria-hidden />
                    </a>
                  </td>
                  <td className="w-28 px-4 py-4 text-sm text-steel">
                    {new Date(signal.created_at).toLocaleDateString("en-AU", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
