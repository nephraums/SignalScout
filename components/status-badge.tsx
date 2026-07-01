import type { SignalStatus } from "@/lib/types";

const styles: Record<SignalStatus, string> = {
  New: "border-board/20 bg-board/10 text-board",
  Reviewed: "border-steel/20 bg-steel/10 text-steel",
  "Worth Action": "border-success/20 bg-success/10 text-success",
  Assigned: "border-board/20 bg-board/10 text-board",
  Researching: "border-signal/20 bg-signal/10 text-signal",
  "Copied to Internal GPT": "border-success/20 bg-success/10 text-success",
  "Gong Flow Started": "border-board/20 bg-board/10 text-board",
  "Added to CRM Manually": "border-signal/20 bg-signal/10 text-signal",
  Dismissed: "border-line bg-white text-steel"
};

export function StatusBadge({ status }: { status: SignalStatus }) {
  return (
    <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}
