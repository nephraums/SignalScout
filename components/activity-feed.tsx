"use client";

import { getActivity, getProfileName } from "@/lib/storage";
import type { ActivityEvent } from "@/lib/types";
import { useEffect, useState } from "react";

export function ActivityFeed({ companyId, signalId, title = "Activity" }: { companyId?: string; signalId?: string; title?: string }) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    setEvents(getActivity({ companyId, signalId }).slice(0, 12));
  }, [companyId, signalId]);

  return (
    <section className="rounded-md border border-line bg-white p-5 shadow-panel">
      <h2 className="text-sm font-semibold uppercase text-steel">{title}</h2>
      <div className="mt-4 space-y-3">
        {events.length ? (
          events.map((event) => (
            <div key={event.id} className="border-b border-line pb-3 last:border-0 last:pb-0">
              <p className="text-sm font-medium text-ink">{event.event_summary}</p>
              <p className="mt-1 text-xs text-steel">
                {event.event_type} by {getProfileName(event.user_id)} · {new Date(event.created_at).toLocaleString("en-AU")}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-steel">No activity yet.</p>
        )}
      </div>
    </section>
  );
}
