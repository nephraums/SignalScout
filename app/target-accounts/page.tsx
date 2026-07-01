"use client";

import Link from "next/link";
import { ArrowUpRight, Newspaper, Settings } from "lucide-react";
import { AddArticleSignalButton } from "@/components/add-article-signal-button";
import { ScanNewsButton } from "@/components/scan-news-button";
import { ScorePill } from "@/components/score-pill";
import { StatusBadge } from "@/components/status-badge";
import { getNewsArticles, getSettings, getSignals } from "@/lib/storage";
import type { AppSettings, NewsArticle, Signal, TargetAccount } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";

type AccountMatch = {
  account: TargetAccount;
  signals: Signal[];
  newsArticles: NewsArticle[];
  score: number;
  priority: string;
};

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function scorePriority(priority: string) {
  if (priority === "Top pick") {
    return 15;
  }
  if (priority === "Secondary") {
    return 8;
  }
  return 0;
}

function sourceHost(sourceUrl: string) {
  try {
    return new URL(sourceUrl).hostname.replace(/^www\./, "");
  } catch {
    return "source";
  }
}

function articleHasSignal(article: NewsArticle, signals: Signal[]) {
  return signals.some((signal) => signal.source_url === article.url);
}

export default function TargetAccountsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [countryFilter, setCountryFilter] = useState("All");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [companyFilter, setCompanyFilter] = useState("");

  useEffect(() => {
    setSettings(getSettings());
    setSignals(getSignals());
    setNewsArticles(getNewsArticles());
  }, []);

  const accountMatches = useMemo<AccountMatch[]>(() => {
    if (!settings) {
      return [];
    }

    return settings.targetAccounts
      .map((account) => {
        const accountName = normalize(account.name);
        const matchedSignals = signals.filter((signal) => {
          const signalCompany = normalize(signal.company.name);
          return signalCompany === accountName || signalCompany.includes(accountName) || accountName.includes(signalCompany);
        });
        const matchedArticles = newsArticles.filter((article) => article.accountId === account.id);
        const industryPreference = settings.industryPreferences.find((item) => item.name === account.industry);
        const industryBoost = industryPreference?.enabled ? scorePriority(industryPreference.priority) : 0;
        const highestSignalScore = Math.max(0, ...matchedSignals.map((signal) => signal.opportunity_score));
        const newsBoost = Math.min(18, matchedArticles.reduce((sum, article) => sum + Math.min(6, Math.floor((article.relevanceScore ?? 0) / 15)), 0));
        const recencyBoost = [...matchedSignals, ...matchedArticles].some((item) => {
          const date = "created_at" in item ? item.created_at : (item.publishedAt ?? item.foundAt);
          const ageInDays = (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24);
          return ageInDays <= 30;
        })
          ? 5
          : 0;

        return {
          account,
          signals: matchedSignals,
          newsArticles: matchedArticles,
          score: Math.min(100, highestSignalScore + industryBoost + newsBoost + recencyBoost),
          priority: industryPreference?.priority ?? "Monitor"
        };
      })
      .sort((a, b) => b.score - a.score || b.signals.length + b.newsArticles.length - (a.signals.length + a.newsArticles.length));
  }, [settings, signals, newsArticles]);

  const filteredAccountMatches = useMemo(() => {
    return accountMatches.filter((match) => {
      const countryMatches = countryFilter === "All" || match.account.country === countryFilter;
      const industryMatches = industryFilter === "All" || match.account.industry === industryFilter;
      const companyMatches =
        !companyFilter.trim() || match.account.name.toLowerCase().includes(companyFilter.trim().toLowerCase());
      return countryMatches && industryMatches && companyMatches;
    });
  }, [accountMatches, countryFilter, industryFilter, companyFilter]);

  if (!settings) {
    return null;
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal text-ink">Account watchlist</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-steel">
            Track named accounts, scan public news, and see which accounts are already being worked.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ScanNewsButton onScanComplete={() => setNewsArticles(getNewsArticles())} />
          <Link
            href="/settings"
            className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink hover:border-board hover:text-board"
          >
            <Settings size={17} aria-hidden />
            Edit Targets
          </Link>
        </div>
      </section>

      <section className="rounded-md border border-line bg-white p-4 text-sm leading-6 text-steel shadow-panel">
        The scan uses public news RSS for the configured accounts and stores recent article matches in this browser. Scheduling this as a continuous job is the next deployment step.
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-md border border-line bg-white p-4 shadow-panel">
          <p className="text-sm font-medium text-steel">Configured accounts</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{settings.targetAccounts.length}</p>
        </div>
        <div className="rounded-md border border-line bg-white p-4 shadow-panel">
          <p className="text-sm font-medium text-steel">Accounts with matched news</p>
          <p className="mt-2 text-3xl font-semibold text-ink">
            {filteredAccountMatches.filter((item) => item.signals.length > 0 || item.newsArticles.length > 0).length}
          </p>
        </div>
        <div className="rounded-md border border-line bg-white p-4 shadow-panel">
          <p className="text-sm font-medium text-steel">Top industries</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-ink">
            {settings.industryPreferences
              .filter((item) => item.priority === "Top pick" && item.enabled)
              .map((item) => item.name)
              .join(", ")}
          </p>
        </div>
      </section>

      <section className="grid gap-3 rounded-md border border-line bg-white p-4 shadow-panel md:grid-cols-4">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Country</span>
          <select
            value={countryFilter}
            onChange={(event) => setCountryFilter(event.target.value)}
            className="focus-ring h-10 w-full rounded-md border border-line px-3 text-sm text-ink"
          >
            <option>All</option>
            {Array.from(new Set(accountMatches.map((match) => match.account.country))).sort().map((country) => (
              <option key={country}>{country}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Industry</span>
          <select
            value={industryFilter}
            onChange={(event) => setIndustryFilter(event.target.value)}
            className="focus-ring h-10 w-full rounded-md border border-line px-3 text-sm text-ink"
          >
            <option>All</option>
            {Array.from(new Set(accountMatches.map((match) => match.account.industry))).sort().map((industry) => (
              <option key={industry}>{industry}</option>
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
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => {
              setCountryFilter("All");
              setIndustryFilter("All");
              setCompanyFilter("");
            }}
            className="focus-ring h-10 rounded-md border border-line bg-white px-3 text-sm font-semibold text-ink hover:border-board hover:text-board"
          >
            Clear Filters
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-line bg-white shadow-panel">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] table-fixed divide-y divide-line">
            <thead className="bg-mist/70">
              <tr>
                {["Company", "Country", "Industry", "Preference", "Score", "Matched items", "Latest related news"].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase text-steel">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredAccountMatches.map((match) => {
                const latestArticle = match.newsArticles[0];

                return (
                  <tr key={match.account.id} className="align-top hover:bg-mist/35">
                    <td className="px-4 py-4 font-semibold text-ink">{match.account.name}</td>
                    <td className="px-4 py-4 text-sm text-steel">{match.account.country}</td>
                    <td className="px-4 py-4 text-sm text-steel">{match.account.industry}</td>
                    <td className="px-4 py-4 text-sm font-medium text-ink">{match.priority}</td>
                    <td className="px-4 py-4">
                      <ScorePill score={match.score} />
                    </td>
                    <td className="px-4 py-4 text-sm text-ink">{match.signals.length + match.newsArticles.length}</td>
                    <td className="px-4 py-4">
                      {latestArticle ? (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <a
                              href={latestArticle.url}
                              target="_blank"
                              rel="noreferrer"
                              className="block text-sm font-semibold leading-5 text-ink hover:text-board"
                            >
                              {latestArticle.title}
                            </a>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-steel">
                              <span>{latestArticle.source}</span>
                              <span className="rounded-md bg-mist px-2 py-0.5 text-xs font-semibold text-ink">
                                Relevance {latestArticle.relevanceScore ?? 0}
                              </span>
                              <span>
                                {latestArticle.publishedAt
                                  ? new Date(latestArticle.publishedAt).toLocaleDateString("en-AU", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric"
                                    })
                                  : "Date unknown"}
                              </span>
                              <a
                                href={latestArticle.url}
                                target="_blank"
                                rel="noreferrer"
                                className="focus-ring inline-flex items-center gap-1 rounded-md font-medium text-board hover:underline"
                              >
                                Open
                                <ArrowUpRight size={14} aria-hidden />
                              </a>
                            </div>
                            {latestArticle.matchedTerms?.length ? (
                              <p className="text-xs leading-5 text-steel">
                                Matched: {latestArticle.matchedTerms.slice(0, 6).join(", ")}
                              </p>
                            ) : null}
                          </div>
                          <AddArticleSignalButton
                            article={latestArticle}
                            account={match.account}
                            existingSignal={articleHasSignal(latestArticle, signals)}
                            onSignalAdded={() => setSignals(getSignals())}
                          />
                        </div>
                      ) : match.signals.length ? (
                        <div className="space-y-2">
                          {match.signals.slice(0, 2).map((signal) => (
                            <div key={signal.id} className="space-y-1">
                              <Link href={`/signals/${signal.id}`} className="block text-sm font-semibold leading-5 text-ink hover:text-board">
                                {signal.source_title}
                              </Link>
                              <div className="flex flex-wrap items-center gap-2">
                                <StatusBadge status={signal.status} />
                                <a
                                  href={signal.source_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="focus-ring inline-flex items-center gap-1 rounded-md text-sm font-medium text-board hover:underline"
                                >
                                  {sourceHost(signal.source_url)}
                                  <ArrowUpRight size={14} aria-hidden />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-sm text-steel">
                          <Newspaper size={15} aria-hidden />
                          No matched articles yet
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
