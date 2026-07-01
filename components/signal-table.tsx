"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { ScorePill } from "@/components/score-pill";
import { StatusBadge } from "@/components/status-badge";
import { getProfileName } from "@/lib/storage";
import type { Signal } from "@/lib/types";

function sourceHost(sourceUrl: string) {
  try {
    return new URL(sourceUrl).hostname.replace(/^www\./, "");
  } catch {
    return "Source";
  }
}

export function SignalTable({ signals }: { signals: Signal[] }) {
  return (
    <div className="overflow-hidden rounded-md border border-line bg-white shadow-panel">
      <div className="overflow-x-auto">
        <table className="min-w-[1240px] table-fixed divide-y divide-line">
          <thead className="bg-mist/70">
            <tr>
              {[
                "Company",
                "Country",
                "Industry",
                "Signal type",
                "Intent source",
                "Signal summary",
                "Score",
                "Recommended play",
                "Owner",
                "Source",
                "Date found",
                "Status"
              ].map((heading) => (
                <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase text-steel">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {signals.map((signal) => (
              <tr key={signal.id} className="align-top hover:bg-mist/35">
                <td className="w-44 px-4 py-4">
                  <Link href={`/signals/${signal.id}`} className="font-semibold text-ink hover:text-board">
                    {signal.company.name}
                  </Link>
                </td>
                <td className="w-32 px-4 py-4 text-sm text-steel">{signal.company.country}</td>
                <td className="w-40 px-4 py-4 text-sm text-steel">{signal.company.industry}</td>
                <td className="w-52 px-4 py-4 text-sm font-medium text-ink">{signal.signal_type}</td>
                <td className="w-40 px-4 py-4 text-sm text-steel">{signal.intent_source ?? "Public Signal"}</td>
                <td className="w-72 px-4 py-4 text-sm leading-6 text-steel">{signal.summary}</td>
                <td className="w-20 px-4 py-4">
                  <ScorePill score={signal.opportunity_score} />
                </td>
                <td className="w-52 px-4 py-4 text-sm text-ink">{signal.recommended_play_name ?? signal.board_use_case}</td>
                <td className="w-40 px-4 py-4 text-sm text-steel">{getProfileName(signal.owner_user_id)}</td>
                <td className="w-24 px-4 py-4">
                  <a
                    href={signal.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="focus-ring inline-flex max-w-24 items-center gap-1 rounded-md text-sm font-medium text-board hover:underline"
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
                <td className="w-40 px-4 py-4">
                  <StatusBadge status={signal.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
