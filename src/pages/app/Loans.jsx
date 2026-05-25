import { useState } from "react";
import { useApp } from "../../store/AppContext";
import { calculateEMI, fmt } from "../../utils/helpers";
import { LOAN_PRODUCTS, REQUEST_TYPES } from "../../utils/constants";
import { createRequest, getUserRequests } from "../../utils/requests";
import { validateAmount } from "../../utils/security";
import { REQUEST_STATUS } from "../../utils/constants";
import ErrorBoundary from "../../components/common/ErrorBoundary";

const FEATURES = {
  "loan-personal":  ["No collateral required","Flexible tenure 12–60 months","Instant in-app application","Pre-closure after 6 EMIs"],
  "loan-gold":      ["75% LTV on gold value","Same-day admin approval","Minimal documentation","Safe gold storage"],
  "loan-home":      ["Up to 90% property value","Tax benefit u/s 24 & 80C","Balance transfer facility","Doorstep service"],
  "loan-education": ["Moratorium during course + 1 yr","Covers tuition, hostel, books","Tax deduction u/s 80E","No collateral up to ₹7.5L"],
  "loan-business":  ["Collateral-free up to ₹5L","GST-based eligibility","Working capital option","Fast admin review"],
  "loan-vehicle":   ["Up to 100% on-road price (new)","Quick RC transfer support","500+ dealer tie-ups","Flexible 12–84 months"],
};

const STATUS_BADGE = {
  [REQUEST_STATUS.PENDING]:  "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700/40",
  [REQUEST_STATUS.APPROVED]: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700/40",
  [REQUEST_STATUS.REJECTED]: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700/40",
};
const STATUS_ICON = {
  [REQUEST_STATUS.PENDING]:  "fa-clock",
  [REQUEST_STATUS.APPROVED]: "fa-check-circle",
  [REQUEST_STATUS.REJECTED]: "fa-times-circle",
};

function LoanDetail({ loan, onBack }) {
  const { currentUser, showToast, addNotification } = useApp();
  const [loanAmt,  setLoanAmt]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [amtError, setAmtError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const emi = loanAmt
    ? calculateEMI(parseFloat(loanAmt), parseFloat(loan.rate), parseInt(loan.tenure))
    : 0;

  const apply = async () => {
    const err = validateAmount(loanAmt, loan.maxAmt, "Loan amount");
    if (err) { setAmtError(err); return; }
    const amt = parseFloat(loanAmt);
    if (amt < loan.minAmt) { setAmtError(`Minimum loan amount is ₹${loan.minAmt.toLocaleString("en-IN")}`); return; }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    createRequest(REQUEST_TYPES.LOAN, {
      userId:   currentUser.id,
      username: currentUser.username,
      amount:   amt,
      details: {
        loanName: loan.name,
        rate:     loan.rate + "% p.a.",
        tenure:   loan.tenure + " months",
        emi:      "₹" + emi.toLocaleString("en-IN", { maximumFractionDigits: 0 }) + "/mo",
        applied:  new Date().toLocaleDateString(),
      },
    });

    addNotification(`Your ${loan.name} application for ${fmt(amt)} has been submitted and is under review.`, "info");
    showToast(`${loan.name} application submitted! Admin will review shortly.`, "success");
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div>
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-amber-500 hover:text-amber-600 mb-6 transition">
          <i className="fas fa-arrow-left" /> Back to Loans
        </button>
        <div className="max-w-md mx-auto text-center py-12">
          <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
            <i className="fas fa-hourglass-half text-amber-500 text-3xl" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-3">Application Submitted!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-2">Your <strong>{loan.name}</strong> application for <strong>{fmt(parseFloat(loanAmt))}</strong> is under review.</p>
          <p className="text-sm text-slate-400">Admin will review and approve within 24 hours. You will receive a notification upon decision.</p>
          <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-2xl p-4 text-sm text-amber-700 dark:text-amber-400">
            <i className="fas fa-info-circle mr-2" />Track your application in the <strong>My Applications</strong> tab below.
          </div>
          <button onClick={onBack} className="mt-6 bg-amber-500 text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-amber-600 transition">
            Back to Loans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-amber-500 hover:text-amber-600 mb-6 transition">
        <i className="fas fa-arrow-left" /> Back to Loans
      </button>
      <div className={`bg-gradient-to-br ${loan.color} text-white rounded-3xl p-8 mb-8 relative overflow-hidden shadow-xl`}>
        <div className="absolute right-0 top-0 text-9xl opacity-10 -mr-4 -mt-4 pointer-events-none">{loan.icon}</div>
        <div className="relative z-10">
          <div className="text-5xl mb-4">{loan.icon}</div>
          <h2 className="text-3xl font-black mb-1">{loan.name}</h2>
          <p className="text-white/80 text-lg">{loan.max} max · {loan.rate}% p.a. · up to {loan.tenure} months</p>
          <p className="text-white/60 text-sm mt-2">Min: ₹{loan.minAmt?.toLocaleString("en-IN")}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-8">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Apply for Loan</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            <i className="fas fa-info-circle mr-1 text-amber-500" />Amount is credited after admin approval (usually within 24 hours)
          </p>

          <div className="mb-5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Loan Amount (₹)</label>
            <input type="number" value={loanAmt} min={loan.minAmt} max={loan.maxAmt} placeholder={`Min ₹${loan.minAmt?.toLocaleString("en-IN")} – Max ${loan.max}`}
              onChange={(e) => { setLoanAmt(e.target.value); setAmtError(""); }}
              className="w-full p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none text-2xl font-bold text-amber-700 dark:text-amber-400 placeholder-slate-300 transition" />
            {amtError && <p className="text-xs text-red-500 mt-1.5"><i className="fas fa-exclamation-circle mr-1" />{amtError}</p>}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {[10000, 50000, 100000, 200000].filter((v) => v <= loan.maxAmt && v >= loan.minAmt).map((v) => (
              <button key={v} onClick={() => { setLoanAmt(String(v)); setAmtError(""); }}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-amber-50 hover:text-amber-600 transition">
                ₹{v >= 100000 ? (v/100000).toFixed(1)+"L" : (v/1000)+"K"}
              </button>
            ))}
          </div>

          {loanAmt && !amtError && emi > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-2xl p-5 mb-6 space-y-2">
              {[
                ["Monthly EMI",   `₹${emi.toLocaleString("en-IN",{maximumFractionDigits:0})}`],
                ["Total Payable", `₹${(emi*parseInt(loan.tenure)).toLocaleString("en-IN",{maximumFractionDigits:0})}`],
                ["Tenure",        loan.tenure+" months"],
                ["Rate",          loan.rate+"% p.a."],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">{k}</span>
                  <span className="font-bold text-amber-700 dark:text-amber-400">{v}</span>
                </div>
              ))}
            </div>
          )}

          <button onClick={apply} disabled={loading || !loanAmt}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition shadow-lg active:scale-[0.98] disabled:opacity-50">
            {loading ? <><i className="fas fa-spinner fa-spin mr-2" />Submitting…</> : <><i className="fas fa-paper-plane mr-2" />Submit Application</>}
          </button>
          <p className="text-xs text-center text-slate-400 mt-3">
            <i className="fas fa-shield-alt mr-1 text-green-500" />Subject to admin approval · RBI compliant
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
            <h4 className="font-bold text-slate-800 dark:text-white mb-4"><i className="fas fa-star text-amber-500 mr-2" />Key Features</h4>
            <ul className="space-y-3">
              {(FEATURES[loan.id] || []).map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <span className="w-5 h-5 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center flex-none mt-0.5">
                    <i className="fas fa-check text-[10px]" />
                  </span>{f}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-700/30 rounded-2xl p-4 text-sm text-blue-700 dark:text-blue-400">
            <i className="fas fa-clock mr-2" /><strong>Approval Process:</strong> Admin reviews your application and credits the amount to your wallet. You'll receive a notification with the decision.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Loans() {
  const { currentUser, updateUser, addTransaction, showToast, addNotification } = useApp();
  const [activeLoan, setActiveLoan] = useState(null);
  const [activeTab,  setActiveTab]  = useState("products");
  const [prepayAmounts, setPrepayAmounts] = useState({});

  const userRequests = getUserRequests(currentUser?.id || "").filter((r) => r.type === REQUEST_TYPES.LOAN);
  const activeLoans  = currentUser?.loans || [];
  const loan         = LOAN_PRODUCTS.find((l) => l.id === activeLoan);

  const updateLoanRecord = (loanId, updater) => {
    updateUser({ loans: activeLoans.map((ln) => ln.id === loanId ? updater(ln) : ln) });
  };

  const payEmi = (ln, emiAmount) => {
    const outstanding = Number(ln.outstanding ?? ln.amount) || 0;
    const payment = Math.min(Math.round(emiAmount || 0), outstanding);
    if (!payment) return showToast("No EMI is due for this loan.", "info");
    if (payment > (Number(currentUser?.balance) || 0)) return showToast("Insufficient balance to pay EMI.", "error");

    updateLoanRecord(ln.id, (loanItem) => {
      const nextOutstanding = Math.max(0, (Number(loanItem.outstanding ?? loanItem.amount) || 0) - payment);
      return {
        ...loanItem,
        outstanding: nextOutstanding,
        paidEmis: (Number(loanItem.paidEmis) || 0) + 1,
        lastPaidOn: new Date().toLocaleDateString(),
        status: nextOutstanding === 0 ? "closed" : "active",
      };
    });
    updateUser({ balance: (Number(currentUser.balance) || 0) - payment });
    addTransaction({ type: "debit", desc: `Loan EMI Paid: ${ln.name}`, amount: payment, category: "loan" });
    addNotification(`EMI of ${fmt(payment)} paid for ${ln.name}.`, "success");
    showToast(`EMI paid: ${fmt(payment)}`, "success");
  };

  const prepayLoan = (ln) => {
    const raw = prepayAmounts[ln.id];
    const amount = Number(raw);
    const outstanding = Number(ln.outstanding ?? ln.amount) || 0;
    if (!Number.isFinite(amount) || amount <= 0) return showToast("Enter a valid prepayment amount.", "error");
    if (amount > outstanding) return showToast(`Prepayment cannot exceed outstanding ${fmt(outstanding)}.`, "error");
    if (amount > (Number(currentUser?.balance) || 0)) return showToast("Insufficient balance for prepayment.", "error");

    updateLoanRecord(ln.id, (loanItem) => {
      const nextOutstanding = Math.max(0, (Number(loanItem.outstanding ?? loanItem.amount) || 0) - amount);
      return {
        ...loanItem,
        outstanding: nextOutstanding,
        prepayments: [...(loanItem.prepayments || []), { amount, date: new Date().toLocaleDateString() }],
        status: nextOutstanding === 0 ? "closed" : "active",
      };
    });
    updateUser({ balance: (Number(currentUser.balance) || 0) - amount });
    addTransaction({ type: "debit", desc: `Loan Prepayment: ${ln.name}`, amount, category: "loan" });
    setPrepayAmounts({ ...prepayAmounts, [ln.id]: "" });
    showToast(`Prepayment recorded: ${fmt(amount)}`, "success");
  };

  if (loan) return <ErrorBoundary><LoanDetail loan={loan} onBack={() => setActiveLoan(null)} /></ErrorBoundary>;

  return (
    <ErrorBoundary>
      <div className="page-fade-in">
        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-6 w-fit">
          {[["products","fa-hand-holding-usd","Loan Products"],["applications","fa-inbox","My Applications"],["active","fa-list-check","Active Loans"]].map(([id,icon,label]) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab===id?"bg-amber-500 text-slate-900 shadow-md":"text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"}`}>
              <i className={`fas ${icon} text-xs`} />{label}
              {id==="applications" && userRequests.filter(r=>r.status===REQUEST_STATUS.PENDING).length > 0 && (
                <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {userRequests.filter(r=>r.status===REQUEST_STATUS.PENDING).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Products */}
        {activeTab === "products" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {LOAN_PRODUCTS.map((l) => (
              <button key={l.id} onClick={() => setActiveLoan(l.id)}
                className={`bg-gradient-to-br ${l.color} text-white p-6 rounded-3xl shadow-lg relative overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all text-left w-full active:scale-[0.98]`}>
                <div className="absolute right-0 top-0 text-8xl opacity-10 -mr-2 -mt-4 pointer-events-none">{l.icon}</div>
                <div className="relative z-10">
                  <div className="text-4xl mb-3">{l.icon}</div>
                  <h3 className="font-bold text-xl mb-1">{l.name}</h3>
                  <p className="text-white/75 text-sm mb-0.5">{l.max} · {l.rate}% p.a.</p>
                  <p className="text-white/55 text-xs mb-3">Min: ₹{l.minAmt?.toLocaleString("en-IN")}</p>
                  <div className="flex items-center gap-1.5 bg-white/20 py-2 px-4 rounded-2xl text-sm font-bold w-fit">
                    Apply Now <i className="fas fa-arrow-right text-xs ml-1" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Applications */}
        {activeTab === "applications" && (
          <div>
            {userRequests.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                <div className="text-4xl mb-3">📋</div>
                <p className="font-bold text-slate-600 dark:text-slate-300">No applications yet</p>
                <p className="text-sm text-slate-400 mt-1">Apply for a loan from the Products tab</p>
                <button onClick={() => setActiveTab("products")} className="mt-4 bg-amber-500 text-slate-900 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-amber-600 transition">
                  Browse Loans
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {userRequests.map((req) => (
                  <div key={req.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white text-lg">{req.details?.loanName}</p>
                        <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{fmt(req.amount)}</p>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${STATUS_BADGE[req.status]}`}>
                        <i className={`fas ${STATUS_ICON[req.status]} text-[10px]`} />
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[["Rate",req.details?.rate],["Tenure",req.details?.tenure],["EMI",req.details?.emi],["Applied",req.details?.applied]].map(([k,v])=>(
                        <div key={k} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-2.5">
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">{k}</p>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5">{v}</p>
                        </div>
                      ))}
                    </div>
                    {req.status === REQUEST_STATUS.REJECTED && req.adminNote && (
                      <div className="mt-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-700/30 rounded-xl p-3 text-xs text-red-600 dark:text-red-400">
                        <i className="fas fa-info-circle mr-1.5" /><strong>Reason:</strong> {req.adminNote}
                      </div>
                    )}
                    {req.status === REQUEST_STATUS.APPROVED && (
                      <div className="mt-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-700/30 rounded-xl p-3 text-xs text-green-600 dark:text-green-400">
                        <i className="fas fa-check-circle mr-1.5" />Amount credited to your wallet! Check your transaction history.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Active Loans */}
        {activeTab === "active" && (
          <div>
            {activeLoans.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                <div className="text-4xl mb-3">🏦</div>
                <p className="font-bold text-slate-600 dark:text-slate-300">No active loans</p>
                <p className="text-sm text-slate-400 mt-1">Approved loans will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeLoans.map((ln) => {
                  const amount = Number(ln.amount) || 0;
                  const rate = parseFloat(ln.rate) || 0;
                  const tenure = parseInt(ln.tenure, 10) || 0;
                  const emi = amount > 0 && tenure > 0 ? calculateEMI(amount, rate, tenure) : 0;
                  const outstanding = Number(ln.outstanding ?? amount) || 0;
                  const paidEmis = Number(ln.paidEmis) || 0;
                  const progress = amount > 0 ? Math.min(100, ((amount - outstanding) / amount) * 100) : 0;
                  const isClosed = ln.status === "closed" || outstanding === 0;
                  const emiLabel = Number.isFinite(emi) && emi > 0
                    ? `₹${emi.toLocaleString("en-IN",{maximumFractionDigits:0})}`
                    : "N/A";
                  return (
                    <div key={ln.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white">{ln.name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{fmt(amount)} {rate > 0 ? `@ ${rate}% p.a.` : ""}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{tenure > 0 ? `${tenure} months` : "Tenure unavailable"} · Approved: {ln.date}</p>
                        </div>
                        <div className="text-right flex-none">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Monthly EMI</p>
                          <p className="font-bold text-amber-600 text-lg">{emiLabel}</p>
                          <span className={`text-xs px-3 py-0.5 rounded-full font-bold ${isClosed ? "bg-slate-100 dark:bg-slate-700 text-slate-500" : "bg-green-100 dark:bg-green-900/30 text-green-700"}`}>
                            {isClosed ? "Closed" : "Active"}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 grid sm:grid-cols-3 gap-3">
                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Outstanding</p>
                          <p className="font-black text-slate-800 dark:text-white">{fmt(outstanding)}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                          <p className="text-[10px] text-slate-400 uppercase font-bold">EMIs Paid</p>
                          <p className="font-black text-slate-800 dark:text-white">{paidEmis}{tenure > 0 ? `/${tenure}` : ""}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Last Paid</p>
                          <p className="font-black text-slate-800 dark:text-white">{ln.lastPaidOn || "Not yet"}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                      {!isClosed && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button onClick={() => payEmi(ln, emi)}
                            className="bg-amber-500 text-slate-900 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-amber-600 transition">
                            <i className="fas fa-calendar-check mr-2" />Pay EMI
                          </button>
                          <input type="number" min="1" max={outstanding} value={prepayAmounts[ln.id] || ""} onChange={(e) => setPrepayAmounts({ ...prepayAmounts, [ln.id]: e.target.value })}
                            placeholder="Prepay amount"
                            className="flex-1 min-w-[150px] bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-400" />
                          <button onClick={() => prepayLoan(ln)}
                            className="bg-slate-900 dark:bg-slate-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition">
                            <i className="fas fa-forward mr-2" />Prepay
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
