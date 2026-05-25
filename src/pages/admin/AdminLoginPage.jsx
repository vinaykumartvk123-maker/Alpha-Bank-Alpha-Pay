import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ADMIN_USERNAME, ADMIN_PASSWORD } from "../../utils/constants";
import { setAdminSession, isAdminSession, clearAdminSession } from "../../router/AdminRoute";
import MarketTicker from "../../components/common/MarketTicker";

export default function AdminLoginPage() {
  const navigate   = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [locked,   setLocked]   = useState(false);
  const [lockTimer,setLockTimer]= useState(0);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAdminSession()) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  // Lock countdown
  useEffect(() => {
    if (!locked) return;
    setLockTimer(30);
    const interval = setInterval(() => {
      setLockTimer((t) => {
        if (t <= 1) { clearInterval(interval); setLocked(false); setAttempts(0); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [locked]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (locked) return;
    setError(""); setLoading(true);

    await new Promise((r) => setTimeout(r, 600)); // simulate auth delay

    if (
      username.trim().toLowerCase() === ADMIN_USERNAME.toLowerCase() &&
      password === ADMIN_PASSWORD
    ) {
      setAdminSession();
      setLoading(false);
      // replace: true removes /admin/login from browser history so back button cannot return here
      navigate("/admin/dashboard", { replace: true });
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setLoading(false);
      if (newAttempts >= 3) {
        setLocked(true);
        setError("Too many failed attempts. Access locked for 30 seconds.");
      } else {
        setError(`Invalid credentials. ${3 - newAttempts} attempt${3 - newAttempts !== 1 ? "s" : ""} remaining.`);
      }
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <MarketTicker />

      {/* Security indicator bar */}
      <div className="bg-red-950 border-b border-red-900/50 px-4 py-2 flex items-center justify-center gap-2">
        <i className="fas fa-shield-halved text-red-400 text-xs" />
        <p className="text-red-400 text-xs font-semibold tracking-wide">
          RESTRICTED AREA · Admin Console · Authorised Personnel Only · All Access Attempts Are Logged
        </p>
        <i className="fas fa-shield-halved text-red-400 text-xs" />
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-600 px-8 py-7 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.15) 10px, rgba(0,0,0,0.15) 11px)" }} />
              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 bg-white/15 backdrop-blur rounded-2xl flex items-center justify-center flex-none border border-white/20">
                  <i className="fas fa-shield-alt text-white text-2xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-white">Admin Console</h1>
                  <p className="text-red-200 text-sm mt-0.5">Alpha Bank Management System · Hyderabad</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-8">
              <div className="flex items-center gap-2 mb-5 text-xs text-slate-500 bg-slate-800/60 border border-white/5 rounded-xl px-4 py-3">
                <i className="fas fa-info-circle text-amber-500" />
                <span>This portal is restricted to Alpha Bank administrators. Unauthorized access violates the IT Act 2000.</span>
              </div>

              <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
                {/* Honeypot - hidden field to catch bots */}
                <input type="text" name="company" tabIndex={-1} style={{ display: "none" }} />

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                    Admin Username
                  </label>
                  <div className="relative">
                    <i className="fas fa-user-shield absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                    <input
                      type="text" value={username} autoComplete="off" spellCheck={false}
                      onChange={(e) => { setUsername(e.target.value); setError(""); }}
                      required disabled={locked}
                      placeholder="Enter admin username"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-red-500/50 transition text-sm disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                    Admin Password
                  </label>
                  <div className="relative">
                    <i className="fas fa-key absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                    <input
                      type={showPass ? "text" : "password"} value={password} autoComplete="new-password"
                      onChange={(e) => { setPassword(e.target.value); setError(""); }}
                      required disabled={locked}
                      placeholder="Enter admin password"
                      className="w-full pl-11 pr-12 py-3.5 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-red-500/50 transition text-sm disabled:opacity-50"
                    />
                    <button type="button" onClick={() => setShowPass((v) => !v)} disabled={locked}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition disabled:opacity-30">
                      <i className={`fas ${showPass ? "fa-eye-slash" : "fa-eye"} text-sm`} />
                    </button>
                  </div>
                </div>

                {/* Attempt counter */}
                {attempts > 0 && !locked && (
                  <div className="flex gap-1 justify-end">
                    {[0,1,2].map((i) => (
                      <div key={i} className={`w-2 h-2 rounded-full ${i < attempts ? "bg-red-500" : "bg-slate-700"}`} />
                    ))}
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
                    <i className="fas fa-ban text-red-400 text-sm flex-none" />
                    <p className="text-red-300 text-sm font-medium">
                      {error}
                      {locked && <span className="font-black text-red-200 ml-2">({lockTimer}s)</span>}
                    </p>
                  </div>
                )}

                <button
                  type="submit" disabled={loading || locked}
                  className="w-full bg-gradient-to-r from-red-700 to-rose-600 text-white py-4 rounded-xl font-bold text-sm hover:opacity-90 transition shadow-lg shadow-red-900/30 active:scale-[0.98] disabled:opacity-50 mt-2"
                >
                  {loading
                    ? <><i className="fas fa-spinner fa-spin mr-2" />Authenticating…</>
                    : locked
                    ? <><i className="fas fa-lock mr-2" />Locked ({lockTimer}s)</>
                    : <><i className="fas fa-sign-in-alt mr-2" />Access Admin Console</>}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-white/5 text-center">
                <a href="/" className="text-xs text-slate-700 hover:text-slate-500 transition flex items-center justify-center gap-1.5">
                  <i className="fas fa-arrow-left text-[10px]" />Return to Alpha Bank
                </a>
              </div>
            </div>
          </div>

          <div className="text-center mt-5 space-y-1">
            <p className="text-xs text-slate-700">
              <i className="fas fa-lock mr-1 text-slate-600" />
              Secured · Session terminates on tab close · 3-attempt lockout
            </p>
            <p className="text-[10px] text-slate-800">
              Unauthorized access is prosecutable under IT Act 2000, Section 66
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
