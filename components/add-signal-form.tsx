"use client";

import { countries, industries, intentSources } from "@/lib/constants";
import { classifyAndSaveSignal } from "@/lib/signal-actions";
import { getSettings } from "@/lib/storage";
import type { IntentSource } from "@/lib/types";
import { Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AddSignalForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countryOptions, setCountryOptions] = useState(countries);

  useEffect(() => {
    setCountryOptions(Array.from(new Set([...countries, ...getSettings().targetCountries])).sort());
  }, []);

  async function submit(formData: FormData) {
    setLoading(true);
    setError(null);
    setMode(null);

    const sourceUrl = String(formData.get("sourceUrl") ?? "");
    const companyName = String(formData.get("companyName") ?? "");
    const country = String(formData.get("country") ?? "");
    const industry = String(formData.get("industry") ?? "");
    const intentSource = String(formData.get("intentSource") ?? "Public Signal") as IntentSource;
    const notes = String(formData.get("notes") ?? "");

    try {
      const signal = await classifyAndSaveSignal({ sourceUrl, companyName, country, industry, intentSource, notes });
      setMode("classified");
      router.push(`/signals/${signal.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The signal could not be classified.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={submit} className="space-y-5 rounded-md border border-line bg-white p-5 shadow-panel">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Source URL</span>
          <input
            required
            type="url"
            name="sourceUrl"
            className="focus-ring h-11 w-full rounded-md border border-line px-3 text-sm text-ink"
            placeholder="https://..."
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Company name</span>
          <input
            required
            name="companyName"
            className="focus-ring h-11 w-full rounded-md border border-line px-3 text-sm text-ink"
            placeholder="Company Pty Ltd"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Country</span>
          <select required name="country" className="focus-ring h-11 w-full rounded-md border border-line px-3 text-sm text-ink">
            {countryOptions.map((country) => (
              <option key={country}>{country}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Industry</span>
          <select required name="industry" className="focus-ring h-11 w-full rounded-md border border-line px-3 text-sm text-ink">
            {industries.map((industry) => (
              <option key={industry}>{industry}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Intent source</span>
          <select required name="intentSource" className="focus-ring h-11 w-full rounded-md border border-line px-3 text-sm text-ink">
            {intentSources.map((source) => (
              <option key={source}>{source}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-ink">Optional notes</span>
        <textarea
          name="notes"
          rows={5}
          className="focus-ring w-full rounded-md border border-line p-3 text-sm leading-6 text-ink"
          placeholder="Public observations only. Example: large enterprise, multi-country rollout, finance transformation language, hiring for demand planning."
        />
      </label>
      {error ? <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {mode ? <p className="text-sm text-steel">Classification mode: {mode}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="focus-ring inline-flex h-11 items-center gap-2 rounded-md bg-board px-4 text-sm font-semibold text-white hover:bg-board/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? <Loader2 className="animate-spin" size={17} aria-hidden /> : <Sparkles size={17} aria-hidden />}
        {loading ? "Classifying" : "Classify Signal"}
      </button>
    </form>
  );
}
