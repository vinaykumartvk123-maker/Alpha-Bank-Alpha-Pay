import { REQUESTS_DB_KEY, REQUEST_STATUS } from "./constants";
import { uid } from "./security";

// ─── Raw access ────────────────────────────────────────────────────────────────
export const getRequestsDB = () => {
  try { return JSON.parse(localStorage.getItem(REQUESTS_DB_KEY)) || {}; }
  catch { return {}; }
};

export const saveRequestsDB = (data) => {
  try { localStorage.setItem(REQUESTS_DB_KEY, JSON.stringify(data)); }
  catch (e) { console.error("Requests storage write failed:", e); }
};

// ─── Create a new request ─────────────────────────────────────────────────────
// type: "loan" | "deposit" | "insurance"
// payload: { userId, username, amount, details: {...} }
export const createRequest = (type, payload) => {
  const db  = getRequestsDB();
  const id  = uid();
  const req = {
    id,
    type,
    userId:      payload.userId,
    username:    payload.username,
    amount:      payload.amount,
    details:     payload.details || {},
    status:      REQUEST_STATUS.PENDING,
    submittedAt: new Date().toLocaleString("en-IN"),
    reviewedAt:  null,
    adminNote:   "",
  };
  db[id] = req;
  saveRequestsDB(db);
  return req;
};

// ─── Admin: approve a request ─────────────────────────────────────────────────
export const approveRequest = (requestId, adminNote = "") => {
  const db = getRequestsDB();
  if (!db[requestId] || db[requestId].status !== REQUEST_STATUS.PENDING) return null;
  db[requestId] = {
    ...db[requestId],
    status:     REQUEST_STATUS.APPROVED,
    reviewedAt: new Date().toLocaleString("en-IN"),
    adminNote,
  };
  saveRequestsDB(db);
  return db[requestId];
};

// ─── Admin: reject a request ──────────────────────────────────────────────────
export const rejectRequest = (requestId, adminNote = "") => {
  const db = getRequestsDB();
  if (!db[requestId] || db[requestId].status !== REQUEST_STATUS.PENDING) return null;
  db[requestId] = {
    ...db[requestId],
    status:     REQUEST_STATUS.REJECTED,
    reviewedAt: new Date().toLocaleString("en-IN"),
    adminNote,
  };
  saveRequestsDB(db);
  return db[requestId];
};

// ─── Get all requests (admin view) ───────────────────────────────────────────
export const getAllRequests = () => Object.values(getRequestsDB())
  .sort((a, b) => {
    // pending first, then by submitted date descending
    if (a.status === REQUEST_STATUS.PENDING && b.status !== REQUEST_STATUS.PENDING) return -1;
    if (b.status === REQUEST_STATUS.PENDING && a.status !== REQUEST_STATUS.PENDING) return  1;
    return b.submittedAt.localeCompare(a.submittedAt);
  });

// ─── Get requests for one user ────────────────────────────────────────────────
export const getUserRequests = (userId) => Object.values(getRequestsDB())
  .filter((r) => r.userId === userId)
  .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

// ─── Count pending requests ───────────────────────────────────────────────────
export const getPendingCount = () =>
  Object.values(getRequestsDB()).filter((r) => r.status === REQUEST_STATUS.PENDING).length;
