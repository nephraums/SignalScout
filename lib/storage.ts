"use client";

import { companies as seedCompanies, companyNotes, seedSignals } from "@/lib/mock-data";
import { boardUseCases, countries, defaultRelevanceTerms, industries, intentSources, seedProfiles } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import type { AppSettings, Company, NewsArticle, Signal, SignalStatus, TargetAccount } from "@/lib/types";
import type { ActivityEvent, CompanyWatcher, Note, Profile } from "@/lib/types";

const SIGNAL_KEY = "signalscout.customSignals";
const STATUS_KEY = "signalscout.statusOverrides";
const NOTES_KEY = "signalscout.noteOverrides";
const SETTINGS_KEY = "signalscout.settings";
const NEWS_KEY = "signalscout.newsArticles";
const CURRENT_USER_KEY = "signalscout.currentUser";
const NOTES_STORE_KEY = "signalscout.notes";
const ACTIVITY_KEY = "signalscout.activity";
const WATCHERS_KEY = "signalscout.watchers";
const DATA_VERSION_KEY = "signalscout.dataVersion";
const CURRENT_DATA_VERSION = "global-team-workflow-v4";
const SHARED_STATE_KEYS = [
  SIGNAL_KEY,
  STATUS_KEY,
  NOTES_KEY,
  SETTINGS_KEY,
  NEWS_KEY,
  NOTES_STORE_KEY,
  ACTIVITY_KEY,
  WATCHERS_KEY
];
const sharedStateKeySet = new Set(SHARED_STATE_KEYS);
let hydratePromise: Promise<void> | null = null;

export const defaultTargetAccounts: TargetAccount[] = seedCompanies.map((company) => ({
  id: `acct-${company.id}`,
  name: company.name,
  country: company.country,
  industry: company.industry,
  website: company.website ?? "",
  notes: companyNotes[company.id] ?? ""
}));

export const defaultSettings: AppSettings = {
  targetCountries: countries,
  industryPreferences: industries.map((industry) => ({
    name: industry,
    enabled: true,
    priority:
      industry === "Manufacturing" || industry === "CPG" || industry === "FMCG" || industry === "Retail"
        ? "Top pick"
        : industry === "Extractive industries"
          ? "Secondary"
          : "Monitor"
  })),
  boardUseCases,
  intentSources,
  targetAccounts: defaultTargetAccounts,
  relevanceTerms: defaultRelevanceTerms,
  autoAddThreshold: 35
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(value));
  syncSharedState(key, value);
}

function writeLocalJson<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(value));
}

function syncSharedState<T>(key: string, value: T) {
  if (!supabase || !sharedStateKeySet.has(key)) {
    return;
  }

  void supabase
    .from("app_state")
    .upsert({
      key,
      value,
      updated_at: new Date().toISOString()
    })
    .then(({ error }) => {
      if (error) {
        console.warn("SignalScout shared state sync failed", error.message);
      }
    });
}

function mergeById<T extends { id: string }>(remote: T[], local: T[]) {
  const byId = new Map<string, T>();
  [...remote, ...local].forEach((item) => byId.set(item.id, item));
  return Array.from(byId.values());
}

function mergeByName<T extends { name: string }>(remote: T[], local: T[]) {
  const byName = new Map<string, T>();
  [...remote, ...local].forEach((item) => byName.set(item.name, item));
  return Array.from(byName.values());
}

function mergeSharedValue(key: string, remoteValue: unknown, localValue: unknown) {
  if (!localValue) {
    return remoteValue;
  }

  if (key === SETTINGS_KEY) {
    const remote = remoteValue as AppSettings;
    const local = localValue as AppSettings;
    return {
      ...remote,
      ...local,
      targetCountries: Array.from(new Set([...(remote.targetCountries ?? []), ...(local.targetCountries ?? [])])).sort(),
      industryPreferences: mergeByName(remote.industryPreferences ?? [], local.industryPreferences ?? []),
      boardUseCases: Array.from(new Set([...(remote.boardUseCases ?? []), ...(local.boardUseCases ?? [])])),
      intentSources: Array.from(new Set([...(remote.intentSources ?? []), ...(local.intentSources ?? [])])),
      targetAccounts: mergeById(remote.targetAccounts ?? [], local.targetAccounts ?? []),
      relevanceTerms: Array.from(new Set([...(remote.relevanceTerms ?? []), ...(local.relevanceTerms ?? [])]))
    };
  }

  if ([SIGNAL_KEY, NEWS_KEY, NOTES_STORE_KEY, ACTIVITY_KEY, WATCHERS_KEY].includes(key)) {
    return mergeById((remoteValue as { id: string }[]) ?? [], (localValue as { id: string }[]) ?? []);
  }

  if ([STATUS_KEY, NOTES_KEY].includes(key)) {
    return {
      ...((remoteValue as Record<string, unknown>) ?? {}),
      ...((localValue as Record<string, unknown>) ?? {})
    };
  }

  return remoteValue;
}

export async function hydrateSharedStorage() {
  if (typeof window === "undefined" || !supabase) {
    ensureCurrentDataVersion();
    return;
  }

  hydratePromise ??= (async () => {
    ensureCurrentDataVersion();

    const { data, error } = await supabase.from("app_state").select("key,value").in("key", SHARED_STATE_KEYS);

    if (error) {
      console.warn("SignalScout shared state load failed", error.message);
      return;
    }

    const remoteKeys = new Set<string>();
    data?.forEach((row) => {
      remoteKeys.add(row.key);
      const localValue = readJson<unknown | null>(row.key, null);
      const mergedValue = mergeSharedValue(row.key, row.value, localValue);
      writeLocalJson(row.key, mergedValue);
      syncSharedState(row.key, mergedValue);
    });

    SHARED_STATE_KEYS.forEach((key) => {
      if (remoteKeys.has(key)) {
        return;
      }

      const raw = window.localStorage.getItem(key);
      if (raw) {
        try {
          syncSharedState(key, JSON.parse(raw));
        } catch {
          // Leave malformed local values alone; normal reads will fall back safely.
        }
      }
    });
  })();

  await hydratePromise;
}

function removePlaceholderSignals(signals: Signal[]) {
  return signals.filter((signal) => {
    try {
      return new URL(signal.source_url).hostname !== "example.com";
    } catch {
      return true;
    }
  });
}

function ensureCurrentDataVersion() {
  if (typeof window === "undefined") {
    return;
  }

  const dataVersion = readJson<string | null>(DATA_VERSION_KEY, null);
  if (dataVersion !== CURRENT_DATA_VERSION) {
    if (!window.localStorage.getItem(SIGNAL_KEY)) writeJson(SIGNAL_KEY, []);
    if (!window.localStorage.getItem(STATUS_KEY)) writeJson(STATUS_KEY, {});
    if (!window.localStorage.getItem(NOTES_KEY)) writeJson(NOTES_KEY, {});
    if (!window.localStorage.getItem(NEWS_KEY)) writeJson(NEWS_KEY, []);
    if (!window.localStorage.getItem(NOTES_STORE_KEY)) writeJson(NOTES_STORE_KEY, []);
    if (!window.localStorage.getItem(ACTIVITY_KEY)) writeJson(ACTIVITY_KEY, []);
    if (!window.localStorage.getItem(WATCHERS_KEY)) writeJson(WATCHERS_KEY, []);
    if (!window.localStorage.getItem(CURRENT_USER_KEY)) writeJson(CURRENT_USER_KEY, seedProfiles[0].id);
    if (!window.localStorage.getItem(SETTINGS_KEY)) writeJson(SETTINGS_KEY, defaultSettings);
    writeJson(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
  }
}

export function getSignals(): Signal[] {
  ensureCurrentDataVersion();

  const storedSignals = readJson<Signal[]>(SIGNAL_KEY, []);
  const customSignals = removePlaceholderSignals(storedSignals);
  if (customSignals.length !== storedSignals.length) {
    writeJson(SIGNAL_KEY, customSignals);
  }
  const statuses = readJson<Record<string, SignalStatus>>(STATUS_KEY, {});
  const notes = readJson<Record<string, string>>(NOTES_KEY, {});

  return [...seedSignals, ...customSignals]
    .map((signal) => ({
      ...signal,
      intent_source: signal.intent_source ?? "Public Signal",
      created_by_user_id: signal.created_by_user_id ?? seedProfiles[0].id,
      owner_user_id: signal.owner_user_id ?? signal.created_by_user_id ?? seedProfiles[0].id,
      assigned_to_user_id: signal.assigned_to_user_id ?? null,
      copied_to_internal_gpt: signal.copied_to_internal_gpt ?? false,
      copied_to_gong_flow: signal.copied_to_gong_flow ?? false,
      manually_added_to_crm: signal.manually_added_to_crm ?? false,
      status: statuses[signal.id] ?? signal.status,
      user_notes: notes[signal.id] ?? signal.user_notes
    }))
    .sort((a, b) => {
      if (b.opportunity_score !== a.opportunity_score) {
        return b.opportunity_score - a.opportunity_score;
      }

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
}

export function getSignal(signalId: string) {
  return getSignals().find((signal) => signal.id === signalId);
}

export function saveSignal(signal: Signal) {
  const customSignals = removePlaceholderSignals(readJson<Signal[]>(SIGNAL_KEY, []));
  writeJson(SIGNAL_KEY, [signal, ...customSignals.filter((item) => item.id !== signal.id)]);
  addActivity({
    event_type: "Signal created",
    company_id: signal.company_id,
    signal_id: signal.id,
    event_summary: `${getProfileName(signal.created_by_user_id ?? getCurrentUser().id)} created a signal for ${signal.company.name}.`
  });
}

export function updateSignalStatus(signalId: string, status: SignalStatus) {
  const statuses = readJson<Record<string, SignalStatus>>(STATUS_KEY, {});
  writeJson(STATUS_KEY, {
    ...statuses,
    [signalId]: status
  });
  addActivity({
    event_type: "Status changed",
    signal_id: signalId,
    event_summary: `${getProfileName(getCurrentUser().id)} changed signal status to ${status}.`
  });
}

export function updateSignalNotes(signalId: string, notes: string) {
  const noteOverrides = readJson<Record<string, string>>(NOTES_KEY, {});
  writeJson(NOTES_KEY, {
    ...noteOverrides,
    [signalId]: notes
  });
}

export function updateSignalFlags(signalId: string, flags: Partial<Pick<Signal, "copied_to_internal_gpt" | "copied_to_gong_flow" | "manually_added_to_crm" | "last_action_at">>) {
  const customSignals = readJson<Signal[]>(SIGNAL_KEY, []);
  writeJson(
    SIGNAL_KEY,
    customSignals.map((signal) => (signal.id === signalId ? { ...signal, ...flags } : signal))
  );
  const eventType = flags.copied_to_internal_gpt
    ? "Signal copied for internal GPT"
    : flags.copied_to_gong_flow
      ? "Gong Flow Started"
      : flags.manually_added_to_crm
        ? "Marked as added to CRM manually"
        : "Signal updated";
  addActivity({
    event_type: eventType,
    signal_id: signalId,
    event_summary: `${getProfileName(getCurrentUser().id)} updated signal workflow.`
  });
}

export function getCompanies(): Company[] {
  const customSignals = readJson<Signal[]>(SIGNAL_KEY, []);
  const customCompanies = customSignals.map((signal) => signal.company);
  const byId = new Map<string, Company>();

  [...seedCompanies, ...customCompanies].forEach((company) => {
    byId.set(company.id, {
      ...company,
      visibility: company.visibility ?? "Shared",
      status: company.status ?? "Not Reviewed",
      owner_user_id: company.owner_user_id ?? null,
      assigned_bdr_user_id: company.assigned_bdr_user_id ?? null,
      assigned_sales_user_id: company.assigned_sales_user_id ?? null
    });
  });

  return Array.from(byId.values());
}

export function getSettings(): AppSettings {
  ensureCurrentDataVersion();

  const stored = readJson<Partial<AppSettings>>(SETTINGS_KEY, {});
  const storedIndustryNames = new Set(stored.industryPreferences?.map((item) => item.name) ?? []);
  const mergedIndustryPreferences = [
    ...(stored.industryPreferences ?? []),
    ...defaultSettings.industryPreferences.filter((item) => !storedIndustryNames.has(item.name))
  ];

  return {
    targetCountries: stored.targetCountries ?? defaultSettings.targetCountries,
    industryPreferences: mergedIndustryPreferences,
    boardUseCases: stored.boardUseCases ?? defaultSettings.boardUseCases,
    intentSources: stored.intentSources ?? defaultSettings.intentSources,
    targetAccounts: stored.targetAccounts ?? defaultSettings.targetAccounts,
    relevanceTerms: stored.relevanceTerms ?? defaultSettings.relevanceTerms,
    autoAddThreshold: stored.autoAddThreshold ?? defaultSettings.autoAddThreshold
  };
}

export function saveSettings(settings: AppSettings) {
  writeJson(SETTINGS_KEY, settings);
}

export function getIndustryPriority(industry: string) {
  const match = getSettings().industryPreferences.find((item) => item.name === industry);
  return match?.enabled ? match.priority : "Monitor";
}

export function getNewsArticles(): NewsArticle[] {
  ensureCurrentDataVersion();

  return readJson<NewsArticle[]>(NEWS_KEY, [])
    .map((article) => ({
      ...article,
      intentSource: article.intentSource ?? "News"
    }))
    .sort((a, b) => {
    const aTime = new Date(a.publishedAt ?? a.foundAt).getTime();
    const bTime = new Date(b.publishedAt ?? b.foundAt).getTime();
    return bTime - aTime;
  });
}

export function saveNewsArticles(articles: NewsArticle[]) {
  const existing = getNewsArticles();
  const byId = new Map<string, NewsArticle>();

  [...articles, ...existing].forEach((article) => {
    byId.set(article.id, article);
  });

  writeJson(NEWS_KEY, Array.from(byId.values()).slice(0, 250));
}

export function clearNewsArticles() {
  writeJson(NEWS_KEY, []);
}

export function getProfiles(): Profile[] {
  ensureCurrentDataVersion();
  return seedProfiles;
}

export function getCurrentUser(): Profile {
  ensureCurrentDataVersion();
  const userId = readJson<string>(CURRENT_USER_KEY, seedProfiles[0].id);
  return seedProfiles.find((profile) => profile.id === userId) ?? seedProfiles[0];
}

export function setCurrentUser(userId: string) {
  writeJson(CURRENT_USER_KEY, userId);
}

export function getProfileName(userId?: string | null) {
  if (!userId) {
    return "Unassigned";
  }
  return seedProfiles.find((profile) => profile.id === userId)?.full_name ?? "Unknown user";
}

export function getNotes(filters: { companyId?: string; signalId?: string } = {}) {
  ensureCurrentDataVersion();
  return readJson<Note[]>(NOTES_STORE_KEY, [])
    .filter((note) => {
      const companyMatches = !filters.companyId || note.company_id === filters.companyId;
      const signalMatches = !filters.signalId || note.signal_id === filters.signalId;
      return companyMatches && signalMatches;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function addNote({ companyId, signalId, noteText }: { companyId?: string | null; signalId?: string | null; noteText: string }) {
  const now = new Date().toISOString();
  const note: Note = {
    id: `note-${Date.now()}`,
    company_id: companyId ?? null,
    signal_id: signalId ?? null,
    user_id: getCurrentUser().id,
    note_text: noteText,
    created_at: now,
    updated_at: now
  };
  writeJson(NOTES_STORE_KEY, [note, ...readJson<Note[]>(NOTES_STORE_KEY, [])]);
  addActivity({
    event_type: "Note added",
    company_id: companyId ?? null,
    signal_id: signalId ?? null,
    event_summary: `${getProfileName(note.user_id)} added a note.`
  });
  return note;
}

export function getActivity(filters: { companyId?: string; signalId?: string } = {}) {
  ensureCurrentDataVersion();
  return readJson<ActivityEvent[]>(ACTIVITY_KEY, [])
    .filter((event) => {
      const companyMatches = !filters.companyId || event.company_id === filters.companyId;
      const signalMatches = !filters.signalId || event.signal_id === filters.signalId;
      return companyMatches && signalMatches;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function addActivity(event: Omit<ActivityEvent, "id" | "user_id" | "created_at"> & { user_id?: string }) {
  const activity: ActivityEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    user_id: event.user_id ?? getCurrentUser().id,
    created_at: new Date().toISOString(),
    ...event
  };
  writeJson(ACTIVITY_KEY, [activity, ...readJson<ActivityEvent[]>(ACTIVITY_KEY, [])].slice(0, 250));
  return activity;
}

export function getWatchers(companyId?: string) {
  ensureCurrentDataVersion();
  return readJson<CompanyWatcher[]>(WATCHERS_KEY, []).filter((watcher) => !companyId || watcher.company_id === companyId);
}

export function isWatching(companyId: string, userId = getCurrentUser().id) {
  return getWatchers(companyId).some((watcher) => watcher.user_id === userId);
}

export function toggleCompanyWatch(companyId: string) {
  const currentUser = getCurrentUser();
  const watchers = readJson<CompanyWatcher[]>(WATCHERS_KEY, []);
  const existing = watchers.find((watcher) => watcher.company_id === companyId && watcher.user_id === currentUser.id);
  if (existing) {
    writeJson(WATCHERS_KEY, watchers.filter((watcher) => watcher.id !== existing.id));
    return false;
  }

  const watcher: CompanyWatcher = {
    id: `watch-${Date.now()}`,
    company_id: companyId,
    user_id: currentUser.id,
    created_at: new Date().toISOString()
  };
  writeJson(WATCHERS_KEY, [watcher, ...watchers]);
  addActivity({
    event_type: "Company watched",
    company_id: companyId,
    event_summary: `${currentUser.full_name} watched a company.`
  });
  return true;
}
