import Link from "next/link";
import { ArrowRight, Crosshair, Radar, Settings } from "lucide-react";

export default function InstructionsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-md border border-line bg-white p-6 shadow-panel">
        <p className="inline-flex items-center gap-2 rounded-md border border-board/20 bg-board/10 px-2.5 py-1 text-sm font-medium text-board">
          <Radar size={15} aria-hidden />
          SignalScout purpose
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-normal text-ink">Find public buying signals before intent tools catch up</h1>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-steel">
          SignalScout is designed to spot early market signals as soon as they appear in public news, company announcements, hiring activity, earnings commentary, and industry coverage. Intent tools can be useful, but by the time a company is visibly searching for software, internal conversations may already have been running for months or years. This workflow helps the team find earlier clues, add the right signals, and give BDRs enough context to create relevant outreach with a custom GPT.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-md border border-line bg-white p-5 shadow-panel">
          <Settings className="text-board" size={22} aria-hidden />
          <h2 className="mt-3 text-lg font-semibold text-ink">1. Configure the scout</h2>
          <p className="mt-2 text-sm leading-6 text-steel">
            Set target countries, industries, relevance terms, and target accounts. Use multiple company-country combinations when useful, such as Panasonic Japan and Panasonic Singapore. Adding HQ and regional HQ countries can broaden useful results.
          </p>
        </div>
        <div className="rounded-md border border-line bg-white p-5 shadow-panel">
          <Crosshair className="text-board" size={22} aria-hidden />
          <h2 className="mt-3 text-lg font-semibold text-ink">2. Scan targets and markets</h2>
          <p className="mt-2 text-sm leading-6 text-steel">
            Run the target watchlist scan frequently for named accounts. Use Discover to scan configured countries and industries for new large-company candidates. Review the articles and add only the signals worth passing to BDRs.
          </p>
        </div>
        <div className="rounded-md border border-line bg-white p-5 shadow-panel">
          <Radar className="text-board" size={22} aria-hidden />
          <h2 className="mt-3 text-lg font-semibold text-ink">3. Work the signal</h2>
          <p className="mt-2 text-sm leading-6 text-steel">
            Track opportunity score, matched search words, labels, and workflow status in My Signals. Use the generated briefing as raw material for highly relevant outreach drafts in your custom GPT.
          </p>
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        <Link href="/settings" className="focus-ring inline-flex h-11 items-center gap-2 rounded-md bg-board px-4 text-sm font-semibold text-white hover:bg-board/90">
          Start with Settings
          <ArrowRight size={16} aria-hidden />
        </Link>
        <Link href="/target-accounts" className="focus-ring inline-flex h-11 items-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink hover:border-board hover:text-board">
          Scan My Targets Watchlist
        </Link>
      </section>
    </div>
  );
}
