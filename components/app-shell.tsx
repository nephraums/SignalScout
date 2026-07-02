"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, Building2, Crosshair, Plus, Search, Settings, ShieldCheck } from "lucide-react";
import { GovernanceNote } from "@/components/governance-note";
import { LoginPanel } from "@/components/login-panel";
import { UserSwitcher } from "@/components/user-switcher";
import { getLoggedInUser, hydrateSharedStorage } from "@/lib/storage";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/instructions", label: "Instructions", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/target-accounts", label: "Scan My Targets Watchlist", icon: Crosshair },
  { href: "/discover", label: "Discover", icon: Search },
  { href: "/companies", label: "My Signals", icon: Building2 },
  { href: "/add", label: "Manually Add Signal", icon: Plus },
  { href: "/", label: "Dashboard Summary", icon: BarChart3 }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    hydrateSharedStorage().finally(() => {
      setLoggedIn(Boolean(getLoggedInUser()));
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-6">
        <div className="rounded-md border border-line bg-white p-5 text-sm text-steel shadow-panel">Loading shared workspace...</div>
      </main>
    );
  }

  if (!loggedIn) {
    return <LoginPanel onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-white/92 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-board text-white">
              <ShieldCheck size={21} aria-hidden />
            </span>
            <span>
              <span className="block text-lg font-semibold tracking-normal text-ink">SignalScout</span>
              <span className="block text-sm text-steel">Public signal-to-play workflow</span>
            </span>
          </Link>
          <div className="flex flex-col gap-3 lg:items-end">
            <UserSwitcher />
            <nav className="flex flex-wrap gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`focus-ring inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium transition ${
                      active
                        ? "border-board bg-board text-white"
                        : "border-line bg-white text-ink hover:border-board hover:text-board"
                    }`}
                  >
                    <Icon size={16} aria-hidden />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-6">{children}</main>
      <GovernanceNote />
    </div>
  );
}
