"use client";

import { getCurrentUser, getLoggedInUser, getProfiles, logout, setCurrentUser } from "@/lib/storage";
import { LogOut, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

export function UserSwitcher() {
  const [currentUserId, setCurrentUserId] = useState("");
  const loggedInUser = getLoggedInUser();
  const profiles = getProfiles();
  const adminProfile = profiles.find((profile) => profile.id === "user-admin");
  const switchableProfiles = loggedInUser?.id === "user-admin"
    ? profiles
    : [loggedInUser, adminProfile].filter(Boolean);

  useEffect(() => {
    setCurrentUserId(getCurrentUser().id);
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-2">
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
          {switchableProfiles.map((profile) => (
            <option key={profile!.id} value={profile!.id}>
              {profile!.full_name}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={() => {
          logout();
          window.location.reload();
        }}
        className="focus-ring grid h-10 w-10 place-items-center rounded-md border border-line bg-white text-steel hover:border-board hover:text-board"
        title="Sign out"
      >
        <LogOut size={16} aria-hidden />
      </button>
    </div>
  );
}
