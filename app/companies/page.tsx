"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ScorePill } from "@/components/score-pill";
import { getCompanies, getProfileName, getSignals } from "@/lib/storage";
import type { Company, Signal } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";

type CompanyRollup = {
  name: string;
  country: string;
  industry: string;
  signalCount: number;
  highestScore: number;
  latestSignalDate: string;
  priority: string;
  topSignalId: string;
  companyId: string;
  owner: string;
};

function priority(score: number) {
  if (score >= 80) {
    return "Immediate review";
  }
  if (score >= 65) {
    return "Watch closely";
  }
  return "Monitor";
}

export default function CompaniesPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    setSignals(getSignals());
    setCompanies(getCompanies());
  }, []);

  const rollups = useMemo(() => {
    const byCompany = new Map<string, CompanyRollup>();

    companies.forEach((company) => {
      byCompany.set(company.id, {
        companyId: company.id,
        name: company.name,
        country: company.country,
        industry: company.industry,
        signalCount: 0,
        highestScore: 0,
        latestSignalDate: company.updated_at,
        priority: company.priority ?? "Monitor",
        topSignalId: "",
        owner: getProfileName(company.owner_user_id)
      });
    });

    signals.forEach((signal) => {
      const existing = byCompany.get(signal.company_id);
      const latestDate = existing?.latestSignalDate ?? signal.created_at;
      const isNewer = new Date(signal.created_at).getTime() > new Date(latestDate).getTime();
      const highestScore = Math.max(existing?.highestScore ?? 0, signal.opportunity_score);

      byCompany.set(signal.company_id, {
        name: signal.company.name,
        companyId: signal.company_id,
        country: signal.company.country,
        industry: signal.company.industry,
        signalCount: (existing?.signalCount ?? 0) + 1,
        highestScore,
        latestSignalDate: isNewer ? signal.created_at : latestDate,
        priority: priority(highestScore),
        topSignalId:
          !existing || signal.opportunity_score > existing.highestScore ? signal.id : existing.topSignalId,
        owner: getProfileName(signal.company.owner_user_id ?? signal.owner_user_id)
      });
    });

    return Array.from(byCompany.values()).sort((a, b) => b.highestScore - a.highestScore);
  }, [signals, companies]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal text-ink">Company directory</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-steel">
          Shared account directory with ownership, signal rollups, latest activity, and company detail pages.
        </p>
      </div>
      <div className="overflow-hidden rounded-md border border-line bg-white shadow-panel">
        <div className="overflow-x-auto">
          <table className="min-w-[880px] table-fixed divide-y divide-line">
            <thead className="bg-mist/70">
              <tr>
                {["Company", "Country", "Industry", "Signals", "Highest score", "Owner", "Latest signal", "Priority", "Open"].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase text-steel">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rollups.map((company) => (
                <tr key={company.name} className="hover:bg-mist/35">
                  <td className="px-4 py-4 font-semibold text-ink">
                    <Link href={`/companies/${company.companyId}`} className="hover:text-board">
                      {company.name}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-sm text-steel">{company.country}</td>
                  <td className="px-4 py-4 text-sm text-steel">{company.industry}</td>
                  <td className="px-4 py-4 text-sm text-ink">{company.signalCount}</td>
                  <td className="px-4 py-4"><ScorePill score={company.highestScore} /></td>
                  <td className="px-4 py-4 text-sm text-steel">{company.owner}</td>
                  <td className="px-4 py-4 text-sm text-steel">
                    {new Date(company.latestSignalDate).toLocaleDateString("en-AU", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    })}
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-ink">{company.priority}</td>
                  <td className="px-4 py-4">
                    <Link
                      href={company.topSignalId ? `/signals/${company.topSignalId}` : `/companies/${company.companyId}`}
                      className="focus-ring inline-flex items-center gap-1 rounded-md text-sm font-medium text-board hover:underline"
                    >
                      Open
                      <ArrowUpRight size={14} aria-hidden />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
