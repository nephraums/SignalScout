"use client";

import { updateSignalFlags, updateSignalStatus } from "@/lib/storage";
import type { Signal } from "@/lib/types";
import { CheckCircle2, ClipboardCopy } from "lucide-react";
import { useState } from "react";

export function SignalWorkflowActions({ signal, onUpdate }: { signal: Signal; onUpdate: (signal: Signal) => void }) {
  const [copied, setCopied] = useState(false);

  async function copyBriefing() {
    await navigator.clipboard.writeText(signal.copyable_internal_gpt_briefing);
    const updates = {
      copied_to_internal_gpt: true,
      last_action_at: new Date().toISOString()
    };
    updateSignalFlags(signal.id, updates);
    updateSignalStatus(signal.id, "Copied to Internal GPT");
    onUpdate({ ...signal, ...updates, status: "Copied to Internal GPT" });
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function markCrm() {
    const updates = {
      manually_added_to_crm: true,
      last_action_at: new Date().toISOString()
    };
    updateSignalFlags(signal.id, updates);
    updateSignalStatus(signal.id, "Added to CRM Manually");
    onUpdate({ ...signal, ...updates, status: "Added to CRM Manually" });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={copyBriefing}
        className="focus-ring inline-flex h-10 items-center gap-2 rounded-md bg-board px-4 text-sm font-semibold text-white hover:bg-board/90"
      >
        <ClipboardCopy size={16} aria-hidden />
        {copied ? "Copied" : "Copy Briefing"}
      </button>
      <button
        type="button"
        onClick={markCrm}
        className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink hover:border-board hover:text-board"
      >
        <CheckCircle2 size={16} aria-hidden />
        Mark Added to CRM Manually
      </button>
    </div>
  );
}
