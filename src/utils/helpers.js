// ─── Formatting ──────────────────────────────────────────────────────────────
const toSafeNumber = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export const fmt = (v) =>
  "₹" + toSafeNumber(v).toLocaleString("en-IN", { maximumFractionDigits: 0 });

export const fmtFull = (v) =>
  "₹" + toSafeNumber(v).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const currencySymbol = (c) => ({ INR: "₹", USD: "$", EUR: "€", GBP: "£" }[c] || "₹");

// ─── Finance ─────────────────────────────────────────────────────────────────
export const calculateEMI = (principal, ratePercent, months) => {
  principal = toSafeNumber(principal);
  ratePercent = toSafeNumber(ratePercent);
  months = parseInt(months, 10);
  if (principal <= 0 || !Number.isFinite(months) || months <= 0) return 0;
  const r = ratePercent / 12 / 100;
  if (r === 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
};

// ─── Category detection ───────────────────────────────────────────────────────
export const getCategoryFromDesc = (desc) => {
  const d = (desc || "").toLowerCase();
  if (/(sent to|received from|transfer)/.test(d))
    return { key: "transfer", label: "Transfer", icon: "fa-exchange-alt", cls: "bg-amber-100 text-amber-700" };
  if (/(mobile|recharge|dth|fasttag)/.test(d))
    return { key: "recharge", label: "Recharge", icon: "fa-mobile-alt", cls: "bg-orange-100 text-orange-700" };
  if (/(electricity|gas|credit card|bill|paid:)/.test(d))
    return { key: "bills", label: "Bills", icon: "fa-file-invoice", cls: "bg-blue-100 text-blue-700" };
  if (/(deposit|balance|opening|wallet|scratch)/.test(d))
    return { key: "deposit", label: "Deposit", icon: "fa-piggy-bank", cls: "bg-green-100 text-green-700" };
  if (/(loan|emi|disbursed)/.test(d))
    return { key: "loan", label: "Loan", icon: "fa-hand-holding-usd", cls: "bg-red-100 text-red-700" };
  return { key: "other", label: "Other", icon: "fa-circle", cls: "bg-slate-100 text-slate-700" };
};

// ─── Tier system ─────────────────────────────────────────────────────────────
export const getUserTier = (txCount = 0) => {
  if (txCount >= 50) return { name: "Platinum", icon: "💎", next: null, txNeeded: 0 };
  if (txCount >= 20) return { name: "Gold",     icon: "🥇", next: "Platinum", txNeeded: 50 - txCount };
  if (txCount >= 10) return { name: "Silver",   icon: "🥈", next: "Gold",     txNeeded: 20 - txCount };
  return              { name: "Bronze",   icon: "🥉", next: "Silver",   txNeeded: 10 - txCount };
};

// ─── Confetti ────────────────────────────────────────────────────────────────
export const launchConfetti = () => {
  const colors = ["#4f46e5","#7c3aed","#06b6d4","#10b981","#f59e0b","#ec4899"];
  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      const p = document.createElement("div");
      p.style.cssText = `position:fixed;top:-10px;left:${Math.random()*100}vw;width:${4+Math.random()*6}px;height:${8+Math.random()*6}px;background:${colors[Math.floor(Math.random()*colors.length)]};border-radius:2px;animation:confettiFall ${1.5+Math.random()*2}s linear forwards;z-index:9999;pointer-events:none;`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 3000);
    }, i * 20);
  }
};
