import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getDB, saveDB } from "../../utils/storage";
import { getUserRequests } from "../../utils/requests";
import { getUserTier, fmt, getCategoryFromDesc } from "../../utils/helpers";
import { uid, sanitize } from "../../utils/security";
import { REQUEST_STATUS } from "../../utils/constants";

// ─── User Detail Modal ────────────────────────────────────────────────────────
function UserDetailPanel({ user, onClose, onRefresh }) {
  const [creditAmt,   setCreditAmt]   = useState("");
  const [debitAmt,    setDebitAmt]    = useState("");
  const [creditNote,  setCreditNote]  = useState("");
  const [debitNote,   setDebitNote]   = useState("");
  const [loading,     setLoading]     = useState(null);
  const [activeTab,   setActiveTab]   = useState("overview");

  const txCount    = (user.tx || []).length;
  const tier       = getUserTier(txCount);
  const requests   = useMemo(() => getUserRequests(user.id), [user.id]);
  const userLoans  = user.loans || [];
  const userTx     = [...(user.tx || [])].reverse();

  const adminCredit = async () => {
    const amt = Number(creditAmt);
    if (!amt || amt <= 0) return alert("Enter a valid amount");
    setLoading("credit");
    await new Promise((r) => setTimeout(r, 600));
    const users = getDB();
    const u     = users[user.id];
    if (!u) { setLoading(null); return; }
    u.balance = (Number(u.balance) || 0) + amt;
    const note = sanitize(creditNote) || "Admin Credit";
    u.tx = [...(u.tx || []), { id: uid(), type: "credit", desc: `Admin: ${note}`, amount: amt, date: new Date().toLocaleDateString(), category: "deposit" }];
    u.notifications = [{ id: uid(), type: "success", msg: `${fmt(amt)} has been credited to your account by Alpha Bank. Ref: ${note}`, date: new Date().toLocaleDateString(), read: false }, ...(u.notifications || [])].slice(0, 30);
    users[user.id] = u;
    saveDB(users);
    setCreditAmt(""); setCreditNote(""); setLoading(null);
    onRefresh();
  };

  const adminDebit = async () => {
    const amt = Number(debitAmt);
    if (!amt || amt <= 0) return alert("Enter a valid amount");
    setLoading("debit");
    await new Promise((r) => setTimeout(r, 600));
    const users = getDB();
    const u     = users[user.id];
    if (!u) { setLoading(null); return; }
    if (amt > (Number(u.balance) || 0)) { setLoading(null); return alert("User has insufficient balance"); }
    u.balance = Math.max(0, (Number(u.balance) || 0) - amt);
    const note = sanitize(debitNote) || "Admin Debit";
    u.tx = [...(u.tx || []), { id: uid(), type: "debit", desc: `Admin: ${note}`, amount: amt, date: new Date().toLocaleDateString(), category: "other" }];
    u.notifications = [{ id: uid(), type: "warning", msg: `${fmt(amt)} has been debited from your account. Ref: ${note}`, date: new Date().toLocaleDateString(), read: false }, ...(u.notifications || [])].slice(0, 30);
    users[user.id] = u;
    saveDB(users);
    setDebitAmt(""); setDebitNote(""); setLoading(null);
    onRefresh();
  };

  const TABS = [
    { id: "overview",  label: "Overview"     },
    { id: "txns",      label: `Transactions (${txCount})` },
    { id: "loans",     label: `Loans (${userLoans.length})` },
    { id: "requests",  label: `Requests (${requests.length})` },
    { id: "actions",   label: "Admin Actions" },
  ];

  const STATUS_CLS = {
    pending:  "text-amber-400 bg-amber-500/20 border-amber-500/30",
    approved: "text-green-400 bg-green-500/20 border-green-500/30",
    rejected: "text-red-400 bg-red-500/20 border-red-500/30",
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-slate-900 rounded-3xl border border-white/10 shadow-2xl flex flex-col" style={{ maxHeight: "90vh" }}>
        {/* Header */}
        <div className="flex items-center gap-4 p-6 border-b border-white/5 flex-none">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-yellow-300 rounded-2xl flex items-center justify-center text-slate-900 font-black text-2xl flex-none">
            {user.username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-black text-white text-xl">{user.username}</h2>
              {user.displayName && <span className="text-slate-400 text-sm">({user.displayName})</span>}
              <span className="text-xs bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded-full font-bold">{tier.icon} {tier.name}</span>
              {user.kyc?.status === "verified" && <span className="text-xs bg-green-400/10 text-green-400 border border-green-400/20 px-2 py-0.5 rounded-full font-bold"><i className="fas fa-shield-alt mr-1 text-[9px]" />KYC</span>}
            </div>
            <p className="text-slate-400 text-sm font-mono mt-0.5">{user.upiId || user.username + "@alpha"}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl flex items-center justify-center transition flex-none">
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3 overflow-x-auto flex-none border-b border-white/5 pb-0">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap rounded-t-xl transition border-b-2 ${activeTab === t.id ? "text-amber-400 border-amber-400 bg-amber-400/5" : "text-slate-500 border-transparent hover:text-slate-300"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Overview */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Balance",      fmt(user.balance || 0),               "text-green-400" ],
                  ["Transactions", String(txCount),                       "text-white"     ],
                  ["Account No.",  user.accountNumber || "N/A",           "text-amber-400 font-mono text-xs" ],
                  ["IFSC",         user.ifscCode || "N/A",                "text-amber-400 font-mono text-xs" ],
                  ["Email",        user.email || "—",                     "text-slate-300" ],
                  ["Phone",        user.phone || "—",                     "text-slate-300" ],
                  ["Joined",       user.joinDate || "—",                  "text-slate-300" ],
                  ["KYC Status",   user.kyc?.status || "pending",         user.kyc?.status === "verified" ? "text-green-400" : "text-amber-400" ],
                ].map(([k, v, cls]) => (
                  <div key={k} className="bg-slate-800 rounded-xl p-3">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold mb-1">{k}</p>
                    <p className={`text-sm font-bold ${cls} break-all`}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transactions */}
          {activeTab === "txns" && (
            userTx.length === 0 ? (
              <p className="text-center text-slate-500 py-10">No transactions yet</p>
            ) : (
              <div className="space-y-2">
                {userTx.slice(0, 30).map((t) => {
                  const cat = getCategoryFromDesc(t.desc);
                  return (
                    <div key={t.id} className="flex items-center justify-between py-2.5 border-b border-white/5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 ${cat.cls} rounded-full flex items-center justify-center flex-none`}>
                          <i className={`fas ${cat.icon} text-xs`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-slate-200 font-medium truncate">{t.desc}</p>
                          <p className="text-xs text-slate-500">{t.date}</p>
                        </div>
                      </div>
                      <span className={`font-bold text-sm flex-none ml-4 ${t.type === "credit" ? "text-green-400" : "text-slate-200"}`}>
                        {t.type === "credit" ? "+" : "−"}{fmt(t.amount)}
                      </span>
                    </div>
                  );
                })}
                {userTx.length > 30 && <p className="text-center text-slate-500 text-xs pt-2">Showing latest 30 of {userTx.length}</p>}
              </div>
            )
          )}

          {/* Loans */}
          {activeTab === "loans" && (
            userLoans.length === 0 ? (
              <p className="text-center text-slate-500 py-10">No active loans</p>
            ) : (
              <div className="space-y-3">
                {userLoans.map((ln) => (
                  <div key={ln.id} className="bg-slate-800 rounded-xl p-4 flex justify-between items-center gap-4">
                    <div>
                      <p className="font-bold text-white">{ln.name}</p>
                      <p className="text-xs text-slate-400">{fmt(ln.amount)} @ {ln.rate}% p.a. · Approved {ln.date}</p>
                    </div>
                    <span className="text-xs bg-green-400/10 text-green-400 border border-green-400/20 px-3 py-1 rounded-full font-bold">Active</span>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Requests */}
          {activeTab === "requests" && (
            requests.length === 0 ? (
              <p className="text-center text-slate-500 py-10">No requests submitted</p>
            ) : (
              <div className="space-y-3">
                {requests.map((r) => (
                  <div key={r.id} className="bg-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white capitalize">{r.type}</span>
                        <span className="font-black text-amber-400">{fmt(r.amount)}</span>
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${STATUS_CLS[r.status] || STATUS_CLS.pending}`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{r.submittedAt}</p>
                    {r.adminNote && <p className="text-xs text-slate-300 italic mt-1">Admin note: {r.adminNote}</p>}
                  </div>
                ))}
              </div>
            )
          )}

          {/* Admin Actions */}
          {activeTab === "actions" && (
            <div className="space-y-5">
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5">
                <h3 className="font-bold text-green-400 mb-4 flex items-center gap-2"><i className="fas fa-plus-circle" />Credit Account</h3>
                <div className="space-y-3">
                  <input type="number" value={creditAmt} onChange={(e) => setCreditAmt(e.target.value)} placeholder="Amount (₹)" min="1"
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-green-500 transition" />
                  <input value={creditNote} onChange={(e) => setCreditNote(e.target.value)} placeholder="Reason (e.g. Cash deposit at branch)"
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-green-500 transition" />
                  <button onClick={adminCredit} disabled={loading === "credit"}
                    className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold text-sm transition disabled:opacity-60">
                    {loading === "credit" ? <><i className="fas fa-spinner fa-spin mr-2" />Processing…</> : <><i className="fas fa-plus mr-2" />Credit {creditAmt ? fmt(parseFloat(creditAmt) || 0) : "Amount"}</>}
                  </button>
                </div>
              </div>

              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
                <h3 className="font-bold text-red-400 mb-4 flex items-center gap-2"><i className="fas fa-minus-circle" />Debit Account</h3>
                <div className="space-y-3">
                  <input type="number" value={debitAmt} onChange={(e) => setDebitAmt(e.target.value)} placeholder="Amount (₹)" min="1"
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-red-500 transition" />
                  <input value={debitNote} onChange={(e) => setDebitNote(e.target.value)} placeholder="Reason (e.g. Loan EMI recovery)"
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-red-500 transition" />
                  <button onClick={adminDebit} disabled={loading === "debit"}
                    className="w-full bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-bold text-sm transition disabled:opacity-60">
                    {loading === "debit" ? <><i className="fas fa-spinner fa-spin mr-2" />Processing…</> : <><i className="fas fa-minus mr-2" />Debit {debitAmt ? fmt(parseFloat(debitAmt) || 0) : "Amount"}</>}
                  </button>
                </div>
              </div>

              <div className="bg-slate-800 rounded-2xl p-4 text-xs text-slate-500 border border-white/5">
                <i className="fas fa-info-circle text-amber-400 mr-2" />All admin actions are logged in the user's transaction history and a notification is sent to the user.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Users list ───────────────────────────────────────────────────────────────
export default function AdminUsers() {
  const [search,     setSearch]     = useState("");
  const [sortBy,     setSortBy]     = useState("balance"); // balance | txns | joined
  const [selectedId, setSelectedId] = useState(null);
  const [rawUsers,   setRawUsers]   = useState(() => Object.values(getDB()));

  const refresh = useCallback(() => setRawUsers(Object.values(getDB())), []);

  const users = useMemo(() => {
    const filtered = rawUsers.filter((u) =>
      !search ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.upiId?.toLowerCase().includes(search.toLowerCase())
    );
    return [...filtered].sort((a, b) => {
      if (sortBy === "balance") return (b.balance || 0) - (a.balance || 0);
      if (sortBy === "txns")    return (b.tx?.length || 0) - (a.tx?.length || 0);
      return (b.joinDate || "").localeCompare(a.joinDate || "");
    });
  }, [rawUsers, search, sortBy]);

  const selectedUser = rawUsers.find((u) => u.id === selectedId);
  const totalBalance = rawUsers.reduce((s, u) => s + (u.balance || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">All Users</h1>
          <p className="text-slate-400 text-sm">{rawUsers.length} registered accounts · Total deposits: {fmt(totalBalance)}</p>
        </div>
        <button onClick={refresh} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 border border-white/5 px-4 py-2.5 rounded-xl transition">
          <i className="fas fa-sync-alt" />Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search username, email, UPI ID…"
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-white/5 rounded-xl text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-amber-500/50 transition" />
        </div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          className="bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-amber-500/50 transition">
          <option value="balance">Sort: Balance</option>
          <option value="txns">Sort: Transactions</option>
          <option value="joined">Sort: Joined date</option>
        </select>
      </div>

      {/* Table */}
      {users.length === 0 ? (
        <div className="text-center py-20 text-slate-600">
          <i className="fas fa-users text-5xl mb-4 block opacity-20" />
          <p className="font-bold text-slate-400 text-lg">No users found</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  {["User", "Balance", "UPI ID", "Transactions", "KYC", "Tier", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const txCount = (user.tx || []).length;
                  const tier    = getUserTier(txCount);
                  return (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/3 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-yellow-300 rounded-xl flex items-center justify-center text-slate-900 font-black flex-none">
                            {user.username?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-white">{user.username}</p>
                            <p className="text-xs text-slate-500">{user.email || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-bold text-green-400 whitespace-nowrap">{fmt(user.balance || 0)}</td>
                      <td className="px-5 py-4 text-slate-400 font-mono text-xs whitespace-nowrap">{user.upiId || user.username + "@alpha"}</td>
                      <td className="px-5 py-4 text-slate-300 text-center">{txCount}</td>
                      <td className="px-5 py-4">
                        {user.kyc?.status === "verified"
                          ? <span className="text-[10px] font-bold text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full"><i className="fas fa-check mr-1 text-[8px]" />Verified</span>
                          : <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">Pending</span>}
                      </td>
                      <td className="px-5 py-4 text-slate-300 whitespace-nowrap">{tier.icon} {tier.name}</td>
                      <td className="px-5 py-4">
                        <button onClick={() => setSelectedId(user.id)}
                          className="text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/20 px-3 py-1.5 rounded-xl transition">
                          View / Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User detail modal */}
      {selectedUser && (
        <UserDetailPanel
          user={selectedUser}
          onClose={() => setSelectedId(null)}
          onRefresh={() => { refresh(); setRawUsers(Object.values(getDB())); }}
        />
      )}
    </div>
  );
}
