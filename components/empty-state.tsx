import Link from "next/link";
import { Plus } from "lucide-react";

export function EmptyState() {
  return (
    <div className="rounded-md border border-dashed border-line bg-white p-8 text-center">
      <h2 className="text-lg font-semibold text-ink">No signals yet</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-steel">
        Add a public URL or observation to classify the signal and place it on the ranked dashboard.
      </p>
      <Link
        href="/add"
        className="focus-ring mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-board px-4 text-sm font-semibold text-white hover:bg-board/90"
      >
        <Plus size={16} aria-hidden />
        Add Signal
      </Link>
    </div>
  );
}
