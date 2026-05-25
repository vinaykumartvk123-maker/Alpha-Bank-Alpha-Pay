import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../store/AppContext";
import { getUserTier, fmt } from "../../utils/helpers";
import { hashPassword, validatePassword, validateEmail, sanitize, sanitizeUsername, validateUsername } from "../../utils/security";
import { getDB, saveDB } from "../../utils/storage";
import UPIPin from "../../components/common/UPIPin";
import ErrorBoundary from "../../components/common/ErrorBoundary";

function Toggle({ label, sub, checked, onToggle }) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
      <div>
        <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>
      </div>
      <button onClick={onToggle}
        className={`w-12 h-6 rounded-full transition-colors relative flex-none ${checked ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-600"}`}>
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? "left-7" : "left-1"}`} />
      </button>
    </div>
  );
}

export default function Settings() {
  const { currentUser, updateUser, logout, showToast, isDarkMode, setIsDarkMode, isPrivacy, setIsPrivacy, openModal, closeModal } = useApp();
  const navigate = useNavigate();

  // Profile fields
  const [editing,     setEditing]     = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || "");
  const [email,       setEmail]       = useState(currentUser?.email    || "");
  const [phone,       setPhone]       = useState(currentUser?.phone    || "");
  const [dob,         setDob]         = useState(currentUser?.dob      || "");
  const [savingProf,  setSavingProf]  = useState(false);

  // Username change (one-time)
  const [newUsername, setNewUsername] = useState("");
  const [usernameErr, setUsernameErr] = useState("");
  const [savingUser,  setSavingUser]  = useState(false);

  // Login password change
  const [newPass,    setNewPass]    = useState("");
  const [passErr,    setPassErr]    = useState("");
  const [showPass,   setShowPass]   = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  // UPI PIN management
  const [pinModalMode, setPinModalMode] = useState(null); // "set" | "change"
  const [dailyLimit, setDailyLimit] = useState(String(currentUser?.security?.dailyTransferLimit || 100000));

  const txCount = (currentUser?.tx || []).length;
  const tier    = getUserTier(txCount);
  const score   = Math.min(900, 650 + Math.min(txCount * 3, 60) + (currentUser?.balance > 10000 ? 30 : 0) + 80);
  const hasPIN  = !!currentUser?.upiPinHash;
  const usernameChanged = !!currentUser?.usernameChangedOn;

  const saveProfile = async () => {
    const emailErr = validateEmail(email);
    if (emailErr) return showToast(emailErr, "error");
    setSavingProf(true);
    await new Promise((r) => setTimeout(r, 400));
    updateUser({ displayName: sanitize(displayName), email: sanitize(email), phone: sanitize(phone), dob: sanitize(dob) });
    setEditing(false); setSavingProf(false);
    showToast("Profile updated!", "success");
  };

  const changeUsername = async () => {
    if (usernameChanged) return showToast("Username can only be changed once.", "error");
    const cleaned = sanitizeUsername(newUsername);
    const err = validateUsername(cleaned);
    if (err) { setUsernameErr(err); return; }
    if (cleaned.toLowerCase() === currentUser.username.toLowerCase()) { setUsernameErr("That is your current username."); return; }

    setSavingUser(true);
    const users = getDB();
    if (Object.values(users).some((u) => u.id !== currentUser.id && u.username.toLowerCase() === cleaned.toLowerCase())) {
      setUsernameErr("Username already taken."); setSavingUser(false); return;
    }
    await new Promise((r) => setTimeout(r, 600));
    const newUpi = cleaned.toLowerCase() + "@alpha";
    updateUser({ username: cleaned, upiId: newUpi, usernameChangedOn: new Date().toLocaleDateString() });
    setNewUsername(""); setUsernameErr(""); setSavingUser(false);
    showToast(`Username changed to ${cleaned}. Your new UPI ID: ${newUpi}`, "success");
  };

  const changePassword = async () => {
    const err = validatePassword(newPass);
    if (err) { setPassErr(err); return; }
    setSavingPass(true);
    const hashed = await hashPassword(newPass);
    updateUser({ pass: hashed });
    setNewPass(""); setPassErr(""); setSavingPass(false);
    showToast("Login password changed successfully!", "success");
  };

  const saveDailyLimit = () => {
    const limit = Number(dailyLimit);
    if (!Number.isFinite(limit) || limit < 1000 || limit > 1000000) {
      return showToast("Daily transfer limit must be between ₹1,000 and ₹10,00,000.", "error");
    }
    updateUser({ security: { ...(currentUser?.security || {}), dailyTransferLimit: limit } });
    showToast("Daily transfer limit updated.", "success");
  };

  const exportStatement = () => {
    const tx = currentUser?.tx || [];
    if (!tx.length) return showToast("No transactions to export", "error");
    const rows = ["Date,Description,Type,Amount(INR)"];
    [...tx].reverse().forEach((t) => rows.push(`${t.date},"${t.desc}",${t.type},${t.amount}`));
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `AlphaBank_${currentUser.username}_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(a.href);
    showToast("Statement exported as CSV!", "success");
  };

  const confirmDeleteAccount = () => {
    openModal("Delete Account", (
      <div className="space-y-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 rounded-2xl p-4">
          <p className="font-bold text-red-700 dark:text-red-400 text-sm mb-1">⚠️ This action is permanent</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">Balance of <strong>{fmt(currentUser?.balance||0)}</strong> and all data will be deleted permanently.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={closeModal} className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white py-3 rounded-xl font-bold text-sm transition">Cancel</button>
          <button onClick={() => { const users=getDB(); delete users[currentUser.id]; saveDB(users); logout(); closeModal(); navigate("/", { replace: true }); }}
            className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-red-600 transition">Delete My Account</button>
        </div>
      </div>
    ));
  };

  const confirmClearHistory = () => {
    openModal("Clear Transaction History", (
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">Clear all {txCount} transaction records? Balance is unaffected.</p>
        <div className="flex gap-3">
          <button onClick={closeModal} className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white py-3 rounded-xl font-bold text-sm transition">Cancel</button>
          <button onClick={() => { updateUser({tx:[]}); closeModal(); showToast("History cleared.","info"); }}
            className="flex-1 bg-amber-500 text-slate-900 py-3 rounded-xl font-bold text-sm hover:bg-amber-600 transition">Clear History</button>
        </div>
      </div>
    ));
  };

  return (
    <ErrorBoundary>
      {/* UPI PIN modal */}
      {pinModalMode && (
        <UPIPin mode={pinModalMode}
          onSuccess={() => { setPinModalMode(null); showToast(hasPIN ? "UPI PIN changed!" : "UPI PIN set successfully!", "success"); }}
          onClose={() => setPinModalMode(null)} />
      )}

      <div className="space-y-8 max-w-3xl page-fade-in">

        {/* ── Profile ── */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-xl text-slate-800 dark:text-white">Profile</h3>
            <button onClick={() => setEditing((v) => !v)}
              className="text-amber-600 text-sm font-bold hover:bg-amber-50 dark:hover:bg-amber-900/20 px-4 py-2 rounded-xl transition">
              <i className="fas fa-edit mr-1" />{editing ? "Cancel" : "Edit"}
            </button>
          </div>
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-yellow-400 rounded-full flex items-center justify-center text-slate-900 text-3xl font-bold shadow-lg flex-none">
              {currentUser?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-800 dark:text-white">{currentUser?.displayName || currentUser?.username}</h4>
              <p className="text-amber-600 font-mono text-sm">{currentUser?.upiId || currentUser?.username?.toLowerCase()+"@alpha"}</p>
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Joined: <strong className="text-slate-700 dark:text-slate-200">{currentUser?.joinDate||"N/A"}</strong></span>
                <span>Tier: <strong className="text-slate-700 dark:text-slate-200">{tier.icon} {tier.name}</strong></span>
                <span>KYC: <strong className={currentUser?.kyc?.status==="verified"?"text-green-600":"text-amber-600"}>{currentUser?.kyc?.status==="verified"?"Verified":"Pending"}</strong></span>
              </div>
            </div>
          </div>

          {editing && (
            <div className="mb-4">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">Display Name</label>
              <input value={displayName} onChange={(e)=>setDisplayName(e.target.value)} maxLength={40} placeholder="Your full name"
                className="w-full bg-slate-50 dark:bg-slate-700 p-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-400 text-sm transition mb-4" />
            </div>
          )}
          {!editing && currentUser?.displayName && (
            <div className="mb-4"><p className="text-xs text-slate-400">Display Name</p><p className="font-semibold text-slate-800 dark:text-white text-sm mt-0.5">{currentUser.displayName}</p></div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label:"Email",        value:email, setter:setEmail, type:"email", placeholder:"your@email.com"    },
              { label:"Phone Number", value:phone, setter:setPhone, type:"tel",   placeholder:"+91 98765 43210"   },
              { label:"Date of Birth",value:dob,   setter:setDob,  type:"date",  placeholder:""                  },
            ].map(({label,value,setter,type,placeholder}) => (
              <div key={label}>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">{label}</label>
                <input type={type} value={value} onChange={(e)=>setter(e.target.value)} disabled={!editing} placeholder={placeholder}
                  className="w-full bg-slate-50 dark:bg-slate-700 p-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-60 text-sm transition" />
              </div>
            ))}
          </div>
          {editing && (
            <button onClick={saveProfile} disabled={savingProf}
              className="mt-4 bg-amber-500 text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-amber-600 transition text-sm disabled:opacity-60">
              {savingProf ? <><i className="fas fa-spinner fa-spin mr-2" />Saving…</> : <><i className="fas fa-save mr-2" />Save Changes</>}
            </button>
          )}
        </div>

        {/* ── Credit Score ── */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
          <h3 className="font-bold text-xl text-slate-800 dark:text-white mb-6">Credit Score</h3>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-36 h-36 flex-none">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#fef3c7" strokeWidth="12"/>
                <circle cx="60" cy="60" r="50" fill="none" stroke="#f59e0b" strokeWidth="12"
                  strokeDasharray={`${((score-300)/600)*314} 314`} strokeLinecap="round"/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-extrabold text-slate-800 dark:text-white">{score}</p>
                <p className={`text-xs font-bold ${score>=750?"text-green-600":score>=700?"text-blue-600":"text-amber-600"}`}>
                  {score>=750?"Excellent":score>=700?"Good":"Fair"}
                </p>
              </div>
            </div>
            <div className="flex-1 w-full space-y-2.5">
              {[["Poor","300–549","text-red-500"],["Average","550–649","text-orange-500"],["Fair","650–699","text-amber-500"],["Good","700–749","text-blue-500"],["Excellent","750–900","text-green-500"]].map(([l,r,c])=>(
                <div key={l} className="flex justify-between text-sm"><span className="text-slate-500 dark:text-slate-400">{l}</span><span className={`font-bold ${c}`}>{r}</span></div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Security & Account ── */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
          <h3 className="font-bold text-xl text-slate-800 dark:text-white mb-6">Security & Preferences</h3>
          <div className="space-y-4">
            <Toggle label="Privacy Mode"  sub="Hide balances across the app" checked={isPrivacy}  onToggle={()=>setIsPrivacy(v=>!v)} />
            <Toggle label="Dark Mode"     sub="Switch to dark colour theme"   checked={isDarkMode} onToggle={()=>setIsDarkMode(v=>!v)} />

            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
              <p className="font-bold text-slate-700 dark:text-slate-200 text-sm mb-1">Daily Transfer Limit</p>
              <p className="text-xs text-slate-400 mb-3">Controls the maximum amount you can send from Alpha Pay in one day.</p>
              <div className="flex gap-2 flex-wrap">
                <input type="number" min="1000" max="1000000" step="1000" value={dailyLimit} onChange={(e)=>setDailyLimit(e.target.value)}
                  className="flex-1 min-w-[180px] bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-400 transition" />
                <button onClick={saveDailyLimit}
                  className="bg-amber-500 text-slate-900 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-amber-600 transition">
                  Save Limit
                </button>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {[25000, 50000, 100000, 250000].map((v) => (
                  <button key={v} type="button" onClick={() => setDailyLimit(String(v))}
                    className="px-3 py-1.5 bg-white dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-300 hover:bg-amber-50 hover:text-amber-600 transition">
                    {fmt(v)}
                  </button>
                ))}
              </div>
            </div>

            {/* Username change */}
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">Change Username</p>
                {usernameChanged && <span className="text-[10px] bg-slate-200 dark:bg-slate-600 text-slate-500 px-2 py-0.5 rounded-full font-bold">Already changed once</span>}
              </div>
              <p className="text-xs text-slate-400 mb-3">One-time only. Your UPI ID will also change to newname@alpha.</p>
              {!usernameChanged ? (
                <div className="space-y-2">
                  <input value={newUsername} onChange={(e)=>{setNewUsername(e.target.value);setUsernameErr("");}} placeholder="New username"
                    className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-400 transition" />
                  {usernameErr && <p className="text-xs text-red-500"><i className="fas fa-exclamation-circle mr-1"/>{usernameErr}</p>}
                  <button onClick={changeUsername} disabled={savingUser||!newUsername}
                    className="bg-amber-500 text-slate-900 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-amber-600 transition disabled:opacity-60">
                    {savingUser?<><i className="fas fa-spinner fa-spin mr-2"/>Changing…</>:"Change Username"}
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">Current username: <strong className="text-slate-700 dark:text-slate-300">{currentUser?.username}</strong></p>
              )}
            </div>

            {/* UPI PIN management */}
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between mb-1">
                <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">UPI / Transaction PIN</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${hasPIN?"bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400":"bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"}`}>
                  {hasPIN?"Set":"Not Set"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">6-digit PIN required for all money transfers. Separate from your login password.</p>
              <div className="flex gap-2">
                {!hasPIN
                  ? <button onClick={()=>setPinModalMode("set")} className="bg-amber-500 text-slate-900 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-amber-600 transition">
                      <i className="fas fa-lock mr-2"/>Set UPI PIN
                    </button>
                  : <>
                      <button onClick={()=>setPinModalMode("change")} className="bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-300 dark:hover:bg-slate-500 transition">
                        <i className="fas fa-key mr-2"/>Change PIN
                      </button>
                      <span className="text-xs text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                        <i className="fas fa-check-circle"/>PIN active
                      </span>
                    </>
                }
              </div>
            </div>

            {/* Login password change */}
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
              <p className="font-bold text-slate-700 dark:text-slate-200 text-sm mb-1">Change Login Password</p>
              <p className="text-xs text-slate-400 mb-3">Min 8 chars, 1 uppercase, 1 number.</p>
              <div className="relative mb-2">
                <input type={showPass?"text":"password"} value={newPass} onChange={(e)=>{setNewPass(e.target.value);setPassErr("");}} placeholder="New password"
                  className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl p-3 pr-10 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-400 transition" />
                <button type="button" onClick={()=>setShowPass(v=>!v)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                  <i className={`fas ${showPass?"fa-eye-slash":"fa-eye"} text-xs`}/>
                </button>
              </div>
              {passErr && <p className="text-xs text-red-500 mb-2"><i className="fas fa-exclamation-circle mr-1"/>{passErr}</p>}
              <button onClick={changePassword} disabled={savingPass}
                className="bg-amber-500 text-slate-900 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-amber-600 transition disabled:opacity-60">
                {savingPass?<><i className="fas fa-spinner fa-spin mr-2"/>Updating…</>:"Change Password"}
              </button>
            </div>

            {/* Export */}
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
              <p className="font-bold text-slate-700 dark:text-slate-200 text-sm mb-1">Export Statement</p>
              <p className="text-xs text-slate-400 mb-3">Download full transaction history as CSV</p>
              <button onClick={exportStatement} className="bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-600 transition">
                <i className="fas fa-download mr-2"/>Download Statement
              </button>
            </div>

            {/* Clear history */}
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
              <p className="font-bold text-slate-700 dark:text-slate-200 text-sm mb-1">Transaction History</p>
              <p className="text-xs text-slate-400 mb-3">Permanently clear all {txCount} transaction records. Balance unaffected.</p>
              <button onClick={confirmClearHistory} className="bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-300 dark:hover:bg-slate-500 transition">Clear History</button>
            </div>

            {/* Danger zone */}
            <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-700/30">
              <p className="font-bold text-red-600 dark:text-red-400 mb-1 text-sm">Danger Zone</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Permanently delete your account and all data.</p>
              <button onClick={confirmDeleteAccount} className="bg-red-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-600 transition">
                <i className="fas fa-trash mr-2"/>Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* App info */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-300 rounded-xl flex items-center justify-center">
              <span className="font-black text-slate-900 text-lg">α</span>
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-white text-sm">Alpha Bank v2.0 · Hyderabad</p>
              <p className="text-xs text-slate-400">© 2024 Alpha Financial Services Ltd. · RBI Regulated</p>
            </div>
          </div>
          <div className="flex gap-2">
            <i className="fas fa-shield-alt text-green-500 text-lg"/>
            <i className="fas fa-lock text-blue-500 text-lg"/>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
