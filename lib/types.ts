export type SignalStatus =
  | "New"
  | "Reviewed"
  | "Worth Action"
  | "Assigned"
  | "Researching"
  | "Copied to Internal GPT"
  | "Gong Flow Started"
  | "Added to CRM Manually"
  | "Dismissed";

export type SignalType =
  | "Earnings Miss / Guidance Change"
  | "Inventory / Working Capital Issue"
  | "M&A / Acquisition / Divestment"
  | "Expansion / New Market / New Facility"
  | "Executive Change"
  | "Job Advertisement Signal"
  | "Supply Chain Disruption"
  | "Technology / Transformation Signal";

export type IntentSource =
  | "Public Signal"
  | "Job Ad"
  | "Company Announcement"
  | "Earnings / Filing"
  | "News"
  | "Review Site"
  | "Procurement / Tender"
  | "Partner / Analyst Intent"
  | "Manual Intent Note";

export type Company = {
  id: string;
  name: string;
  country: string;
  industry: string;
  website?: string | null;
  owner_user_id?: string | null;
  assigned_bdr_user_id?: string | null;
  assigned_sales_user_id?: string | null;
  visibility?: "Shared" | "Private";
  priority?: string | null;
  status?: CompanyStatus;
  last_reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type CompanyStatus =
  | "Not Reviewed"
  | "Watching"
  | "Researching"
  | "Active Pursuit"
  | "Added to CRM Manually"
  | "Dormant"
  | "Dismissed";

export type Signal = {
  id: string;
  company_id: string;
  company: Company;
  source_url: string;
  source_title: string;
  source_date?: string | null;
  intent_source: IntentSource;
  signal_type: SignalType;
  summary: string;
  why_it_matters: string;
  possible_business_pain: string;
  board_use_case: string;
  opportunity_score: number;
  suggested_discovery_question: string;
  recommended_play_name: string;
  recommended_play_reason: string;
  suggested_manual_research_steps: string;
  suggested_next_action: string;
  copyable_internal_gpt_briefing: string;
  suggested_linkedin_comment: string;
  suggested_connection_note: string;
  suggested_first_message: string;
  status: SignalStatus;
  created_by_user_id?: string | null;
  owner_user_id?: string | null;
  assigned_to_user_id?: string | null;
  play_id?: string | null;
  copied_to_internal_gpt?: boolean;
  copied_to_gong_flow?: boolean;
  manually_added_to_crm?: boolean;
  last_action_at?: string | null;
  user_notes?: string | null;
  associated_labels?: string[];
  matched_terms?: string[];
  created_at: string;
  updated_at: string;
};

export type SignalInput = {
  sourceUrl: string;
  companyName: string;
  country: string;
  industry: string;
  notes?: string;
};

export type ClassificationResult = Pick<
  Signal,
  | "signal_type"
  | "summary"
  | "why_it_matters"
  | "possible_business_pain"
  | "board_use_case"
  | "opportunity_score"
  | "suggested_discovery_question"
  | "recommended_play_name"
  | "recommended_play_reason"
  | "suggested_manual_research_steps"
  | "suggested_next_action"
  | "copyable_internal_gpt_briefing"
  | "suggested_linkedin_comment"
  | "suggested_connection_note"
  | "suggested_first_message"
> & {
  source_title: string;
  source_date?: string | null;
};

export type IndustryPreference = {
  name: string;
  enabled: boolean;
  priority: "Top pick" | "Secondary" | "Monitor";
};

export type TargetAccount = {
  id: string;
  name: string;
  country: string;
  industry: string;
  website?: string;
  notes?: string;
};

export type UserRole = "Admin" | "Sales Rep" | "BDR" | "Viewer";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  team?: string | null;
  created_at: string;
  updated_at: string;
};

export type SalesPlay = {
  id: string;
  play_name: string;
  play_category: string;
  description: string;
  trigger_signals: string[];
  likely_business_pain: string;
  relevant_board_use_case: string;
  suggested_discovery_question: string;
  suggested_next_action: string;
  created_at: string;
  updated_at: string;
};

export type Note = {
  id: string;
  company_id?: string | null;
  signal_id?: string | null;
  user_id: string;
  note_text: string;
  created_at: string;
  updated_at: string;
};

export type ActivityEvent = {
  id: string;
  event_type: string;
  company_id?: string | null;
  signal_id?: string | null;
  user_id: string;
  event_summary: string;
  created_at: string;
};

export type CompanyWatcher = {
  id: string;
  company_id: string;
  user_id: string;
  created_at: string;
};

export type AppSettings = {
  targetCountries: string[];
  industryPreferences: IndustryPreference[];
  boardUseCases: string[];
  intentSources: IntentSource[];
  targetAccounts: TargetAccount[];
  relevanceTerms: string[];
  autoAddThreshold: number;
};

export type NewsArticle = {
  id: string;
  accountId: string;
  accountName: string;
  title: string;
  url: string;
  source: string;
  intentSource: IntentSource;
  publishedAt?: string | null;
  snippet?: string;
  relevanceScore?: number;
  matchedTerms?: string[];
  autoAddedSignalId?: string;
  foundAt: string;
};

export type DiscoveryArticle = NewsArticle & {
  inferredCompanyName: string;
  inferredCountry: string;
  inferredIndustry: string;
  inferredWebsite?: string;
  revenueSignal?: string;
};
