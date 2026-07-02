"use client";

import { countries, industries } from "@/lib/constants";
import { getLoggedInUser, getProfiles, getSettings, saveProfiles, saveSettings } from "@/lib/storage";
import type { AppSettings, IndustryPreference, Profile, TargetAccount, UserRole } from "@/lib/types";
import { Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const blankAccount: TargetAccount = {
  id: "",
  name: "",
  country: "Australia",
  industry: "Manufacturing",
  website: "",
  notes: ""
};

function makeId(name: string) {
  return `acct-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
}

export function SettingsForm() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [newCountry, setNewCountry] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeTab, setActiveTab] = useState<"markets" | "accounts" | "relevance" | "labels" | "users">("markets");
  const loggedInUser = getLoggedInUser();
  const canManageUsers = loggedInUser?.id === "user-admin";

  useEffect(() => {
    setSettings(getSettings());
    setProfiles(getProfiles());
  }, []);

  if (!settings) {
    return null;
  }

  function updateIndustry(name: string, patch: Partial<IndustryPreference>) {
    setSettings((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        industryPreferences: current.industryPreferences.map((item) =>
          item.name === name ? { ...item, ...patch } : item
        )
      };
    });
  }

  function toggleCountry(country: string) {
    setSettings((current) => {
      if (!current) {
        return current;
      }

      const selected = new Set(current.targetCountries);
      if (selected.has(country)) {
        selected.delete(country);
      } else {
        selected.add(country);
      }

      return {
        ...current,
        targetCountries: Array.from(selected)
      };
    });
  }

  function addCountry() {
    const country = newCountry.trim();
    if (!country) {
      return;
    }

    setSettings((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        targetCountries: Array.from(new Set([...current.targetCountries, country]))
      };
    });
    setNewCountry("");
  }

  function addAccount() {
    setSettings((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        targetAccounts: [
          ...current.targetAccounts,
          {
            ...blankAccount,
            id: `acct-new-${Date.now()}`
          }
        ]
      };
    });
  }

  function updateAccount(id: string, patch: Partial<TargetAccount>) {
    setSettings((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        targetAccounts: current.targetAccounts.map((account) =>
          account.id === id ? { ...account, ...patch } : account
        )
      };
    });
  }

  function removeAccount(id: string) {
    setSettings((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        targetAccounts: current.targetAccounts.filter((account) => account.id !== id)
      };
    });
  }

  function save() {
    if (!settings) {
      return;
    }

    const normalized: AppSettings = {
      ...settings,
      targetAccounts: settings.targetAccounts
        .filter((account) => account.name.trim())
        .map((account) => ({
          ...account,
          id: account.id || makeId(account.name),
          name: account.name.trim()
        }))
    };

    saveSettings(normalized);
    setSettings(normalized);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  function addUser() {
    const now = new Date().toISOString();
    const nextUser: Profile = {
      id: `user-${Date.now()}`,
      full_name: "New User",
      username: "New User",
      password: "New User",
      email: "new.user@example.com",
      role: "Viewer",
      team: "Global",
      created_at: now,
      updated_at: now
    };
    const nextProfiles = [...profiles, nextUser];
    setProfiles(nextProfiles);
    saveProfiles(nextProfiles);
  }

  function updateUser(id: string, patch: Partial<Profile>) {
    const nextProfiles = profiles.map((profile) =>
      profile.id === id
        ? {
            ...profile,
            ...patch,
            username: patch.username ?? profile.username,
            updated_at: new Date().toISOString()
          }
        : profile
    );
    setProfiles(nextProfiles);
    saveProfiles(nextProfiles);
  }

  function removeUser(id: string) {
    if (id === "user-admin") {
      return;
    }
    const nextProfiles = profiles.filter((profile) => profile.id !== id);
    setProfiles(nextProfiles);
    saveProfiles(nextProfiles);
  }

  const countryOptions = Array.from(new Set([...countries, ...settings.targetCountries])).sort();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 rounded-md border border-line bg-white p-2 shadow-panel">
        {[
          ["markets", "Markets"],
          ["accounts", "Accounts"],
          ["relevance", "Relevance"],
          ["labels", "Labels"],
          ...(canManageUsers ? [["users", "Users"]] : [])
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setActiveTab(value as typeof activeTab)}
            className={`focus-ring h-10 rounded-md px-3 text-sm font-semibold ${
              activeTab === value ? "bg-board text-white" : "text-ink hover:bg-mist"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "markets" ? (
      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-md border border-line bg-white p-5 shadow-panel">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-ink">Target countries</h2>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, targetCountries: [] })}
              className="focus-ring h-9 rounded-md border border-line bg-white px-3 text-sm font-semibold text-ink hover:border-board hover:text-board"
            >
              Clear All
            </button>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {countryOptions.map((country) => (
              <label key={country} className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={settings.targetCountries.includes(country)}
                  onChange={() => toggleCountry(country)}
                  className="h-4 w-4 accent-board"
                />
                {country}
              </label>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <input
              value={newCountry}
              onChange={(event) => setNewCountry(event.target.value)}
              className="focus-ring h-10 min-w-0 flex-1 rounded-md border border-line px-3 text-sm text-ink"
              placeholder="Add country"
            />
            <button
              type="button"
              onClick={addCountry}
              className="focus-ring inline-flex h-10 items-center justify-center rounded-md border border-line bg-white px-3 text-sm font-semibold text-ink hover:border-board hover:text-board"
            >
              Add
            </button>
          </div>
        </div>

        <div className="rounded-md border border-line bg-white p-5 shadow-panel">
          <h2 className="text-lg font-semibold text-ink">Industry preferences</h2>
          <div className="mt-4 space-y-3">
            {settings.industryPreferences.map((industry) => (
              <div key={industry.name} className="grid gap-2 rounded-md border border-line p-3 sm:grid-cols-[1fr_150px] sm:items-center">
                <label className="flex items-center gap-2 text-sm font-medium text-ink">
                  <input
                    type="checkbox"
                    checked={industry.enabled}
                    onChange={(event) => updateIndustry(industry.name, { enabled: event.target.checked })}
                    className="h-4 w-4 accent-board"
                  />
                  {industry.name}
                </label>
                <select
                  value={industry.priority}
                  onChange={(event) =>
                    updateIndustry(industry.name, {
                      priority: event.target.value as IndustryPreference["priority"]
                    })
                  }
                  className="focus-ring h-10 rounded-md border border-line px-3 text-sm text-ink"
                >
                  <option>Top pick</option>
                  <option>Secondary</option>
                  <option>Monitor</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      </section>
      ) : null}

      {activeTab === "accounts" ? (
      <section className="rounded-md border border-line bg-white p-5 shadow-panel">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Target accounts</h2>
            <p className="mt-1 text-sm text-steel">{settings.targetAccounts.length} accounts configured</p>
          </div>
          <button
            type="button"
            onClick={addAccount}
            className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-semibold text-ink hover:border-board hover:text-board disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={16} aria-hidden />
            Add Account
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {settings.targetAccounts.map((account, index) => (
            <div key={account.id} className="grid gap-3 rounded-md border border-line p-3 lg:grid-cols-[1.2fr_150px_180px_1fr_44px] lg:items-start">
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase text-steel">Company {index + 1}</span>
                <input
                  value={account.name}
                  onChange={(event) => updateAccount(account.id, { name: event.target.value })}
                  className="focus-ring h-10 w-full rounded-md border border-line px-3 text-sm text-ink"
                  placeholder="Company name"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase text-steel">Country</span>
                <select
                  value={account.country}
                  onChange={(event) => updateAccount(account.id, { country: event.target.value })}
                  className="focus-ring h-10 w-full rounded-md border border-line px-3 text-sm text-ink"
                >
                  {Array.from(new Set([...countries, ...settings.targetCountries])).sort().map((country) => (
                    <option key={country}>{country}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase text-steel">Industry</span>
                <select
                  value={account.industry}
                  onChange={(event) => updateAccount(account.id, { industry: event.target.value })}
                  className="focus-ring h-10 w-full rounded-md border border-line px-3 text-sm text-ink"
                >
                  {industries.map((industry) => (
                    <option key={industry}>{industry}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase text-steel">Website or notes</span>
                <input
                  value={account.website || account.notes || ""}
                  onChange={(event) => updateAccount(account.id, { website: event.target.value })}
                  className="focus-ring h-10 w-full rounded-md border border-line px-3 text-sm text-ink"
                  placeholder="https://..."
                />
              </label>
              <button
                type="button"
                onClick={() => removeAccount(account.id)}
                className="focus-ring mt-5 grid h-10 w-10 place-items-center rounded-md border border-line bg-white text-steel hover:border-red-300 hover:text-red-700 lg:mt-6"
                title="Remove account"
              >
                <Trash2 size={16} aria-hidden />
              </button>
            </div>
          ))}
        </div>
      </section>
      ) : null}

      {activeTab === "relevance" ? (
      <section className="rounded-md border border-line bg-white p-5 shadow-panel">
        <h2 className="text-lg font-semibold text-ink">Relevance terms and auto-add threshold</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_180px]">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Relevant search terms</span>
            <textarea
              value={settings.relevanceTerms.join("\n")}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  relevanceTerms: event.target.value
                    .split(/\n|,/)
                    .map((term) => term.trim())
                    .filter(Boolean)
                })
              }
              rows={12}
              className="focus-ring w-full rounded-md border border-line p-3 text-sm leading-6 text-ink"
              placeholder="Paste terms, one per line"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Auto-add score</span>
            <input
              type="number"
              min={0}
              max={100}
              value={settings.autoAddThreshold}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  autoAddThreshold: Number(event.target.value)
                })
              }
              className="focus-ring h-11 w-full rounded-md border border-line px-3 text-sm text-ink"
            />
            <p className="text-sm leading-6 text-steel">
              Articles at or above this relevance score are automatically added as dashboard signals after scanning.
            </p>
          </label>
        </div>
      </section>
      ) : null}

      {activeTab === "labels" ? (
      <>
      <section className="rounded-md border border-line bg-white p-5 shadow-panel">
        <h2 className="text-lg font-semibold text-ink">Intent source labels</h2>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {settings.intentSources.map((label, index) => (
            <input
              key={`${label}-${index}`}
              value={label}
              onChange={(event) => {
                const labels = [...settings.intentSources];
                labels[index] = event.target.value as typeof label;
                setSettings({ ...settings, intentSources: labels });
              }}
              className="focus-ring h-10 w-full rounded-md border border-line px-3 text-sm text-ink"
            />
          ))}
        </div>
      </section>

      <section className="rounded-md border border-line bg-white p-5 shadow-panel">
        <h2 className="text-lg font-semibold text-ink">Board use-case labels</h2>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {settings.boardUseCases.map((label, index) => (
            <input
              key={`${label}-${index}`}
              value={label}
              onChange={(event) => {
                const labels = [...settings.boardUseCases];
                labels[index] = event.target.value;
                setSettings({ ...settings, boardUseCases: labels });
              }}
              className="focus-ring h-10 w-full rounded-md border border-line px-3 text-sm text-ink"
            />
          ))}
        </div>
      </section>
      </>
      ) : null}

      {activeTab === "users" && canManageUsers ? (
      <section className="rounded-md border border-line bg-white p-5 shadow-panel">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">User management</h2>
            <p className="mt-1 text-sm text-steel">Prototype access only. Passwords are simple shared-workspace values for now.</p>
          </div>
          <button
            type="button"
            onClick={addUser}
            className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-semibold text-ink hover:border-board hover:text-board"
          >
            <Plus size={16} aria-hidden />
            Add User
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {profiles.map((profile) => (
            <div key={profile.id} className="grid gap-3 rounded-md border border-line p-3 lg:grid-cols-[1fr_1fr_1fr_150px_44px] lg:items-end">
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase text-steel">Name</span>
                <input
                  value={profile.full_name}
                  onChange={(event) => updateUser(profile.id, { full_name: event.target.value, username: event.target.value })}
                  className="focus-ring h-10 w-full rounded-md border border-line px-3 text-sm text-ink"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase text-steel">Username</span>
                <input
                  value={profile.username ?? profile.full_name}
                  onChange={(event) => updateUser(profile.id, { username: event.target.value })}
                  className="focus-ring h-10 w-full rounded-md border border-line px-3 text-sm text-ink"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase text-steel">Password</span>
                <input
                  value={profile.password ?? ""}
                  onChange={(event) => updateUser(profile.id, { password: event.target.value })}
                  className="focus-ring h-10 w-full rounded-md border border-line px-3 text-sm text-ink"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase text-steel">Role</span>
                <select
                  value={profile.role}
                  onChange={(event) => updateUser(profile.id, { role: event.target.value as UserRole })}
                  className="focus-ring h-10 w-full rounded-md border border-line px-3 text-sm text-ink"
                  disabled={profile.id === "user-admin"}
                >
                  <option>Admin</option>
                  <option>Sales Rep</option>
                  <option>BDR</option>
                  <option>Viewer</option>
                </select>
              </label>
              <button
                type="button"
                onClick={() => removeUser(profile.id)}
                disabled={profile.id === "user-admin"}
                className="focus-ring grid h-10 w-10 place-items-center rounded-md border border-line bg-white text-steel hover:border-red-300 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                title="Remove user"
              >
                <Trash2 size={16} aria-hidden />
              </button>
            </div>
          ))}
        </div>
      </section>
      ) : null}

      <div className="sticky bottom-4 flex justify-end">
        <button
          type="button"
          onClick={save}
          className="focus-ring inline-flex h-11 items-center gap-2 rounded-md bg-board px-4 text-sm font-semibold text-white shadow-panel hover:bg-board/90"
        >
          <Save size={17} aria-hidden />
          {saved ? "Saved" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
