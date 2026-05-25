import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "../store/AppContext";
import { isAdminSession } from "./AdminRoute";

export default function ProtectedRoute({ children }) {
  const { currentUser, authReady } = useApp();
  const location = useLocation();

  // Block admin accounts from accessing user routes and vice versa
  // (Admin session holder should not be using the user app)
  if (isAdminSession()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (!authReady) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium text-sm">Restoring session…</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
