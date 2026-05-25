import { useState, useCallback } from "react";
import { getAllRequests, approveRequest, rejectRequest } from "../../utils/requests";
import { getDB, saveDB } from "../../utils/storage";
import { uid } from "../../utils/security";
import { REQUEST_STATUS, REQUEST_TYPES } from "../../utils/constants";
import { fmt } from "../../utils/helpers";

const TYPE_META = {
  loan:      { label: "Loan",      icon: "fa-hand-holding-usd", badge: "bg-amber-500/20 text-amber-400 border-amber-500/30"  },
  deposit:   { label: "Deposit",   icon: "fa-piggy-bank",       badge: "bg-green-500/20 text-green-400 border-green-500/30"  },
  insurance: { label: "Insurance", icon: "fa-shield-alt",       badge: "bg-blue-500/20 text-blue-400 border-blue-500/30"     },
};

const STATUS_META = {
  pending:  { cls: "bg-amber-500/20 text-amber-400 border border-amber-500/30",  dot: "bg-amber-400",  label: "Pending"  },
  approved: { cls: "bg-green-500/20 text-green-400 border border-green-500/30",  dot: "bg-green-400",  label: "Approved" },
  rejected: { cls: "bg-red-500/20 text-red-400 border border-red-500/30",        dot: "bg-red-400",    label: "Rejected" },
};

function RequestCard({ req, onAction }) {
  const [note,       setNote]       = useState("");
  const [loading,    setLoading]    = useState(null); // "approve" | "reject"
  const [expanded,   setExpanded]   = useState(false);
  const tm = TYPE_META[req.type] || TYPE_META.loan;
  const sm = STATUS_META[req.status] || STATUS_META.pending;
  const isPending = req.status === REQUEST_STATUS.PENDING;

  const handleApprove = async () => {
    setLoading("approve");
    await new Promise((r) => setTimeout(r, 800));
    const approvedReq = approveRequest(req.id, note);
    if (!approvedReq) {
      setLoading(null);
      onAction();
      return;
    }

    // Credit user's balance / activate loan / etc.
    const users = getDB();
    const user  = users[approvedReq.userId];
    if (user) {
      const requestAmount = Number(approvedReq.amount) || 0;
      user.balance = (Number(user.balance) || 0) + requestAmount;
      user.tx = user.tx || [];

      let desc = "";
      if (approvedReq.type === REQUEST_TYPES.LOAN) {
        const loanRate = parseFloat(approvedReq.details?.rate) || 0;
        const loanTenure = parseInt(approvedReq.details?.tenure, 10) || 0;
        desc = `Loan Approved & Disbursed: ${approvedReq.details?.loanName || "Loan"}`;
        user.loans = [...(user.loans || []), {
          id: uid(), name: approvedReq.details?.loanName || "Loan",
          amount: requestAmount, rate: loanRate,
          tenure: loanTenure, date: new Date().toLocaleDateString(),
        }];
      } else if (approvedReq.type === REQUEST_TYPES.DEPOSIT) {
        desc = `Deposit Approved by Admin — ${approvedReq.details?.method || "Bank Transfer"}`;
      } else if (approvedReq.type === REQUEST_TYPES.INSURANCE) {
        desc = `Insurance Approved & Credited: ${approvedReq.details?.insuranceName || "Insurance"}`;
        user.insurance = [...(user.insurance || []), {
          id: uid(), name: approvedReq.details?.insuranceName,
          premium: requestAmount, date: new Date().toLocaleDateString(), status: "active",
        }];
      }

      user.tx.push({ id: uid(), type: "credit", desc, amount: requestAmount, date: new Date().toLocaleDateString(), category: approvedReq.type });

      // Push notification to user
      user.notifications = [
        {
          id: uid(), type: "success",
          msg: `✅ Your ${tm.label} request of ${fmt(requestAmount)} has been approved and credited to your wallet!${note ? ` Note: ${note}` : ""}`,
          date: new Date().toLocaleDateString(), read: false,
        },
        ...(user.notifications || []),
      ].slice(0, 30);

      users[approvedReq.userId] = user;
      saveDB(users);
    }
    setLoading(null);
    onAction();
  };

  const handleReject = async () => {
    if (!note.trim()) { alert("Please add a rejection reason for the user."); return; }
    setLoading("reject");
    await new Promise((r) => setTimeout(r, 600));
    rejectRequest(req.id, note);

    // Push rejection notification to user
    const users = getDB();
    const user  = users[req.userId];
    if (user) {
      user.notifications = [
        {
          id: uid(), type: "error",
          msg: `❌ Your ${tm.label} request of ${fmt(req.amount)} was declined. Reason: ${note}`,
          date: new Date().toLocaleDateString(), read: false,
        },
        ...(user.notifications || []),
      ].slice(0, 30);
      users[req.userId] = user;
      saveDB(users);
    }
    setLoading(null);
    onAction();
  };

  return (
    <div className={`bg-slate-900 border rounded-2xl overflow-hidden transition-all ${isPending ? "border-amber-500/30" : "border-white/5"}`}>
      {/* Card header */}
      <div className="p-5 flex items-start gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-none border ${tm.badge}`}>
          <i className={`fas ${tm.icon} text-lg`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-white text-lg">{fmt(req.amount)}</span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${tm.badge}`}>{tm.label}</span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${sm.cls} flex items-center gap-1`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} />{sm.label}
                </span>
              </div>
              <p className="text-slate-300 font-semibold mt-0.5">
                <i className="fas fa-user text-slate-500 mr-1.5 text-xs" />{req.username}
              </p>
              <p className="text-slate-500 text-xs mt-0.5">{req.submittedAt}</p>
            </div>
            <button onClick={() => setExpanded((v) => !v)}
              className="text-slate-400 hover:text-white transition text-sm bg-slate-800 rounded-xl px-3 py-1.5 font-bold flex-none">
              {expanded ? "Collapse" : "Details"} <i className={`fas fa-chevron-${expanded ? "up" : "down"} text-xs ml-1`} />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-white/5 px-5 py-4">
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mb-4">
            {Object.entries(req.details || {}).map(([k, v]) => (
              <div key={k} className="flex items-baseline gap-2">
                <span className="text-xs text-slate-500 capitalize min-w-[90px]">{k.replace(/([A-Z])/g, " $1")}:</span>
                <span className="text-sm text-slate-200 font-medium">{String(v)}</span>
              </div>
            ))}
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-slate-500 min-w-[90px]">Request ID:</span>
              <span className="text-xs text-slate-400 font-mono">{req.id}</span>
            </div>
            {req.reviewedAt && (
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-slate-500 min-w-[90px]">Reviewed:</span>
                <span className="text-xs text-slate-300">{req.reviewedAt}</span>
              </div>
            )}
            {req.adminNote && (
              <div className="col-span-2 flex items-baseline gap-2">
                <span className="text-xs text-slate-500 min-w-[90px]">Admin note:</span>
                <span className="text-xs text-slate-300 italic">{req.adminNote}</span>
              </div>
            )}
          </div>

          {/* Action area — only for pending */}
          {isPending && (
            <div className="border-t border-white/5 pt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-2">
                  Note to customer <span className="text-red-400 font-normal">(required for rejection)</span>
                </label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
                  placeholder="e.g. Approved as per eligibility criteria  /  Rejected due to insufficient documents"
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-amber-500 transition resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={handleApprove} disabled={!!loading}
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold text-sm transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading === "approve"
                    ? <><i className="fas fa-spinner fa-spin" />Processing…</>
                    : <><i className="fas fa-check" />Approve & Credit {fmt(req.amount)}</>}
                </button>
                <button onClick={handleReject} disabled={!!loading}
                  className="flex-1 bg-red-600/80 hover:bg-red-600 text-white py-3 rounded-xl font-bold text-sm transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading === "reject"
                    ? <><i className="fas fa-spinner fa-spin" />Processing…</>
                    : <><i className="fas fa-times" />Reject</>}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminRequests() {
  const [filter,    setFilter]    = useState("pending");
  const [typeFilter,setTypeFilter]= useState("all");
  const [search,    setSearch]    = useState("");
  const [requests,  setRequests]  = useState(() => getAllRequests());

  const refresh = useCallback(() => setRequests(getAllRequests()), []);

  const filtered = requests.filter((r) => {
    const matchStatus = filter === "all" || r.status === filter;
    const matchType   = typeFilter === "all" || r.type === typeFilter;
    const matchSearch = !search ||
      r.username.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchType && matchSearch;
  });

  const counts = {
    pending:  requests.filter((r) => r.status === REQUEST_STATUS.PENDING).length,
    approved: requests.filter((r) => r.status === REQUEST_STATUS.APPROVED).length,
    rejected: requests.filter((r) => r.status === REQUEST_STATUS.REJECTED).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white mb-1">Request Queue</h1>
        <p className="text-slate-400 text-sm">Review and action all pending loan, deposit, and insurance requests.</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          ["all",      "All",      requests.length,      "text-slate-300 bg-slate-800 border-white/10"],
          ["pending",  "Pending",  counts.pending,       "text-amber-400 bg-amber-500/10 border-amber-500/30"],
          ["approved", "Approved", counts.approved,      "text-green-400 bg-green-500/10 border-green-500/30"],
          ["rejected", "Rejected", counts.rejected,      "text-red-400 bg-red-500/10 border-red-500/30"],
        ].map(([val, label, count, cls]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition ${
              filter === val ? cls : "text-slate-500 bg-slate-900 border-white/5 hover:border-white/10"
            }`}>
            {label}
            <span className="text-[10px] font-black opacity-80">{count}</span>
          </button>
        ))}
      </div>

      {/* Type + search row */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex gap-1 bg-slate-900 border border-white/5 p-1 rounded-xl">
          {[["all","All"],["loan","Loans"],["deposit","Deposits"],["insurance","Insurance"]].map(([v,l]) => (
            <button key={v} onClick={() => setTypeFilter(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${typeFilter === v ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username or request ID…"
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-white/5 rounded-xl text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-amber-500/50 transition" />
        </div>
        <button onClick={refresh} className="px-4 py-2.5 bg-slate-900 border border-white/5 rounded-xl text-slate-400 hover:text-white transition text-xs font-bold">
          <i className="fas fa-sync-alt mr-1.5" />Refresh
        </button>
      </div>

      {/* Request list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-600">
          <i className="fas fa-inbox text-5xl mb-4 block opacity-20" />
          <p className="font-bold text-slate-400 text-lg">No requests found</p>
          <p className="text-sm mt-1">
            {filter === "pending" ? "All caught up! No pending requests." : "Try changing the filter or search term."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((req) => (
            <RequestCard key={req.id} req={req} onAction={refresh} />
          ))}
        </div>
      )}
    </div>
  );
}
