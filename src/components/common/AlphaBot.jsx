import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../store/AppContext";
import { useRates } from "../../store/RatesContext";
import { getUserTier } from "../../utils/helpers";
import { GEMINI_API_KEY, GEMINI_ENDPOINT, LOAN_PRODUCTS } from "../../utils/constants";

// ══════════════════════════════════════════════════════════════════════════════
// HARDCODED KNOWLEDGE BASE — comprehensive banking FAQ + product data
// Used when Gemini API is unavailable or key is placeholder
// ══════════════════════════════════════════════════════════════════════════════
const KB = {
  // ── Greetings ──────────────────────────────────────────────────────────────
  greet: (name) => `Hello **${name}**! 👋 I'm AlphaBot, your 24/7 AI banking assistant.\n\nI can help you with:\n- 💰 Account balance & transactions\n- 🏦 Loans, EMI calculations\n- 💱 Live currency exchange rates\n- 🎁 Rewards & cashback\n- 💳 Cards & UPI\n- 🔒 Security & account management\n- 📊 Investments & SIP\n- 🧾 Bills & services\n\nWhat can I help you with today?`,

  // ── Balance ────────────────────────────────────────────────────────────────
  balance: (bal, tier) => `Your current **Alpha Pay** balance is:\n\n## ₹${bal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}\n\nTier: ${tier.icon} **${tier.name}**\n\n**Quick actions:**\n- To add money → Request a deposit from Dashboard\n- To send money → Go to Transfer tab\n- To view history → Dashboard → Transactions`,

  // ── Transfer / UPI ─────────────────────────────────────────────────────────
  transfer: `**How to send money on Alpha Pay:**\n\n1. Go to the **Transfer** tab\n2. Enter the recipient's username (e.g. \`john\`)\n3. Select transfer mode:\n   - ⚡ **IMPS** — Instant, 24/7, free, up to ₹5L\n   - 📅 **NEFT** — Batched, free, 2–4 hours, up to ₹10L\n   - 🏦 **RTGS** — High value, ₹25 fee, 30 min, up to ₹50L\n4. Enter amount\n5. Authenticate with your **6-digit UPI PIN**\n\n💡 **Earn 0.5% cashback** on every transfer!`,

  upi: (upiId) => `**Your UPI Details:**\n\n- UPI ID: \`${upiId}\`\n- All Alpha Pay users can pay/receive via their username@alpha ID\n- You can share this with anyone to receive instant payments\n\n**UPI PIN:**\n- Required for all outgoing transfers\n- Set/change from **Settings → Security**\n- 6-digit encrypted PIN\n\n**Tip:** Never share your UPI PIN with anyone — not even Alpha Bank staff! 🔒`,

  // ── Loans ──────────────────────────────────────────────────────────────────
  loans: `**Alpha Bank Loan Products:**\n\n| Product | Rate | Max Amount | Tenure |\n|---|---|---|---|\n| 👤 Personal Loan | 10.5% p.a. | ₹5,00,000 | 60 months |\n| 🪙 Gold Loan | 8.5% p.a. | ₹10,00,000 | 24 months |\n| 🏠 Home Loan | 8.35% p.a. | ₹50,00,000 | 360 months |\n| 🎓 Education Loan | 9.5% p.a. | ₹3,00,000 | 180 months |\n| 💼 Business Loan | 11% p.a. | ₹8,00,000 | 84 months |\n| 🚗 Vehicle Loan | 9% p.a. | ₹4,00,000 | 84 months |\n\n**Apply:** Go to **Loans** tab → Select product → Submit application\n\n⏳ Admin reviews and approves within 24 hours. Funds credited directly to your wallet.`,

  emi: (p, r, n) => {
    const rate = r / 100 / 12;
    const emi  = rate > 0 ? (p * rate * Math.pow(1+rate,n)) / (Math.pow(1+rate,n)-1) : p/n;
    const total = emi * n;
    const interest = total - p;
    return `**EMI Calculation:**\n\n- Principal: ₹${p.toLocaleString("en-IN")}\n- Rate: ${r}% p.a.\n- Tenure: ${n} months\n\n## Monthly EMI: ₹${Math.round(emi).toLocaleString("en-IN")}\n\n- Total Payable: ₹${Math.round(total).toLocaleString("en-IN")}\n- Total Interest: ₹${Math.round(interest).toLocaleString("en-IN")}\n- Interest to Principal: ${((interest/p)*100).toFixed(1)}%`;
  },

  // ── Deposits ───────────────────────────────────────────────────────────────
  deposit: `**How to add money to your Alpha Pay wallet:**\n\n1. Go to **Dashboard** → Click **Add Money**\n2. Select payment method:\n   - 📲 UPI\n   - 🌐 Net Banking\n   - 🏦 NEFT/RTGS\n3. Enter the amount (minimum ₹100)\n4. Submit your deposit request\n\n⏳ Admin will review and credit your account within **24 hours**.\n\nYou'll receive a **notification** once credited. Check your balance on the Dashboard.`,

  // ── Rewards ────────────────────────────────────────────────────────────────
  rewards: (cashback, tier, txCount) => `**Your Rewards Summary:**\n\n- Total Cashback Earned: **₹${cashback.toFixed(2)}**\n- Current Tier: **${tier.icon} ${tier.name}**\n- Total Transactions: **${txCount}**\n\n**How to earn more:**\n- 💸 Transfers → **0.5% cashback** on every send\n- 🧾 Bill payments → **1% cashback**\n- 📈 SIP investments → Special rewards\n- 🃏 Scratch cards → Open in Rewards tab\n\n**Tier Benefits:**\n- 🥉 Bronze (0–9 txns): Basic rewards\n- 🥈 Silver (10–19 txns): Priority support\n- 🥇 Gold (20–49 txns): Enhanced cashback\n- 💎 Platinum (50+ txns): Premium benefits`,

  // ── FD & RD ────────────────────────────────────────────────────────────────
  fd: `**Fixed Deposit (FD) Rates:**\n\n| Tenure | Rate p.a. |\n|---|---|\n| 3 months | 4.75% |\n| 6 months | 5.50% |\n| 1 year | 7.00% |\n| 2 years | 7.10% |\n| 3 years | 7.25% |\n| 5 years | 7.20% |\n| 10 years (Tax Saver) | 7.00% |\n\n- Senior citizens get an **additional 0.50%**\n- Premature closure: **1% penalty** on applicable rate\n- Tax Saver FD: Tax deduction u/s **80C**\n\n**Apply:** SIP tab → FD & RD`,

  rd: `**Recurring Deposit (RD):**\n\n- Interest rate: **7.00% p.a.**\n- Minimum monthly instalment: **₹1,000**\n- Tenures: 3 months to 10 years\n- Quarterly compounding\n\n**Benefits:**\n- Builds savings discipline\n- Guaranteed returns\n- No market risk\n\n**Apply:** SIP tab → FD & RD`,

  // ── SIP / Investments ──────────────────────────────────────────────────────
  sip: `**SIP (Systematic Investment Plan):**\n\n Available investment plans:\n\n- 📈 **Alpha Growth Fund** — 12–15% p.a. · Medium risk · Min ₹500/mo\n- 🔒 **Alpha Secure FD** — 7.25% p.a. · Low risk · Min ₹10,000\n- 📊 **Alpha Index Fund** — 13–18% p.a. · Medium risk · Min ₹5,000\n- 💧 **Alpha Liquid Fund** — 6–7% p.a. · Low risk · Min ₹1,000/mo\n- 🛡️ **Alpha ELSS Fund** — 14–18% p.a. · High risk · Tax saving u/s 80C\n\n**Go to:** SIP tab → Invest Now or Calculator`,

  // ── KYC ───────────────────────────────────────────────────────────────────
  kyc: `**KYC (Know Your Customer) Verification:**\n\n**Required documents:**\n1. 🪪 Aadhaar Card (12-digit number)\n2. 🗂️ PAN Card (10-character number)\n3. 🤳 Selfie (liveness check)\n\n**Benefits of completing KYC:**\n- ✅ Higher transfer limits\n- ✅ Loan eligibility\n- ✅ Full banking features\n- ✅ RBI compliance\n\n**Complete KYC:** Services tab → KYC`,

  // ── Security ──────────────────────────────────────────────────────────────
  security: `**Account Security — Best Practices:**\n\n**✅ Always do:**\n- Use a strong password (8+ chars, uppercase, number)\n- Set your **UPI PIN** before transferring\n- Log out after using on shared devices\n- Enable privacy mode if on public device\n\n**❌ Never do:**\n- Share OTP, UPI PIN, or password with anyone\n- Not even Alpha Bank staff will ask for these!\n- Click links in suspicious emails/SMS claiming to be Alpha Bank\n- Use banking apps on rooted/jailbroken devices\n\n**If suspicious activity detected:**\n📞 **1800-123-4567** (24/7 Fraud Helpline)\n📧 **fraud@alphabank.in**`,

  // ── Password reset ─────────────────────────────────────────────────────────
  password: `**Change your login password:**\n\n1. Go to **Settings** tab\n2. Scroll to **Change Login Password**\n3. Enter new password *(min 8 chars, 1 uppercase, 1 number)*\n4. Click **Change Password**\n\n**Reset UPI PIN:**\n1. Settings → Security\n2. Click **Change PIN** or **Set UPI PIN**\n3. Enter your 6-digit PIN twice to confirm\n\n🔒 Both are stored as one-way SHA-256 hashes — we cannot read them.`,

  // ── Services / Bills ──────────────────────────────────────────────────────
  bills: `**Pay Bills & Recharges:**\n\nGo to **Services** tab to pay:\n- ⚡ Electricity (MSEB, BESCOM, TNEB, WBSEDCL)\n- 📱 Mobile Recharge (Jio, Airtel, Vi, BSNL)\n- 📺 DTH/Cable (Tata Play, Airtel DTH, DishTV)\n- 🔥 Piped Gas (MGL, IGL, GAIL)\n- 💧 Water bills\n- 🌐 Broadband (BSNL, Airtel, Jio Fiber, ACT)\n- 💳 Credit Card payments\n- 🛣️ FASTag recharge\n\n💡 **Earn 1% cashback** on all bill payments!`,

  scheduled: `**Scheduled/Auto Payments:**\n\nSet up recurring payments for:\n- Monthly electricity, gas, water bills\n- Mobile recharges\n- Credit card payments\n- Any recurring expense\n\n**How to set up:**\nServices tab → Auto-Pay → Add Schedule\n- Choose the category, amount, and day of month\n- Toggle on/off anytime\n- Never miss a bill payment again!`,

  // ── Wallet ────────────────────────────────────────────────────────────────
  wallet: (rates) => `**Multi-Currency Wallet:**\n\nYou can hold and convert between:\n- 🇮🇳 **INR** (Indian Rupee) — Primary wallet\n- 🇺🇸 **USD** → ₹${rates.USD.toFixed(2)} today\n- 🇪🇺 **EUR** → ₹${rates.EUR.toFixed(2)} today\n- 🇬🇧 **GBP** → ₹${rates.GBP.toFixed(2)} today\n\n**Convert currencies:**\nWallet tab → Exchange\n\n**View Insights:**\nWallet tab → Insights (monthly spending charts)`,

  // ── Credit Score ──────────────────────────────────────────────────────────
  credit: (txCount, bal) => {
    const score = Math.min(900, 650 + Math.min(txCount * 3, 60) + (bal > 10000 ? 30 : 0) + 80);
    const label = score >= 750 ? "Excellent 🟢" : score >= 700 ? "Good 🔵" : "Fair 🟡";
    return `**Your Estimated Credit Score:**\n\n## ${score}/900 — ${label}\n\n**Score ranges:**\n- 750–900: Excellent (best loan rates)\n- 700–749: Good\n- 650–699: Fair\n- 550–649: Average\n- 300–549: Poor\n\n**Improve your score:**\n- ✅ Make more transactions\n- ✅ Pay loans/EMIs on time\n- ✅ Maintain higher balance\n- ✅ Complete KYC verification\n\nView in **Settings** tab.`;
  },

  // ── Insurance ─────────────────────────────────────────────────────────────
  insurance: `**Alpha Bank Insurance Products:**\n\n- ❤️ **Life Insurance** — From ₹299/month · Up to ₹5 Crore\n- 🏥 **Health Insurance** — Up to ₹1 Crore · 10,000+ hospitals\n- 🚗 **Motor Insurance** — Third party & comprehensive\n- 🏠 **Home Insurance** — Structure & contents cover\n- ✈️ **Travel Insurance** — Single trip & annual plans\n- 💼 **Business Insurance** — Shopkeeper, office, marine\n\n**Apply:** Submit a request from the **Insurance** page.\nAdmin will review and activate your policy within 24 hours.`,

  // ── Account details ────────────────────────────────────────────────────────
  accountDetails: (user) => `**Your Account Details:**\n\n- Account Number: \`${user.accountNumber || "N/A"}\`\n- IFSC Code: \`${user.ifscCode || "N/A"}\`\n- UPI ID: \`${user.upiId || user.username + "@alpha"}\`\n- Account Type: Savings\n- Bank: Alpha Bank, ${user.joinDate ? "since " + user.joinDate : ""}\n- Branch: Financial District, Hyderabad\n\n💡 Use your Account Number + IFSC for NEFT/RTGS transfers from other banks.`,

  // ── About Alpha Bank ──────────────────────────────────────────────────────
  about: `**About Alpha Bank:**\n\n- 🏦 Founded: 1975, Hyderabad\n- 🏛️ Type: RBI-regulated private commercial bank\n- 👥 Customers: 2M+ across India\n- 🏢 Branches: 500+, ATMs: 2,000+\n- 🤖 AI-powered digital banking since 2024\n\n**Regulatory credentials:**\n- ✅ RBI License (Banking Regulation Act 1949)\n- ✅ DICGC Insured (up to ₹5 Lakhs per depositor)\n- ✅ ISO 27001 Certified\n- ✅ PCI-DSS Compliant\n- ✅ DPDP Act 2023 Compliant\n\n**Contact:**\n📞 1800-123-4567 (24/7)\n📧 support@alphabank.in\n📍 Alpha Tower, Financial District, Hyderabad`,

  // ── Charges & fees ─────────────────────────────────────────────────────────
  charges: `**Alpha Bank Service Charges:**\n\n| Service | Charge |\n|---|---|\n| IMPS Transfer | Free |\n| NEFT Transfer | Free |\n| RTGS Transfer | ₹25–₹50 |\n| ATM (Alpha ATMs) | Free |\n| ATM (Other banks, >5/mo) | ₹21 + GST |\n| Debit Card Annual | ₹200 + GST |\n| Statement Download | Free |\n| Cheque Book (25 leaves) | Free (1/quarter) |\n\n**Interest Rates:**\n- Savings Account: 3.5–6% p.a.\n- FD: up to 7.25% p.a.\n- Home Loan: from 8.35% p.a.\n- Personal Loan: from 10.5% p.a.`,
};

// ══════════════════════════════════════════════════════════════════════════════
// INTENT CLASSIFIER — maps message → KB function
// ══════════════════════════════════════════════════════════════════════════════
function classifyIntent(msg) {
  const m = msg.toLowerCase();
  // EMI calculator intent — extract numbers
  const emiMatch = m.match(/(?:emi|calculate|loan).+?(\d[\d,]*)\s*(?:lakhs?|lakh|l|₹)?\s*(?:at|@)?\s*(\d+(?:\.\d+)?)\s*%?\s*(?:for|over)?\s*(\d+)\s*(?:months?|years?)?/);
  if (emiMatch) {
    let [,p,r,n] = emiMatch;
    p = parseFloat(p.replace(/,/g,""));
    if (m.includes("lakh") || m.includes("l")) p *= 100000;
    r = parseFloat(r);
    n = parseInt(n);
    if (m.includes("year")) n *= 12;
    if (p > 0 && r > 0 && n > 0) return { type: "emi", p, r, n };
  }
  if (/(hi|hello|hey|namaste|hlo|good morn|good eve|good after|good night|what can you|how can you|who are you|what are you)/.test(m)) return { type: "greet" };
  if (/(balance|how much|my money|funds|wallet amount|check balance)/.test(m))                          return { type: "balance" };
  if (/(send|transfer|pay someone|pay to|upi transfer|imps|neft|rtgs)/.test(m) && !/(bill|electric|gas|mobile recharge|broadband|fasttag|dth)/.test(m)) return { type: "transfer" };
  if (/(upi id|upi pin|qr code|receive money|scan|upi setup)/.test(m))                                  return { type: "upi" };
  if (/(loan|borrow|credit|emi|personal loan|gold loan|home loan|education loan|vehicle loan|business loan)/.test(m) && !/(pay emi|emi due)/.test(m)) return { type: "loans" };
  if (/(add money|deposit|fund|top up|add fund|add cash|how to add)/.test(m))                            return { type: "deposit" };
  if (/(reward|cashback|scratch|points|tier|bonus|earn more)/.test(m))                                  return { type: "rewards" };
  if (/(fd|fixed deposit|recurring deposit|rd|maturity|interest rate.*deposit)/.test(m) && !/(loan)/.test(m)) return { type: m.includes("rd") || m.includes("recurring") ? "rd" : "fd" };
  if (/(sip|mutual fund|invest|portfolio|index fund|elss|lumpsum|swp)/.test(m))                         return { type: "sip" };
  if (/(kyc|aadhaar|pan card|verification|verify account|identity)/.test(m))                            return { type: "kyc" };
  if (/(security|fraud|scam|safe|hack|phish|suspicious|protect|otp fraud)/.test(m))                    return { type: "security" };
  if (/(password|pin|reset|forgot|change pass|update pass|login issue)/.test(m))                       return { type: "password" };
  if (/(bill|electricity|mobile recharge|dth|gas bill|water bill|broadband|credit card bill|fasttag)/.test(m)) return { type: "bills" };
  if (/(auto pay|scheduled|recurring pay|standing order|autopay)/.test(m))                              return { type: "scheduled" };
  if (/(wallet|currency|usd|eur|gbp|forex|exchange rate|convert|foreign)/.test(m))                     return { type: "wallet" };
  if (/(credit score|cibil|experian|score|creditworthiness)/.test(m))                                  return { type: "credit" };
  if (/(insurance|life insurance|health insurance|motor|car insurance|home insur|travel insurance)/.test(m)) return { type: "insurance" };
  if (/(account number|ifsc|sort code|account detail|my account)/.test(m))                              return { type: "account" };
  if (/(about|alpha bank|history|founded|rbi|headquarters|hyderabad|branch count)/.test(m))            return { type: "about" };
  if (/(charge|fee|charges|free transfer|cost|pricing|service charge)/.test(m))                        return { type: "charges" };
  return { type: "unknown" };
}
function parseAction(msg) {
  const m = msg.toLowerCase();
  const openIntent = /(open|go to|show me|navigate|take me|take me to|bring me|show|lead me)/.test(m);
  if (!openIntent) return null;

  const routes = [
    { regex: /(transfer|send money|beneficiary|beneficiaries|upi)/, path: "/app/transfer", label: "Transfer page" },
    { regex: /(deposit|add money|top up|fund|request deposit|add cash)/, path: "/app/services?tab=deposit", label: "Deposit page" },
    { regex: /(bill|recharge|payments|pay bills|auto-pay|auto pay|scheduled)/, path: "/app/services", label: "Services page" },
    { regex: /(kyc|aadhaar|pan|verification|verify account)/, path: "/app/services?tab=kyc", label: "KYC page" },
    { regex: /(goal|goals|savings goal|savings)/, path: "/app/sip", label: "Goals page" },
    { regex: /(budget|budgets|spending limit|budget tracker)/, path: "/app/dashboard", label: "Dashboard budgets" },
    { regex: /(statement|export|download csv|export csv|transaction export)/, path: "/app/dashboard", label: "Dashboard statement" },
    { regex: /(rewards|cashback|scratch)/, path: "/app/rewards", label: "Rewards page" },
    { regex: /(wallet|currency|exchange|forex)/, path: "/app/wallet", label: "Wallet page" },
    { regex: /(settings|security|upi pin|username|password)/, path: "/app/settings", label: "Settings page" },
  ];

  return routes.find((item) => item.regex.test(m)) || null;
}
// ══════════════════════════════════════════════════════════════════════════════
// FALLBACK — get response from KB based on intent
// ══════════════════════════════════════════════════════════════════════════════
function getKBResponse(msg, user, rates) {
  const intent  = classifyIntent(msg);
  const txCount = (user?.tx || []).length;
  const tier    = getUserTier(txCount);
  const bal     = user?.balance || 0;
  const name    = user?.displayName || user?.username || "there";

  switch (intent.type) {
    case "emi":     return KB.emi(intent.p, intent.r, intent.n);
    case "greet":   return KB.greet(name);
    case "balance": return KB.balance(bal, tier);
    case "transfer":return KB.transfer;
    case "upi":     return KB.upi(user?.upiId || (user?.username + "@alpha"));
    case "loans":   return KB.loans;
    case "deposit": return KB.deposit;
    case "rewards": return KB.rewards(user?.rewards?.cashback || 0, tier, txCount);
    case "fd":      return KB.fd;
    case "rd":      return KB.rd;
    case "sip":     return KB.sip;
    case "kyc":     return KB.kyc;
    case "security":return KB.security;
    case "password":return KB.password;
    case "bills":   return KB.bills;
    case "scheduled":return KB.scheduled;
    case "wallet":  return KB.wallet(rates);
    case "credit":  return KB.credit(txCount, bal);
    case "insurance":return KB.insurance;
    case "account": return KB.accountDetails(user || {});
    case "about":   return KB.about;
    case "charges": return KB.charges;
    default:
      return `I can help you with banking questions! Try asking about:\n\n- *"What's my balance?"*\n- *"How do I send money?"*\n- *"Calculate EMI for ₹2,00,000 at 10.5% for 24 months"*\n- *"Show me loan options"*\n- *"What are today's forex rates?"*\n- *"How do I pay bills?"*\n- *"What is my credit score?"*\n\nOr call us 24/7 at **1800-123-4567** 📞`;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// MARKDOWN RENDERER
// ══════════════════════════════════════════════════════════════════════════════
function renderMD(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    // Restore intentional HTML tags we add ourselves
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, '<code class="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
    .replace(/^## (.+)$/gm,  '<p class="font-black text-base mt-3 mb-1 text-slate-800 dark:text-white">$1</p>')
    .replace(/^### (.+)$/gm, '<p class="font-bold text-sm mt-2 mb-1 text-slate-700 dark:text-slate-200">$1</p>')
    .replace(/^\| (.+) \|$/gm, (line) => {
      if (line.includes("---")) return "";
      const cells = line.split("|").filter(Boolean).map((c) => `<td class="px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-600">${c.trim()}</td>`).join("");
      return `<tr>${cells}</tr>`;
    })
    .replace(/(<tr>[\s\S]+?<\/tr>)+/g, (t) => `<table class="w-full border-collapse my-2 text-xs">${t}</table>`)
    .replace(/^- (.+)$/gm, '<div class="flex gap-2 items-start my-0.5"><span class="text-amber-500 font-bold mt-0.5 flex-none text-sm">•</span><span>$1</span></div>')
    .replace(/^\d+\. (.+)$/gm, '<div class="flex gap-2 items-start my-0.5"><span class="text-amber-500 font-bold mt-0.5 flex-none text-sm">›</span><span>$1</span></div>')
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n(?!<)/g, "<br/>");
}

// ══════════════════════════════════════════════════════════════════════════════
// GEMINI API CALL
// ══════════════════════════════════════════════════════════════════════════════
const buildSystemPrompt = (user, rates) => {
  const txCount = (user?.tx || []).length;
  const tier    = getUserTier(txCount);
  return `You are AlphaBot, the expert AI banking assistant for Alpha Bank — a full-service RBI-regulated private bank headquartered in Hyderabad, Telangana, India. Founded 1975. 2M+ customers, 500+ branches.

CUSTOMER CONTEXT:
- Name: ${user?.displayName || user?.username || "Guest"}
- Balance: ₹${(user?.balance || 0).toLocaleString("en-IN")}
- UPI ID: ${user?.upiId || (user?.username?.toLowerCase() + "@alpha")}
- Account: ${user?.accountNumber || "N/A"}, IFSC: ${user?.ifscCode || "N/A"}
- Tier: ${tier.name} ${tier.icon} | Transactions: ${txCount}
- Cashback Earned: ₹${(user?.rewards?.cashback || 0).toFixed(2)}
- KYC: ${user?.kyc?.status || "pending"}

LIVE FOREX (INR): USD ₹${rates?.USD?.toFixed(2)}, EUR ₹${rates?.EUR?.toFixed(2)}, GBP ₹${rates?.GBP?.toFixed(2)}

PRODUCTS:
- Savings: 3.5–6% p.a. | FD: up to 7.25% p.a. | RD: 7.00% p.a.
- Loans: Personal 10.5% (max ₹5L), Gold 8.5% (max ₹10L), Home 8.35% (max ₹50L), Education 9.5% (max ₹3L), Business 11% (max ₹8L), Vehicle 9% (max ₹4L)
- Loan Process: User applies → Admin reviews → Approved within 24h → Funds credited
- Deposits: User requests → Admin approves within 24h → Balance credited
- Cashback: 0.5% on transfers, 1% on bill payments
- Insurance: Life, Health, Motor, Home, Travel, Business — submit request to admin

SERVICES: Bill payments (Electricity, Mobile, DTH, Gas, Water, Broadband, Credit Card, FASTag) | Scheduled/Auto-pay | KYC (Aadhaar+PAN+Selfie)
TRANSFERS: IMPS (instant, free, ≤₹5L) | NEFT (2-4h, free, ≤₹10L) | RTGS (30min, ₹25 fee, high value)
SECURITY: UPI PIN required for all transfers. SHA-256 hashed. 30-min session expiry.
SUPPORT: 1800-123-4567 (24/7) | support@alphabank.in | fraud@alphabank.in

INSTRUCTIONS:
- Respond in Markdown: use **bold**, bullet points, tables where helpful
- Be warm, professional, and concise (under 200 words unless calculation needed)
- For EMI queries, show the calculation clearly with monthly EMI, total payable, total interest
- Never ask for passwords, OTP, or PINs
- If you cannot help, refer to 1800-123-4567`;
};

// ══════════════════════════════════════════════════════════════════════════════
// DEMO MODE - Set to false when you have a valid Gemini API key
// To enable real Gemini:
// 1. Get a working API key from https://aistudio.google.com/app/apikey
// 2. Ensure Generative Language API is enabled in Google Cloud Console
// 3. Add the key to .env as VITE_GEMINI_API_KEY
// 4. Change DEMO_MODE to false below
// 5. Run: npm run dev
// ══════════════════════════════════════════════════════════════════════════════
const DEMO_MODE = true;

async function generateDemoResponse(userMsg, user, rates) {
  // Simulate Gemini with contextual banking responses
  const msg = userMsg.toLowerCase();
  
  const demoResponses = {
    greet: ["**Hello!** 👋 I'm AlphaBot, your AI banking assistant. How can I help you today? You can ask me about account balance, transfers, loans, investments, and more!", 
            "**Hi there!** Welcome to AlphaBank. I'm here to assist with all your banking needs. What would you like to know?"],
    balance: [`Your current balance is **₹${Math.floor(Math.random() * 50000) + 10000}**. This includes your savings and investment accounts.`,
              `You have **₹${Math.floor(Math.random() * 75000) + 15000}** across all accounts.`],
    transfer: [`To transfer funds, go to **Wallet → Transfer** in the app. You can transfer to any bank account using NEFT, IMPS, or UPI. Standard charges apply.`,
               `**Quick transfer steps:**\n1. Open Wallet\n2. Click Transfer\n3. Enter recipient details\n4. Confirm with UPI PIN\nTransfers are instant for UPI!`],
    loan: [`We offer personal loans from **₹1,00,000 to ₹50,00,000** at competitive rates. Interest rates start from **7.5% p.a.** Apply instantly in the app!`,
           `**Our Loan Products:**\n- **Personal Loan:** ₹1L - ₹50L (7.5% - 12% p.a.)\n- **Business Loan:** ₹2L - ₹1Cr (8% - 13% p.a.)\n- **Auto Loan:** Up to vehicle value (6.5% - 10% p.a.)`],
    rewards: [`You currently have **${Math.floor(Math.random() * 5000) + 500} AlphaPoints**! Redeem them for cashback, vouchers, or investments.`,
              `Earn **1 AlphaPoint per ₹100** spent. You have **${Math.floor(Math.random() * 8000) + 1000} points** available.`],
    security: [`Your account is secured with **256-bit encryption** and multi-factor authentication. Never share your UPI PIN or OTP.`,
               `**Security tips:**\n1. Enable 2FA\n2. Use a strong password\n3. Never share OTP/PIN\n4. Verify sender in transfers`],
    charges: [`AlphaBank charges **₹0** for most transactions! NEFT/IMPS: ₹2.50 per transfer. Monthly maintenance: ₹0 for savings.`,
              `**Our Fee Structure:**\n- Account Maintenance: FREE\n- UPI Transfers: FREE\n- NEFT/IMPS: ₹2.50\n- Card Issuance: FREE`],
  };
  
  // Match keywords and return response
  for (const [key, responses] of Object.entries(demoResponses)) {
    if (msg.includes(key) || msg.includes(key === "balance" ? "balance" : key)) {
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }
  
  // Default response
  return `I'd be happy to help! Could you clarify what you need? You can ask about:\n- **Account Balance** - Check your funds\n- **Transfer** - Send money\n- **Loans** - Get financing\n- **Rewards** - Redeem points\n- **Security** - Protection info\n- **Charges** - Fee details`;
}

async function callGemini(userMsg, history, user, rates) {
  // Use demo mode if API key is not valid
  if (DEMO_MODE) {
    return await generateDemoResponse(userMsg, user, rates);
  }
  
  const key = GEMINI_API_KEY;
  const isPlaceholder = !key || key.includes("XXXX") || key === "YOUR_GEMINI_API_KEY_HERE";
  if (isPlaceholder) return null;

  try {
    const prompt = `${buildSystemPrompt(user, rates)}\n\n${userMsg}`;
    const res = await fetch(`${GEMINI_ENDPOINT}?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: { text: prompt },
        maxOutputTokens: 600,
        temperature: 0.7,
        topP: 0.9,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text =
      data?.candidates?.[0]?.output ||
      data?.output ||
      data?.candidates?.[0]?.content?.[0]?.text ||
      data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || null;
  } catch {
    return null;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// QUICK SUGGESTION CHIPS
// ══════════════════════════════════════════════════════════════════════════════
const SUGGESTIONS = [
  "What's my balance?",
  "How to send money?",
  "Open Transfer page",
  "Show my goals",
  "Open KYC page",
  "Request a deposit",
  "Export my statement",
  "Live forex rates",
];

// ══════════════════════════════════════════════════════════════════════════════
// COPY BUTTON
// ══════════════════════════════════════════════════════════════════════════════
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    const plain = text.replace(/<[^>]*>/g, "").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">");
    navigator.clipboard?.writeText(plain).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  };
  return (
    <button onClick={copy}
      className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-slate-400 hover:text-amber-500 flex items-center gap-1 mt-1">
      <i className={`fas ${copied ? "fa-check text-green-500" : "fa-copy"}`} />
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function AlphaBot() {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const liveRates       = useRates();

  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState("");
  const [typing,   setTyping]   = useState(false);
  const [showSugg, setShowSugg] = useState(true);
  const bottomRef   = useRef(null);
  const textareaRef = useRef(null);

  const isGeminiActive = DEMO_MODE || (!!GEMINI_API_KEY && !GEMINI_API_KEY.includes("XXXX") && GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY_HERE");

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);
  useEffect(() => { if (open) setTimeout(() => textareaRef.current?.focus(), 150); }, [open]);

  const handleInput = (e) => {
    setInput(e.target.value);
    const el = textareaRef.current;
    if (el) { el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 120) + "px"; }
  };

  const send = useCallback(async (overrideMsg) => {
    const msg = (overrideMsg ?? input).trim();
    if (!msg || typing) return;
    setInput(""); setShowSugg(false);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const userMsgObj = { role: "user", content: msg, rawContent: msg };
    setMessages((prev) => [...prev, userMsgObj]);
    setTyping(true);

    // Simulate realistic thinking delay
    await new Promise((r) => setTimeout(r, 300 + Math.random() * 500));

    // Try Gemini first; fall back to KB
    let rawReply = null;
    if (isGeminiActive) {
      rawReply = await callGemini(msg, messages, currentUser, liveRates);
    }
    if (!rawReply) {
      rawReply = getKBResponse(msg, currentUser, liveRates);
    }

    const action = parseAction(msg);
    if (action && action.path) {
      navigate(action.path);
      rawReply += `\n\n✅ I opened the **${action.label}** for you.`;
    }

    const rendered = renderMD(rawReply);
    setTyping(false);
    setMessages((prev) => [...prev, { role: "assistant", content: rendered, rawContent: rawReply }]);
  }, [input, typing, messages, isGeminiActive, currentUser, liveRates, navigate]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const clearChat = () => { setMessages([]); setShowSugg(true); };

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
      {open && (
        <div className="mb-4 bg-white dark:bg-slate-900 rounded-3xl flex flex-col overflow-hidden"
          style={{ width: "min(420px,calc(100vw - 24px))", height: "min(640px,calc(100vh - 100px))", boxShadow: "0 32px 80px rgba(0,0,0,0.22),0 0 0 1px rgba(0,0,0,0.06)" }}>

          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-yellow-400 px-5 py-4 flex items-center justify-between flex-none">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 bg-slate-900/20 rounded-2xl flex items-center justify-center">
                <i className="fas fa-robot text-slate-900 text-lg" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-yellow-400 rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900">AlphaBot</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isGeminiActive ? "bg-slate-900/20 text-slate-900" : "bg-slate-900/10 text-slate-800"}`}>
                    {isGeminiActive ? "✦ Gemini AI" : "Smart AI"}
                  </span>
                </div>
                <p className="text-xs text-slate-900/60 font-medium">Always available · Banking expert</p>
              </div>
            </div>
            <div className="flex gap-1">
              {messages.length > 0 && (
                <button onClick={clearChat} title="Clear chat"
                  className="w-8 h-8 bg-slate-900/10 hover:bg-slate-900/20 rounded-xl flex items-center justify-center text-slate-900/70 transition">
                  <i className="fas fa-trash-alt text-xs" />
                </button>
              )}
              <button onClick={() => setOpen(false)}
                className="w-8 h-8 bg-slate-900/10 hover:bg-slate-900/20 rounded-xl flex items-center justify-center text-slate-900/70 transition">
                <i className="fas fa-times text-sm" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/60 dark:bg-slate-900/60">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-6">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-300 rounded-3xl flex items-center justify-center shadow-lg shadow-amber-200">
                  <i className="fas fa-robot text-slate-900 text-2xl" />
                </div>
                <div>
                  <p className="font-black text-slate-800 dark:text-white text-lg">Hi, I'm AlphaBot!</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {isGeminiActive ? "Powered by Google Gemini AI" : "Your smart banking assistant"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Ask me anything about your account</p>
                </div>
              </div>
            )}

            {/* Suggestion chips */}
            {showSugg && messages.length === 0 && (
              <div className="grid grid-cols-2 gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)}
                    className="text-left text-xs font-semibold px-3 py-2.5 bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-slate-200 dark:border-slate-700 hover:border-amber-300 text-slate-700 dark:text-slate-300 rounded-2xl transition-all leading-tight">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Chat messages */}
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 chat-bubble-in ${m.role === "user" ? "justify-end" : "justify-start"} group`}>
                {m.role === "assistant" && (
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-300 rounded-xl flex items-center justify-center flex-none self-start mt-0.5 shadow-sm">
                    <i className="fas fa-robot text-slate-900 text-xs" />
                  </div>
                )}
                <div className={`flex flex-col max-w-[82%] ${m.role === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-gradient-to-br from-amber-500 to-yellow-400 text-slate-900 rounded-tr-sm font-medium shadow-md shadow-amber-200"
                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-sm border border-slate-100 dark:border-slate-700 shadow-sm"
                    }`}
                    dangerouslySetInnerHTML={{ __html: m.role === "user" ? m.rawContent || m.content : m.content }}
                  />
                  {m.role === "assistant" && <CopyButton text={m.content} />}
                </div>
                {m.role === "user" && (
                  <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center flex-none self-start mt-0.5 shadow-sm">
                    <span className="text-slate-900 text-xs font-black">
                      {currentUser?.username?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex gap-3 items-start chat-bubble-in">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-300 rounded-xl flex items-center justify-center flex-none shadow-sm">
                  <i className="fas fa-robot text-slate-900 text-xs" />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3.5 flex gap-1.5 items-center shadow-sm">
                  <span className="typing-dot w-2 h-2 bg-amber-400 rounded-full" />
                  <span className="typing-dot w-2 h-2 bg-amber-400 rounded-full" />
                  <span className="typing-dot w-2 h-2 bg-amber-400 rounded-full" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="flex-none bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-3">
            <div className={`flex items-end gap-2 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 transition-colors px-4 py-2 ${input ? "border-amber-400" : "border-slate-200 dark:border-slate-700"}`}>
              <textarea
                ref={textareaRef} value={input} onChange={handleInput} onKeyDown={handleKeyDown}
                placeholder="Ask AlphaBot anything…" rows={1} disabled={typing}
                className="flex-1 bg-transparent text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none resize-none leading-relaxed disabled:opacity-50"
                style={{ maxHeight: "120px", minHeight: "24px" }}
              />
              <button onClick={() => send()} disabled={!input.trim() || typing}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-none mb-0.5 ${
                  input.trim() && !typing
                    ? "bg-gradient-to-br from-amber-500 to-yellow-400 text-slate-900 shadow-md active:scale-95"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                }`}>
                <i className="fas fa-paper-plane text-xs" />
              </button>
            </div>
            <p className="text-center text-[10px] text-slate-400 mt-1.5">Enter to send · Shift+Enter for new line</p>
          </div>
        </div>
      )}

      {/* FAB button */}
      <button onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 bg-gradient-to-br from-amber-500 to-yellow-400 text-slate-900 rounded-2xl flex items-center justify-center text-xl transition-all active:scale-95 relative"
        style={{ animation: "pulseRing 2.5s infinite", boxShadow: "0 8px 24px rgba(245,158,11,0.5)" }}
        title="AlphaBot — AI Banking Assistant">
        <i className={`fas ${open ? "fa-times" : "fa-robot"} transition-transform`} />
        {!open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full flex items-center justify-center">
            <span className="text-[8px] font-black text-white">AI</span>
          </span>
        )}
      </button>
    </div>
  );
}
