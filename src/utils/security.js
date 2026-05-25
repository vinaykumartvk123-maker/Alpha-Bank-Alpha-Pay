import { PASSWORD_PEPPER } from "./constants";

// ─── Password hashing (SHA-256 via Web Crypto API) ────────────────────────────
// One-way hash — cannot be reversed, unlike the previous base64 approach
export const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + PASSWORD_PEPPER);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

export const verifyPassword = async (plaintext, storedHash) => {
  // Support legacy base64 encoding from older data — upgrade on login
  if (!storedHash.match(/^[a-f0-9]{64}$/)) {
    // Looks like old base64 — compare directly then force re-hash on next save
    try {
      const decoded = decodeURIComponent(atob(storedHash));
      return decoded === plaintext ? "legacy" : false;
    } catch {
      return false;
    }
  }
  const hash = await hashPassword(plaintext);
  return hash === storedHash ? "ok" : false;
};

// ─── Input sanitization ───────────────────────────────────────────────────────
// Strips HTML tags and normalizes whitespace — prevents stored XSS
export const sanitize = (str) => {
  if (typeof str !== "string") return "";
  return str
    .replace(/<[^>]*>/g, "")       // strip HTML tags
    .replace(/[<>&"']/g, "")       // strip leftover dangerous chars
    .trim()
    .slice(0, 200);                 // max length guard
};

export const sanitizeUsername = (str) => {
  if (typeof str !== "string") return "";
  return str
    .replace(/[^a-zA-Z0-9_.-]/g, "") // only alphanumeric, underscore, dot, dash
    .trim()
    .slice(0, 30);
};

// ─── Validators ───────────────────────────────────────────────────────────────
export const validatePassword = (pass) => {
  if (!pass || pass.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(pass)) return "Password must contain at least one uppercase letter.";
  if (!/[0-9]/.test(pass)) return "Password must contain at least one number.";
  return null; // null = valid
};

export const validateUsername = (username) => {
  if (!username || username.length < 3) return "Username must be at least 3 characters.";
  if (username.length > 30) return "Username cannot exceed 30 characters.";
  if (!/^[a-zA-Z0-9_.-]+$/.test(username)) return "Username can only contain letters, numbers, _ . -";
  return null;
};

export const validateEmail = (email) => {
  if (!email) return null; // email is optional
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address.";
  return null;
};

export const validateAmount = (amount, balance, label = "Amount") => {
  const raw = String(amount ?? "").replace(/,/g, "").trim();
  const amt = Number(raw);
  if (!raw || !/^\d+(\.\d{1,2})?$/.test(raw) || !Number.isFinite(amt) || amt <= 0) {
    return `${label} must be a valid amount greater than zero.`;
  }
  const available = Number(balance);
  if (balance !== undefined && Number.isFinite(available) && amt > available) return "Insufficient balance.";
  return null;
};

// ─── Crypto-safe UID ─────────────────────────────────────────────────────────
export const uid = () => {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
};
