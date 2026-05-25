import { useState, useMemo } from "react";
import { useApp } from "../../store/AppContext";
import { useRates } from "../../store/RatesContext";
import { validateAmount } from "../../utils/security";
import { fmt } from "../../utils/helpers";
import ErrorBoundary from "../../components/common/ErrorBoundary";

// ── Month-over-month spending bar chart (pure SVG, no library) ────────────────
function SpendingInsights({ tx }) {
  const monthData = useMemo(() => {
    const map = {};
    tx.filter((t) => t.type === "debit").forEach((t) => {
      // Try to parse date — handles "DD/MM/YYYY" and "M/D/YYYY"
      const parts = String(t.date || "").split("/");
      if (parts.length < 3) return;
      const key = `${parts[2]}-${parts[1]?.padStart(2,"0") || "01"}`;
      map[key] = (map[key] || 0) + (Number(t.amount) || 0);
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, total]) => {
        const [yr, mo] = key.split("-");
        const label = new Date(parseInt(yr), parseInt(mo) - 1).toLocaleString("en-IN", { month: "short" });
        return { label: `${label} '${yr.slice(2)}`, total };
      });
  }, [tx]);

  if (monthData.length < 2) return (
    <div className="text-center py-8 text-slate-400 text-sm">
      <i className="fas fa-chart-bar text-3xl mb-3 block opacity-40" />
      Make more transactions to see monthly insights
    </div>
  );

  const maxVal = Math.max(...monthData.map((m) => m.total), 1);

  return (
    <div>
      <div className="flex items-end gap-3 h-40">
        {monthData.map((m, i) => {
          const pct = (m.total / maxVal) * 100;
          const isLast = i === monthData.length - 1;
          return (
            <div key={m.label} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{fmt(m.total)}</span>
              <div className="w-full relative flex items-end" style={{ height: "80px" }}>
                <div
                  className={`w-full rounded-t-xl transition-all duration-1000 ${isLast ? "bg-gradient-to-t from-amber-500 to-yellow-400" : "bg-gradient-to-t from-slate-300 to-slate-200 dark:from-slate-600 dark:to-slate-500"}`}
                  style={{ height: `${Math.max(pct, 4)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 text-center">{m.label}</span>
            </div>
          );
        })}
      </div>
      {monthData.length >= 2 && (() => {
        const last = monthData[monthData.length - 1].total;
        const prev = monthData[monthData.length - 2].total;
        const diff = last - prev;
        const pct  = prev > 0 ? ((diff / prev) * 100).toFixed(0) : 0;
        return (
          <div className={`mt-4 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-2 ${diff > 0 ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" : "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"}`}>
            <i className={`fas ${diff > 0 ? "fa-arrow-up" : "fa-arrow-down"}`} />
            {Math.abs(pct)}% {diff > 0 ? "more" : "less"} spending vs last month ({diff > 0 ? "+" : ""}{fmt(Math.abs(diff))})
          </div>
        );
      })()}
    </div>
  );
}

// ── Category breakdown by month ───────────────────────────────────────────────
function CategoryBreakdown({ tx }) {
  const { getCategoryFromDesc } = { getCategoryFromDesc: (d) => {
    const lower = (d || "").toLowerCase();
    if (/(sent to|transfer)/.test(lower))  return { label: "Transfer",  color: "bg-amber-400" };
    if (/(electric|gas|credit|bill)/.test(lower)) return { label: "Bills",    color: "bg-blue-400"  };
    if (/(mobile|recharge|dth)/.test(lower))      return { label: "Recharge", color: "bg-orange-400"};
    if (/(loan|emi)/.test(lower))                 return { label: "Loans",    color: "bg-red-400"   };
    if (/(invest|sip|fd|rd)/.test(lower))         return { label: "Invest",   color: "bg-green-400" };
    return { label: "Other", color: "bg-slate-400" };
  }};

  const debits = tx.filter((t) => t.type === "debit");
  const total  = debits.reduce((s, t) => s + (Number(t.amount) || 0), 0);
  if (!total) return null;

  const cats = {};
  debits.forEach((t) => {
    const c = getCategoryFromDesc(t.desc);
    if (!cats[c.label]) cats[c.label] = { total: 0, color: c.color };
    cats[c.label].total += Number(t.amount) || 0;
  });

  return (
    <div className="space-y-3">
      {Object.entries(cats).sort((a, b) => b[1].total - a[1].total).map(([label, { total: amt, color }]) => {
        const pct = ((amt / total) * 100).toFixed(0);
        return (
          <div key={label}>
            <div className="flex justify-between text-xs mb-1.5">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                <span className="font-semibold text-slate-600 dark:text-slate-300">{label}</span>
              </div>
              <span className="font-bold text-slate-700 dark:text-slate-200">{fmt(amt)} <span className="text-slate-400 font-normal">{pct}%</span></span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400">Total spending</span>
        <span className="font-black text-slate-700 dark:text-white">{fmt(total)}</span>
      </div>
    </div>
  );
}

export default function Wallet() {
  const { currentUser, updateUser, addTransaction, showToast } = useApp();
  const liveRates = useRates();
  const [from,    setFrom]    = useState("INR");
  const [to,      setTo]      = useState("USD");
  const [amount,  setAmount]  = useState("");
  const [activeTab, setActiveTab] = useState("wallet");
  const wallets = currentUser?.wallets || { USD: 0, EUR: 0, GBP: 0 };
  const tx      = currentUser?.tx || [];

  const SYMS = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };

  const getPreview = () => {
    if (!amount || from === to) return "";
    const inr = from === "INR" ? parseFloat(amount) : parseFloat(amount) * liveRates[from];
    const out  = to === "INR" ? inr : inr / liveRates[to];
    return `${SYMS[from]}${parseFloat(amount).toLocaleString("en-IN")} ${from} = ${SYMS[to]}${out.toFixed(2)} ${to}`;
  };

  const convert = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || from === to) return showToast("Fill all fields & choose different currencies", "error");
    const avail = from === "INR" ? currentUser.balance : (wallets[from] || 0);
    if (amt > avail) return showToast(`Insufficient ${from} balance`, "error");

    const inr = from === "INR" ? amt : amt * liveRates[from];
    const out  = to === "INR" ? inr : inr / liveRates[to];
    const newWallets = { ...wallets };
    let newBalance = Number(currentUser.balance) || 0;

    if (from === "INR") newBalance -= amt;
    else newWallets[from] = Math.max(0, (newWallets[from] || 0) - amt);
    if (to === "INR")   newBalance += out;
    else newWallets[to] = (newWallets[to] || 0) + out;

    updateUser({ balance: newBalance, wallets: newWallets });
    addTransaction({ type: to === "INR" ? "credit" : "debit", desc: `Currency Exchange: ${amt} ${from} → ${out.toFixed(2)} ${to}`, amount: inr, category: "exchange" });
    showToast(`Converted! You now have ${out.toFixed(2)} ${to}`, "success");
    setAmount("");
  };

  const wallCards = [
    { key: "USD", sym: "$", color: "from-blue-600 to-blue-800",   icon: "fa-dollar-sign", flag: "🇺🇸" },
    { key: "EUR", sym: "€", color: "from-amber-500 to-amber-700", icon: "fa-euro-sign",   flag: "🇪🇺" },
    { key: "GBP", sym: "£", color: "from-red-600 to-red-800",     icon: "fa-pound-sign",  flag: "🇬🇧" },
  ];

  const TABS = [
    { id: "wallet",   label: "Wallets",   icon: "fa-globe"     },
    { id: "exchange", label: "Exchange",  icon: "fa-exchange-alt" },
    { id: "insights", label: "Insights",  icon: "fa-chart-bar" },
  ];

  return (
    <ErrorBoundary>
      <div className="page-fade-in space-y-6">

        {/* Tab bar */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-fit">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === t.id ? "bg-amber-500 text-slate-900 shadow-md" : "text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"}`}>
              <i className={`fas ${t.icon} text-xs`} />{t.label}
            </button>
          ))}
        </div>

        {/* ── WALLETS TAB ── */}
        {activeTab === "wallet" && (
          <>
            {/* INR wallet — big card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-7 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-1">🇮🇳 Indian Rupee (INR)</p>
                  <h2 className="text-4xl font-black">₹ {(currentUser?.balance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h2>
                  <p className="text-slate-400 text-xs mt-2 font-mono">{currentUser?.upiId || `${currentUser?.username?.toLowerCase()}@alpha`}</p>
                </div>
                <div className="bg-amber-400/20 rounded-2xl px-4 py-2 text-center">
                  <p className="text-amber-400 text-xs font-bold">Primary</p>
                  <p className="text-white font-black text-lg">INR</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {wallCards.map(({ key, sym, color, icon, flag }) => (
                <div key={key} className={`bg-gradient-to-br ${color} text-white p-6 rounded-2xl shadow-lg relative overflow-hidden`}>
                  <div className="absolute right-2 top-2 text-5xl opacity-15 pointer-events-none">
                    <i className={`fas ${icon}`} />
                  </div>
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-2xl">{flag}</span>
                    <span className="text-xs bg-white/20 rounded-full px-2 py-0.5 font-bold">{key}</span>
                  </div>
                  <p className="text-2xl font-black">{sym} {(wallets[key] || 0).toFixed(2)}</p>
                  <p className="text-xs text-white/60 mt-1">≈ ₹{((wallets[key] || 0) * liveRates[key]).toFixed(0)}</p>
                  <p className="text-[11px] text-white/50 mt-3 font-mono">1 {key} = ₹{liveRates[key].toFixed(2)}</p>
                  <button onClick={() => { setFrom("INR"); setTo(key); setActiveTab("exchange"); }}
                    className="mt-3 text-xs bg-white/20 hover:bg-white/30 transition px-3 py-1.5 rounded-lg font-bold">
                    <i className="fas fa-plus mr-1" />Add {key}
                  </button>
                </div>
              ))}
            </div>

            {/* Live rates strip */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Live Exchange Rates · Updated every 3s</p>
              <div className="grid grid-cols-3 gap-3">
                {wallCards.map(({ key, sym, flag }) => (
                  <div key={key} className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <p className="text-lg mb-1">{flag}</p>
                    <p className="text-xs text-slate-400 font-medium">{key}/INR</p>
                    <p className="font-black text-amber-500 text-lg">₹{liveRates[key]?.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── EXCHANGE TAB ── */}
        {activeTab === "exchange" && (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 max-w-lg">
            <h3 className="font-bold text-slate-800 dark:text-white text-xl mb-1">Currency Exchange</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Convert between INR, USD, EUR, GBP at live rates</p>

            <div className="space-y-4">
              <div className="flex gap-3 items-center">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1.5">From</label>
                  <select value={from} onChange={(e) => setFrom(e.target.value)}
                    className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none font-bold text-sm">
                    {["INR","USD","EUR","GBP"].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button onClick={() => { const tmp = from; setFrom(to); setTo(tmp); }}
                  className="mt-6 w-10 h-10 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full flex items-center justify-center hover:bg-amber-500 hover:text-slate-900 transition flex-none">
                  <i className="fas fa-exchange-alt" />
                </button>
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1.5">To</label>
                  <select value={to} onChange={(e) => setTo(e.target.value)}
                    className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none font-bold text-sm">
                    {["INR","USD","EUR","GBP"].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1.5">Amount ({from})</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
                  className="w-full p-4 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none font-bold text-xl text-amber-600 transition" />
              </div>

              {getPreview() && (
                <div className="text-sm font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 p-4 rounded-xl text-center">
                  {getPreview()}
                </div>
              )}

              <button onClick={convert}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 py-4 rounded-xl font-bold hover:opacity-90 transition shadow-lg active:scale-95">
                <i className="fas fa-exchange-alt mr-2" />Convert Now
              </button>
            </div>
          </div>
        )}

        {/* ── INSIGHTS TAB ── */}
        {activeTab === "insights" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 dark:text-white mb-1">Monthly Spending</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Last 6 months comparison</p>
              <SpendingInsights tx={tx} />
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 dark:text-white mb-1">Category Breakdown</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">All-time spending by category</p>
              <CategoryBreakdown tx={tx} />
            </div>

            {/* Summary stats */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 dark:text-white mb-4">Account Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  ["Total In",    fmt(tx.filter((t)=>t.type==="credit").reduce((s,t)=>s+(Number(t.amount)||0),0)), "text-green-600","fa-arrow-down"],
                  ["Total Out",   fmt(tx.filter((t)=>t.type==="debit" ).reduce((s,t)=>s+(Number(t.amount)||0),0)), "text-red-500","fa-arrow-up"   ],
                  ["Transactions",String(tx.length),                                                   "text-blue-600","fa-receipt"   ],
                  ["Avg Txn",     tx.length ? fmt(tx.reduce((s,t)=>s+(Number(t.amount)||0),0)/tx.length) : "₹0",   "text-amber-600","fa-chart-line"],
                ].map(([label, val, cls, icon]) => (
                  <div key={label} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <i className={`fas ${icon} text-xs text-slate-400`} />
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{label}</span>
                    </div>
                    <p className={`font-black text-xl ${cls}`}>{val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
