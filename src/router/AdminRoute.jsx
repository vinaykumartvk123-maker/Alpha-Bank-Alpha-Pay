import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

const ADMIN_SESSION_KEY = "alpha_admin_session";

// ── Simple sessionStorage-only admin session ──────────────────────────────────
// sessionStorage auto-clears when the browser tab closes — no need for
// the over-engineered in-memory token that was causing StrictMode double-runs
// to wipe the session on every navigation inside /admin/*.
export const setAdminSession = () => {
  sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
};

export const clearAdminSession = () => {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
};

export const isAdminSession = () => {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === "1";
};

// ── Back-button guard for AdminLayout ────────────────────────────────────────
// Only intercepts popstate events that move OUT of /admin/*.
// Does NOT clear the session on unmount — that was causing the bug
// (React StrictMode runs unmount→mount twice, wiping the session on load).
export function useAdminSessionGuard() {
  const navigate = useNavigate();
  // Track whether the component is actually mounted (not StrictMode's fake unmount)
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    const handlePopState = () => {
      // Only act if truly navigated away from /admin/*
      if (!window.location.pathname.startsWith("/admin")) {
        clearAdminSession();
        window.location.replace("/admin/login");
      }
    };

    window.addEventListener("popstate", handlePopState);

    // Cleanup: only remove the event listener — do NOT clear the session here.
    // Session lives for the duration of the browser tab (sessionStorage).
    // It's explicitly cleared by the logout button and AdminLoginPage.
    return () => {
      window.removeEventListener("popstate", handlePopState);
      // Only clear session if truly unmounting (not StrictMode's fake unmount)
      // We detect this by checking if we've been mounted for > 100ms
    };
  }, []);
}

// ── Route guard component ─────────────────────────────────────────────────────
export default function AdminRoute({ children }) {
  const location = useLocation();
  if (!isAdminSession()) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  return children;
}
