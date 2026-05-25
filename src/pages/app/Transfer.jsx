import { useState } from "react";
import { useApp } from "../../store/AppContext";
import { getDB, saveDB } from "../../utils/storage";
import { uid, sanitizeUsername, sanitize, validateAmount } from "../../utils/security";
import { createRequest } from "../../utils/requests";
import { REQUEST_TYPES } from "../../utils/constants";
import ErrorBoundary from "../../components/common/ErrorBoundary";
import UPIPin from "../../components/common/UPIPin";

const RAILS = [
  { id: "imps", label: "IMPS", desc: "Instant · 24/7", fee: 0,  limit: 500000,   time: "Instant",   color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"   },
  { id: "neft", label: "NEFT", desc: "Batched · Free",  fee: 0,  limit: 1000000,  time: "2–4 hours", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"     },
  { id: "rtgs", label: "RTGS", desc: "High Value",      fee: 25, limit: 50000000, time: "30 min",    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
];

export default function Transfer() {
  const { currentUser, updateUser, addTransaction, showToast, openModal, closeModal, addNotification } = useApp();
  const [recipient,  setRecipient]  = useState("");
  const [amount,     setAmount]     = useState("");
  const [note,       setNote]       = useState("");
  const [rail,       setRail]       = useState("imps");
  const [loading,    setLoading]    = useState(false);
  const [activeTab,  setActiveTab]  = useState("send");
  const [pinOpen,    setPinOpen]    = useState(false);
  const [pendingTx,  setPendingTx]  = useState(null); // holds validated tx data until PIN confirmed

  const selectedRail  = RAILS.find((r) => r.id === rail);
  const beneficiaries = currentUser?.beneficiaries || [];
  const dailyTransferLimit = Number(currentUser?.security?.dailyTransferLimit) || 100000;
  const today = new Date().toLocaleDateString();
  const sentToday = (currentUser?.tx || [])
    .filter((t) => t.type === "debit" && t.category === "transfer" && t.date === today)
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const remainingDailyLimit = Math.max(0, dailyTransferLimit - sentToday);

  const recentPayees = (() => {
    const map = {};
    (currentUser?.tx || [])
      .filter((t) => t.desc?.startsWith("Sent to"))
      .forEach((t) => { const n = String(t.desc || "").split(" — ")[0].replace("Sent to ", ""); if (n) map[n] = (map[n] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([n]) => n);
  })();

  const saveBeneficiary = (username) => {
    if (beneficiaries.some((b) => b.username === username)) return showToast("Already saved", "info");
    updateUser({ beneficiaries: [...beneficiaries, { id: uid(), username, addedOn: new Date().toLocaleDateString() }] });
    showToast(`${username} saved as beneficiary!`, "success");
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const cleanRecipient = sanitizeUsername(recipient);
    const amtErr = validateAmount(amount, currentUser?.balance);
    if (!cleanRecipient)    return showToast("Enter a valid username", "error");
    if (amtErr)             return showToast(amtErr, "error");
    if (cleanRecipient.toLowerCase() === currentUser.username.toLowerCase())
                            return showToast("Cannot transfer to yourself", "error");

    const amt = parseFloat(amount);
    if (selectedRail?.limit && amt > selectedRail.limit)
      return showToast(`${selectedRail.label} limit is ₹${selectedRail.limit.toLocaleString("en-IN")}`, "error");

    const users  = getDB();
    const target = Object.values(users).find((u) => u.username.toLowerCase() === cleanRecipient.toLowerCase());
    if (!target) return showToast(`User "${cleanRecipient}" not found on Alpha Pay`, "error");

    const totalDebit = amt + (selectedRail?.fee || 0);
    if (totalDebit > (currentUser?.balance || 0))
      return showToast(`Insufficient balance (includes ₹${selectedRail?.fee || 0} ${selectedRail?.label} fee)`, "error");
    if (amt > remainingDailyLimit)
      return showToast(`Daily transfer limit exceeded. Remaining today: ₹${remainingDailyLimit.toLocaleString("en-IN")}`, "error");

    // Check UPI PIN is set
    if (!currentUser?.upiPinHash) {
      showToast("Please set your UPI PIN first in Settings → Security.", "error");
      return;
    }

    // Store pending transaction and open PIN modal
    setPendingTx({ target, amt, totalDebit, cleanNote: sanitize(note) });
    setPinOpen(true);
  };

  const executeTransfer = async () => {
    if (!pendingTx) return;
    const { target, amt, totalDebit, cleanNote } = pendingTx;
    setPinOpen(false);
    setLoading(true);

    const delay = rail === "imps" ? 1000 : rail === "neft" ? 1500 : 2000;
    await new Promise((r) => setTimeout(r, delay));

    const cashback  = parseFloat((amt * 0.005).toFixed(2));
    const desc      = cleanNote ? `Sent to ${target.username} — ${cleanNote.slice(0, 60)}` : `Sent to ${target.username}`;

    updateUser({
      balance:  (currentUser.balance || 0) - totalDebit,
      rewards:  { ...currentUser.rewards, cashback: (currentUser.rewards?.cashback || 0) + cashback },
    });
    addTransaction({ type: "debit", desc, amount: amt, category: "transfer" });
    addNotification(`₹${amt.toLocaleString("en-IN")} sent to ${target.username} via ${selectedRail.label}.`, "success");

    // Credit recipient
    const users     = getDB();
    target.balance  = (target.balance || 0) + amt;
    target.tx       = target.tx || [];
    const recvDesc  = cleanNote ? `Received from ${currentUser.username} — ${cleanNote.slice(0, 60)}` : `Received from ${currentUser.username}`;
    target.tx.push({ id: uid(), type: "credit", desc: recvDesc, amount: amt, date: new Date().toLocaleDateString(), category: "transfer" });
    target.notifications = [
      { id: uid(), type: "success", msg: `💸 You received ₹${amt.toLocaleString("en-IN")} from ${currentUser.username}!`, date: new Date().toLocaleDateString(), read: false },
      ...(target.notifications || []),
    ].slice(0, 30);
    users[target.id] = target;
    saveDB(users);

    showToast(`₹${amt.toLocaleString("en-IN")} sent via ${selectedRail.label}! +₹${cashback} cashback 💸`, "success");
    setRecipient(""); setAmount(""); setNote(""); setLoading(false); setPendingTx(null);
  };

  const removeBeneficiary = (id) => {
    updateUser({ beneficiaries: beneficiaries.filter((b) => b.id !== id) });
    showToast("Beneficiary removed", "info");
  };

  return (
    <ErrorBoundary>
      {/* UPI PIN modal */}
      {pinOpen && (
        <UPIPin
          mode="verify"
          title={`Confirm transfer of ₹${parseFloat(amount).toLocaleString("en-IN")} to ${recipient}`}
          onSuccess={executeTransfer}
          onClose={() => { setPinOpen(false); setPendingTx(null); }}
        />
      )}

      <div className="page-fade-in">
        {/* Tab bar */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-6 w-fit">
          {[["send","fa-paper-plane","Send Money"],["beneficiaries","fa-users","Beneficiaries"]].map(([id,icon,label]) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === id ? "bg-amber-500 text-slate-900 shadow-md" : "text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"}`}>
              <i className={`fas ${icon} text-xs`} />{label}
            </button>
          ))}
        </div>

        {activeTab === "send" && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
              <h3 className="text-xl font-bold mb-1 text-slate-800 dark:text-white">Send Money</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Secured with UPI PIN · 0.5% cashback on every transfer</p>
              <div className="mb-5 grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-2xl p-3">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Daily Limit</p>
                  <p className="text-sm font-black text-slate-700 dark:text-white">₹{dailyTransferLimit.toLocaleString("en-IN")}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-2xl p-3">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Remaining Today</p>
                  <p className="text-sm font-black text-amber-600">₹{remainingDailyLimit.toLocaleString("en-IN")}</p>
                </div>
              </div>

              {!currentUser?.upiPinHash && (
                <div className="mb-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-2xl p-4 flex items-start gap-3">
                  <i className="fas fa-exclamation-triangle text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-700 dark:text-amber-400">UPI PIN not set</p>
                    <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">Go to Settings → Security to set your 6-digit UPI PIN before sending money.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Recipient Username</label>
                  <div className="relative mt-2">
                    <input value={recipient} onChange={(e) => setRecipient(e.target.value)} required
                      className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition"
                      placeholder="Enter exact username…" autoComplete="off" />
                    <i className="fas fa-user absolute left-4 top-4 text-slate-400" />
                    {recipient && (
                      <button type="button" onClick={() => saveBeneficiary(sanitizeUsername(recipient))} title="Save as beneficiary"
                        className="absolute right-3 top-3 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-amber-500 transition text-xs">
                        <i className="fas fa-user-plus" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Rail selector */}
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">Transfer Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    {RAILS.map((r) => (
                      <button key={r.id} type="button" onClick={() => setRail(r.id)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${rail === r.id ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20" : "border-slate-200 dark:border-slate-600 hover:border-amber-300"}`}>
                        <p className={`text-xs font-black ${rail === r.id ? "text-amber-600" : "text-slate-700 dark:text-slate-300"}`}>{r.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{r.desc}</p>
                        <p className={`text-[10px] mt-1 font-bold ${r.fee > 0 ? "text-orange-500" : "text-green-500"}`}>{r.fee > 0 ? `Fee: ₹${r.fee}` : "Free"}</p>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-2"><i className="fas fa-clock mr-1" />{selectedRail?.label}: {selectedRail?.time} · Limit: ₹{(selectedRail?.limit || 0).toLocaleString("en-IN")}</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Amount (₹)</label>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required min="1"
                    className="w-full mt-2 p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none text-2xl font-bold text-amber-700 dark:text-amber-400 placeholder-slate-300 transition"
                    placeholder="0.00" />
                  <div className="flex gap-2 mt-2">
                    {[500,1000,2000,5000].map((v) => (
                      <button key={v} type="button" onClick={() => setAmount(String(v))}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-amber-50 hover:text-amber-600 transition">
                        ₹{v >= 1000 ? v/1000+"K" : v}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Note (optional)</label>
                  <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={60}
                    className="w-full mt-2 p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none transition text-sm"
                    placeholder="e.g. Dinner split, rent…" />
                </div>

                <button type="submit" disabled={loading || !currentUser?.upiPinHash}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 py-4 rounded-xl font-bold shadow-lg shadow-amber-200 hover:opacity-90 transition active:scale-95 disabled:opacity-60">
                  {loading
                    ? <><i className="fas fa-spinner fa-spin mr-2" />Processing…</>
                    : <><i className="fas fa-lock mr-2" />Continue with UPI PIN</>}
                </button>
              </form>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {recentPayees.length > 0 && (
                <div className="bg-amber-50 dark:bg-slate-800 p-6 rounded-3xl border border-amber-100 dark:border-slate-700">
                  <h3 className="text-base font-bold mb-4 text-amber-900 dark:text-white">Recent Payees</h3>
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {recentPayees.map((name) => (
                      <button key={name} onClick={() => setRecipient(name)} className="flex flex-col items-center gap-2 min-w-[56px] group">
                        <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center text-amber-600 font-bold border-2 border-amber-100 dark:border-slate-600 shadow-sm group-hover:bg-amber-500 group-hover:text-slate-900 transition">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 text-center truncate max-w-[56px]">{name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {beneficiaries.length > 0 && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
                  <h3 className="text-base font-bold mb-4 text-slate-800 dark:text-white">Saved Beneficiaries</h3>
                  <div className="space-y-2">
                    {beneficiaries.slice(0, 4).map((b) => (
                      <button key={b.id} onClick={() => setRecipient(b.username)}
                        className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 transition text-left">
                        <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 font-bold flex-none">
                          {b.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{b.username}</p>
                          <p className="text-xs text-slate-400">Added {b.addedOn}</p>
                        </div>
                        <i className="fas fa-arrow-right text-amber-400 text-xs" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Transfer Modes</h3>
                {RAILS.map((r) => (
                  <div key={r.id} className={`flex items-start justify-between p-3 rounded-xl border mb-2 last:mb-0 transition ${rail === r.id ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700" : "bg-slate-50 dark:bg-slate-700/50 border-transparent"}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full border ${r.color}`}>{r.label}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{r.time}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Up to ₹{(r.limit/100000).toFixed(0)}L</p>
                    </div>
                    <span className={`text-xs font-bold ${r.fee > 0 ? "text-orange-500" : "text-green-500"}`}>{r.fee > 0 ? `₹${r.fee}` : "FREE"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "beneficiaries" && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl text-slate-800 dark:text-white">Saved Beneficiaries</h3>
              <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">{beneficiaries.length} saved</span>
            </div>
            {beneficiaries.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <i className="fas fa-users text-4xl mb-3 block opacity-30" />
                <p className="font-medium">No saved beneficiaries</p>
                <p className="text-xs mt-1">Click <i className="fas fa-user-plus text-amber-500 mx-1" /> when entering a username to save them.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {beneficiaries.map((b) => (
                  <div key={b.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-300 rounded-full flex items-center justify-center text-slate-900 font-black text-lg flex-none">
                      {b.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 dark:text-white">{b.username}</p>
                      <p className="text-xs text-slate-400 font-mono">{b.username.toLowerCase()}@alpha</p>
                      <p className="text-xs text-slate-400 mt-0.5">Added {b.addedOn}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => { setRecipient(b.username); setActiveTab("send"); }}
                        className="w-9 h-9 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl flex items-center justify-center hover:bg-amber-200 transition text-xs">
                        <i className="fas fa-paper-plane" />
                      </button>
                      <button onClick={() => removeBeneficiary(b.id)}
                        className="w-9 h-9 bg-red-50 dark:bg-red-900/20 text-red-400 rounded-xl flex items-center justify-center hover:bg-red-100 transition text-xs">
                        <i className="fas fa-trash-alt" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
