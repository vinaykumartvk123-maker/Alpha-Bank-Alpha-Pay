import { DB_KEY, SESSION_KEY, SESSION_DURATION_MS } from "./constants";

export const USER_DB_UPDATED_EVENT = "alpha:user-db-updated";

const notifyUserDBUpdated = () => {
  if (typeof window === "undefined") return;
  const dispatch = () => window.dispatchEvent(new Event(USER_DB_UPDATED_EVENT));
  if (typeof queueMicrotask === "function") queueMicrotask(dispatch);
  else setTimeout(dispatch, 0);
};

// ─── Database (user store) ────────────────────────────────────────────────────
export const getDB = () => {
  try {
    return JSON.parse(localStorage.getItem(DB_KEY)) || {};
  } catch {
    return {};
  }
};

export const saveDB = (data) => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
    notifyUserDBUpdated();
  } catch (e) {
    console.error("Storage write failed:", e);
  }
};

// ─── Session management with expiry ──────────────────────────────────────────
export const setSession = (userId) => {
  try {
    const payload = { id: userId, expires: Date.now() + SESSION_DURATION_MS };
    localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error("Session write failed:", e);
  }
};

export const getSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const payload = JSON.parse(raw);
    if (!payload?.id || !payload?.expires) { clearSession(); return null; }
    if (Date.now() > payload.expires) { clearSession(); return null; } // expired
    return payload.id;
  } catch {
    clearSession();
    return null;
  }
};

// Extend session on activity — call this on any meaningful user action
export const refreshSession = (userId) => setSession(userId);

export const clearSession = () => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
};
