// ─── Gemini AI — key read from Vite env, never exposed to UI ─────────────────
export const GEMINI_API_KEY  = import.meta.env.VITE_GEMINI_API_KEY || "YOUR_GEMINI_API_KEY_HERE";
export const GEMINI_MODEL    = "gemini-1.5-flash";
export const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta2/models/${GEMINI_MODEL}:generateText`;

// ─── Storage keys ─────────────────────────────────────────────────────────────
export const DB_KEY           = "alpha_users_v3";
export const REQUESTS_DB_KEY  = "alpha_requests_v1";
export const SESSION_KEY      = "alpha_session_v3";
export const SESSION_DURATION_MS = 30 * 60 * 1000;

// ─── Security ─────────────────────────────────────────────────────────────────
export const PASSWORD_PEPPER = "AlphaBank@2024#SecurePepper!";

// ─── Admin superuser credentials ─────────────────────────────────────────────
// Admin logs in ONLY at /admin/login — completely separate from user login
export const ADMIN_USERNAME = "alphabank_admin";
export const ADMIN_PASSWORD = "Admin@Alpha2024";

// ─── Bank address ─────────────────────────────────────────────────────────────
export const BANK_ADDRESS = {
  line1: "Alpha Tower, Financial District",
  line2: "Nanakramguda, Hyderabad — 500032",
  state: "Telangana, India",
  phone: "1800-123-4567",
  email: "support@alphabank.in",
  city:  "Hyderabad",
};

// ─── Request types & statuses ─────────────────────────────────────────────────
export const REQUEST_TYPES  = { LOAN: "loan", DEPOSIT: "deposit", INSURANCE: "insurance" };
export const REQUEST_STATUS = { PENDING: "pending", APPROVED: "approved", REJECTED: "rejected" };

// ─── Live rates baseline (INR) ────────────────────────────────────────────────
export const LIVE_RATES_BASE = { USD: 90.73, EUR: 106.93, GBP: 122.29 };

// ─── Loan products — realistic RBI-aligned limits ────────────────────────────
export const LOAN_PRODUCTS = [
  { id:"loan-personal",  name:"Personal Loan",  icon:"👤", rate:"10.5", max:"₹5,00,000",   maxAmt:500000,  minAmt:10000,  tenure:"60",  color:"from-amber-500 to-amber-700",  desc:"No collateral. Flexible repayment up to 60 months."       },
  { id:"loan-gold",      name:"Gold Loan",       icon:"🪙", rate:"8.5",  max:"₹10,00,000",  maxAmt:1000000, minAmt:10000,  tenure:"24",  color:"from-yellow-500 to-amber-600", desc:"Loan against gold jewellery. Same-day disbursal."          },
  { id:"loan-home",      name:"Home Loan",       icon:"🏠", rate:"8.35", max:"₹50,00,000",  maxAmt:5000000, minAmt:200000, tenure:"360", color:"from-blue-500 to-blue-700",   desc:"Up to 90% of property value. 30-year tenure."             },
  { id:"loan-education", name:"Education Loan",  icon:"🎓", rate:"9.5",  max:"₹3,00,000",   maxAmt:300000,  minAmt:10000,  tenure:"180", color:"from-green-500 to-green-700",  desc:"Moratorium during course + 1 year. Tax benefit u/s 80E."  },
  { id:"loan-business",  name:"Business Loan",   icon:"💼", rate:"11",   max:"₹8,00,000",   maxAmt:800000,  minAmt:25000,  tenure:"84",  color:"from-orange-500 to-orange-700",desc:"Working capital & term loan. GST-based eligibility."       },
  { id:"loan-vehicle",   name:"Vehicle Loan",    icon:"🚗", rate:"9",    max:"₹4,00,000",   maxAmt:400000,  minAmt:25000,  tenure:"84",  color:"from-cyan-500 to-cyan-700",   desc:"Up to 100% on-road price for new vehicles."               },
];

// ─── App navigation ───────────────────────────────────────────────────────────
export const NAV_ITEMS = [
  { id:"dashboard", icon:"fa-th-large",        label:"Overview",  path:"/app/dashboard" },
  { id:"transfer",  icon:"fa-paper-plane",      label:"Transfer",  path:"/app/transfer"  },
  { id:"wallet",    icon:"fa-globe",            label:"Wallet",    path:"/app/wallet"    },
  { id:"services",  icon:"fa-bolt",             label:"Services",  path:"/app/services"  },
  { id:"loans",     icon:"fa-hand-holding-usd", label:"Loans",     path:"/app/loans"     },
  { id:"sip",       icon:"fa-chart-pie",        label:"SIP",       path:"/app/sip"       },
  { id:"rewards",   icon:"fa-gift",             label:"Rewards",   path:"/app/rewards"   },
  { id:"settings",  icon:"fa-cog",              label:"Settings",  path:"/app/settings"  },
];

export const PAGE_TITLES = {
  dashboard:"Overview", transfer:"Send Money", wallet:"Multi-Currency Wallet",
  services:"Services & Bills", loans:"Loans", sip:"SIP & Investments",
  rewards:"Rewards", settings:"Settings",
};

export const ADMIN_NAV = [
  { id:"dashboard", icon:"fa-tachometer-alt", label:"Dashboard", path:"/admin/dashboard" },
  { id:"requests",  icon:"fa-inbox",           label:"Requests",  path:"/admin/requests"  },
  { id:"users",     icon:"fa-users",           label:"All Users", path:"/admin/users"     },
  { id:"broadcast", icon:"fa-bullhorn",        label:"Broadcast", path:"/admin/broadcast" },
];
