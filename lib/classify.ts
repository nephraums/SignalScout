import { boardUseCases, salesPlays, signalTypes } from "@/lib/constants";
import { calculateOpportunityScore } from "@/lib/scoring";
import type { ClassificationResult, SignalInput, SignalType } from "@/lib/types";

function chooseSignalType(text: string): SignalType {
  const lower = text.toLowerCase();
  const matches: Array<[RegExp, SignalType]> = [
    [/(guidance|earnings|profit warning|miss|margin|forecast)/, "Earnings Miss / Guidance Change"],
    [/(inventory|working capital|stock|warehouse)/, "Inventory / Working Capital Issue"],
    [/(acquisition|acquire|merger|m&a|divest|subsidiary)/, "M&A / Acquisition / Divestment"],
    [/(expansion|new market|facility|plant|capacity|vietnam|new site)/, "Expansion / New Market / New Facility"],
    [/(cfo|coo|executive|appointed|resigned|chief)/, "Executive Change"],
    [/(job|hiring|role|manager|vacancy|recruit)/, "Job Advertisement Signal"],
    [/(delay|shortage|disruption|closure|supplier|logistics|production)/, "Supply Chain Disruption"],
    [/(erp|transformation|technology|data platform|ai|system)/, "Technology / Transformation Signal"]
  ];

  return matches.find(([pattern]) => pattern.test(lower))?.[1] ?? "Technology / Transformation Signal";
}

function chooseBoardUseCase(signalType: SignalType, text: string) {
  const lower = text.toLowerCase();

  if (/consolidation|acquisition|group|reporting|subsidiary/.test(lower)) {
    return "Group Consolidation & Reporting";
  }

  if (/inventory|demand|forecast/.test(lower)) {
    return "Demand Forecasting / Foresight";
  }

  if (/supply|s&op|ibp|production|logistics/.test(lower)) {
    return "IBP / S&OP";
  }

  if (/capacity|workforce|facility|expansion/.test(lower)) {
    return "Workforce / Capacity Planning";
  }

  if (/finance|erp|transformation/.test(lower)) {
    return "Finance Transformation";
  }

  return boardUseCases.includes("FP&A / Enterprise Planning")
    ? "FP&A / Enterprise Planning"
    : boardUseCases[0];
}

export function fallbackClassification(input: SignalInput, sourceTitle?: string): ClassificationResult {
  const text = `${input.sourceUrl} ${input.companyName} ${input.industry} ${input.notes ?? ""}`;
  const signalType = chooseSignalType(text);
  const boardUseCase = chooseBoardUseCase(signalType, text);
  const score = calculateOpportunityScore({
    signalType,
    notes: text,
    sourceDate: new Date().toISOString().slice(0, 10)
  });
  const play =
    salesPlays.find((item) => item.trigger_signals.includes(signalType)) ??
    salesPlays.find((item) => item.play_name === "S&OP / FP&A / Planning Hiring") ??
    salesPlays[0];
  const copyableBriefing = [
    `Company: ${input.companyName}`,
    `Country: ${input.country}`,
    `Industry: ${input.industry}`,
    `Public Signal: ${sourceTitle || input.sourceUrl}`,
    `Source URL: ${input.sourceUrl}`,
    `Signal Summary: ${input.companyName} has a public signal that appears relevant to ${boardUseCase.toLowerCase()} based on the submitted URL and notes.`,
    `Likely Business Pain: ${play.likely_business_pain}`,
    `Recommended Sales Play: ${play.play_name}`,
    `Relevant Use Case: ${play.relevant_board_use_case}`,
    "Why This Matters: The signal may indicate a change in operating conditions, management focus, or planning complexity.",
    `Suggested Manual Research: ${play.suggested_next_action}`,
    `Suggested Discovery Question: ${play.suggested_discovery_question}`,
    `Suggested Next Action: ${play.suggested_next_action}`
  ].join("\n");

  return {
    signal_type: signalTypes.includes(signalType) ? signalType : "Technology / Transformation Signal",
    source_title: sourceTitle || `Public signal for ${input.companyName}`,
    source_date: new Date().toISOString().slice(0, 10),
    summary: `${input.companyName} has a public signal that appears relevant to ${boardUseCase.toLowerCase()} based on the submitted URL and notes.`,
    why_it_matters: "The signal may indicate a change in operating conditions, management focus, or planning complexity that a sales user should review before outreach.",
    possible_business_pain: "The business may be dealing with less predictable planning assumptions, manual coordination across teams, or pressure to improve forecast confidence.",
    board_use_case: boardUseCase,
    opportunity_score: score,
    recommended_play_name: play.play_name,
    recommended_play_reason: `This play fits because the signal type is ${signalType} and the public information suggests ${play.likely_business_pain.toLowerCase()}`,
    suggested_manual_research_steps: play.suggested_next_action,
    suggested_next_action: play.suggested_next_action,
    copyable_internal_gpt_briefing: copyableBriefing,
    suggested_discovery_question: `How is ${input.companyName} currently reflecting this change in its planning and performance management process?`,
    suggested_linkedin_comment: "Interesting public update and a useful signal of how planning priorities are evolving.",
    suggested_connection_note: `I noticed the recent public update from ${input.companyName} and would value connecting around planning and performance topics.`,
    suggested_first_message: `I saw the recent public update from ${input.companyName}. It looks like the kind of change that can affect planning assumptions and cross-functional alignment. Would it be useful to compare notes on how teams handle this?`
  };
}
