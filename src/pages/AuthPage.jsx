import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useApp } from "../store/AppContext";
import { isAdminSession } from "../router/AdminRoute";
import { validatePassword, validateUsername, validateEmail } from "../utils/security";

export default function AuthPage() {
  const { login, signup, showToast } = useApp();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || "/app/dashboard";
  const isSignup  = location.pathname === "/signup";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email,    setEmail]    = useState("");
  const [balance,  setBalance]  = useState("");
  const [terms,    setTerms]    = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Live password hints for signup
  const pwHints = isSignup ? [
    { ok: password.length >= 8,       text: "At least 8 characters"       },
    { ok: /[A-Z]/.test(password),     text: "One uppercase letter"         },
    { ok: /[0-9]/.test(password),     text: "One number"                   },
  ] : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isSignup) {
      const uErr = validateUsername(username);
      if (uErr) return setError(uErr);
      const pErr = validatePassword(password);
      if (pErr) return setError(pErr);
      const eErr = validateEmail(email);
      if (eErr) return setError(eErr);
      if (!terms) return setError("Please accept the Terms & Conditions to continue.");
    } else {
      if (!username || !password) return setError("Please fill in all fields.");
    }

    setLoading(true);
    const result = isSignup
      ? await signup(username, password, email, parseFloat(balance) || 0)
      : await login(username, password);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      showToast(isSignup ? "Welcome to Alpha Bank! 🎉" : "Welcome back! 👋", "success");
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-slate-950 relative overflow-hidden">
      {/* BG orbs */}
      <div className="absolute w-96 h-96 bg-amber-500 rounded-full top-10 left-10 opacity-10 animate-pulse blur-3xl pointer-events-none" />
      <div className="absolute w-96 h-96 bg-yellow-500 rounded-full bottom-10 right-10 opacity-10 blur-3xl pointer-events-none" />

      <div className="z-10 w-full max-w-md">
        {/* Back to website */}
        <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-amber-400 transition text-sm font-semibold mb-6 w-fit">
          <i className="fas fa-arrow-left" /> Back to website
        </Link>

        <div className="bg-white/[0.07] backdrop-blur-xl border border-white/15 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4">
              <i className="fas fa-university text-3xl text-slate-900" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Alpha Bank</h1>
            <p className="text-amber-300 text-sm mt-1 font-medium">Secure Net Banking Portal</p>
          </div>

          {/* Tab toggle */}
          <div className="flex bg-black/30 p-1.5 rounded-2xl mb-7 border border-white/10">
            <Link to="/login" className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all text-center ${!isSignup ? "text-slate-900 bg-amber-500 shadow-md" : "text-amber-400 hover:text-white"}`}>
              <i className="fas fa-sign-in-alt mr-1.5" /> Log In
            </Link>
            <Link to="/signup" className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all text-center ${isSignup ? "text-slate-900 bg-amber-500 shadow-md" : "text-amber-400 hover:text-white"}`}>
              <i className="fas fa-user-plus mr-1.5" /> Create Account
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="relative">
              <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 text-sm pointer-events-none" />
              <input type="text" placeholder="Username" value={username}
                onChange={(e) => setUsername(e.target.value)} required autoComplete="username"
                className="w-full bg-white/5 border border-white/20 rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder-amber-400/70 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:bg-white/10 transition text-sm" />
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 text-sm pointer-events-none" />
                <input type={showPass ? "text" : "password"} placeholder="Password" value={password}
                  onChange={(e) => setPassword(e.target.value)} required autoComplete={isSignup ? "new-password" : "current-password"}
                  className="w-full bg-white/5 border border-white/20 rounded-2xl pl-11 pr-12 py-3.5 text-white placeholder-amber-400/70 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:bg-white/10 transition text-sm" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400 hover:text-white transition">
                  <i className={`fas ${showPass ? "fa-eye-slash" : "fa-eye"} text-sm`} />
                </button>
              </div>
              {/* Password hints (signup only) */}
              {isSignup && password && (
                <div className="mt-2 space-y-1">
                  {pwHints.map((h) => (
                    <div key={h.text} className={`flex items-center gap-2 text-xs font-medium ${h.ok ? "text-green-400" : "text-slate-500"}`}>
                      <i className={`fas ${h.ok ? "fa-check-circle" : "fa-circle"} text-[10px]`} />
                      {h.text}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {isSignup && (
              <>
                <div className="relative">
                  <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 text-sm pointer-events-none" />
                  <input type="email" placeholder="Email (optional)" value={email}
                    onChange={(e) => setEmail(e.target.value)} autoComplete="email"
                    className="w-full bg-white/5 border border-white/20 rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder-amber-400/70 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:bg-white/10 transition text-sm" />
                </div>
                <div className="relative">
                  <i className="fas fa-rupee-sign absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 text-sm pointer-events-none" />
                  <input type="number" placeholder="Opening Balance ₹ (optional)" value={balance}
                    onChange={(e) => setBalance(e.target.value)} min="0"
                    className="w-full bg-white/5 border border-white/20 rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder-amber-400/70 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:bg-white/10 transition text-sm" />
                </div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <button type="button" onClick={() => setTerms(!terms)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-none mt-0.5 transition-all ${terms ? "bg-amber-400 border-amber-400" : "border-white/30 group-hover:border-amber-300"}`}>
                    {terms && <i className="fas fa-check text-white text-xs" />}
                  </button>
                  <span className="text-xs text-amber-300 leading-relaxed select-none">
                    I agree to Alpha Bank's{" "}
                    <Link to="/terms" className="text-white underline font-semibold hover:no-underline">Terms & Conditions</Link>
                    {" "}and{" "}
                    <Link to="/privacy" className="text-white underline font-semibold hover:no-underline">Privacy Policy</Link>.
                    I confirm I am 18+ years old.
                  </span>
                </label>
              </>
            )}

            {error && (
              <div className="flex items-center gap-2.5 text-red-300 bg-red-900/30 p-3.5 rounded-2xl text-xs font-semibold border border-red-500/30">
                <i className="fas fa-exclamation-circle text-sm flex-none" /> {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-900 font-bold py-4 rounded-2xl shadow-lg shadow-amber-900/40 transition-all active:scale-[0.98] disabled:opacity-60 text-sm mt-1">
              {loading
                ? <><i className="fas fa-spinner fa-spin mr-2" />Processing…</>
                : isSignup
                  ? <><i className="fas fa-user-plus mr-2" />Create My Account</>
                  : <><i className="fas fa-sign-in-alt mr-2" />Login to Net Banking</>}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-4 flex-wrap">
            {["RBI Regulated", "256-bit SSL", "DICGC Insured"].map((b) => (
              <span key={b} className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold">
                <i className="fas fa-shield-alt text-emerald-400 text-xs" /> {b}
              </span>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">
          Passwords are hashed with SHA-256. We never store plaintext credentials.
        </p>
      </div>
    </div>
  );
}
