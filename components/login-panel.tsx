"use client";

import { login } from "@/lib/storage";
import { LogIn, ShieldCheck } from "lucide-react";
import { useState } from "react";

export function LoginPanel({ onLogin }: { onLogin: () => void }) {
  const [error, setError] = useState("");

  function submit(formData: FormData) {
    const username = String(formData.get("username") ?? "");
    const password = String(formData.get("password") ?? "");
    const user = login(username, password);

    if (!user) {
      setError("Username or password did not match.");
      return;
    }

    onLogin();
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-7xl place-items-center px-5 py-10">
      <section className="w-full max-w-md rounded-md border border-line bg-white p-6 shadow-panel">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-md bg-board text-white">
            <ShieldCheck size={22} aria-hidden />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-ink">SignalScout</h1>
            <p className="text-sm text-steel">Public signal-to-play workflow</p>
          </div>
        </div>

        <form action={submit} className="mt-6 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-ink">Username</span>
            <input
              name="username"
              autoComplete="username"
              className="focus-ring h-11 w-full rounded-md border border-line px-3 text-sm text-ink"
              placeholder="Peter"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-ink">Password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              className="focus-ring h-11 w-full rounded-md border border-line px-3 text-sm text-ink"
              placeholder="Same as username"
            />
          </label>

          {error ? <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

          <button
            type="submit"
            className="focus-ring inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-board px-4 text-sm font-semibold text-white hover:bg-board/90"
          >
            <LogIn size={17} aria-hidden />
            Sign In
          </button>
        </form>
      </section>
    </main>
  );
}
