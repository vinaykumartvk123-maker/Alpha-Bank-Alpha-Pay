import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../store/AppContext";
import { useRates } from "../../store/RatesContext";
import { getCategoryFromDesc, getUserTier, launchConfetti, fmt } from "../../utils/helpers";
import { createRequest, getUserRequests } from "../../utils/requests";
import { REQUEST_TYPES, REQUEST_STATUS } from "../../utils/constants";
import ErrorBoundary from "../../components/common/ErrorBoundary";

// ─── QR via Google Charts API (no extra npm) ─────────────────────────────────
function UpiQR({ upiId }) {
  const url = `https://chart.googleapis.com/chart?chs=160x160&cht=qr&chl=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=AlphaBank&cu=INR`)}&choe=UTF-8`;
  return (
    <img src={url} alt="UPI QR Code" width={120} height={120}
      className="rounded-2xl border-4 border-white shadow-md"
      onError={(e) => { e.target.style.display = "none"; }} />
  );
}

// ─── Spending chart ───────────────────────────────────────────────────────────
function SpendingChart({ tx }) {
  const debits = tx.filter((t) => t.type === "debit");
  if (!debits.length) return (
    <div className="text-center py-6 text-slate-400">
      <i className="fas fa-chart-pie text-2xl mb-2 opacity-50 block" />
      <p className="text-xs">No spending data yet</p>
    </div>
  );
  const cats = {};
  debits.forEach((t) => { const c = getCategoryFromDesc(t.desc); cats[c.label] = (cats[c.label] || 0) + (Number(t.amount) || 0); });
  const total = Object.values(cats).reduce((s, v) => s + v, 0);
  const colors = ["bg-amber-400", "bg-pink-500", "bg-blue-500", "bg-orange-500", "bg-teal-500", "bg-purple-500"];
  return (
    <div className="space-y-3">
      {Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([label, amt], i) => {
        const pct = ((amt / total) * 100).toFixed(0);
        return (
          <div key={label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-slate-600 dark:text-slate-300">{label}</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">{fmt(amt)} <span className="text-slate-400">{pct}%</span></span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className={`h-full ${colors[i % colors.length]} rounded-full transition-all duration-1000`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Budget Tracker ───────────────────────────────────────────────────────────
const BUDGET_CATS = ["Transfer", "Bills", "Recharge", "Loan", "Other"];

function BudgetTracker({ tx, budgets, onUpdateBudgets }) {
  const [editing, setEditing] = useState(null);
  const [tempVal, setTempVal] = useState("");
  const currentMonth = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const spent = {};
  tx.filter((t) => t.type === "debit").forEach((t) => {
    const cat = getCategoryFromDesc(t.desc).label;
    spent[cat] = (spent[cat] || 0) + (Number(t.amount) || 0);
  });

  const save = (cat) => {
    const v = parseFloat(tempVal);
    if (v > 0) onUpdateBudgets({ ...budgets, [cat]: v });
    setEditing(null); setTempVal("");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wide">🎯 Budget Tracker</h3>
        <span className="text-xs text-slate-400">{currentMonth}</span>
      </div>
      <div className="space-y-3">
        {BUDGET_CATS.map((cat) => {
          const budget = budgets?.[cat] || 0;
          const s = spent[cat] || 0;
          const pct = budget > 0 ? Math.min((s / budget) * 100, 100) : 0;
          const over = budget > 0 && s > budget;
          const warn = budget > 0 && pct >= 80 && !over;
          return (
            <div key={cat}>
              <div className="flex justify-between text-xs mb-1 items-center">
                <span className="font-medium text-slate-600 dark:text-slate-300">{cat}</span>
                <div className="flex items-center gap-2">
                  {over && <span className="text-[10px] font-bold text-red-500">Over budget!</span>}
                  {warn && <span className="text-[10px] font-bold text-amber-500">80% used</span>}
                  {editing === cat ? (
                    <div className="flex gap-1">
                      <input autoFocus type="number" value={tempVal} onChange={(e) => setTempVal(e.target.value)}
                        placeholder="Set budget" className="w-20 text-xs px-2 py-0.5 border border-amber-300 rounded-lg outline-none dark:bg-slate-700 dark:text-white" />
                      <button onClick={() => save(cat)} className="text-green-600 text-xs font-bold"><i className="fas fa-check" /></button>
                      <button onClick={() => setEditing(null)} className="text-red-400 text-xs"><i className="fas fa-times" /></button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditing(cat); setTempVal(budget || ""); }}
                      className="text-[10px] text-amber-500 hover:underline font-bold">
                      {budget > 0 ? `${fmt(s)} / ${fmt(budget)}` : "Set limit"}
                    </button>
                  )}
                </div>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${over ? "bg-red-500" : warn ? "bg-amber-400" : "bg-green-500"}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GoalsSummary({ goals }) {
  const totalTarget = goals.reduce((sum, goal) => sum + (Number(goal.target) || 0), 0);
  const totalSaved = goals.reduce((sum, goal) => sum + (Number(goal.saved) || 0), 0);
  const progress = totalTarget > 0 ? Math.min(Math.round((totalSaved / totalTarget) * 100), 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-white text-lg">Savings Goals</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Track your goals, progress, and monthly savings plan.</p>
        </div>
        <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 font-bold">{goals.length} goals</span>
      </div>
      {goals.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-700 rounded-3xl">
          <p className="font-bold text-slate-700 dark:text-slate-200 mb-2">No active goals yet</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Create a savings goal in the SIP tab to stay on track.</p>
          <Link to="/app/sip" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-900 font-bold text-sm hover:bg-amber-600 transition">
            <i className="fas fa-bullseye" /> Create Goal
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-3xl bg-slate-50 dark:bg-slate-900/60 p-4">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
              <span>Total progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div className="h-full bg-amber-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {goals.slice(0, 2).map((goal) => {
              const pct = goal.target ? Math.min(Math.round((goal.saved || 0) / goal.target * 100), 100) : 0;
              return (
                <div key={goal.id} className="bg-slate-50 dark:bg-slate-900/60 rounded-3xl p-4 border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-slate-800 dark:text-white text-sm">{goal.name}</p>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{pct}%</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Target ₹{fmt(goal.target)} · Saved ₹{fmt(goal.saved || 0)}</p>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-right">
            <Link to="/app/sip" className="text-xs font-bold text-amber-500 hover:underline">View all goals in SIP</Link>
          </div>
        </div>
      )}
    </div>
  );
}

function UpcomingBills({ bills }) {
  const items = bills?.length ? bills : [
    { label: "Electricity bill", amount: 1799, due: "26 May", status: "Due in 5 days" },
    { label: "Internet recharge", amount: 299, due: "28 May", status: "Due in 7 days" },
    { label: "Mobile postpaid", amount: 549, due: "30 May", status: "Due in 9 days" },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wide">Upcoming payments</h3>
        <span className="text-[11px] text-slate-500">Stay on track</span>
      </div>
      <div className="space-y-3">
        {items.slice(0, 3).map((bill) => (
          <div key={bill.label} className="flex items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200/70 dark:border-slate-700">
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">{bill.label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Due {bill.due}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900 dark:text-white">₹{fmt(bill.amount)}</p>
              <p className="text-[11px] text-amber-500 mt-0.5">{bill.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SIPReminder({ goals }) {
  const nextGoal = (goals || []).find((goal) => (Number(goal.saved) || 0) < (Number(goal.target) || 0));
  if (!nextGoal) {
    return (
      <div className="bg-slate-900 border border-white/5 rounded-3xl p-6">
        <p className="text-slate-400 text-sm mb-4">No active SIP goals yet.</p>
        <Link to="/app/sip" className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-amber-500 text-slate-900 font-bold text-sm hover:bg-amber-600 transition">
          <i className="fas fa-plus" /> Create your first SIP
        </Link>
      </div>
    );
  }

  const remaining = Math.max(0, Number(nextGoal.target) - Number(nextGoal.saved || 0));
  const pct = nextGoal.target ? Math.min(Math.round((Number(nextGoal.saved || 0) / Number(nextGoal.target)) * 100), 100) : 0;

  return (
    <div className="bg-slate-900 border border-white/5 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Next SIP Reminder</p>
          <h3 className="text-lg font-bold text-white mt-2">{nextGoal.name}</h3>
        </div>
        <span className="text-xs text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full">{pct}% funded</span>
      </div>
      <p className="text-sm text-slate-400 mb-5">₹{fmt(remaining)} more needed to reach your next target.</p>
      <div className="h-3 rounded-full bg-slate-800 overflow-hidden mb-5">
        <div className="h-full bg-amber-500" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-slate-500">Next installment due in 12 days. Keep the momentum going.</p>
    </div>
  );
}

// ─── Transaction list with search + filter ────────────────────────────────────
function TxList({ tx }) {
  const [limit,  setLimit]  = useState(15);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | credit | debit

  const filtered = [...tx].reverse().filter((t) => {
    const matchType = filter === "all" || t.type === filter;
    const desc = String(t.desc || "");
    const date = String(t.date || "");
    const amount = String(t.amount || "");
    const matchSearch = !search || desc.toLowerCase().includes(search.toLowerCase()) ||
      amount.includes(search) || date.includes(search);
    return matchType && matchSearch;
  });

  if (!tx.length) return (
    <div className="text-center py-12 text-slate-400">
      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
        <i className="fas fa-receipt text-2xl opacity-50" />
      </div>
      <p className="font-medium">No transactions yet</p>
      <p className="text-xs mt-1">Start by adding money to your wallet</p>
    </div>
  );

  return (
    <>
      {/* Search & filter bar */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[160px]">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions…"
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-400 outline-none transition" />
        </div>
        <div className="flex gap-1">
          {[["all","All"],["credit","In"],["debit","Out"]].map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition ${filter === v ? "bg-amber-500 text-slate-900" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">No transactions match your search.</div>
      ) : (
        <>
          <div className="space-y-2">
            {filtered.slice(0, limit).map((t) => {
              const cat = getCategoryFromDesc(t.desc);
              const isCredit = t.type === "credit";
              return (
                <div key={t.id} className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-2xl transition cursor-default">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 ${cat.cls} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <i className={`fas ${cat.icon} text-sm`} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm truncate">{t.desc}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400">{t.date}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cat.cls}`}>{cat.label}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`font-bold text-sm flex-shrink-0 ml-4 ${isCredit ? "text-green-600" : "text-slate-800 dark:text-white"}`}>
                    {isCredit ? "+" : "−"}{fmt(t.amount)}
                  </span>
                </div>
              );
            })}
          </div>
          {filtered.length > limit && (
            <button onClick={() => setLimit((l) => l + 15)}
              className="mt-4 w-full text-xs font-bold text-amber-600 hover:text-amber-700 py-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition">
              Load more ({filtered.length - limit} remaining)
            </button>
          )}
        </>
      )}
    </>
  );
}

// ─── Deposit Request Modal ────────────────────────────────────────────────────
function DepositModalBody({ userId, username, onClose, showToast, addNotification }) {
  const [amount,  setAmount]  = useState("");
  const [method,  setMethod]  = useState("UPI");
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);

  const submit = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 100) return showToast("Minimum deposit is ₹100", "error");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    createRequest(REQUEST_TYPES.DEPOSIT, {
      userId, username, amount: amt,
      details: { method, note: "User-initiated deposit request", requested: new Date().toLocaleDateString() },
    });
    addNotification(`Deposit request of ${fmt(amt)} via ${method} submitted. Pending admin approval.`, "info");
    showToast(`Deposit request of ${fmt(amt)} submitted! Admin will credit your account shortly.`, "success");
    setLoading(false); setDone(true);
    setTimeout(() => onClose(), 2000);
  };

  if (done) return (
    <div className="text-center py-6">
      <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <i className="fas fa-hourglass-half text-amber-500 text-2xl" />
      </div>
      <p className="font-bold text-slate-800 dark:text-white text-lg">Request Submitted!</p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Admin will credit your account within 24 hours.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-700/30 rounded-2xl p-3 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
        <i className="fas fa-info-circle mt-0.5 flex-none" />
        <span>Deposits require admin approval to maintain banking compliance. Your request will be processed within 24 hours.</span>
      </div>
      <div>
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Payment Method</label>
        <div className="grid grid-cols-3 gap-2">
          {["UPI","Net Banking","NEFT/RTGS"].map((m) => (
            <button key={m} onClick={() => setMethod(m)} type="button"
              className={`py-2.5 rounded-xl text-xs font-bold border-2 transition ${method===m?"border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400":"border-slate-200 dark:border-slate-600 text-slate-500 hover:border-amber-300"}`}>
              {m}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Amount (₹)</label>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus min="100"
          className="w-full mt-2 p-4 border-2 border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-2xl focus:border-amber-300 outline-none font-bold text-2xl text-amber-700 dark:text-amber-400 placeholder-slate-300 transition"
          placeholder="0" />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[500,1000,5000,10000].map((v) => (
          <button key={v} type="button" onClick={() => setAmount(String(v))}
            className="bg-slate-100 dark:bg-slate-700 hover:bg-amber-50 hover:text-amber-600 py-2 rounded-xl text-xs font-bold transition">
            {fmt(v)}
          </button>
        ))}
      </div>
      <button onClick={submit} disabled={!amount || parseFloat(amount) < 100 || loading}
        className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 disabled:opacity-50 text-slate-900 py-4 rounded-2xl font-bold hover:opacity-90 transition text-base shadow-lg active:scale-95">
        {loading ? <><i className="fas fa-spinner fa-spin mr-2"/>Submitting…</> : <><i className="fas fa-paper-plane mr-2"/>Submit Deposit Request</>}
      </button>
    </div>
  );
}

// ─── Virtual Card ─────────────────────────────────────────────────────────────
function VirtualCard({ user, isPrivacy, updateUser, showToast }) {
  const [showDetails, setShowDetails] = useState(false);
  const controls = user?.cardControls || { frozen: false, online: true, international: false, contactless: true };
  const toggleControl = (key) => {
    const next = { ...controls, [key]: !controls[key] };
    updateUser({ cardControls: next });
    showToast(`${key === "frozen" ? "Card freeze" : key.charAt(0).toUpperCase() + key.slice(1)} ${next[key] ? "enabled" : "disabled"}.`, "success");
  };
  const cardNum = user?.accountNumber
    ? user.accountNumber.replace(/(.{4})/g, "$1 ").trim()
    : "4000 1234 5678 9000";
  const maskedNum = "•••• •••• •••• " + (user?.accountNumber?.slice(-4) || "9000");

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wide">💳 Virtual Debit Card</h3>
        <div className="flex gap-2">
          <button onClick={() => setShowDetails((v) => !v)}
            className="text-xs text-amber-500 font-bold hover:bg-amber-50 dark:hover:bg-amber-900/20 px-3 py-1 rounded-lg transition">
            {showDetails ? "Hide" : "Show"} Details
          </button>
          <button onClick={() => toggleControl("frozen")}
            className={`text-xs font-bold px-3 py-1 rounded-lg transition ${controls.frozen ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30" : "bg-slate-100 dark:bg-slate-700 text-slate-500"}`}>
            {controls.frozen ? "Frozen" : "Freeze"}
          </button>
        </div>
      </div>

      <div className={`relative bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl p-5 text-white overflow-hidden transition-all ${controls.frozen ? "opacity-60 grayscale" : ""}`}>
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -mr-8 -mt-8" />
        <div className="absolute left-0 bottom-0 w-24 h-24 bg-amber-400/10 rounded-full -ml-6 -mb-6" />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Alpha Bank</p>
              <p className="text-xs text-slate-300 font-medium">Visa Debit</p>
            </div>
            <div className="flex gap-1">
              <div className="w-7 h-7 bg-red-500/80 rounded-full" />
              <div className="w-7 h-7 bg-yellow-400/80 rounded-full -ml-3" />
            </div>
          </div>
          <p className="text-base font-mono tracking-widest mb-4">
            {isPrivacy ? "•••• •••• •••• ••••" : showDetails ? cardNum : maskedNum}
          </p>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[9px] text-slate-400 uppercase">Card Holder</p>
              <p className="text-sm font-bold uppercase">{user?.username || "Account Holder"}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-slate-400 uppercase">Expires</p>
              <p className="text-sm font-bold">12/28</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-slate-400 uppercase">CVV</p>
              <p className="text-sm font-bold">{showDetails && !isPrivacy ? "•••" : "•••"}</p>
            </div>
          </div>
        </div>
        {controls.frozen && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 rounded-2xl">
            <div className="text-center">
              <i className="fas fa-snowflake text-blue-300 text-3xl mb-1" />
              <p className="text-white text-xs font-bold">Card Frozen</p>
            </div>
          </div>
        )}
      </div>

      {showDetails && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
            <p className="text-[10px] text-slate-400 uppercase font-semibold mb-1">Account No.</p>
            <p className="text-xs font-mono font-bold text-slate-800 dark:text-white">{isPrivacy ? "••••••••••••" : (user?.accountNumber || "N/A")}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
            <p className="text-[10px] text-slate-400 uppercase font-semibold mb-1">IFSC Code</p>
            <p className="text-xs font-mono font-bold text-slate-800 dark:text-white">{user?.ifscCode || "ALPH0XXXXX"}</p>
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        {[
          ["online", "Online", "fa-globe"],
          ["international", "Intl", "fa-plane"],
          ["contactless", "Tap Pay", "fa-wifi"],
          ["frozen", "Frozen", "fa-snowflake"],
        ].map(([key, label, icon]) => (
          <button key={key} onClick={() => toggleControl(key)}
            className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition ${
              controls[key]
                ? key === "frozen"
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700/40 text-blue-600 dark:text-blue-400"
                  : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700/40 text-green-700 dark:text-green-400"
                : "bg-slate-50 dark:bg-slate-700/50 border-slate-100 dark:border-slate-600 text-slate-400"
            }`}>
            <span className="flex items-center gap-2"><i className={`fas ${icon}`} />{label}</span>
            <span>{controls[key] ? "On" : "Off"}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Account Info Card ────────────────────────────────────────────────────────
function AccountInfoCard({ user, isPrivacy }) {
  const [copied, setCopied] = useState(null);
  const copy = (val, key) => {
    navigator.clipboard?.writeText(val).then(() => { setCopied(key); setTimeout(() => setCopied(null), 1500); });
  };
  const rows = [
    { label: "Account No.", val: user?.accountNumber || "N/A",    key: "acc"  },
    { label: "IFSC Code",   val: user?.ifscCode      || "N/A",    key: "ifsc" },
    { label: "UPI ID",      val: user?.upiId          || `${user?.username?.toLowerCase()}@alpha`, key: "upi" },
  ];
  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
      <div className="flex items-center gap-4 mb-5">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-white">Account Details</h3>
          <p className="text-xs text-slate-400 mt-0.5">Share to receive payments</p>
        </div>
        <div className="ml-auto">
          <UpiQR upiId={user?.upiId || `${user?.username?.toLowerCase()}@alpha`} />
        </div>
      </div>
      <div className="space-y-3">
        {rows.map(({ label, val, key }) => (
          <div key={key} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">{label}</p>
              <p className="text-sm font-mono font-bold text-slate-800 dark:text-white mt-0.5">
                {isPrivacy && key === "acc" ? "••••••••••••" : val}
              </p>
            </div>
            <button onClick={() => copy(val, key)}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 text-slate-400 hover:text-amber-600 hover:border-amber-300 transition text-xs">
              <i className={`fas ${copied === key ? "fa-check text-green-500" : "fa-copy"}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { currentUser, updateUser, addTransaction, showToast, openModal, closeModal,
    isPrivacy, setIsPrivacy, currentCurrency, setCurrentCurrency, addNotification } = useApp();
  const liveRates = useRates();

  const balance = currentUser?.balance || 0;
  const tx = currentUser?.tx || [];
  const budgets = currentUser?.budgets || {};

  const displayBalance = () => {
    if (isPrivacy) return "••••••";
    if (currentCurrency === "INR") return balance.toLocaleString("en-IN", { minimumFractionDigits: 2 });
    const rate = liveRates[currentCurrency] || 1;
    return (balance / rate).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  const currSymbol = { INR: "₹", USD: "$", EUR: "€", GBP: "£" }[currentCurrency];

  const handleDeposit = () => {
    openModal("Request Deposit",
      <DepositModalBody
        userId={currentUser?.id} username={currentUser?.username}
        onClose={closeModal} showToast={showToast} addNotification={addNotification}
      />
    );
  };

  const exportStatement = () => {
    if (!tx.length) return showToast("No transactions to export", "error");
    const rows = ["Date,Description,Type,Amount"];
    [...tx].reverse().forEach((t) => rows.push(`${t.date},"${t.desc}",${t.type},${t.amount}`));
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `AlphaBank_${currentUser.username}_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(a.href);
    showToast("Statement exported as CSV!", "success");
  };

  const clearHistory = () => {
    openModal("Clear Transaction History",
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl">
          <i className="fas fa-exclamation-triangle text-red-500 text-xl" />
          <p className="text-sm text-red-700 dark:text-red-300 font-semibold">This will permanently delete all transaction history. Balance unaffected.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={closeModal} className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white py-3 rounded-xl font-bold hover:bg-slate-200 transition text-sm">Cancel</button>
          <button onClick={() => { updateUser({ tx: [] }); closeModal(); showToast("Transaction history cleared.", "info"); }}
            className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition text-sm">Clear All</button>
        </div>
      </div>
    );
  };

  const allRequests    = getUserRequests(currentUser?.id || "");
  const pendingRequests = allRequests.filter((r) => r.status === REQUEST_STATUS.PENDING);
  const totalRecv = tx.filter((t) => t.type === "credit").reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const totalSent = tx.filter((t) => t.type === "debit").reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const cashback  = currentUser?.rewards?.cashback || 0;
  const tier      = getUserTier(tx.length);
  const today = new Date().toLocaleDateString();
  const dailyTransferLimit = Number(currentUser?.security?.dailyTransferLimit) || 100000;
  const sentToday = tx
    .filter((t) => t.type === "debit" && t.category === "transfer" && t.date === today)
    .reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const remainingDailyLimit = Math.max(0, dailyTransferLimit - sentToday);
  const cardControls = currentUser?.cardControls || {};

  const quickActions = [
    { label: "Add Money", icon: "fa-plus",           path: null,             action: handleDeposit   },
    { label: "Transfer",  icon: "fa-paper-plane",    path: "/app/transfer"                           },
    { label: "Services",  icon: "fa-bolt",            path: "/app/services"                           },
    { label: "Loans",     icon: "fa-hand-holding-usd",path: "/app/loans"                              },
    { label: "Rewards",   icon: "fa-gift",            path: "/app/rewards"                            },
    { label: "Wallet",    icon: "fa-globe",           path: "/app/wallet"                             },
    { label: "Invest",    icon: "fa-chart-pie",       path: "/app/sip"                                },
    { label: "Statement", icon: "fa-download",        path: null,             action: exportStatement },
  ];

  return (
    <ErrorBoundary>
      <div className="space-y-6 page-fade-in">

        {/* ── Balance Card ── */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-slate-400 text-sm font-medium">Total Balance</p>
                  <select value={currentCurrency} onChange={(e) => setCurrentCurrency(e.target.value)}
                    className="text-xs bg-white/10 border-0 rounded-lg px-2 py-1 text-slate-300 outline-none cursor-pointer">
                    {["INR","USD","EUR","GBP"].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button onClick={() => setIsPrivacy((v) => !v)} className="text-slate-500 hover:text-white transition">
                    <i className={`fas ${isPrivacy ? "fa-eye-slash" : "fa-eye"}`} />
                  </button>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mt-2 tracking-tight">
                  {currSymbol} {displayBalance()}
                </h1>
                <p className="text-slate-400 text-sm mt-2 font-mono">{currentUser?.upiId || `${currentUser?.username?.toLowerCase()}@alpha`}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-xs bg-white/10 px-3 py-1 rounded-full">{tier.icon} {tier.name}</span>
                <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full">
                  <i className="fas fa-shield-alt mr-1" />Secured
                </span>
                <span className="text-xs text-slate-500 font-mono">{currentUser?.ifscCode || "ALPH0XXXXX"}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={handleDeposit}
                className="bg-amber-400 hover:bg-amber-500 text-slate-900 px-6 py-3 rounded-xl font-bold transition text-sm flex items-center gap-2 shadow-lg active:scale-95">
                <i className="fas fa-plus" /> Add Money
              </button>
              <Link to="/app/transfer"
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold transition text-sm flex items-center gap-2 active:scale-95">
                <i className="fas fa-paper-plane" /> Send Money
              </Link>
            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div>
          <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-4">Quick Actions</h3>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {quickActions.map(({ label, icon, path, action }) => {
              const cls = "flex flex-col items-center gap-2 cursor-pointer group";
              const inner = (
                <>
                  <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-700 group-hover:bg-amber-50 dark:group-hover:bg-amber-900/20 group-hover:text-amber-600 group-hover:-translate-y-1 transition-all">
                    <i className={`fas ${icon} text-xl`} />
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 text-center leading-tight">{label}</span>
                </>
              );
              return path
                ? <Link key={label} to={path} className={cls}>{inner}</Link>
                : <button key={label} onClick={action} className={cls}>{inner}</button>;
            })}
          </div>
        </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <UpcomingBills bills={currentUser?.bills} />
        <SIPReminder goals={currentUser?.goals || []} />
      </div>

        {pendingRequests.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-3xl p-5">
            <h3 className="font-bold text-amber-800 dark:text-amber-400 mb-3 flex items-center gap-2">
              <i className="fas fa-hourglass-half text-amber-500" />Pending Requests ({pendingRequests.length})
            </h3>
            <div className="space-y-2">
              {pendingRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-3 border border-amber-100 dark:border-amber-700/20">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${req.type==="loan"?"bg-amber-100 text-amber-600":req.type==="deposit"?"bg-green-100 text-green-600":"bg-blue-100 text-blue-600"}`}>
                      <i className={`fas ${req.type==="loan"?"fa-hand-holding-usd":req.type==="deposit"?"fa-piggy-bank":"fa-shield-alt"} text-xs`} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 capitalize">{req.type} Request</p>
                      <p className="text-xs text-slate-400">{req.submittedAt}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-600 dark:text-amber-400">{fmt(req.amount)}</p>
                    <span className="text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold">Pending Review</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Account Info + Virtual Card ── */}
        <div className="grid md:grid-cols-2 gap-6">
          <AccountInfoCard user={currentUser} isPrivacy={isPrivacy} />
          <VirtualCard user={currentUser} isPrivacy={isPrivacy} updateUser={updateUser} showToast={showToast} />
        </div>

        {/* ── Security Controls ── */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wide">Security & Limits</h3>
            <Link to="/app/settings" className="text-xs font-bold text-amber-600 hover:underline">Manage</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ["UPI PIN", currentUser?.upiPinHash ? "Active" : "Not set", currentUser?.upiPinHash ? "text-green-600" : "text-amber-600", "fa-key"],
              ["KYC", currentUser?.kyc?.status === "verified" ? "Verified" : "Pending", currentUser?.kyc?.status === "verified" ? "text-green-600" : "text-amber-600", "fa-shield-alt"],
              ["Card", cardControls.frozen ? "Frozen" : "Ready", cardControls.frozen ? "text-blue-600" : "text-green-600", "fa-credit-card"],
              ["Limit Left", fmt(remainingDailyLimit), "text-amber-600", "fa-gauge-high"],
            ].map(([label, value, cls, icon]) => (
              <div key={label} className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <i className={`fas ${icon} text-xs text-slate-400`} />
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{label}</span>
                </div>
                <p className={`font-black text-sm ${cls}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Stats + Spending ── */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wide mb-4">📊 Spending Breakdown</h3>
            <SpendingChart tx={tx} />
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
            <BudgetTracker tx={tx} budgets={budgets} onUpdateBudgets={(b) => updateUser({ budgets: b })} />
          </div>
        </div>

        {/* ── Quick Stats ── */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wide mb-4">💡 Account Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              ["Total Received", `+${fmt(totalRecv)}`, "text-green-600", "fa-arrow-down"],
              ["Total Spent",    `−${fmt(totalSent)}`,  "text-slate-700 dark:text-slate-200", "fa-arrow-up"],
              ["Transactions",   String(tx.length),     "text-slate-700 dark:text-slate-200", "fa-receipt"],
              ["Tier",           `${tier.icon} ${tier.name}`, "text-amber-600", "fa-award"],
              ["Cashback",       `₹${cashback.toFixed(2)}`, "text-green-600", "fa-gift"],
            ].map(([label, val, cls, icon]) => (
              <div key={label} className="flex flex-col gap-1 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-1.5">
                  <i className={`fas ${icon} text-xs text-slate-400`} />
                  <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
                </div>
                <span className={`font-bold text-sm ${cls}`}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Transactions ── */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">Transaction History</h3>
            <div className="flex gap-2">
              <button onClick={exportStatement} className="text-xs font-bold text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 px-3 py-1.5 rounded-lg transition">
                <i className="fas fa-download mr-1" />Export CSV
              </button>
              <button onClick={clearHistory} className="text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition">Clear</button>
            </div>
          </div>
          <TxList tx={tx} />
        </div>
      </div>
    </ErrorBoundary>
  );
}
