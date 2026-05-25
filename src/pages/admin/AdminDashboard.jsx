import { useMemo } from "react";
import { Link } from "react-router-dom";
import { getDB } from "../../utils/storage";
import { getAllRequests, getPendingCount } from "../../utils/requests";
import { REQUEST_STATUS, REQUEST_TYPES } from "../../utils/constants";
import { fmt } from "../../utils/helpers";

function StatCard({ icon, label, value, sub, color, to }) {
  const inner = (
    <div className={`bg-slate-900 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition group ${to ? "cursor-pointer" : ""}`}>
      <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
        <i className={`fas ${icon} text-lg text-white`} />
      </div>
      <p className="text-2xl font-black text-white mb-0.5">{value}</p>
      <p className="text-sm font-semibold text-slate-300">{label}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

export default function AdminDashboard() {
  const users    = useMemo(() => Object.values(getDB()), []);
  const requests = useMemo(() => getAllRequests(), []);

  const totalBalance    = users.reduce((s, u) => s + (u.balance || 0), 0);
  const totalLoans      = users.reduce((s, u) => s + (u.loans?.length || 0), 0);
  const pendingCount    = requests.filter((r) => r.status === REQUEST_STATUS.PENDING).length;
  const approvedToday   = requests.filter((r) => r.status === REQUEST_STATUS.APPROVED && r.reviewedAt?.includes(new Date().toLocaleDateString())).length;

  const byType = {
    [REQUEST_TYPES.LOAN]:      requests.filter((r) => r.type === REQUEST_TYPES.LOAN),
    [REQUEST_TYPES.DEPOSIT]:   requests.filter((r) => r.type === REQUEST_TYPES.DEPOSIT),
    [REQUEST_TYPES.INSURANCE]: requests.filter((r) => r.type === REQUEST_TYPES.INSURANCE),
  };

  const recentRequests = requests.slice(0, 8);

  const resolvedCount = requests.filter((r) => r.status !== REQUEST_STATUS.PENDING).length;
  const totalRequests = requests.length;
  const resolutionRate = totalRequests ? Math.round((resolvedCount / totalRequests) * 100) : 0;
  const pendingKyc = users.filter((u) => u.kyc?.status !== "verified").length;
  const lowBalanceUsers = users.filter((u) => (Number(u.balance) || 0) < 2500);
  const unverifiedUsers = users.filter((u) => u.kyc?.status !== "verified");
  const riskAccounts = users.filter((u) => (Number(u.balance) || 0) < 2500 || u.kyc?.status !== "verified").slice(0, 4);
  const highValuePending = requests.filter((r) => r.status === REQUEST_STATUS.PENDING && (Number(r.amount) || 0) > 100000).length;
  const openByType = {
    loan:      byType[REQUEST_TYPES.LOAN].filter((r) => r.status === REQUEST_STATUS.PENDING).length,
    deposit:   byType[REQUEST_TYPES.DEPOSIT].filter((r) => r.status === REQUEST_STATUS.PENDING).length,
    insurance: byType[REQUEST_TYPES.INSURANCE].filter((r) => r.status === REQUEST_STATUS.PENDING).length,
  };

  const TYPE_META = {
    loan:      { label: "Loan",      icon: "fa-hand-holding-usd", color: "bg-amber-500/20 text-amber-400" },
    deposit:   { label: "Deposit",   icon: "fa-piggy-bank",       color: "bg-green-500/20 text-green-400" },
    insurance: { label: "Insurance", icon: "fa-shield-alt",       color: "bg-blue-500/20 text-blue-400"   },
  };
  const STATUS_META = {
    pending:  { cls: "bg-amber-500/20 text-amber-400 border-amber-500/30",  label: "Pending"  },
    approved: { cls: "bg-green-500/20 text-green-400 border-green-500/30",  label: "Approved" },
    rejected: { cls: "bg-red-500/20 text-red-400 border-red-500/30",        label: "Rejected" },
  };

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-black text-white mb-1">Admin Dashboard</h1>
        <p className="text-slate-400 text-sm">Alpha Bank Management Console · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="fa-users"           label="Registered Users"    value={users.length}      sub={`${users.filter(u=>u.kyc?.status==="verified").length} KYC verified`} color="bg-blue-600"   to="/admin/users" />
        <StatCard icon="fa-inbox"           label="Pending Requests"    value={pendingCount}      sub="Needs your action"                                                    color="bg-amber-500"  to="/admin/requests" />
        <StatCard icon="fa-rupee-sign"      label="Total Deposits"      value={fmt(totalBalance)} sub="Across all accounts"                                                  color="bg-green-600" />
        <StatCard icon="fa-check-circle"    label="Approved Today"      value={approvedToday}     sub="Requests resolved"                                                    color="bg-purple-600" />
      </div>

      {/* Admin action center */}
      <div className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">Action Center</p>
              <h2 className="text-xl font-black text-white">Fast review, faster approvals</h2>
              <p className="text-sm text-slate-400 mt-2">Direct access to requests, user management, and broadcast tools from the dashboard.</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 text-amber-300 px-3 py-1 text-xs font-bold border border-amber-500/20">{resolutionRate}% resolved</span>
            </div>
          </div>
          <div className="grid sm:grid-cols-4 gap-3">
            <Link to="/admin/requests" className="group rounded-3xl border border-white/10 p-4 bg-slate-950 hover:border-amber-500 hover:bg-amber-500/5 transition">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-300 flex items-center justify-center">
                  <i className="fas fa-inbox" />
                </div>
                <span className="text-[11px] font-semibold text-slate-400 group-hover:text-white">Review</span>
              </div>
              <p className="text-sm font-bold text-white">Request queue</p>
              <p className="text-xs text-slate-500 mt-1">{pendingCount} pending approvals</p>
            </Link>
            <Link to="/admin/users" className="group rounded-3xl border border-white/10 p-4 bg-slate-950 hover:border-blue-500 hover:bg-blue-500/5 transition">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-300 flex items-center justify-center">
                  <i className="fas fa-users" />
                </div>
                <span className="text-[11px] font-semibold text-slate-400 group-hover:text-white">Manage</span>
              </div>
              <p className="text-sm font-bold text-white">User accounts</p>
              <p className="text-xs text-slate-500 mt-1">{users.length} customers</p>
            </Link>
            <Link to="/admin/broadcast" className="group rounded-3xl border border-white/10 p-4 bg-slate-950 hover:border-green-500 hover:bg-green-500/5 transition">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-green-500/10 text-green-300 flex items-center justify-center">
                  <i className="fas fa-bullhorn" />
                </div>
                <span className="text-[11px] font-semibold text-slate-400 group-hover:text-white">Notify</span>
              </div>
              <p className="text-sm font-bold text-white">Send broadcast</p>
              <p className="text-xs text-slate-500 mt-1">Keep users informed</p>
            </Link>
            <Link to="/admin/requests" className="group rounded-3xl border border-white/10 p-4 bg-slate-950 hover:border-rose-500 hover:bg-rose-500/5 transition">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-300 flex items-center justify-center">
                  <i className="fas fa-hand-holding-usd" />
                </div>
                <span className="text-[11px] font-semibold text-slate-400 group-hover:text-white">Priority</span>
              </div>
              <p className="text-sm font-bold text-white">High-value requests</p>
              <p className="text-xs text-slate-500 mt-1">{highValuePending} above ₹1L</p>
            </Link>
          </div>
        </div>
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 text-slate-400 text-xs uppercase tracking-[0.3em] mb-4">
              <i className="fas fa-chart-line text-slate-500" />
              <span>Operational score</span>
            </div>
            <div className="space-y-4">
              <div className="rounded-3xl bg-slate-950 border border-white/5 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-500">Resolved requests</span>
                  <span className="text-sm font-bold text-white">{resolvedCount}/{totalRequests || 1}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-amber-500 transition-all" style={{ width: `${resolutionRate}%` }} />
                </div>
              </div>
              <div className="rounded-3xl bg-slate-950 border border-white/5 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-500">Pending KYC review</span>
                  <span className="text-sm font-bold text-white">{pendingKyc}</span>
                </div>
                <p className="text-xs text-slate-400">{pendingKyc === 0 ? "All verified users" : "Focus on high-risk accounts"}</p>
              </div>
            </div>
          </div>
          <div className="mt-6 rounded-3xl bg-slate-950 border border-white/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500">Current queue</span>
              <span className="text-xs text-slate-400">{`${openByType.loan}L / ${openByType.deposit}D / ${openByType.insurance}I`}</span>
            </div>
            <div className="grid gap-2">
              {Object.entries(openByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between text-xs text-slate-300">
                  <span className="capitalize">{TYPE_META[type].label}</span>
                  <strong className="text-white">{count}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Request type breakdown */}
      <div className="grid md:grid-cols-3 gap-4">
        {Object.entries(byType).map(([type, reqs]) => {
          const m = TYPE_META[type];
          const pending = reqs.filter((r) => r.status === REQUEST_STATUS.PENDING).length;
          const total   = reqs.length;
          const approved= reqs.filter((r) => r.status === REQUEST_STATUS.APPROVED).length;
          return (
            <div key={type} className="bg-slate-900 border border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-9 h-9 ${m.color} rounded-xl flex items-center justify-center border border-white/5`}>
                  <i className={`fas ${m.icon} text-sm`} />
                </div>
                <div>
                  <p className="font-bold text-white">{m.label} Requests</p>
                  <p className="text-xs text-slate-400">{total} total</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800 rounded-xl p-3 text-center">
                  <p className="text-amber-400 font-black text-xl">{pending}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Pending</p>
                </div>
                <div className="bg-slate-800 rounded-xl p-3 text-center">
                  <p className="text-green-400 font-black text-xl">{approved}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Approved</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-300 flex items-center justify-center">
              <i className="fas fa-wallet" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Low balance</p>
              <p className="font-bold text-white text-lg">{lowBalanceUsers.length} accounts</p>
            </div>
          </div>
          <p className="text-sm text-slate-400">Accounts below ₹2,500 may need outreach or deposit reminders.</p>
        </div>
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-300 flex items-center justify-center">
              <i className="fas fa-shield-alt" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">KYC pending</p>
              <p className="font-bold text-white text-lg">{unverifiedUsers.length} users</p>
            </div>
          </div>
          <p className="text-sm text-slate-400">Verify pending accounts faster to reduce operational risk.</p>
        </div>
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-red-500/10 text-red-300 flex items-center justify-center">
              <i className="fas fa-exclamation-triangle" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Priority alerts</p>
              <p className="font-bold text-white text-lg">{riskAccounts.length} flagged</p>
            </div>
          </div>
          <div className="space-y-3">
            {riskAccounts.length === 0 ? (
              <p className="text-sm text-slate-400">No flagged accounts currently.</p>
            ) : (
              riskAccounts.map((u) => (
                <div key={u.id} className="rounded-2xl bg-slate-950/80 p-3 border border-white/5">
                  <p className="text-sm font-semibold text-white">{u.username}</p>
                  <p className="text-xs text-slate-500">{u.kyc?.status !== "verified" ? "KYC pending" : "Low balance"}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent requests table */}
      <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="font-bold text-white">Recent Requests</h2>
          <Link to="/admin/requests" className="text-xs text-amber-400 font-bold hover:underline">View all →</Link>
        </div>
        {recentRequests.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <i className="fas fa-inbox text-4xl mb-3 block opacity-30" />
            <p>No requests yet. Users haven't submitted any applications.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  {["User", "Type", "Amount", "Submitted", "Status"].map((h) => (
                    <th key={h} className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((req) => {
                  const tm = TYPE_META[req.type] || TYPE_META.loan;
                  const sm = STATUS_META[req.status] || STATUS_META.pending;
                  return (
                    <tr key={req.id} className="border-b border-white/5 hover:bg-white/3 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-300 rounded-lg flex items-center justify-center text-slate-900 font-black text-sm flex-none">
                            {req.username?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-white">{req.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${tm.color} border-white/10`}>
                          <i className={`fas ${tm.icon} text-[9px]`} />{tm.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-white">{fmt(req.amount)}</td>
                      <td className="px-6 py-4 text-slate-400 text-xs">{req.submittedAt}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${sm.cls}`}>{sm.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Users summary */}
      <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-white">User Tier Distribution</h2>
          <Link to="/admin/users" className="text-xs text-amber-400 font-bold hover:underline">Manage users →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[["Bronze","🥉","text-amber-700"],["Silver","🥈","text-slate-400"],["Gold","🥇","text-yellow-400"],["Platinum","💎","text-slate-300"]].map(([tier, icon, cls]) => {
            const count = users.filter((u) => {
              const txCount = (u.tx || []).length;
              const t = txCount >= 50 ? "Platinum" : txCount >= 20 ? "Gold" : txCount >= 10 ? "Silver" : "Bronze";
              return t === tier;
            }).length;
            return (
              <div key={tier} className="bg-slate-800 rounded-xl p-4 text-center">
                <p className="text-2xl mb-1">{icon}</p>
                <p className={`font-black text-xl ${cls}`}>{count}</p>
                <p className="text-xs text-slate-400 mt-0.5">{tier}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
