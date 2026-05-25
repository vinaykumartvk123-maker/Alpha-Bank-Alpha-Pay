import { useState } from "react";
import { getDB, saveDB } from "../../utils/storage";
import { uid, sanitize } from "../../utils/security";
import { fmt } from "../../utils/helpers";

const TEMPLATES = [
  { label: "Maintenance Notice",  icon: "fa-wrench",       type: "warning", text: "Alpha Bank systems will undergo scheduled maintenance on Sunday, 2:00 AM – 4:00 AM IST. Online services may be temporarily unavailable." },
  { label: "Rate Update",         icon: "fa-percent",      type: "info",    text: "Alpha Bank has revised its Fixed Deposit interest rates effective from today. New rates: up to 7.50% p.a. Visit the Interest Rates page for details." },
  { label: "Security Alert",      icon: "fa-shield-alt",   type: "error",   text: "Important: Never share your UPI PIN, OTP, or password with anyone — including Alpha Bank staff. Report suspicious activity to 1800-123-4567." },
  { label: "Feature Launch",      icon: "fa-rocket",       type: "success", text: "New feature available! You can now set monthly budget limits per category in your Dashboard. Visit the Overview tab to get started." },
  { label: "Holiday Notice",      icon: "fa-calendar",     type: "info",    text: "Alpha Bank branches will remain closed on account of the public holiday. Internet banking and ATMs will function normally 24/7." },
];

const TYPE_OPTIONS = [
  { val: "success", label: "Success",  cls: "text-green-400 bg-green-500/10 border-green-500/30"  },
  { val: "info",    label: "Info",     cls: "text-blue-400  bg-blue-500/10  border-blue-500/30"   },
  { val: "warning", label: "Warning",  cls: "text-amber-400 bg-amber-500/10 border-amber-500/30"  },
  { val: "error",   label: "Alert",    cls: "text-red-400   bg-red-500/10   border-red-500/30"    },
];

export default function AdminBroadcast() {
  const [msg,      setMsg]      = useState("");
  const [type,     setType]     = useState("info");
  const [loading,  setLoading]  = useState(false);
  const [sent,     setSent]     = useState(false);
  const [sentCount,setSentCount]= useState(0);

  const broadcast = async () => {
    const cleaned = sanitize(msg.trim());
    if (!cleaned) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    const users = getDB();
    let count   = 0;
    const today = new Date().toLocaleDateString();

    Object.values(users).forEach((u) => {
      u.notifications = [
        {
          id: uid(), type, read: false, date: today,
          msg: `📢 Alpha Bank: ${cleaned}`,
        },
        ...(u.notifications || []),
      ].slice(0, 30);
      users[u.id] = u;
      count++;
    });

    saveDB(users);
    setLoading(false);
    setSent(true);
    setSentCount(count);
    setTimeout(() => { setSent(false); setMsg(""); }, 4000);
  };

  const users = Object.values(getDB());
  const selectedTypeMeta = TYPE_OPTIONS.find((t) => t.val === type);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-white mb-1">Broadcast to All Users</h1>
        <p className="text-slate-400 text-sm">Send a notification to every registered account simultaneously. Use responsibly.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          ["fa-users",      "Total Users",      users.length,                          "text-white"     ],
          ["fa-bell",       "Will Receive",     users.length,                          "text-amber-400" ],
          ["fa-eye",        "Active (30-day)",  users.filter(u=>(u.tx||[]).some(t=>{
            try { return new Date(t.date) > new Date(Date.now()-30*864e5); } catch { return false; }
          })).length,                                                                    "text-green-400" ],
        ].map(([icon, label, val, cls]) => (
          <div key={label} className="bg-slate-900 border border-white/5 rounded-2xl p-4 text-center">
            <i className={`fas ${icon} text-2xl text-slate-500 mb-2 block`} />
            <p className={`text-2xl font-black ${cls}`}>{val}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Templates */}
      <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Templates</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {TEMPLATES.map((tpl) => (
            <button key={tpl.label} onClick={() => { setMsg(tpl.text); setType(tpl.type); }}
              className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left transition text-sm text-slate-300 hover:text-white group">
              <span className="w-8 h-8 bg-slate-700 group-hover:bg-slate-600 rounded-lg flex items-center justify-center flex-none transition">
                <i className={`fas ${tpl.icon} text-amber-400 text-xs`} />
              </span>
              {tpl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Compose */}
      <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 space-y-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Compose Broadcast</p>

        {/* Type selector */}
        <div className="flex gap-2 flex-wrap">
          {TYPE_OPTIONS.map((t) => (
            <button key={t.val} onClick={() => setType(t.val)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                type === t.val ? t.cls : "text-slate-500 bg-slate-800 border-white/5 hover:border-white/10"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Message */}
        <div>
          <label className="text-xs font-bold text-slate-400 block mb-2">Message</label>
          <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={5} maxLength={500}
            placeholder="Type your broadcast message here…"
            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 text-sm outline-none focus:border-amber-500/50 transition resize-none" />
          <p className="text-xs text-slate-600 mt-1 text-right">{msg.length}/500</p>
        </div>

        {/* Preview */}
        {msg.trim() && (
          <div className={`rounded-xl p-4 border ${selectedTypeMeta?.cls} text-sm`}>
            <p className="font-bold mb-1 flex items-center gap-2">
              <i className="fas fa-eye text-[11px]" />Preview — what users will see
            </p>
            <p className="opacity-90">📢 Alpha Bank: {msg}</p>
          </div>
        )}

        {/* Send */}
        {sent ? (
          <div className="text-center py-4 text-green-400 font-bold">
            <i className="fas fa-check-circle text-3xl mb-2 block" />
            Broadcast sent to {sentCount} user{sentCount !== 1 ? "s" : ""}!
          </div>
        ) : (
          <button onClick={broadcast} disabled={!msg.trim() || loading}
            className="w-full bg-red-600 hover:bg-red-500 text-white py-4 rounded-xl font-bold transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading
              ? <><i className="fas fa-spinner fa-spin" />Sending…</>
              : <><i className="fas fa-bullhorn" />Send to All {users.length} Users</>}
          </button>
        )}
        <p className="text-xs text-slate-600 text-center">
          <i className="fas fa-exclamation-triangle text-amber-500 mr-1" />
          This will immediately push a notification to every registered user. This action cannot be undone.
        </p>
      </div>
    </div>
  );
}
