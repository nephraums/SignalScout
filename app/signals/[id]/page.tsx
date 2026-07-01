"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { NotesEditor } from "@/components/notes-editor";
import { ScorePill } from "@/components/score-pill";
import { StatusBadge } from "@/components/status-badge";
import { StatusControls } from "@/components/status-controls";
import { ActivityFeed } from "@/components/activity-feed";
import { SignalWorkflowActions } from "@/components/signal-workflow-actions";
import { TeamNotes } from "@/components/team-notes";
import { getProfileName } from "@/lib/storage";
import { getSignal } from "@/lib/storage";
import { useEffect, useState } from "react";
import type { Signal } from "@/lib/types";

function DetailBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-line bg-white p-5 shadow-panel">
      <h2 className="text-sm font-semibold uppercase text-steel">{title}</h2>
      <div className="mt-3 text-sm leading-6 text-ink">{children}</div>
    </section>
  );
}

export default function SignalDetailPage() {
  const params = useParams<{ id: string }>();
  const [signal, setSignal] = useState<Signal | null | undefined>(undefined);

  useEffect(() => {
    setSignal(getSignal(params.id));
  }, [params.id]);

  if (signal === undefined) {
    return null;
  }

  if (!signal) {
    return (
      <div className="rounded-md border border-line bg-white p-8 text-center shadow-panel">
        <h1 className="text-xl font-semibold text-ink">Signal not found</h1>
        <p className="mt-2 text-sm text-steel">The signal may have been removed from this browser.</p>
        <Link href="/" className="mt-5 inline-flex rounded-md bg-board px-4 py-2 text-sm font-semibold text-white">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/" className="focus-ring inline-flex items-center gap-2 rounded-md text-sm font-medium text-board hover:underline">
        <ArrowLeft size={16} aria-hidden />
        Back to dashboard
      </Link>

      <section className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal text-ink">{signal.company.name}</h1>
          <p className="mt-2 text-sm leading-6 text-steel">{signal.summary}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-md border border-line bg-white px-2.5 py-1 text-sm font-medium text-steel">{signal.company.country}</span>
            <span className="rounded-md border border-line bg-white px-2.5 py-1 text-sm font-medium text-steel">{signal.company.industry}</span>
            <span className="rounded-md border border-line bg-white px-2.5 py-1 text-sm font-medium text-steel">{signal.signal_type}</span>
            <span className="rounded-md border border-line bg-white px-2.5 py-1 text-sm font-medium text-steel">{signal.intent_source ?? "Public Signal"}</span>
          </div>
        </div>
        <aside className="rounded-md border border-line bg-white p-5 shadow-panel">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-steel">Opportunity score</p>
              <div className="mt-2">
                <ScorePill score={signal.opportunity_score} />
              </div>
            </div>
            <StatusBadge status={signal.status} />
          </div>
          <div className="mt-5 space-y-2 text-sm text-steel">
            <p>
              <span className="font-semibold text-ink">Use case:</span> {signal.board_use_case}
            </p>
            <p>
              <span className="font-semibold text-ink">Owner:</span> {getProfileName(signal.owner_user_id)}
            </p>
            <p>
              <span className="font-semibold text-ink">Intent source:</span> {signal.intent_source ?? "Public Signal"}
            </p>
            <p>
              <span className="font-semibold text-ink">Source date:</span> {signal.source_date ?? "Unknown"}
            </p>
          </div>
          <a
            href={signal.source_url}
            target="_blank"
            rel="noreferrer"
            className="focus-ring mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-semibold text-ink hover:border-board hover:text-board"
          >
            Open Source
            <ExternalLink size={16} aria-hidden />
          </a>
        </aside>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <DetailBlock title="Source title">{signal.source_title}</DetailBlock>
        <DetailBlock title="Recommended sales play">
          <div className="space-y-2">
            <p className="font-semibold">{signal.recommended_play_name}</p>
            <p>{signal.recommended_play_reason}</p>
          </div>
        </DetailBlock>
        <DetailBlock title="Why it matters">{signal.why_it_matters}</DetailBlock>
        <DetailBlock title="Possible business pain">{signal.possible_business_pain}</DetailBlock>
        <DetailBlock title="Suggested manual research">{signal.suggested_manual_research_steps}</DetailBlock>
      </section>

      <DetailBlock title="Copy for Internal GPT / Gong Flow">
        <div className="space-y-4">
          <pre className="whitespace-pre-wrap rounded-md bg-mist p-4 text-sm leading-6 text-ink">
            {signal.copyable_internal_gpt_briefing}
          </pre>
          <SignalWorkflowActions signal={signal} onUpdate={setSignal} />
        </div>
      </DetailBlock>

      <section className="grid gap-5 lg:grid-cols-2">
        <DetailBlock title="Suggested discovery question">
          <div className="flex flex-col gap-3">
            <p>{signal.suggested_discovery_question}</p>
            <CopyButton text={signal.suggested_discovery_question} />
          </div>
        </DetailBlock>
        <DetailBlock title="Suggested public comment">
          <div className="flex flex-col gap-3">
            <p>{signal.suggested_linkedin_comment}</p>
            <CopyButton text={signal.suggested_linkedin_comment} />
          </div>
        </DetailBlock>
        <DetailBlock title="Suggested short note">
          <div className="flex flex-col gap-3">
            <p>{signal.suggested_connection_note}</p>
            <CopyButton text={signal.suggested_connection_note} />
          </div>
        </DetailBlock>
        <DetailBlock title="Suggested manual first message">
          <div className="flex flex-col gap-3">
            <p>{signal.suggested_first_message}</p>
            <CopyButton text={signal.suggested_first_message} />
          </div>
        </DetailBlock>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <DetailBlock title="Status workflow">
          <StatusControls
            signalId={signal.id}
            currentStatus={signal.status}
            onStatusChange={(status) => setSignal({ ...signal, status })}
          />
        </DetailBlock>
        <DetailBlock title="User notes">
          <NotesEditor
            signalId={signal.id}
            initialValue={signal.user_notes}
            onSave={(user_notes) => setSignal({ ...signal, user_notes })}
          />
        </DetailBlock>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <TeamNotes companyId={signal.company_id} signalId={signal.id} />
        <ActivityFeed companyId={signal.company_id} signalId={signal.id} />
      </section>
    </div>
  );
}
