import type { IntentSource, Profile, SalesPlay, SignalStatus, SignalType } from "@/lib/types";

export const countries = [
  "Australia",
  "New Zealand",
  "Singapore",
  "Japan",
  "Germany",
  "France",
  "United States",
  "Saudi Arabia",
  "Malaysia",
  "Indonesia",
  "Thailand",
  "Vietnam",
  "Philippines"
];

export const industries = [
  "Manufacturing",
  "CPG",
  "FMCG",
  "Retail",
  "Extractive industries",
  "Distribution",
  "Logistics",
  "Financial services",
  "Large diversified groups"
];

export const statuses: SignalStatus[] = [
  "New",
  "Reviewed",
  "Worth Action",
  "Assigned",
  "Researching",
  "Copied to Internal GPT",
  "Gong Flow Started",
  "Added to CRM Manually",
  "Dismissed"
];

const seedTimestamp = "2026-07-01T09:00:00.000Z";

export const seedProfiles: Profile[] = [
  {
    id: "user-admin",
    full_name: "Admin",
    username: "Admin",
    password: "Admin",
    email: "admin@example.com",
    role: "Admin",
    team: "Global",
    created_at: seedTimestamp,
    updated_at: seedTimestamp
  },
  {
    id: "user-peter",
    full_name: "Peter",
    username: "Peter",
    password: "Peter",
    email: "peter@example.com",
    role: "BDR",
    team: "BDR",
    created_at: seedTimestamp,
    updated_at: seedTimestamp
  },
  {
    id: "user-jerome",
    full_name: "Jerome",
    username: "Jerome",
    password: "Jerome",
    email: "jerome@example.com",
    role: "Sales Rep",
    team: "Sales",
    created_at: seedTimestamp,
    updated_at: seedTimestamp
  },
  {
    id: "user-sanford",
    full_name: "Sanford",
    username: "Sanford",
    password: "Sanford",
    email: "sanford@example.com",
    role: "Sales Rep",
    team: "Sales",
    created_at: seedTimestamp,
    updated_at: seedTimestamp
  },
  {
    id: "user-jezreel",
    full_name: "Jezreel",
    username: "Jezreel",
    password: "Jezreel",
    email: "jezreel@example.com",
    role: "BDR",
    team: "BDR",
    created_at: seedTimestamp,
    updated_at: seedTimestamp
  },
  {
    id: "user-kristine",
    full_name: "Kristine",
    username: "Kristine",
    password: "Kristine",
    email: "kristine@example.com",
    role: "Sales Rep",
    team: "Sales",
    created_at: seedTimestamp,
    updated_at: seedTimestamp
  }
];

export const salesPlays: SalesPlay[] = [
  {
    id: "play-inventory-working-capital",
    play_name: "Inventory Growth / Working Capital Pressure",
    play_category: "Supply Chain Planning",
    description: "Use when public signals suggest inventory build, working-capital pressure, or demand-supply mismatch.",
    trigger_signals: ["Inventory / Working Capital Issue", "Supply Chain Disruption"],
    likely_business_pain: "Demand assumptions, inventory buffers, and working-capital targets may not be aligned.",
    relevant_board_use_case: "IBP / S&OP",
    suggested_discovery_question: "How are inventory and working-capital assumptions connected to your latest demand and supply plans?",
    suggested_next_action: "Research recent financial commentary, look for planning or supply-chain leaders, and prepare an account hypothesis.",
    created_at: seedTimestamp,
    updated_at: seedTimestamp
  },
  {
    id: "play-acquisition-group-complexity",
    play_name: "Acquisition / Group Complexity",
    play_category: "Group Reporting",
    description: "Use when acquisitions, divestments, or new subsidiaries create integration and reporting complexity.",
    trigger_signals: ["M&A / Acquisition / Divestment"],
    likely_business_pain: "New entities may be slow to integrate into consolidation, reporting, and forecast cycles.",
    relevant_board_use_case: "Group Consolidation & Reporting",
    suggested_discovery_question: "How quickly do acquired entities need to be incorporated into group reporting and planning?",
    suggested_next_action: "Research group structure, acquired entities, integration timing, and finance leadership.",
    created_at: seedTimestamp,
    updated_at: seedTimestamp
  },
  {
    id: "play-guidance-downgrade",
    play_name: "Profit Warning / Guidance Downgrade",
    play_category: "Enterprise Planning",
    description: "Use when public guidance, margin, or profit commentary changes materially.",
    trigger_signals: ["Earnings Miss / Guidance Change"],
    likely_business_pain: "Finance teams may need faster scenario planning and clearer drivers of forecast change.",
    relevant_board_use_case: "FP&A / Enterprise Planning",
    suggested_discovery_question: "How quickly can operating changes be reflected in forecast and margin scenarios?",
    suggested_next_action: "Research earnings commentary and identify finance leaders.",
    created_at: seedTimestamp,
    updated_at: seedTimestamp
  },
  {
    id: "play-finance-leadership-change",
    play_name: "New CFO / Finance Leadership Change",
    play_category: "Finance Transformation",
    description: "Use when finance leadership changes may create a mandate to improve planning, reporting, or performance management.",
    trigger_signals: ["Executive Change"],
    likely_business_pain: "New finance leaders often reassess planning cadence, reporting quality, and transformation priorities.",
    relevant_board_use_case: "Finance Transformation",
    suggested_discovery_question: "What planning or reporting priorities are likely to change under the new finance leadership?",
    suggested_next_action: "Research CFO mandate and recent company performance.",
    created_at: seedTimestamp,
    updated_at: seedTimestamp
  },
  {
    id: "play-expansion-capacity",
    play_name: "Expansion / New Facility / New Market",
    play_category: "Capacity Planning",
    description: "Use when new facilities, markets, or capacity changes create operational planning complexity.",
    trigger_signals: ["Expansion / New Market / New Facility"],
    likely_business_pain: "Growth plans may pressure workforce, capacity, supply-chain, and capital planning.",
    relevant_board_use_case: "Workforce / Capacity Planning",
    suggested_discovery_question: "How are expansion milestones connected to workforce, capacity, and supply plans?",
    suggested_next_action: "Research the expansion plan and operational leadership.",
    created_at: seedTimestamp,
    updated_at: seedTimestamp
  },
  {
    id: "play-planning-hiring",
    play_name: "S&OP / FP&A / Planning Hiring",
    play_category: "Planning Maturity",
    description: "Use when public hiring suggests capability-building around planning, S&OP, demand planning, or FP&A.",
    trigger_signals: ["Job Advertisement Signal", "Technology / Transformation Signal"],
    likely_business_pain: "The company may be addressing fragmented planning processes or manual forecast cycles.",
    relevant_board_use_case: "IBP / S&OP",
    suggested_discovery_question: "What planning-process improvement is the role or program expected to unlock?",
    suggested_next_action: "Review the job description and infer capability gaps.",
    created_at: seedTimestamp,
    updated_at: seedTimestamp
  }
];

export const boardUseCases = [
  "FP&A / Enterprise Planning",
  "IBP / S&OP",
  "Demand Forecasting / Foresight",
  "Group Consolidation & Reporting",
  "Supply Chain Planning",
  "Workforce / Capacity Planning",
  "Finance Transformation",
  "Performance Management"
];

export const scoringRules: Record<SignalType, number> = {
  "M&A / Acquisition / Divestment": 25,
  "Earnings Miss / Guidance Change": 25,
  "Inventory / Working Capital Issue": 20,
  "Supply Chain Disruption": 20,
  "Executive Change": 15,
  "Job Advertisement Signal": 15,
  "Expansion / New Market / New Facility": 15,
  "Technology / Transformation Signal": 15
};

export const signalTypes = Object.keys(scoringRules) as SignalType[];

export const intentSources: IntentSource[] = [
  "Public Signal",
  "Job Ad",
  "Company Announcement",
  "Earnings / Filing",
  "News",
  "Review Site",
  "Procurement / Tender",
  "Partner / Analyst Intent",
  "Manual Intent Note"
];

export const defaultRelevanceTerms = [
  "CFO",
  "office of finance",
  "finance transformation",
  "FP&A",
  "financial planning",
  "forecasting",
  "budgeting",
  "supply chain",
  "sales and operational planning",
  "S&OP",
  "demand planning",
  "demand forecasting",
  "macroeconomic intelligence",
  "integrated business planning",
  "IBP",
  "tactical planning",
  "procurement planning",
  "continuous planning",
  "market growth",
  "market trends",
  "market share",
  "capacity planning",
  "production planning",
  "inventory planning",
  "working capital",
  "margin pressure",
  "cost inflation",
  "raw material volatility",
  "commodity prices",
  "input costs",
  "supplier disruption",
  "logistics costs",
  "freight costs",
  "energy prices",
  "rubber prices",
  "coffee bean prices",
  "cocoa prices",
  "aluminium prices",
  "steel prices",
  "resin prices",
  "semiconductor shortage",
  "factory expansion",
  "new facility",
  "new plant",
  "capacity expansion",
  "regional expansion",
  "sales growth",
  "revenue growth",
  "order book",
  "backlog",
  "new contract",
  "customer demand",
  "price increases",
  "acquisition",
  "integration",
  "restructuring"
];
