import { scoringRules } from "@/lib/constants";
import type { SignalType } from "@/lib/types";

type ScoreOptions = {
  signalType: SignalType;
  notes?: string;
  sourceDate?: string | null;
};

export function calculateOpportunityScore({
  signalType,
  notes = "",
  sourceDate
}: ScoreOptions) {
  const lowerNotes = notes.toLowerCase();
  let score = scoringRules[signalType] ?? 10;

  if (/(enterprise|listed|group|conglomerate|large|multinational)/i.test(lowerNotes)) {
    score += 10;
  }

  if (/(multi-country|regional|apac|asean|anz|international|cross-border)/i.test(lowerNotes)) {
    score += 10;
  }

  if (/(finance|cfo|fp&a|consolidation|reporting|budget|forecast)/i.test(lowerNotes)) {
    score += 10;
  }

  if (/(supply|inventory|demand|s&op|ibp|logistics|capacity|production)/i.test(lowerNotes)) {
    score += 10;
  }

  if (sourceDate) {
    const sourceTime = new Date(sourceDate).getTime();
    const ageInDays = (Date.now() - sourceTime) / (1000 * 60 * 60 * 24);
    if (!Number.isNaN(ageInDays) && ageInDays <= 30) {
      score += 10;
    }
  }

  return Math.min(100, Math.max(0, score));
}
