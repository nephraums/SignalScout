"use client";

import { AddArticleSignalButton } from "@/components/add-article-signal-button";
import { ScorePill } from "@/components/score-pill";
import { industries } from "@/lib/constants";
import { getSettings } from "@/lib/storage";
import type { DiscoveryArticle, TargetAccount } from "@/lib/types";
import { ArrowUpRight, Loader2, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function DiscoverPage() {
  const [countryOptions, setCountryOptions] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [articles, setArticles] = useState<DiscoveryArticle[]>([]);
  const [countryFilter, setCountryFilter] = useState("All");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [companyFilter, setCompanyFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const settings = getSettings();
    const activeCountries = [...settings.targetCountries].sort();
    setCountryOptions(activeCountries);
    setSelectedCountries(activeCountries);
    setSelectedIndustries(
      settings.industryPreferences
        .filter((item) => item.enabled && item.priority !== "Monitor")
        .map((item) => item.name)
        .slice(0, 3)
    );
  }, []);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const countryMatches = countryFilter === "All" || article.inferredCountry === countryFilter;
      const industryMatches = industryFilter === "All" || article.inferredIndustry === industryFilter;
      const companyMatches =
        !companyFilter.trim() || article.inferredCompanyName.toLowerCase().includes(companyFilter.trim().toLowerCase());
      return countryMatches && industryMatches && companyMatches;
    });
  }, [articles, countryFilter, industryFilter, companyFilter]);

  function toggle(value: string, current: string[], setter: (next: string[]) => void) {
    setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  async function scan() {
    setLoading(true);
    setError(null);

    try {
      const settings = getSettings();
      const response = await fetch("/api/scan-market", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          countries: selectedCountries,
          industries: selectedIndustries,
          relevanceTerms: settings.relevanceTerms,
          days: 30
        })
      });

      if (!response.ok) {
        throw new Error("Market scan failed.");
      }

      const payload = (await response.json()) as { articles: DiscoveryArticle[] };
      setArticles(payload.articles);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Market scan failed.");
    } finally {
      setLoading(false);
    }
  }

  function asAccount(article: DiscoveryArticle): TargetAccount {
    return {
      id: `discover-${article.inferredCompanyName}-${article.inferredCountry}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: article.inferredCompanyName,
      country: article.inferredCountry,
      industry: article.inferredIndustry,
      website: article.inferredWebsite,
      notes: `${article.revenueSignal ?? "Revenue not verified"}. Discovered from country/industry scan.`
    };
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal text-ink">Market discovery</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-steel">
            Scan public news by country and industry to find large-company candidates with planning, finance, supply-chain, or market-growth signals.
          </p>
        </div>
        <button
          type="button"
          onClick={scan}
          disabled={loading || selectedCountries.length === 0 || selectedIndustries.length === 0}
          className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-md bg-board px-4 text-sm font-semibold text-white hover:bg-board/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? <Loader2 className="animate-spin" size={17} aria-hidden /> : <Search size={17} aria-hidden />}
          {loading ? "Scanning" : "Scan Markets"}
        </button>
      </section>

      <section className="rounded-md border border-line bg-white p-4 text-sm leading-6 text-steel shadow-panel">
        Revenue above USD 500m is treated as a best-effort filter using public article language such as revenue, sales, billion, large enterprise, and similar clues. Exact revenue and company websites need a later enrichment source.
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-md border border-line bg-white p-5 shadow-panel">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-ink">Countries</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedCountries(countryOptions)}
                className="focus-ring h-9 rounded-md border border-line bg-white px-3 text-sm font-semibold text-ink hover:border-board hover:text-board"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={() => setSelectedCountries([])}
                className="focus-ring h-9 rounded-md border border-line bg-white px-3 text-sm font-semibold text-ink hover:border-board hover:text-board"
              >
                Clear All
              </button>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {countryOptions.map((country) => (
              <label key={country} className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={selectedCountries.includes(country)}
                  onChange={() => toggle(country, selectedCountries, setSelectedCountries)}
                  className="h-4 w-4 accent-board"
                />
                {country}
              </label>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-line bg-white p-5 shadow-panel">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-ink">Industries</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedIndustries(industries)}
                className="focus-ring h-9 rounded-md border border-line bg-white px-3 text-sm font-semibold text-ink hover:border-board hover:text-board"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={() => setSelectedIndustries([])}
                className="focus-ring h-9 rounded-md border border-line bg-white px-3 text-sm font-semibold text-ink hover:border-board hover:text-board"
              >
                Clear All
              </button>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {industries.map((industry) => (
              <label key={industry} className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={selectedIndustries.includes(industry)}
                  onChange={() => toggle(industry, selectedIndustries, setSelectedIndustries)}
                  className="h-4 w-4 accent-board"
                />
                {industry}
              </label>
            ))}
          </div>
        </div>
      </section>

      {error ? <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <section className="grid gap-3 rounded-md border border-line bg-white p-4 shadow-panel md:grid-cols-4">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Country</span>
          <select value={countryFilter} onChange={(event) => setCountryFilter(event.target.value)} className="focus-ring h-10 w-full rounded-md border border-line px-3 text-sm text-ink">
            <option>All</option>
            {Array.from(new Set(articles.map((article) => article.inferredCountry))).sort().map((country) => (
              <option key={country}>{country}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Industry</span>
          <select value={industryFilter} onChange={(event) => setIndustryFilter(event.target.value)} className="focus-ring h-10 w-full rounded-md border border-line px-3 text-sm text-ink">
            <option>All</option>
            {Array.from(new Set(articles.map((article) => article.inferredIndustry))).sort().map((industry) => (
              <option key={industry}>{industry}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Company</span>
          <input value={companyFilter} onChange={(event) => setCompanyFilter(event.target.value)} className="focus-ring h-10 w-full rounded-md border border-line px-3 text-sm text-ink" placeholder="Filter company" />
        </label>
        <div className="flex items-end text-sm text-steel">{filteredArticles.length} candidates</div>
      </section>

      <section className="overflow-hidden rounded-md border border-line bg-white shadow-panel">
        <div className="overflow-x-auto">
          <table className="min-w-[1080px] table-fixed divide-y divide-line">
            <thead className="bg-mist/70">
              <tr>
                {["Company", "Country", "Industry", "Relevance", "Revenue clue", "Article", "Action"].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase text-steel">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredArticles.map((article) => (
                <tr key={article.id} className="align-top hover:bg-mist/35">
                  <td className="px-4 py-4 font-semibold text-ink">{article.inferredCompanyName}</td>
                  <td className="px-4 py-4 text-sm text-steel">{article.inferredCountry}</td>
                  <td className="px-4 py-4 text-sm text-steel">{article.inferredIndustry}</td>
                  <td className="px-4 py-4">
                    <ScorePill score={article.relevanceScore ?? 0} />
                  </td>
                  <td className="px-4 py-4 text-sm leading-6 text-steel">{article.revenueSignal}</td>
                  <td className="px-4 py-4">
                    <a href={article.url} target="_blank" rel="noreferrer" className="block text-sm font-semibold leading-5 text-ink hover:text-board">
                      {article.title}
                    </a>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-steel">
                      <span>{article.source}</span>
                      <a href={article.url} target="_blank" rel="noreferrer" className="focus-ring inline-flex items-center gap-1 rounded-md font-medium text-board hover:underline">
                        Open
                        <ArrowUpRight size={14} aria-hidden />
                      </a>
                    </div>
                    {article.matchedTerms?.length ? <p className="mt-2 text-xs leading-5 text-steel">Matched: {article.matchedTerms.slice(0, 6).join(", ")}</p> : null}
                  </td>
                  <td className="px-4 py-4">
                    <AddArticleSignalButton article={article} account={asAccount(article)} onSignalAdded={() => {}} />
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
