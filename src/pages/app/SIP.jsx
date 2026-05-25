import { useState } from "react";
import { useApp } from "../../store/AppContext";
import { fmt } from "../../utils/helpers";
import { uid, sanitize } from "../../utils/security";
import ErrorBoundary from "../../components/common/ErrorBoundary";

const fmtCr = (v) => {
  const n = Math.round(v);
  if (n >= 10000000) return (n / 10000000).toFixed(2) + " Cr";
  if (n >= 100000)   return (n / 100000).toFixed(2)   + " L";
  return "₹" + n.toLocaleString("en-IN");
};

const DonutChart = ({ invested, gains, total }) => {
  if (!total || total <= 0) return null;
  const pct = Math.min(invested / total, 1);
  const r = 54, circ = 2 * Math.PI * r;
  return (
    <svg width="128" height="128" viewBox="0 0 128 128">
      <circle cx="64" cy="64" r={r} fill="none" stroke="#fef3c7" strokeWidth="16" />
      <circle cx="64" cy="64" r={r} fill="none" stroke="#f59e0b" strokeWidth="16"
        strokeDasharray={`${circ * pct} ${circ}`} strokeLinecap="round" transform="rotate(-90 64 64)" />
      <circle cx="64" cy="64" r={r} fill="none" stroke="#4ade80" strokeWidth="16"
        strokeDasharray={`${circ * (1 - pct)} ${circ}`} strokeDashoffset={`${-circ * pct}`}
        strokeLinecap="round" transform="rotate(-90 64 64)" />
      <text x="64" y="60" textAnchor="middle" fontSize="11" fontWeight="900" fill="#1e293b">{Math.round((gains / total) * 100)}%</text>
      <text x="64" y="74" textAnchor="middle" fontSize="9" fill="#64748b">returns</text>
    </svg>
  );
};

const PLANS = [
  { name: "Alpha Growth Fund",  type: "SIP",     ret: "12–15%", risk: "Medium", min: "₹500/mo",   icon: "📈", color: "from-amber-500 to-yellow-400", riskCls: "text-amber-600" },
  { name: "Alpha Secure FD",    type: "FD",      ret: "7.25%",  risk: "Low",    min: "₹10,000",   icon: "🔒", color: "from-green-500 to-emerald-500", riskCls: "text-green-600" },
  { name: "Alpha Index Fund",   type: "Lumpsum", ret: "13–18%", risk: "Medium", min: "₹5,000",    icon: "📊", color: "from-blue-500 to-blue-600",     riskCls: "text-amber-600" },
  { name: "Alpha Liquid Fund",  type: "SIP",     ret: "6–7%",   risk: "Low",    min: "₹1,000/mo", icon: "💧", color: "from-cyan-500 to-cyan-600",     riskCls: "text-green-600" },
  { name: "Alpha ELSS Fund",    type: "SIP",     ret: "14–18%", risk: "High",   min: "₹500/mo",   icon: "🛡️", color: "from-purple-500 to-purple-600",  riskCls: "text-red-500"   },
];

const goalSIP = (target, yrs, rate) => {
  const rM = rate / 100 / 12, nM = yrs * 12;
  return rM > 0 ? (target * rM) / ((Math.pow(1 + rM, nM) - 1) * (1 + rM)) : target / nM;
};

const Slider = ({ label, val, set, min, max, step, display }) => (
  <div>
    <div className="flex justify-between mb-2">
      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{label}</label>
      <span className="text-sm font-black text-amber-500">{display}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={val} onChange={(e) => set(e.target.value)}
      className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-full appearance-none cursor-pointer accent-amber-500" />
  </div>
);


// ── FD & RD Section ──────────────────────────────────────────────────────────
function FDRDSection({ currentUser, updateUser, addTransaction, showToast, uid_fn }) {
  const [activeType, setActiveType] = useState("fd");
  const [amount,    setAmount]     = useState("");
  const [tenure,    setTenure]     = useState("12");
  const [rdMonthly, setRdMonthly]  = useState("");
  const [loading,   setLoading]    = useState(false);

  const FD_RATES = [
    { months: 3,   rate: 4.75 }, { months: 6,   rate: 5.50 },
    { months: 12,  rate: 7.00 }, { months: 24,  rate: 7.10 },
    { months: 36,  rate: 7.25 }, { months: 60,  rate: 7.20 },
    { months: 120, rate: 7.00 },
  ];
  const selectedRate = FD_RATES.find((r) => r.months === parseInt(tenure)) || FD_RATES[2];
  const fdMaturity   = parseFloat(amount || 0) * Math.pow(1 + selectedRate.rate / 100 / 4, 4 * (parseInt(tenure) / 12));
  const rdMaturity   = (() => {
    const r = 7.0 / 100 / 12, n = parseInt(tenure), P = parseFloat(rdMonthly || 0);
    return P > 0 ? P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r) : 0;
  })();

  const deposits     = (currentUser?.deposits || []);

  const createDeposit = async () => {
    const isFD = activeType === "fd";
    const amt  = isFD ? parseFloat(amount) : parseFloat(rdMonthly);
    if (!amt || amt < 1000) return showToast("Minimum deposit is ₹1,000", "error");
    if (amt > (currentUser?.balance || 0)) return showToast("Insufficient balance", "error");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));

    const newDep = {
      id: uid_fn(), type: activeType.toUpperCase(),
      amount: amt, tenure: parseInt(tenure),
      rate: selectedRate.rate,
      maturity: isFD ? fdMaturity : rdMaturity,
      createdOn: new Date().toLocaleDateString(),
      maturesOn: new Date(Date.now() + parseInt(tenure) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      status: "active",
    };

    updateUser({
      balance:  (currentUser.balance || 0) - amt,
      deposits: [...deposits, newDep],
    });
    addTransaction({ type: "debit", desc: `${activeType.toUpperCase()} Created — ${selectedRate.rate}% p.a. · ${tenure} months`, amount: amt, category: "deposit" });
    showToast(`${activeType.toUpperCase()} of ₹${amt.toLocaleString("en-IN")} created at ${selectedRate.rate}% p.a.!`, "success");
    setAmount(""); setRdMonthly(""); setLoading(false);
  };

  const closeDeposit = (dep) => {
    // Premature closure — 1% penalty
    const months = dep.tenure;
    const rate   = Math.max(0, dep.rate - 1);
    const penalty = dep.amount * (1 / 100) * (months / 12);
    const payout  = dep.amount + (dep.amount * (rate / 100) * (months / 12)) - penalty;
    updateUser({
      balance:  (currentUser.balance || 0) + Math.round(payout),
      deposits: deposits.filter((d) => d.id !== dep.id),
    });
    addTransaction({ type: "credit", desc: `${dep.type} Closed (premature) — penalty applied`, amount: Math.round(payout), category: "deposit" });
    showToast(`${dep.type} closed. ₹${Math.round(payout).toLocaleString("en-IN")} credited (1% premature penalty applied).`, "info");
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Create form */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
        <h3 className="font-bold text-xl text-slate-800 dark:text-white mb-1">Create Deposit</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Earn up to 7.25% p.a. — highest in class</p>

        {/* FD / RD toggle */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-xl mb-5">
          {[["fd","Fixed Deposit","fa-lock"],["rd","Recurring Deposit","fa-sync-alt"]].map(([id,label,icon]) => (
            <button key={id} onClick={() => setActiveType(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${activeType === id ? "bg-amber-500 text-slate-900 shadow" : "text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"}`}>
              <i className={`fas ${icon}`} />{label}
            </button>
          ))}
        </div>

        {/* Tenure selector */}
        <div className="mb-4">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Tenure</label>
          <div className="flex flex-wrap gap-2">
            {FD_RATES.map((r) => (
              <button key={r.months} onClick={() => setTenure(String(r.months))}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border-2 ${parseInt(tenure) === r.months ? "border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-amber-300"}`}>
                {r.months < 12 ? `${r.months}M` : `${r.months / 12}Y`}
                <span className="block text-[9px] font-bold text-green-600 mt-0.5">{r.rate}%</span>
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div className="mb-5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">
            {activeType === "fd" ? "Deposit Amount (₹)" : "Monthly Instalment (₹)"}
          </label>
          <input type="number" value={activeType === "fd" ? amount : rdMonthly}
            onChange={(e) => activeType === "fd" ? setAmount(e.target.value) : setRdMonthly(e.target.value)}
            min="1000" placeholder="Min ₹1,000"
            className="w-full p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xl font-bold text-amber-600 dark:text-amber-400 outline-none focus:ring-2 focus:ring-amber-400 transition" />
          <div className="flex gap-2 mt-2">
            {[5000,10000,25000,50000].map((v) => (
              <button key={v} type="button" onClick={() => activeType === "fd" ? setAmount(String(v)) : setRdMonthly(String(v))}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-amber-50 hover:text-amber-600 transition">
                ₹{v >= 1000 ? (v/1000)+"K" : v}
              </button>
            ))}
          </div>
        </div>

        {/* Maturity preview */}
        {((activeType === "fd" && parseFloat(amount) > 0) || (activeType === "rd" && parseFloat(rdMonthly) > 0)) && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-700/30 rounded-2xl p-4 mb-5">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-semibold">Maturity Preview</p>
            <div className="space-y-1.5">
              {activeType === "fd" ? [
                ["Principal",    `₹${parseFloat(amount).toLocaleString("en-IN")}`],
                ["Interest",     `₹${Math.round(fdMaturity - parseFloat(amount)).toLocaleString("en-IN")}`],
                ["Rate",         `${selectedRate.rate}% p.a. (quarterly compounding)`],
                ["Maturity Value",`₹${Math.round(fdMaturity).toLocaleString("en-IN")}`],
              ] : [
                ["Monthly",      `₹${parseFloat(rdMonthly).toLocaleString("en-IN")}`],
                ["Total Invested",`₹${(parseFloat(rdMonthly) * parseInt(tenure)).toLocaleString("en-IN")}`],
                ["Rate",         `7.00% p.a.`],
                ["Maturity Value",`₹${Math.round(rdMaturity).toLocaleString("en-IN")}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">{k}</span>
                  <span className={`font-bold ${k === "Maturity Value" ? "text-amber-600 dark:text-amber-400 text-base" : "text-slate-700 dark:text-slate-200"}`}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={createDeposit} disabled={loading}
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 py-4 rounded-2xl font-bold hover:opacity-90 transition shadow-lg active:scale-[0.98] disabled:opacity-50">
          {loading ? <><i className="fas fa-spinner fa-spin mr-2" />Creating…</> : <><i className="fas fa-lock mr-2" />Create {activeType.toUpperCase()}</>}
        </button>
        <p className="text-xs text-center text-slate-400 mt-3">
          <i className="fas fa-info-circle mr-1 text-amber-500" />Premature closure incurs 1% penalty on applicable rate
        </p>
      </div>

      {/* Deposits list */}
      <div>
        <h4 className="font-bold text-slate-800 dark:text-white mb-4">Active Deposits ({deposits.length})</h4>
        {deposits.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-10 text-center">
            <div className="text-4xl mb-3">🔒</div>
            <p className="font-bold text-slate-600 dark:text-slate-300">No active deposits</p>
            <p className="text-xs text-slate-400 mt-1">Create your first FD or RD on the left</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deposits.map((dep) => {
              const progressPct = Math.min(
                ((Date.now() - new Date(dep.createdOn).getTime()) /
                 (dep.tenure * 30 * 24 * 60 * 60 * 1000)) * 100, 100
              );
              return (
                <div key={dep.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full ${dep.type === "FD" ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"}`}>{dep.type}</span>
                        <span className="text-xs font-bold text-green-600">{dep.rate}% p.a.</span>
                      </div>
                      <p className="font-bold text-slate-800 dark:text-white mt-1 text-lg">₹{dep.amount.toLocaleString("en-IN")}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{dep.tenure} months · Created {dep.createdOn}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Matures</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{dep.maturesOn}</p>
                      <p className="text-xs text-amber-600 font-bold mt-1">₹{Math.round(dep.maturity).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Progress</span><span>{Math.round(progressPct)}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all"
                        style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>
                  <button onClick={() => closeDeposit(dep)}
                    className="text-xs text-red-500 hover:text-red-600 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition">
                    <i className="fas fa-times mr-1" />Close Deposit (premature)
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SIP() {
  const { currentUser, updateUser, addTransaction, showToast } = useApp();
  const [activeTab,   setActiveTab]   = useState("calculator");
  const [calcType,    setCalcType]    = useState("sip");
  // SIP inputs
  const [monthly,     setMonthly]     = useState("5000");
  const [years,       setYears]       = useState("10");
  const [retRate,     setRetRate]     = useState("12");
  const [lumpsum,     setLumpsum]     = useState("100000");
  const [swpAmt,      setSwpAmt]      = useState("5000");
  const [swpCorpus,   setSwpCorpus]   = useState("1000000");
  const [showStepUp,  setShowStepUp]  = useState(false);
  const [stepUp,      setStepUp]      = useState("10");
  // Invest
  const [investAmt,   setInvestAmt]   = useState("");
  const [investType,  setInvestType]  = useState("SIP");
  const [investPlan,  setInvestPlan]  = useState("Alpha Growth Fund");
  const [loading,     setLoading]     = useState(false);
  // Goals — stored in user object, not separate localStorage
  const goals = currentUser?.goals || [];

  const [newGoalName,   setNewGoalName]   = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [newGoalYears,  setNewGoalYears]  = useState("5");
  const [newGoalReturn, setNewGoalReturn] = useState("12");

  // SIP maths
  const r   = parseFloat(retRate) / 100 / 12;
  const n   = parseFloat(years) * 12;
  const P   = parseFloat(monthly) || 0;
  const sipFV   = r > 0 ? P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r) : P * n;
  const sipInv  = P * n;
  const sipGain = sipFV - sipInv;

  const stepUpFV = (() => {
    if (!showStepUp) return sipFV;
    const aStep = parseFloat(stepUp) / 100;
    let fv = 0, sip = P;
    for (let yr = 0; yr < parseFloat(years); yr++) {
      for (let m = 0; m < 12; m++) {
        const rem = n - yr * 12 - m;
        fv += sip * Math.pow(1 + r, rem);
      }
      sip *= 1 + aStep;
    }
    return fv;
  })();

  const L    = parseFloat(lumpsum) || 0;
  const lFV  = L * Math.pow(1 + parseFloat(retRate) / 100, parseFloat(years));
  const lGain = lFV - L;

  const sC = parseFloat(swpCorpus) || 0;
  const sW = parseFloat(swpAmt) || 0;
  const sR = parseFloat(retRate) / 100 / 12;
  const swpMonths = sR > 0 ? Math.log(sW / (sW - sC * sR)) / Math.log(1 + sR) : sC / sW;
  const swpYrs = Math.floor(swpMonths / 12);
  const swpMos = Math.round(swpMonths % 12);

  const investments  = (currentUser?.tx || []).filter((t) => t.category === "investment");
  const totalInvested = investments.reduce((s, t) => s + (Number(t.amount) || 0), 0);

  const handleInvest = async () => {
    const amt = parseFloat(investAmt);
    if (!amt || amt < 100)               return showToast("Minimum investment is ₹100", "error");
    if (amt > (currentUser?.balance || 0)) return showToast("Insufficient balance", "error");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    updateUser({ balance: (currentUser.balance || 0) - amt });
    addTransaction({ type: "debit", desc: `${investType} - ${investPlan}`, amount: amt, category: "investment" });
    showToast(`₹${amt.toLocaleString("en-IN")} invested in ${investPlan}! 📈`, "success");
    setInvestAmt(""); setLoading(false);
  };

  const saveGoals = (g) => updateUser({ goals: g });

  const addGoal = () => {
    if (!newGoalName || !newGoalTarget) return showToast("Fill goal name and target amount", "error");
    const req = goalSIP(parseFloat(newGoalTarget), parseFloat(newGoalYears), parseFloat(newGoalReturn));
    saveGoals([...goals, {
      id: uid(), name: sanitize(newGoalName),
      target: parseFloat(newGoalTarget), years: parseFloat(newGoalYears),
      returnRate: parseFloat(newGoalReturn), requiredSIP: req, saved: 0,
      createdAt: new Date().toLocaleDateString(),
    }]);
    showToast(`Goal "${newGoalName}" created! Required SIP: ${fmt(req)}/mo`, "success");
    setNewGoalName(""); setNewGoalTarget("");
  };

  const TABS = [
    { id: "calculator", label: "Calculator", icon: "fa-calculator"  },
    { id: "invest",     label: "Invest Now",  icon: "fa-rupee-sign" },
    { id: "fdrd",       label: "FD & RD",     icon: "fa-lock"       },
    { id: "goals",      label: "My Goals",    icon: "fa-bullseye"   },
    { id: "portfolio",  label: "Portfolio",   icon: "fa-chart-pie"  },
  ];

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Invested", val: fmt(totalInvested),  icon: "fa-rupee-sign", cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700" },
            { label: "Investments",    val: investments.length,  icon: "fa-receipt",    cls: "bg-green-100 dark:bg-green-900/30 text-green-700"  },
            { label: "SIP Simulation", val: fmtCr(sipFV),        icon: "fa-chart-line", cls: "bg-blue-100 dark:bg-blue-900/30 text-blue-700"    },
            { label: "Active Goals",   val: goals.length,        icon: "fa-bullseye",   cls: "bg-purple-100 dark:bg-purple-900/30 text-purple-700"},
          ].map((c) => (
            <div key={c.label} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm">
              <div className={`w-9 h-9 ${c.cls} rounded-xl flex items-center justify-center mb-3`}>
                <i className={`fas ${c.icon} text-sm`} />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">{c.label}</p>
              <p className="font-black text-slate-800 dark:text-white text-lg">{c.val}</p>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl overflow-x-auto">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === t.id ? "bg-amber-500 text-slate-900 shadow-md" : "text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"}`}>
              <i className={`fas ${t.icon} text-xs`} />{t.label}
            </button>
          ))}
        </div>

        {/* ── CALCULATOR TAB ────────────────────────────────────── */}
        {activeTab === "calculator" && (
          <div className="grid lg:grid-cols-2 gap-6 items-start">
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 space-y-5">
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
                {[["sip","SIP","fa-chart-line"],["lumpsum","Lumpsum","fa-coins"],["swp","SWP","fa-sync-alt"]].map(([id,label,icon])=>(
                  <button key={id} onClick={() => setCalcType(id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${calcType===id?"bg-amber-500 text-slate-900 shadow":"text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"}`}>
                    <i className={`fas ${icon}`}/>{label}
                  </button>
                ))}
              </div>

              {calcType === "sip" && (
                <div className="space-y-5">
                  <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-lg">
                    <i className="fas fa-chart-line text-amber-500" /> SIP Calculator
                  </h3>
                  <Slider label="Monthly Investment" val={monthly} set={setMonthly} min={500} max={500000} step={500}  display={fmtCr(P)} />
                  <Slider label="Expected Returns"   val={retRate} set={setRetRate} min={1}   max={30}     step={0.5}  display={retRate + "% p.a."} />
                  <Slider label="Time Period"         val={years}   set={setYears}   min={1}   max={40}     step={1}    display={years + " years"} />
                  <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                    <button onClick={() => setShowStepUp((v) => !v)}
                      className="flex items-center justify-between w-full text-sm font-bold text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-2"><i className="fas fa-arrow-trend-up text-amber-500" /> Annual Step-up SIP</span>
                      <span className={`w-10 h-5 rounded-full transition-colors relative ${showStepUp ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-600"}`}>
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${showStepUp ? "left-5" : "left-0.5"}`} />
                      </span>
                    </button>
                    {showStepUp && <Slider label="Annual Increase" val={stepUp} set={setStepUp} min={1} max={50} step={1} display={stepUp + "% per year"} />}
                  </div>
                </div>
              )}

              {calcType === "lumpsum" && (
                <div className="space-y-5">
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg"><i className="fas fa-coins text-amber-500 mr-2" />Lumpsum Calculator</h3>
                  <Slider label="Investment Amount" val={lumpsum} set={setLumpsum} min={1000} max={10000000} step={1000} display={fmtCr(L)} />
                  <Slider label="Expected Returns"  val={retRate} set={setRetRate} min={1}    max={30}       step={0.5}  display={retRate + "% p.a."} />
                  <Slider label="Time Period"        val={years}   set={setYears}   min={1}    max={40}       step={1}    display={years + " years"} />
                </div>
              )}

              {calcType === "swp" && (
                <div className="space-y-5">
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg"><i className="fas fa-sync-alt text-amber-500 mr-2" />SWP Calculator</h3>
                  <Slider label="Total Corpus"       val={swpCorpus} set={setSwpCorpus} min={100000} max={100000000} step={100000} display={fmtCr(sC)} />
                  <Slider label="Monthly Withdrawal" val={swpAmt}    set={setSwpAmt}    min={1000}   max={500000}    step={1000}   display={fmt(sW)} />
                  <Slider label="Expected Returns"   val={retRate}   set={setRetRate}   min={1}      max={20}        step={0.5}    display={retRate + "% p.a."} />
                </div>
              )}
            </div>

            {/* Results */}
            <div className="space-y-4">
              {calcType === "sip" && (
                <>
                  <div className="bg-gradient-to-br from-amber-500 to-yellow-400 rounded-3xl p-6 text-slate-900 flex gap-4 items-center">
                    <DonutChart invested={sipInv} gains={sipGain} total={sipFV} />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-900/60 uppercase mb-1">Maturity in {years} yrs</p>
                      <p className="text-4xl font-black">{fmtCr(sipFV)}</p>
                      <div className="mt-3 space-y-1.5 text-sm">
                        <div className="flex justify-between"><span className="text-slate-900/60">Invested</span><span className="font-black">{fmtCr(sipInv)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-900/60">Est. Gains</span><span className="font-black text-green-700">+{fmtCr(sipGain)}</span></div>
                        {showStepUp && <div className="flex justify-between border-t border-slate-900/10 pt-1.5"><span className="text-slate-900/60">With {stepUp}% step-up</span><span className="font-black text-green-800">🚀 {fmtCr(stepUpFV)}</span></div>}
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">Year-by-Year Milestones</p>
                    {[1, 3, 5, Math.ceil(parseFloat(years) / 2), parseFloat(years)].filter((y, i, a) => y <= parseFloat(years) && y > 0 && a.indexOf(y) === i).sort((a, b) => a - b).map((y) => {
                      const yFV = r > 0 ? P * ((Math.pow(1 + r, y * 12) - 1) / r) * (1 + r) : P * y * 12;
                      return (
                        <div key={y} className="flex justify-between py-2.5 border-b border-slate-100 dark:border-slate-700 last:border-0">
                          <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <span className="w-6 h-6 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-[10px] font-black text-amber-600">{y}</span>
                            {y === 1 ? "year" : "years"}
                          </span>
                          <span className="text-sm font-black text-amber-500">{fmtCr(yFV)}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
              {calcType === "lumpsum" && (
                <div className="bg-gradient-to-br from-amber-500 to-yellow-400 rounded-3xl p-6 text-slate-900 flex gap-4 items-center">
                  <DonutChart invested={L} gains={lGain} total={lFV} />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-900/60 uppercase mb-1">Value after {years} yrs</p>
                    <p className="text-4xl font-black">{fmtCr(lFV)}</p>
                    <div className="mt-3 space-y-1.5 text-sm">
                      <div className="flex justify-between"><span className="text-slate-900/60">Principal</span><span className="font-black">{fmtCr(L)}</span></div>
                      <div className="flex justify-between"><span className="text-slate-900/60">Est. Gains</span><span className="font-black text-green-700">+{fmtCr(lGain)}</span></div>
                    </div>
                  </div>
                </div>
              )}
              {calcType === "swp" && (
                <div className={`bg-gradient-to-br rounded-3xl p-6 text-slate-900 ${isFinite(swpMonths) && swpMonths > 0 ? "from-amber-500 to-yellow-400" : "from-green-400 to-emerald-500"}`}>
                  <p className="text-xs font-bold text-slate-900/60 uppercase mb-1">Corpus Duration</p>
                  {isFinite(swpMonths) && swpMonths > 0
                    ? <p className="text-4xl font-black mb-2">{swpYrs}y {swpMos}m</p>
                    : <p className="text-3xl font-black mb-2">Forever ♾️</p>}
                  <p className="text-sm text-slate-900/70">
                    {isFinite(swpMonths) && swpMonths > 0 ? `Withdrawing ${fmt(sW)}/mo at ${retRate}% p.a.` : "Monthly returns exceed withdrawals!"}
                  </p>
                  <p className="text-xs text-slate-900/60 mt-2">Safe withdrawal: <strong>{fmt(sC * (parseFloat(retRate) / 100 / 12))}/mo</strong></p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── INVEST NOW TAB ────────────────────────────────────── */}
        {activeTab === "invest" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
              <h3 className="font-bold text-xl text-slate-800 dark:text-white mb-1">Start Investing</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Amount debited from your wallet instantly.</p>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {["SIP","Lumpsum","FD"].map((t) => (
                  <button key={t} onClick={() => setInvestType(t)}
                    className={`py-2.5 rounded-xl text-sm font-bold transition-all ${investType===t?"bg-amber-500 text-slate-900 shadow":"bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-amber-50"}`}>{t}</button>
                ))}
              </div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Select Plan</label>
              <select value={investPlan} onChange={(e) => setInvestPlan(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-400 outline-none text-sm font-semibold mb-4 transition">
                {PLANS.map((p) => <option key={p.name}>{p.name}</option>)}
              </select>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Amount (₹)</label>
              <input type="number" value={investAmt} onChange={(e) => setInvestAmt(e.target.value)} min="100"
                placeholder="Enter investment amount"
                className="w-full p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-400 outline-none text-xl font-bold mb-3 transition" />
              <div className="flex gap-2 mb-5 flex-wrap">
                {[1000,5000,10000,25000].map((v) => (
                  <button key={v} onClick={() => setInvestAmt(String(v))}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-amber-50 hover:text-amber-600 transition">
                    ₹{v >= 1000 ? (v / 1000) + "K" : v}
                  </button>
                ))}
              </div>
              <button onClick={handleInvest} disabled={loading || !investAmt}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition shadow-lg active:scale-[0.98] disabled:opacity-50">
                {loading ? <><i className="fas fa-spinner fa-spin mr-2" />Processing…</> : <><i className="fas fa-chart-line mr-2" />Invest ₹{parseFloat(investAmt || 0).toLocaleString("en-IN")}</>}
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 dark:text-white">Recommended Plans</h4>
              {PLANS.map((plan) => (
                <div key={plan.name} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-3">
                  <div className={`w-11 h-11 bg-gradient-to-br ${plan.color} rounded-2xl flex items-center justify-center text-xl flex-none`}>{plan.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 dark:text-white text-sm">{plan.name}</p>
                    <div className="flex gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-slate-400">{plan.type}</span>
                      <span className="text-xs font-bold text-green-600">{plan.ret} p.a.</span>
                      <span className={`text-xs font-bold ${plan.riskCls}`}>{plan.risk} Risk</span>
                    </div>
                  </div>
                  <button onClick={() => { setInvestType(plan.type); setInvestPlan(plan.name); setActiveTab("invest"); }}
                    className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-lg font-bold hover:bg-amber-100 transition">
                    Select
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── GOALS TAB ────────────────────────────────────────── */}
        {activeTab === "goals" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
              <h3 className="font-bold text-xl text-slate-800 dark:text-white mb-4"><i className="fas fa-plus-circle text-amber-500 mr-2" />Create New Goal</h3>
              <div className="space-y-4">
                <input value={newGoalName} onChange={(e) => setNewGoalName(e.target.value)} placeholder="Goal name (e.g. Dream Home)"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-400 outline-none text-sm transition" />
                <input type="number" value={newGoalTarget} onChange={(e) => setNewGoalTarget(e.target.value)} placeholder="Target amount (₹)"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-400 outline-none text-sm transition" />
                <div className="grid grid-cols-2 gap-3">
                  <Slider label="Time Period" val={newGoalYears}  set={setNewGoalYears}  min={1} max={30} step={1}   display={newGoalYears + " yrs"} />
                  <Slider label="Return Rate" val={newGoalReturn} set={setNewGoalReturn} min={6} max={24} step={0.5} display={newGoalReturn + "%"} />
                </div>
                {newGoalTarget && parseFloat(newGoalTarget) > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-2xl p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Required Monthly SIP</p>
                    <p className="text-3xl font-black text-amber-600 dark:text-amber-400">
                      {fmt(goalSIP(parseFloat(newGoalTarget), parseFloat(newGoalYears), parseFloat(newGoalReturn)))}/mo
                    </p>
                  </div>
                )}
                <button onClick={addGoal}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 py-3.5 rounded-2xl font-bold hover:opacity-90 transition shadow-lg active:scale-[0.98]">
                  <i className="fas fa-plus mr-2" />Add Goal
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 dark:text-white">My Goals ({goals.length})</h4>
              {goals.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-8 text-center">
                  <div className="text-4xl mb-3">🎯</div>
                  <p className="font-bold text-slate-700 dark:text-slate-300">No goals yet</p>
                  <p className="text-xs text-slate-400 mt-1">Create your first goal on the left!</p>
                </div>
              ) : goals.map((goal) => {
                const progress = Math.min((goal.saved || 0) / goal.target * 100, 100);
                return (
                  <div key={goal.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">{goal.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{fmt(goal.target)} · {goal.years}y · {goal.returnRate}% p.a.</p>
                      </div>
                      <button onClick={() => saveGoals(goals.filter((g) => g.id !== goal.id))} className="text-red-400 hover:text-red-500 transition text-sm">
                        <i className="fas fa-trash-alt" />
                      </button>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Saved: {fmt(goal.saved || 0)}</span><span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-slate-400">Required SIP</p>
                        <p className="text-sm font-black text-amber-500">{fmt(goal.requiredSIP)}/mo</p>
                      </div>
                      <button onClick={() => {
                        const a = prompt("Add to savings (₹):");
                        if (a && parseFloat(a) > 0) saveGoals(goals.map((g) => g.id === goal.id ? { ...g, saved: (g.saved || 0) + parseFloat(a) } : g));
                      }}
                        className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-600 font-bold px-4 py-2 rounded-xl hover:bg-amber-100 transition">
                        + Add Progress
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── FD & RD TAB ──────────────────────────────────────── */}
        {activeTab === "fdrd" && (
          <FDRDSection
            currentUser={currentUser}
            updateUser={updateUser}
            addTransaction={addTransaction}
            showToast={showToast}
            uid_fn={uid}
          />
        )}

        {/* ── PORTFOLIO TAB ────────────────────────────────────── */}
        {activeTab === "portfolio" && (
          investments.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-12 text-center">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="font-bold text-slate-700 dark:text-white mb-2 text-lg">No investments yet</h3>
              <p className="text-sm text-slate-400 mb-6">Start from the "Invest Now" tab.</p>
              <button onClick={() => setActiveTab("invest")} className="bg-amber-500 text-slate-900 px-6 py-3 rounded-xl font-bold text-sm">Start Investing</button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-amber-500 to-yellow-400 rounded-3xl p-6 text-slate-900">
                <p className="text-xs font-bold text-slate-900/60 uppercase mb-1">Total Invested</p>
                <p className="text-4xl font-black mb-4">₹{totalInvested.toLocaleString("en-IN")}</p>
                <div className="grid grid-cols-3 gap-3">
                  {[["Transactions", investments.length], ["SIP", investments.filter((t) => String(t.desc || "").includes("SIP")).length], ["Lumpsum/FD", investments.filter((t) => !String(t.desc || "").includes("SIP")).length]].map(([k, v]) => (
                    <div key={k} className="bg-slate-900/10 rounded-2xl p-3 text-center">
                      <p className="text-xs text-slate-900/60">{k}</p><p className="font-black text-xl">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-4">Plan Breakdown</p>
                {Object.entries(investments.reduce((acc, t) => { const desc = String(t.desc || "Investment"); const plan = desc.split(" - ")[1] || desc; acc[plan] = (acc[plan] || 0) + (Number(t.amount) || 0); return acc; }, {})).map(([plan, amt]) => (
                  <div key={plan} className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{plan}</span>
                      <span className="font-black text-amber-500">{fmt(amt)}</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full" style={{ width: `${totalInvested > 0 ? (amt / totalInvested) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </ErrorBoundary>
  );
}
