"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Building2, Crosshair, Plus, Search, Settings, ShieldCheck } from "lucide-react";
import { GovernanceNote } from "@/components/governance-note";
import { UserSwitcher } from "@/components/user-switcher";
import { hydrateSharedStorage } from "@/lib/storage";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/", label: "Signals", icon: BarChart3 },
  { href: "/target-accounts", label: "Watchlist", icon: Crosshair },
  { href: "/discover", label: "Discover", icon: Search },
  { href: "/companies", label: "Directory", icon: Building2 },
  { href: "/add", label: "Add Signal", icon: Plus },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrateSharedStorage().finally(() => setReady(true));
  }, []);

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
      <main className="mx-auto max-w-7xl px-5 py-6">
        {ready ? children : <div className="rounded-md border border-line bg-white p-5 text-sm text-steel shadow-panel">Loading shared workspace...</div>}
      </main>
      <GovernanceNote />
    </div>
  );
}
