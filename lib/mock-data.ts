import type { Company, Signal } from "@/lib/types";

const now = "2026-06-30T09:00:00.000Z";

export const companies: Company[] = [
  { id: "co-panasonic", name: "Panasonic", country: "Japan", industry: "Manufacturing", website: "https://holdings.panasonic/global/", created_at: now, updated_at: now },
  { id: "co-shimano", name: "Shimano", country: "Japan", industry: "Manufacturing", website: "https://www.shimano.com", created_at: now, updated_at: now },
  { id: "co-infineon", name: "Infineon", country: "Germany", industry: "Manufacturing", website: "https://www.infineon.com", created_at: now, updated_at: now },
  { id: "co-casco", name: "Casco", country: "Germany", industry: "Manufacturing", website: "https://www.cascoauto.com", created_at: now, updated_at: now },
  { id: "co-yokogawa", name: "Yokogawa", country: "Japan", industry: "Manufacturing", website: "https://www.yokogawa.com", created_at: now, updated_at: now },
  { id: "co-kemet", name: "KEMET", country: "United States", industry: "Manufacturing", website: "https://www.kemet.com", created_at: now, updated_at: now },
  { id: "co-tdk", name: "TDK", country: "Japan", industry: "Manufacturing", website: "https://www.tdk.com", created_at: now, updated_at: now },
  { id: "co-valeo", name: "Valeo", country: "France", industry: "Manufacturing", website: "https://www.valeo.com", created_at: now, updated_at: now },
  { id: "co-flex", name: "Flex", country: "Singapore", industry: "Manufacturing", website: "https://flex.com", created_at: now, updated_at: now },
  { id: "co-ge-oil-gas", name: "GE Oil & Gas", country: "United States", industry: "Extractive industries", website: "https://www.bakerhughes.com", created_at: now, updated_at: now },
  { id: "co-csl", name: "CSL", country: "Australia", industry: "Manufacturing", website: "https://www.csl.com", created_at: now, updated_at: now },
  { id: "co-ansell", name: "Ansell", country: "Australia", industry: "Manufacturing", website: "https://www.ansell.com", created_at: now, updated_at: now },
  { id: "co-cochlear", name: "Cochlear", country: "Australia", industry: "Manufacturing", website: "https://www.cochlear.com", created_at: now, updated_at: now },
  { id: "co-breville-group", name: "Breville Group", country: "Australia", industry: "Manufacturing", website: "https://www.brevillegroup.com", created_at: now, updated_at: now },
  { id: "co-austal", name: "Austal", country: "Australia", industry: "Manufacturing", website: "https://www.austal.com", created_at: now, updated_at: now },
  { id: "co-bluescope", name: "BlueScope", country: "Australia", industry: "Manufacturing", website: "https://www.bluescope.com", created_at: now, updated_at: now },
  { id: "co-orica", name: "Orica", country: "Australia", industry: "Extractive industries", website: "https://www.orica.com", created_at: now, updated_at: now },
  { id: "co-nufarm", name: "Nufarm", country: "Australia", industry: "Manufacturing", website: "https://www.nufarm.com", created_at: now, updated_at: now },
  { id: "co-codan", name: "Codan", country: "Australia", industry: "Manufacturing", website: "https://www.codan.com.au", created_at: now, updated_at: now },
  { id: "co-gpc-electronics", name: "GPC Electronics", country: "Australia", industry: "Manufacturing", website: "https://www.gpcelectronics.com.au", created_at: now, updated_at: now },
  { id: "co-redarc-electronics", name: "REDARC Electronics", country: "Australia", industry: "Manufacturing", website: "https://www.redarcelectronics.com", created_at: now, updated_at: now }
];

export const companyNotes: Record<string, string> = {
  "co-panasonic": "Global HQ: Kadoma, Osaka, Japan. Panasonic Holdings Corporation global HQ.",
  "co-shimano": "Global HQ: Sakai, Osaka, Japan. Shimano Inc. HQ.",
  "co-infineon": "Global HQ: Neubiberg, Germany. Infineon Technologies AG HQ.",
  "co-casco": "Global HQ: Frankfurt, Germany. Casco Products HQ; parent Amphenol is HQ'd in Wallingford, Connecticut, USA.",
  "co-yokogawa": "Global HQ: Musashino, Tokyo, Japan. Yokogawa Electric Corporation HQ.",
  "co-kemet": "Global HQ: Fort Lauderdale, Florida, USA. KEMET HQ; parent YAGEO Group is HQ'd in New Taipei City, Taiwan.",
  "co-tdk": "Global HQ: Chuo-ku, Tokyo, Japan. TDK Corporation HQ.",
  "co-valeo": "Global HQ: Paris, France. Valeo SE HQ at 100 Rue de Courcelles, Paris.",
  "co-flex": "Global HQ: Singapore / Austin, Texas, USA. Legal domicile and Singapore HQ; principal executive offices in Austin.",
  "co-ge-oil-gas": "Global HQ: Houston, Texas, USA. Now largely under Baker Hughes.",
  "co-csl": "Priority 1. Melbourne HQ. US$15.6b FY2025 revenue. Global biopharma manufacturing, regulatory compliance, inventory, capacity and plant-cost planning.",
  "co-ansell": "Priority 2. Melbourne HQ. Approx. US$2.0b FY2025 revenue. Offshore-heavy manufacturing footprint across Malaysia, Sri Lanka, Thailand, Brazil, China, Lithuania, Portugal, Vietnam and India.",
  "co-cochlear": "Priority 3. Sydney HQ. A$2.356b FY2025 sales revenue. Advanced medical device manufacturing with global operations.",
  "co-breville-group": "Priority 4. Sydney HQ. A$1.7b FY2025 revenue. Outsourced/offshore appliance manufacturing, with diversification into Mexico and Southeast Asia including Indonesia.",
  "co-austal": "Priority 5. Henderson, WA HQ. A$1.823b FY2025 revenue. Shipyards in Australia, USA, Philippines and Vietnam.",
  "co-bluescope": "Priority 6. Melbourne HQ. A$16.4b FY2025 revenue. Manufacturing, rollforming and distribution across Australia, North America, Asia, New Zealand and Pacific.",
  "co-orica": "Priority 7. Melbourne HQ. Global explosives, blasting systems and specialty chemicals manufacturing; strong mining, inventory, logistics and regulatory complexity.",
  "co-nufarm": "Priority 8. Melbourne HQ. Crop protection manufacturing and commercial operations across Australia/NZ, Asia, Europe and North America.",
  "co-codan": "Priority 9. Adelaide HQ. A$674.2m FY2025 revenue. Advanced electronics, communications and metal detection with global sales.",
  "co-gpc-electronics": "Priority 10. Sydney HQ. Contract electronics manufacturer with production facilities in Australia, New Zealand and China.",
  "co-redarc-electronics": "Priority 11. Lonsdale, SA HQ. Advanced electronics manufacturer across defence, automotive, power electronics and space."
};

export const seedSignals: Signal[] = [];
