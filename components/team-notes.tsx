"use client";

import { addNote, getNotes, getProfileName } from "@/lib/storage";
import type { Note } from "@/lib/types";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

export function TeamNotes({ companyId, signalId }: { companyId?: string; signalId?: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    setNotes(getNotes({ companyId, signalId }));
  }, [companyId, signalId]);

  function save() {
    if (!noteText.trim()) {
      return;
    }
    addNote({ companyId, signalId, noteText });
    setNoteText("");
    setNotes(getNotes({ companyId, signalId }));
  }

  return (
    <section className="rounded-md border border-line bg-white p-5 shadow-panel">
      <h2 className="text-sm font-semibold uppercase text-steel">Team notes</h2>
      <textarea
        value={noteText}
        onChange={(event) => setNoteText(event.target.value)}
        rows={4}
        className="focus-ring mt-3 w-full rounded-md border border-line p-3 text-sm leading-6 text-ink"
        placeholder="Add a public-source research note. Do not enter confidential CRM, pricing, pipeline, or campaign information."
      />
      <button
        type="button"
        onClick={save}
        className="focus-ring mt-3 inline-flex h-10 items-center gap-2 rounded-md bg-board px-4 text-sm font-semibold text-white hover:bg-board/90"
      >
        <Plus size={16} aria-hidden />
        Add Note
      </button>
      <div className="mt-5 space-y-3">
        {notes.length ? (
          notes.map((note) => (
            <div key={note.id} className="border-b border-line pb-3 last:border-0 last:pb-0">
              <p className="text-sm leading-6 text-ink">{note.note_text}</p>
              <p className="mt-1 text-xs text-steel">
                {getProfileName(note.user_id)} · {new Date(note.created_at).toLocaleString("en-AU")}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-steel">No notes yet.</p>
        )}
      </div>
    </section>
  );
}
