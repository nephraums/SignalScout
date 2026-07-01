"use client";

import { isWatching, toggleCompanyWatch } from "@/lib/storage";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";

export function WatchCompanyButton({ companyId }: { companyId: string }) {
  const [watching, setWatching] = useState(false);

  useEffect(() => {
    setWatching(isWatching(companyId));
  }, [companyId]);

  return (
    <button
      type="button"
      onClick={() => setWatching(toggleCompanyWatch(companyId))}
      className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-semibold text-ink hover:border-board hover:text-board"
    >
      {watching ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
      {watching ? "Unwatch" : "Watch Company"}
    </button>
  );
}
