import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { uid, hashPassword, verifyPassword, sanitize, sanitizeUsername, validatePassword, validateUsername, validateEmail } from "../utils/security";
import { getDB, saveDB, getSession, setSession, clearSession, refreshSession, USER_DB_UPDATED_EVENT } from "../utils/storage";
import { DB_KEY } from "../utils/constants";
import { clearAdminSession } from "../router/AdminRoute";

const AppContext = createContext(null);

const withUserDefaults = (user = {}) => {
  const defaults = {
    wallets: { USD: 0, EUR: 0, GBP: 0 },
    rewards: { cashback: 0, tier: "Bronze", scratchWins: 0, scratchedCards: [] },
    cardControls: { frozen: false, online: true, international: false, contactless: true },
    security: { dailyTransferLimit: 100000 },
    goals: [], loans: [], beneficiaries: [], budgets: {},
    notifications: [], schedules: [], deposits: [],
    joinDate: new Date().toLocaleDateString(),
  };
  return {
    ...defaults,
    ...user,
    wallets: { ...defaults.wallets, ...(user.wallets || {}) },
    rewards: { ...defaults.rewards, ...(user.rewards || {}) },
    cardControls: { ...defaults.cardControls, ...(user.cardControls || {}) },
    security: { ...defaults.security, ...(user.security || {}) },
  };
};

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady,   setAuthReady]   = useState(false);
  const [toasts,      setToasts]      = useState([]);
  const [modal,       setModal]       = useState(null);
  const [isDarkMode,  setIsDarkMode]  = useState(false);
  const [isPrivacy,   setIsPrivacy]   = useState(false);
  const [currentCurrency, setCurrentCurrency] = useState("INR");

  // ── Dark mode ──────────────────────────────────────────────────────────────
  useEffect(() => { document.body.classList.toggle("dark", isDarkMode); }, [isDarkMode]);

  // ── Session restore on mount ───────────────────────────────────────────────
  useEffect(() => {
    const userId = getSession();
    if (userId) {
      const users = getDB();
      if (users[userId]) { _mountUser(users[userId]); return; }
    }
    setAuthReady(true);
  }, []); // eslint-disable-line

  // ── Session keep-alive ─────────────────────────────────────────────────────
  const sessionRef = useRef(null);
  useEffect(() => {
    if (!currentUser) return;
    sessionRef.current = setInterval(() => {
      if (getSession()) refreshSession(currentUser.id);
      else logout();
    }, 10 * 60 * 1000);
    return () => clearInterval(sessionRef.current);
  }, [currentUser?.id]); // eslint-disable-line

  // ─────────────────────────────────────────────────────────────────────────
  const _mountUser = useCallback((user) => {
    setCurrentUser(withUserDefaults(user));
    setAuthReady(true);
  }, []);

  const saveUserData = useCallback((user) => {
    const users = getDB();
    users[user.id] = user;
    saveDB(users);
  }, []);

  // ── Signup ─────────────────────────────────────────────────────────────────
  const signup = useCallback(async (username, password, email, balance) => {
    const cleanUser  = sanitizeUsername(username);
    const cleanEmail = sanitize(email);
    const userErr  = validateUsername(cleanUser);   if (userErr)  return { error: userErr  };
    const passErr  = validatePassword(password);    if (passErr)  return { error: passErr  };
    const emailErr = validateEmail(cleanEmail);     if (emailErr) return { error: emailErr };

    const users = getDB();
    if (Object.values(users).some((u) => u.username.toLowerCase() === cleanUser.toLowerCase()))
      return { error: "Username already taken." };

    const hashedPass     = await hashPassword(password);
    const id             = uid();
    const openingBalance = Math.max(0, parseFloat(balance) || 0);

    const acArr = new Uint8Array(6);
    crypto.getRandomValues(acArr);
    const accountNumber = Array.from(acArr).map((b) => String(b % 10)).join("").padStart(12, "4");
    const ifscCode      = "ALPH0" + String(Math.floor(10000 + Math.random() * 90000));
    const upiId         = cleanUser.toLowerCase() + "@alpha";

    const newUser = {
      id, username: cleanUser, pass: hashedPass, email: cleanEmail, phone: "", displayName: "",
      balance: openingBalance, accountNumber, ifscCode, upiId,
      wallets: { USD: 0, EUR: 0, GBP: 0 },
      rewards: { cashback: 0, tier: "Bronze", scratchWins: 0, scratchedCards: [] },
      cardControls: { frozen: false, online: true, international: false, contactless: true },
      security: { dailyTransferLimit: 100000 },
      goals: [], loans: [], beneficiaries: [], budgets: {}, schedules: [], deposits: [],
      notifications: [{ id: uid(), type: "success", msg: "Welcome to Alpha Bank! Your account is active.", date: new Date().toLocaleDateString(), read: false }],
      tx: openingBalance > 0
        ? [{ id: uid(), type: "credit", desc: "Opening Balance", amount: openingBalance, date: new Date().toLocaleDateString(), category: "deposit" }]
        : [],
      joinDate: new Date().toLocaleDateString(),
      kyc: { status: "pending", step: 0 },
    };

    users[id] = newUser;
    saveDB(users);
    clearAdminSession();
    setSession(id);
    _mountUser(newUser);
    return { ok: true };
  }, [_mountUser]);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (username, password) => {
    const cleanUser = sanitizeUsername(username);
    const users = getDB();
    const user  = Object.values(users).find((u) => u.username.toLowerCase() === cleanUser.toLowerCase());
    if (!user) return { error: "User not found." };

    const result = await verifyPassword(password, user.pass);
    if (!result) return { error: "Incorrect password." };

    if (result === "legacy") {
      user.pass = await hashPassword(password);
      users[user.id] = user;
      saveDB(users);
    }
    clearAdminSession();
    setSession(user.id);
    _mountUser(user);
    return { ok: true };
  }, [_mountUser]);

  const logout = useCallback(() => { clearSession(); setCurrentUser(null); }, []);

  // Keep the mounted user fresh when admin actions credit loans, deposits, or
  // insurance payouts into localStorage from another route/tab.
  useEffect(() => {
    if (!currentUser?.id) return;

    const syncMountedUser = (event) => {
      if (event?.type === "storage" && event.key && event.key !== DB_KEY) return;
      setCurrentUser((prev) => {
        if (!prev?.id) return prev;
        const latest = getDB()[prev.id];
        return latest ? withUserDefaults(latest) : prev;
      });
    };

    window.addEventListener(USER_DB_UPDATED_EVENT, syncMountedUser);
    window.addEventListener("storage", syncMountedUser);
    return () => {
      window.removeEventListener(USER_DB_UPDATED_EVENT, syncMountedUser);
      window.removeEventListener("storage", syncMountedUser);
    };
  }, [currentUser?.id]);

  const updateUser = useCallback((updates) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const latest = getDB()[prev.id] || prev;
      const updated = withUserDefaults({ ...latest, ...updates });
      saveUserData(updated);
      if (updated.id) refreshSession(updated.id);
      return updated;
    });
  }, [saveUserData]);

  const addTransaction = useCallback((tx) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const latest = getDB()[prev.id] || prev;
      const newTx  = [...(latest.tx || []), { id: uid(), date: new Date().toLocaleDateString(), ...tx }];
      const updated = withUserDefaults({ ...latest, tx: newTx });
      saveUserData(updated);
      return updated;
    });
  }, [saveUserData]);

  // ── Notifications ──────────────────────────────────────────────────────────
  const addNotification = useCallback((msg, type = "info") => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const latest = getDB()[prev.id] || prev;
      const notif   = { id: uid(), type, msg: sanitize(msg), date: new Date().toLocaleDateString(), read: false };
      const updated = withUserDefaults({ ...latest, notifications: [notif, ...(latest.notifications || [])].slice(0, 30) });
      saveUserData(updated);
      return updated;
    });
  }, [saveUserData]);

  const markNotificationsRead = useCallback(() => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const latest = getDB()[prev.id] || prev;
      const updated = withUserDefaults({ ...latest, notifications: (latest.notifications || []).map((n) => ({ ...n, read: true })) });
      saveUserData(updated);
      return updated;
    });
  }, [saveUserData]);

  // ── Toasts ─────────────────────────────────────────────────────────────────
  const showToast = useCallback((msg, type = "info") => {
    const id = uid();
    setToasts((t) => [...t, { id, msg: sanitize(String(msg)), type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  // ── Modal ──────────────────────────────────────────────────────────────────
  const openModal  = useCallback((title, body) => setModal({ title: sanitize(title), body }), []);
  const closeModal = useCallback(() => setModal(null), []);

  // ── Memoized context value — ONLY rebuilds when individual pieces change ───
  // This prevents the entire consumer tree from re-rendering on every tick.
  const value = useMemo(() => ({
    currentUser, authReady,
    toasts, showToast,
    modal, openModal, closeModal,
    isDarkMode, setIsDarkMode,
    isPrivacy, setIsPrivacy,
    currentCurrency, setCurrentCurrency,
    signup, login, logout,
    updateUser, addTransaction,
    addNotification, markNotificationsRead,
  }), [
    currentUser, authReady,
    toasts, showToast,
    modal, openModal, closeModal,
    isDarkMode,
    isPrivacy,
    currentCurrency,
    signup, login, logout,
    updateUser, addTransaction,
    addNotification, markNotificationsRead,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
};

// ── Request helpers (re-exported for convenience) ─────────────────────────────
// Components import these directly from utils/requests.js
// This comment block documents the pattern — no extra state needed here since
// requests are stored in a separate localStorage key and read on-demand by admin.
