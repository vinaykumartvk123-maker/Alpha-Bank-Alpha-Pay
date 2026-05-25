import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useApp } from "../../store/AppContext";
import { uid, sanitize, validateAmount } from "../../utils/security";
import { createRequest } from "../../utils/requests";
import { REQUEST_TYPES } from "../../utils/constants";
import { fmt } from "../../utils/helpers";
import ErrorBoundary from "../../components/common/ErrorBoundary";

// ── Bill categories ───────────────────────────────────────────────────────────
const BILL_CATS = [
  { id: "electricity", label: "Electricity",    icon: "fa-bolt",          color: "from-yellow-400 to-amber-500",  providers: ["MSEB","BESCOM","TNEB","WBSEDCL","CESC"] },
  { id: "mobile",      label: "Mobile Recharge", icon: "fa-mobile-alt",   color: "from-green-400 to-emerald-500", providers: ["Jio","Airtel","Vi","BSNL"] },
  { id: "dth",         label: "DTH / Cable",     icon: "fa-tv",           color: "from-purple-400 to-violet-500", providers: ["Tata Play","Airtel DTH","DishTV","SunDirect"] },
  { id: "gas",         label: "Piped Gas",       icon: "fa-fire",         color: "from-orange-400 to-red-500",    providers: ["MGL","IGL","GAIL","Adani Gas"] },
  { id: "water",       label: "Water",           icon: "fa-tint",         color: "from-blue-400 to-cyan-500",     providers: ["MCGM","BDA","GWMC","NDMC"] },
  { id: "broadband",   label: "Broadband",       icon: "fa-wifi",         color: "from-indigo-400 to-blue-500",   providers: ["BSNL","Airtel","Jio Fiber","ACT"] },
  { id: "credit",      label: "Credit Card",     icon: "fa-credit-card",  color: "from-slate-500 to-slate-700",   providers: ["HDFC","ICICI","SBI","Axis","Alpha Bank"] },
  { id: "fasttag",     label: "FASTag",          icon: "fa-road",         color: "from-teal-400 to-teal-600",     providers: ["Alpha Bank FASTag","HDFC FASTag","Paytm FASTag"] },
];

// ── Scheduled payments ────────────────────────────────────────────────────────
function ScheduledPayments() {
  const { currentUser, updateUser, showToast } = useApp();
  const [form, setForm]     = useState({ name: "", amount: "", day: "1", category: "electricity" });
  const [adding, setAdding] = useState(false);
  const schedules = currentUser?.schedules || [];

  const add = () => {
    const err = validateAmount(form.amount, undefined, "Amount");
    if (err) return showToast(err, "error");
    if (!form.name.trim()) return showToast("Enter a payment name", "error");
    const newSched = {
      id: uid(), name: sanitize(form.name),
      amount: parseFloat(form.amount), day: parseInt(form.day),
      category: form.category, active: true,
      createdOn: new Date().toLocaleDateString(),
      nextRun: `${form.day} of every month`,
    };
    updateUser({ schedules: [...schedules, newSched] });
    showToast(`Auto-pay for "${form.name}" scheduled on day ${form.day}!`, "success");
    setForm({ name: "", amount: "", day: "1", category: "electricity" });
    setAdding(false);
  };

  const toggle = (id) => {
    updateUser({ schedules: schedules.map((s) => s.id === id ? { ...s, active: !s.active } : s) });
  };
  const remove = (id) => {
    updateUser({ schedules: schedules.filter((s) => s.id !== id) });
    showToast("Schedule removed", "info");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-white text-lg">Scheduled Payments</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Auto-pay recurring bills on a set date every month</p>
        </div>
        <button onClick={() => setAdding((v) => !v)}
          className="flex items-center gap-2 bg-amber-500 text-slate-900 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-amber-600 transition active:scale-95">
          <i className={`fas ${adding ? "fa-times" : "fa-plus"} text-xs`} />
          {adding ? "Cancel" : "Add Schedule"}
        </button>
      </div>

      {adding && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-2xl p-5 mb-6">
          <h4 className="font-bold text-slate-800 dark:text-white mb-4 text-sm">New Scheduled Payment</h4>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1.5">Payment Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Electricity Bill, Netflix"
                className="w-full p-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-400 transition" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1.5">Amount (₹)</label>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0" min="1"
                className="w-full p-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-400 transition" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1.5">Day of Month</label>
              <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}
                className="w-full p-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-400 transition">
                {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>{d}{d===1?"st":d===2?"nd":d===3?"rd":"th"} of every month</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1.5">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full p-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-400 transition">
                {BILL_CATS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <button onClick={add}
            className="bg-amber-500 text-slate-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-amber-600 transition active:scale-95">
            <i className="fas fa-calendar-check mr-2" />Create Auto-Pay
          </button>
        </div>
      )}

      {schedules.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <i className="fas fa-calendar-alt text-2xl text-slate-400" />
          </div>
          <p className="font-semibold text-slate-600 dark:text-slate-300 text-sm">No scheduled payments</p>
          <p className="text-xs text-slate-400 mt-1">Add recurring bills and forget about late payments</p>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map((s) => {
            const cat = BILL_CATS.find((c) => c.id === s.category) || BILL_CATS[0];
            return (
              <div key={s.id}
                className={`bg-white dark:bg-slate-800 rounded-2xl border p-4 flex items-center gap-4 transition ${s.active ? "border-slate-100 dark:border-slate-700" : "border-slate-100 dark:border-slate-700 opacity-60"}`}>
                <div className={`w-11 h-11 bg-gradient-to-br ${cat.color} rounded-xl flex items-center justify-center text-white flex-none`}>
                  <i className={`fas ${cat.icon} text-base`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 dark:text-white text-sm">{s.name}</p>
                  <div className="flex flex-wrap gap-2 mt-0.5">
                    <span className="text-xs text-slate-500 dark:text-slate-400">{fmt(s.amount)}/month</span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{s.nextRun}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-none">
                  <button onClick={() => toggle(s.id)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${s.active ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-600"}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${s.active ? "left-5" : "left-0.5"}`} />
                  </button>
                  <button onClick={() => remove(s.id)}
                    className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-400 flex items-center justify-center hover:bg-red-100 transition text-xs">
                    <i className="fas fa-trash-alt" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Bill payment form ─────────────────────────────────────────────────────────
function BillForm({ cat, onClose }) {
  const { currentUser, updateUser, addTransaction, showToast, addNotification } = useApp();
  const [provider, setProvider] = useState(cat.providers[0]);
  const [accNo,    setAccNo]    = useState("");
  const [amount,   setAmount]   = useState("");
  const [loading,  setLoading]  = useState(false);

  const pay = async () => {
    const cardControls = currentUser?.cardControls || {};
    if (cardControls.frozen) return showToast("Your virtual card is frozen. Unfreeze it from the Dashboard card controls.", "error");
    if (cardControls.online === false) return showToast("Online card payments are disabled. Enable Online in Dashboard card controls.", "error");
    const err = validateAmount(amount, currentUser?.balance);
    if (err) return showToast(err, "error");
    if (!accNo.trim()) return showToast("Enter your account / consumer number", "error");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    const amt = parseFloat(amount);
    const cashback = parseFloat((amt * 0.01).toFixed(2));
    const desc = `${cat.label} Paid: ${provider} — ${sanitize(accNo).slice(0, 20)}`;
    updateUser({
      balance: (currentUser.balance || 0) - amt,
      rewards: { ...currentUser.rewards, cashback: (currentUser.rewards?.cashback || 0) + cashback },
    });
    addTransaction({ type: "debit", desc, amount: amt, category: "bills" });
    addNotification(`${cat.label} bill of ${fmt(amt)} paid successfully. +₹${cashback} cashback!`, "success");
    showToast(`${cat.label} bill paid! +₹${cashback} cashback 🎉`, "success");
    setLoading(false); setAmount(""); setAccNo(""); onClose();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1.5">Provider</label>
        <select value={provider} onChange={(e) => setProvider(e.target.value)}
          className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-400 transition">
          {cat.providers.map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1.5">
          {cat.id === "mobile" ? "Mobile Number" : cat.id === "credit" ? "Card Last 4 Digits" : "Consumer / Account No."}
        </label>
        <input value={accNo} onChange={(e) => setAccNo(e.target.value)} maxLength={20}
          placeholder={cat.id === "mobile" ? "10-digit number" : "Enter number"}
          className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-400 transition" />
      </div>
      <div>
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1.5">Amount (₹)</label>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min="1" placeholder="0"
          className="w-full p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xl font-bold text-amber-600 dark:text-amber-400 outline-none focus:ring-2 focus:ring-amber-400 transition" />
        <div className="flex gap-2 mt-2">
          {[200,500,1000,2000].map((v) => (
            <button key={v} type="button" onClick={() => setAmount(String(v))}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-amber-50 hover:text-amber-600 transition">₹{v}</button>
          ))}
        </div>
      </div>
      <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 p-3 rounded-xl">
        <i className="fas fa-gift mr-1 text-amber-500" />Earn <strong>1% cashback</strong> on bill payments · Balance: <strong>{fmt(currentUser?.balance || 0)}</strong>
      </div>
      <button onClick={pay} disabled={loading}
        className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 py-4 rounded-2xl font-bold hover:opacity-90 transition shadow-lg active:scale-[0.98] disabled:opacity-60 text-base">
        {loading ? <><i className="fas fa-spinner fa-spin mr-2" />Paying…</> : <><i className="fas fa-bolt mr-2" />Pay Now</>}
      </button>
    </div>
  );
}

function DepositRequest() {
  const { currentUser, showToast, addNotification } = useApp();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("UPI");
  const [loading, setLoading] = useState(false);

  const submitDeposit = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 100) return showToast("Minimum deposit is ₹100", "error");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    createRequest(REQUEST_TYPES.DEPOSIT, {
      userId: currentUser?.id,
      username: currentUser?.username,
      amount: amt,
      details: { method, requested: new Date().toLocaleDateString() },
    });
    addNotification(`Deposit request of ${fmt(amt)} submitted and pending approval.`, "info");
    showToast("Deposit request submitted! Admin will credit your account shortly.", "success");
    setAmount("");
    setMethod("UPI");
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-3xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-3xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
            <i className="fas fa-piggy-bank text-lg" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">Request a Deposit</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Submit a deposit request and our admin team will credit it within 24 hours.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1.5">Payment Method</label>
          <select value={method} onChange={(e) => setMethod(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-400 transition">
            {['UPI', 'Net Banking', 'NEFT/RTGS'].map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1.5">Amount (₹)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min="100" placeholder="100"
            className="w-full p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xl font-bold text-amber-700 dark:text-amber-400 outline-none focus:ring-2 focus:ring-amber-400 transition" />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[100, 500, 1000, 5000].map((value) => (
          <button key={value} type="button" onClick={() => setAmount(String(value))}
            className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl py-2 text-xs font-bold hover:bg-amber-50 hover:text-amber-600 transition">
            ₹{value}
          </button>
        ))}
      </div>

      <button onClick={submitDeposit} disabled={loading}
        className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 py-4 rounded-2xl font-bold hover:opacity-90 transition shadow-lg active:scale-[0.98] disabled:opacity-60 text-base">
        {loading ? <><i className="fas fa-spinner fa-spin mr-2" />Submitting…</> : <><i className="fas fa-paper-plane mr-2" />Submit Deposit Request</>}
      </button>
    </div>
  );
}

// ── KYC Flow ──────────────────────────────────────────────────────────────────
function KYCSection() {
  const { currentUser, updateUser, showToast } = useApp();
  const kyc = currentUser?.kyc || { status: "pending", step: 0 };
  const [step,    setStep]    = useState(kyc.step || 0);
  const [aadhaar, setAadhaar] = useState(currentUser?.kyc?.aadhaar || "");
  const [pan,     setPan]     = useState(currentUser?.kyc?.pan     || "");
  const [selfie,  setSelfie]  = useState(currentUser?.kyc?.selfie  || false);
  const [loading, setLoading] = useState(false);

  const isVerified = kyc.status === "verified";

  const submitStep = async (nextStep) => {
    if (step === 0) {
      const clean = aadhaar.replace(/\s/g, "");
      if (!/^\d{12}$/.test(clean)) return showToast("Enter a valid 12-digit Aadhaar number", "error");
    }
    if (step === 1) {
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase())) return showToast("Enter a valid PAN (e.g. ABCDE1234F)", "error");
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    const updates = { step: nextStep };
    if (step === 0) updates.aadhaar = aadhaar.replace(/\s/g, "");
    if (step === 1) updates.pan = pan.toUpperCase();
    if (nextStep >= 3) { updates.status = "verified"; showToast("🎉 KYC Verified! Full banking access unlocked.", "success"); }
    else showToast(`Step ${step + 1} verified!`, "success");
    updateUser({ kyc: { ...kyc, ...updates } });
    setStep(nextStep);
    setLoading(false);
  };

  if (isVerified || (kyc.status === "verified")) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/30 rounded-2xl p-6 flex items-start gap-4">
        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-none">
          <i className="fas fa-shield-alt text-white text-xl" />
        </div>
        <div>
          <p className="font-bold text-green-700 dark:text-green-400 text-lg">KYC Verified ✓</p>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Your account is fully verified. You have access to all banking features including higher transfer limits.</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {["Aadhaar Verified", "PAN Verified", "Selfie Verified"].map((b) => (
              <span key={b} className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-3 py-1 rounded-full font-bold">
                <i className="fas fa-check mr-1" />{b}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const STEPS = [
    { title: "Aadhaar Verification",   icon: "fa-id-card",   desc: "Enter your 12-digit Aadhaar number" },
    { title: "PAN Card",               icon: "fa-file-alt",  desc: "Enter your 10-character PAN" },
    { title: "Selfie Verification",    icon: "fa-camera",    desc: "Take a selfie for liveness check" },
  ];

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center flex-none">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${i < step ? "text-green-600 bg-green-50 dark:bg-green-900/20" : i === step ? "text-amber-700 bg-amber-100 dark:bg-amber-900/30" : "text-slate-400 bg-slate-50 dark:bg-slate-800"}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black flex-none ${i < step ? "bg-green-500 text-white" : i === step ? "bg-amber-500 text-slate-900" : "bg-slate-200 dark:bg-slate-600 text-slate-500"}`}>
                {i < step ? <i className="fas fa-check" /> : i + 1}
              </div>
              <span className="whitespace-nowrap">{s.title}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`h-0.5 w-6 flex-none ${i < step ? "bg-green-400" : "bg-slate-200 dark:bg-slate-700"}`} />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 max-w-md">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
            <i className={`fas ${STEPS[step]?.icon} text-amber-600`} />
          </div>
          <div>
            <p className="font-bold text-slate-800 dark:text-white">{STEPS[step]?.title}</p>
            <p className="text-xs text-slate-400">{STEPS[step]?.desc}</p>
          </div>
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <input value={aadhaar} onChange={(e) => setAadhaar(e.target.value.replace(/\D/g,"").slice(0,12))}
              placeholder="Enter 12-digit Aadhaar number" maxLength={12}
              className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-mono text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-400 transition tracking-widest" />
            <p className="text-[11px] text-slate-400"><i className="fas fa-lock mr-1 text-green-500" />Your Aadhaar is encrypted and never stored in plaintext.</p>
            <button onClick={() => submitStep(1)} disabled={loading || aadhaar.length !== 12}
              className="w-full bg-amber-500 text-slate-900 py-3 rounded-xl font-bold text-sm hover:bg-amber-600 transition disabled:opacity-50">
              {loading ? <><i className="fas fa-spinner fa-spin mr-2" />Verifying…</> : "Verify Aadhaar →"}
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <input value={pan} onChange={(e) => setPan(e.target.value.toUpperCase().slice(0,10))}
              placeholder="e.g. ABCDE1234F" maxLength={10}
              className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-mono text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-400 transition tracking-widest uppercase" />
            <p className="text-[11px] text-slate-400"><i className="fas fa-shield-alt mr-1 text-green-500" />Used only for tax compliance as per Income Tax Act.</p>
            <button onClick={() => submitStep(2)} disabled={loading || pan.length !== 10}
              className="w-full bg-amber-500 text-slate-900 py-3 rounded-xl font-bold text-sm hover:bg-amber-600 transition disabled:opacity-50">
              {loading ? <><i className="fas fa-spinner fa-spin mr-2" />Verifying…</> : "Verify PAN →"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 flex flex-col items-center gap-3">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 rounded-full flex items-center justify-center">
                {selfie ? <i className="fas fa-check text-green-500 text-3xl" /> : <i className="fas fa-camera text-amber-500 text-3xl" />}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">Click below to simulate a selfie capture for liveness detection</p>
              <button onClick={() => setSelfie(true)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition ${selfie ? "bg-green-100 text-green-700" : "bg-amber-500 text-slate-900 hover:bg-amber-600"}`}>
                {selfie ? <><i className="fas fa-check mr-2" />Selfie Captured!</> : <><i className="fas fa-camera mr-2" />Capture Selfie</>}
              </button>
            </div>
            <button onClick={() => submitStep(3)} disabled={loading || !selfie}
              className="w-full bg-green-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-600 transition disabled:opacity-50">
              {loading ? <><i className="fas fa-spinner fa-spin mr-2" />Completing KYC…</> : <><i className="fas fa-shield-alt mr-2" />Complete KYC Verification</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Services main ─────────────────────────────────────────────────────────────
export default function Services() {
  const location = useLocation();
  const { openModal, closeModal, currentUser } = useApp();
  const params = new URLSearchParams(location.search);
  const [activeTab, setActiveTab] = useState(params.get("tab") || "bills");
  const billTx = (currentUser?.tx || []).filter((t) => t.category === "bills").slice(-5).reverse();

  const payBill = (cat) => {
    openModal(`Pay ${cat.label} Bill`, <BillForm cat={cat} onClose={closeModal} />);
  };

  const TABS = [
    { id: "bills",     label: "Pay Bills",     icon: "fa-file-invoice"   },
    { id: "scheduled", label: "Auto-Pay",      icon: "fa-calendar-check" },
    { id: "deposit",   label: "Deposit",       icon: "fa-piggy-bank"     },
    { id: "kyc",       label: "KYC",           icon: "fa-shield-alt"     },
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

        {/* ── Bill payments ── */}
        {activeTab === "bills" && (
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-1">Pay Bills & Recharges</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Earn <strong className="text-amber-500">1% cashback</strong> on every bill payment</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {BILL_CATS.map((cat) => (
                <button key={cat.id} onClick={() => payBill(cat)}
                  className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 flex flex-col items-center gap-3 hover:-translate-y-1 hover:shadow-lg transition-all text-center active:scale-95">
                  <div className={`w-14 h-14 bg-gradient-to-br ${cat.color} rounded-2xl flex items-center justify-center text-white text-2xl shadow-md group-hover:scale-110 transition-transform`}>
                    <i className={`fas ${cat.icon}`} />
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-200 text-sm leading-tight">{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Recent bill payments rendered from parent-level billTx */}
            {billTx.length > 0 && (
              <div className="mt-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
                <h4 className="font-bold text-slate-700 dark:text-white text-sm mb-4">Recent Bill Payments</h4>
                <div className="space-y-3">
                  {billTx.map((t) => (
                    <div key={t.id} className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.desc}</p>
                        <p className="text-xs text-slate-400">{t.date}</p>
                      </div>
                      <span className="font-bold text-slate-800 dark:text-white text-sm">{fmt(t.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Scheduled payments ── */}
        {activeTab === "scheduled" && <ScheduledPayments />}

        {activeTab === "deposit" && <DepositRequest />}

        {/* ── KYC ── */}
        {activeTab === "kyc" && (
          <div>
            <div className="mb-6">
              <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-1">KYC Verification</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Complete your KYC to unlock higher transfer limits and all banking features. RBI mandated.</p>
            </div>
            <KYCSection />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
