"use client";

import { statuses } from "@/lib/constants";
import { updateSignalStatus } from "@/lib/storage";
import type { SignalStatus } from "@/lib/types";

export function StatusControls({
  signalId,
  currentStatus,
  onStatusChange
}: {
  signalId: string;
  currentStatus: SignalStatus;
  onStatusChange?: (status: SignalStatus) => void;
}) {
  function update(status: SignalStatus) {
    updateSignalStatus(signalId, status);
    onStatusChange?.(status);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((status) => (
        <button
          key={status}
          type="button"
          onClick={() => update(status)}
          className={`focus-ring h-9 rounded-md border px-3 text-sm font-medium ${
            currentStatus === status
              ? "border-board bg-board text-white"
              : "border-line bg-white text-ink hover:border-board hover:text-board"
          }`}
        >
          {status}
        </button>
      ))}
    </div>
  );
}
