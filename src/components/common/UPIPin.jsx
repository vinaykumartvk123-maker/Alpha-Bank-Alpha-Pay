import { useState, useEffect, useCallback } from "react";
import { hashPassword } from "../../utils/security";
import { useApp } from "../../store/AppContext";

// ── UPI PIN numpad modal ──────────────────────────────────────────────────────
// onSuccess(pin) called when correct PIN entered
// onClose() called on cancel
// mode: "verify" | "set" | "change"
export default function UPIPin({ mode = "verify", onSuccess, onClose, title }) {
  const { currentUser, updateUser, showToast } = useApp();
  const [digits,   setDigits]   = useState([]);
  const [confirm,  setConfirm]  = useState([]);
  const [phase,    setPhase]    = useState(mode === "set" ? "enter" : "verify"); // enter | confirm
  const [error,    setError]    = useState("");
  const [attempts, setAttempts] = useState(0);
  const [loading,  setLoading]  = useState(false);

  const MAX_ATTEMPTS = 3;
  const PIN_LENGTH   = 6;

  const activeDigits = phase === "confirm" ? confirm : digits;
  const setActive = phase === "confirm" ? setConfirm : setDigits;

  const handleKey = useCallback((k) => {
    setError("");
    if (k === "del") {
      setActive((prev) => prev.slice(0, -1));
      return;
    }
    if (activeDigits.length >= PIN_LENGTH) return;
    const next = [...activeDigits, k];
    setActive(next);

    if (next.length === PIN_LENGTH) {
      setTimeout(() => process(next), 120);
    }
  }, [activeDigits, phase]); // eslint-disable-line

  const process = async (entered) => {
    setLoading(true);

    if (mode === "set" || (mode === "change" && phase === "enter")) {
      if (phase === "enter") {
        setPhase("confirm");
        setDigits(entered);
        setConfirm([]);
        setLoading(false);
        return;
      }
      // confirm phase
      if (entered.join("") !== digits.join("")) {
        setError("PINs do not match. Try again.");
        setConfirm([]);
        setPhase("enter");
        setDigits([]);
        setLoading(false);
        return;
      }
      // Save new PIN
      const pinHash = await hashPassword(entered.join(""));
      updateUser({ upiPinHash: pinHash });
      showToast("UPI PIN set successfully!", "success");
      setLoading(false);
      onSuccess?.(entered.join(""));
      return;
    }

    // verify mode
    if (!currentUser?.upiPinHash) {
      showToast("Please set your UPI PIN first in Settings.", "error");
      setLoading(false);
      onClose?.();
      return;
    }
    const hash = await hashPassword(entered.join(""));
    if (hash === currentUser.upiPinHash) {
      setLoading(false);
      onSuccess?.(entered.join(""));
      return;
    }
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    if (newAttempts >= MAX_ATTEMPTS) {
      showToast("Too many wrong attempts. Transfer blocked for this session.", "error");
      setLoading(false);
      onClose?.();
      return;
    }
    setError(`Incorrect PIN. ${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts !== 1 ? "s" : ""} left.`);
    setDigits([]);
    setLoading(false);
  };

  // keyboard support
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") { onClose?.(); return; }
      if (e.key === "Backspace") { handleKey("del"); return; }
      if (/^[0-9]$/.test(e.key)) handleKey(e.key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleKey, onClose]);

  const KEYS = [["1","2","3"],["4","5","6"],["7","8","9"],["","0","del"]];
  const displayDigits = activeDigits.length;
  const phaseLabel    = phase === "confirm" ? "Confirm your PIN" : mode === "set" ? "Set a 6-digit UPI PIN" : (title || "Enter UPI PIN to proceed");

  return (
    <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:max-w-sm bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-yellow-400 px-6 py-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <i className="fas fa-lock text-slate-900 text-sm" />
              <span className="font-black text-slate-900">UPI PIN</span>
            </div>
            <p className="text-slate-900/70 text-xs font-medium">{phaseLabel}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 bg-slate-900/10 hover:bg-slate-900/20 rounded-xl flex items-center justify-center text-slate-900/70 transition">
            <i className="fas fa-times text-sm" />
          </button>
        </div>

        {/* PIN dots */}
        <div className="px-8 py-6 flex flex-col items-center">
          <div className="flex gap-4 mb-2">
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <div key={i}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                  i < displayDigits
                    ? "bg-amber-500 border-amber-500 scale-110"
                    : "bg-transparent border-slate-300 dark:border-slate-600"
                }`} />
            ))}
          </div>
          {error && (
            <p className="text-xs text-red-500 font-semibold mt-2 flex items-center gap-1.5">
              <i className="fas fa-exclamation-circle" />{error}
            </p>
          )}
          {loading && (
            <p className="text-xs text-amber-600 font-semibold mt-2 flex items-center gap-1.5">
              <i className="fas fa-spinner fa-spin" />Verifying…
            </p>
          )}
        </div>

        {/* Numpad */}
        <div className="px-6 pb-8 grid grid-cols-3 gap-3">
          {KEYS.flat().map((key, i) => {
            if (key === "") return <div key={i} />;
            return (
              <button key={i} onClick={() => handleKey(key)} disabled={loading}
                className={`h-14 rounded-2xl font-bold text-lg transition-all active:scale-95 disabled:opacity-40 ${
                  key === "del"
                    ? "bg-slate-100 dark:bg-slate-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-700 dark:hover:text-amber-400"
                }`}>
                {key === "del" ? <i className="fas fa-backspace" /> : key}
              </button>
            );
          })}
        </div>

        <p className="text-center text-[10px] text-slate-400 pb-4">
          <i className="fas fa-shield-alt text-green-500 mr-1" />PIN is encrypted and never stored in plaintext
        </p>
      </div>
    </div>
  );
}
