"use client";

import { updateSignalNotes } from "@/lib/storage";
import { Save } from "lucide-react";
import { useState } from "react";

export function NotesEditor({
  signalId,
  initialValue,
  onSave
}: {
  signalId: string;
  initialValue?: string | null;
  onSave?: (notes: string) => void;
}) {
  const [notes, setNotes] = useState(initialValue ?? "");

  function save() {
    updateSignalNotes(signalId, notes);
    onSave?.(notes);
  }

  return (
    <div className="space-y-3">
      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        rows={5}
        className="focus-ring w-full rounded-md border border-line bg-white p-3 text-sm leading-6 text-ink"
        placeholder="Add manual notes from public research or sales review."
      />
      <button
        type="button"
        onClick={save}
        className="focus-ring inline-flex h-10 items-center gap-2 rounded-md bg-board px-4 text-sm font-semibold text-white hover:bg-board/90"
      >
        <Save size={16} aria-hidden />
        Save Notes
      </button>
    </div>
  );
}
