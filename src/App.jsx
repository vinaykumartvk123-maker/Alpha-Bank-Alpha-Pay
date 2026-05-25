import { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router-dom";

import ProtectedRoute from "./router/ProtectedRoute";
import AdminRoute     from "./router/AdminRoute";
import ErrorBoundary  from "./components/common/ErrorBoundary";
import ToastContainer from "./components/common/ToastContainer";
import GenericModal   from "./components/common/GenericModal";

// ── Page loader (shown while lazy chunks download) ─────────────────────────
function PageLoader() {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-100 dark:bg-slate-950">
      <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-400 font-medium text-sm">Loading…</p>
    </div>
  );
}

// ── Suspense + ErrorBoundary wrapper for every route ───────────────────────
function S({ children }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

// ── Root layout — mounts global overlays above all routes ──────────────────
function RootLayout() {
  return (
    <>
      <Outlet />
      <ToastContainer />
      <GenericModal />
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LAZY IMPORTS — user-facing pages
// ══════════════════════════════════════════════════════════════════════════════
const LandingPage  = lazy(() => import("./pages/LandingPage"));
const AuthPage     = lazy(() => import("./pages/AuthPage"));
const AppLayout    = lazy(() => import("./components/layout/AppLayout"));
const Dashboard    = lazy(() => import("./pages/app/Dashboard"));
const Transfer     = lazy(() => import("./pages/app/Transfer"));
const Wallet       = lazy(() => import("./pages/app/Wallet"));
const Services     = lazy(() => import("./pages/app/Services"));
const Loans        = lazy(() => import("./pages/app/Loans"));
const SIP          = lazy(() => import("./pages/app/SIP"));
const Rewards      = lazy(() => import("./pages/app/Rewards"));
const Settings     = lazy(() => import("./pages/app/Settings"));

// ══════════════════════════════════════════════════════════════════════════════
// LAZY IMPORTS — admin-facing pages
// ══════════════════════════════════════════════════════════════════════════════
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage"));
const AdminLayout    = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminRequests  = lazy(() => import("./pages/admin/AdminRequests"));
const AdminUsers     = lazy(() => import("./pages/admin/AdminUsers"));
const AdminBroadcast = lazy(() => import("./pages/admin/AdminBroadcast"));

// ══════════════════════════════════════════════════════════════════════════════
// LAZY IMPORTS — public static/info pages
// ══════════════════════════════════════════════════════════════════════════════
const TermsPage         = lazy(() => import("./pages/StaticPages.jsx").then(m => ({ default: m.TermsPage         })));
const PrivacyPage       = lazy(() => import("./pages/StaticPages.jsx").then(m => ({ default: m.PrivacyPage       })));
const InterestRatesPage = lazy(() => import("./pages/StaticPages.jsx").then(m => ({ default: m.InterestRatesPage })));
const DevelopersPage    = lazy(() => import("./pages/StaticPages.jsx").then(m => ({ default: m.DevelopersPage    })));
const LoansInfoPage     = lazy(() => import("./pages/StaticPages.jsx").then(m => ({ default: m.LoansInfoPage     })));
const AboutPage         = lazy(() => import("./pages/StaticPages.jsx").then(m => ({ default: m.AboutPage         })));
const CyberSecurityPage = lazy(() => import("./pages/StaticPages.jsx").then(m => ({ default: m.CyberSecurityPage })));
const RBIGuidelinesPage = lazy(() => import("./pages/StaticPages.jsx").then(m => ({ default: m.RBIGuidelinesPage })));
const HelpCentrePage    = lazy(() => import("./pages/StaticPages.jsx").then(m => ({ default: m.HelpCentrePage    })));
const ContactPage       = lazy(() => import("./pages/StaticPages.jsx").then(m => ({ default: m.ContactPage       })));
const GrievancePage     = lazy(() => import("./pages/StaticPages.jsx").then(m => ({ default: m.GrievancePage     })));
const BranchLocatorPage = lazy(() => import("./pages/StaticPages.jsx").then(m => ({ default: m.BranchLocatorPage })));
const InsurancePage     = lazy(() => import("./pages/StaticPages.jsx").then(m => ({ default: m.InsurancePage     })));

// ══════════════════════════════════════════════════════════════════════════════
// ROUTER — full route tree
// ══════════════════════════════════════════════════════════════════════════════
const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [

      // ── Public marketing site ──────────────────────────────────────────────
      { path: "/",      element: <S><LandingPage /></S> },
      { path: "/login", element: <S><AuthPage   /></S> },
      { path: "/signup",element: <S><AuthPage   /></S> },

      // ── Static / info pages ────────────────────────────────────────────────
      { path: "/terms",          element: <S><TermsPage         /></S> },
      { path: "/privacy",        element: <S><PrivacyPage       /></S> },
      { path: "/interest-rates", element: <S><InterestRatesPage /></S> },
      { path: "/developers",     element: <S><DevelopersPage    /></S> },
      { path: "/loans-info",     element: <S><LoansInfoPage     /></S> },
      { path: "/about",          element: <S><AboutPage         /></S> },
      { path: "/cyber-security", element: <S><CyberSecurityPage /></S> },
      { path: "/rbi-guidelines", element: <S><RBIGuidelinesPage /></S> },
      { path: "/help",           element: <S><HelpCentrePage    /></S> },
      { path: "/contact",        element: <S><ContactPage       /></S> },
      { path: "/grievance",      element: <S><GrievancePage     /></S> },
      { path: "/branches",       element: <S><BranchLocatorPage /></S> },
      { path: "/insurance",      element: <S><InsurancePage     /></S> },

      // ── Protected user banking app ─────────────────────────────────────────
      {
        path: "/app",
        element: (
          <ProtectedRoute>
            <S><AppLayout /></S>
          </ProtectedRoute>
        ),
        children: [
          { index: true,       element: <Navigate to="/app/dashboard" replace /> },
          { path: "dashboard", element: <S><Dashboard /></S> },
          { path: "transfer",  element: <S><Transfer  /></S> },
          { path: "wallet",    element: <S><Wallet    /></S> },
          { path: "services",  element: <S><Services  /></S> },
          { path: "loans",     element: <S><Loans     /></S> },
          { path: "sip",       element: <S><SIP       /></S> },
          { path: "rewards",   element: <S><Rewards   /></S> },
          { path: "settings",  element: <S><Settings  /></S> },
        ],
      },

      // ── Admin login — public, completely separate from user login ──────────
      { path: "/admin/login", element: <S><AdminLoginPage /></S> },

      // ── Protected admin console ────────────────────────────────────────────
      {
        path: "/admin",
        element: (
          <AdminRoute>
            <S><AdminLayout /></S>
          </AdminRoute>
        ),
        children: [
          { index: true,         element: <Navigate to="/admin/dashboard" replace /> },
          { path: "dashboard",   element: <S><AdminDashboard /></S> },
          { path: "requests",    element: <S><AdminRequests  /></S> },
          { path: "users",       element: <S><AdminUsers     /></S> },
          { path: "broadcast",   element: <S><AdminBroadcast /></S> },
        ],
      },

      // ── Catch-all ─────────────────────────────────────────────────────────
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

// ── App component — exported for mounting in main.jsx ─────────────────────
export default function App() {
  return <RouterProvider router={router} />;
}
