"use client";

import { getCurrentUser, getProfiles, setCurrentUser } from "@/lib/storage";
import { UserRound } from "lucide-react";
import { useEffect, useState } from "react";

export function UserSwitcher() {
  const [currentUserId, setCurrentUserId] = useState("");
  const profiles = getProfiles();

  useEffect(() => {
    setCurrentUserId(getCurrentUser().id);
  }, []);

  return (
    <label className="flex items-center gap-2 rounded-md border border-line bg-white px-2 py-1 text-sm text-ink">
      <UserRound size={15} aria-hidden />
      <select
        value={currentUserId}
        onChange={(event) => {
          setCurrentUser(event.target.value);
          setCurrentUserId(event.target.value);
          window.location.reload();
        }}
        className="h-8 bg-transparent text-sm font-medium outline-none"
      >
        {profiles.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.full_name}
          </option>
        ))}
      </select>
    </label>
  );
}
