import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { ADMIN_NAV } from "../../utils/constants";
import { clearAdminSession, useAdminSessionGuard } from "../../router/AdminRoute";
import { getPendingCount } from "../../utils/requests";
import MarketTicker from "../../components/common/MarketTicker";

export default function AdminLayout() {
  const navigate  = useNavigate();
  const [sideOpen, setSideOpen] = useState(false);
  const [adminSearch, setAdminSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const pending   = getPendingCount();
  const adminSearchItems = ADMIN_NAV.map((item) => ({ label: item.label, path: item.path, icon: item.icon }));

  useEffect(() => {
    const closeSearch = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", closeSearch);
    return () => document.removeEventListener("mousedown", closeSearch);
  }, []);

  // Intercepts browser back-button navigating OUT of /admin/*
  useAdminSessionGuard();

  const handleLogout = () => {
    clearAdminSession();
    navigate("/", { replace: true });
  };

  return (
    <div className="flex flex-col h-screen min-h-0 bg-slate-950">
      <MarketTicker />
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Sidebar ─────────────────────────────────── */}
        <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 pt-9 bg-slate-900 border-r border-white/5 transition-transform duration-300 ${sideOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0 lg:pt-0`}>
          {/* Brand */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
            <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center flex-none shadow-lg">
              <i className="fas fa-shield-alt text-white text-base" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-white text-base">Alpha</span>
                <span className="font-black text-red-400 text-base">Admin</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Bank Management Console</p>
            </div>
            <button onClick={() => setSideOpen(false)} className="ml-auto text-slate-500 hover:text-white lg:hidden">
              <i className="fas fa-times" />
            </button>
          </div>

          {/* Admin identity chip */}
          <div className="mx-4 mt-4 mb-4 bg-red-500/10 border border-red-500/20 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center flex-none">
              <i className="fas fa-user-shield text-white text-sm" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Super Admin</p>
              <p className="text-red-400 text-[11px] font-mono">alphabank_admin</p>
            </div>
            <span className="ml-auto text-[9px] bg-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded-full border border-red-500/30 flex-none">ADMIN</span>
          </div>

          {/* Nav items */}
          <nav className="flex-1 min-h-0 px-3 space-y-0.5 overflow-y-auto pb-4">
            {ADMIN_NAV.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={() => setSideOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all relative ${
                    isActive
                      ? "bg-red-500 text-white shadow-lg shadow-red-900/30"
                      : "text-slate-400 hover:text-white hover:bg-white/8"
                  }`
                }
              >
                <i className={`fas ${item.icon} text-base w-5 text-center`} />
                {item.label}
                {item.id === "requests" && pending > 0 && (
                  <span className="ml-auto bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full min-w-[20px] text-center">
                    {pending}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Sign out */}
          <div className="mt-auto flex-none border-t border-white/10 p-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
            >
              <i className="fas fa-sign-out-alt w-5 text-center" />Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile backdrop */}
        {sideOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
            onClick={() => setSideOpen(false)}
          />
        )}

        {/* ── Main content ─────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          {/* Top bar */}
          <header className="flex-none flex items-center justify-between px-4 md:px-8 h-16 bg-slate-900 border-b border-white/5 sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSideOpen(true)}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-800 transition"
              >
                <i className="fas fa-bars" />
              </button>
              <span className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl">
                <i className="fas fa-circle text-[6px] animate-pulse" />
                Admin Console · Live
              </span>
            </div>

            <div className="flex items-center gap-3">
              {pending > 0 && (
                <NavLink
                  to="/admin/requests"
                  className="flex items-center gap-2 text-xs font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20 px-3 py-1.5 rounded-xl hover:bg-amber-400/20 transition"
                >
                  <i className="fas fa-clock" />
                  {pending} pending
                </NavLink>
              )}
              <div className="relative hidden xl:block" ref={searchRef}>
                <input
                  type="text"
                  value={adminSearch}
                  onChange={(e) => { setAdminSearch(e.target.value); setSearchOpen(true); }}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Search admin…"
                  className="w-64 bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-2xl px-4 py-2 text-xs outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
                />
                {searchOpen && adminSearch.trim() && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-50">
                    {adminSearchItems.filter((item) => item.label.toLowerCase().includes(adminSearch.toLowerCase())).slice(0, 5).map((item) => (
                      <button
                        key={item.path}
                        onClick={() => { setAdminSearch(""); setSearchOpen(false); navigate(item.path); setSideOpen(false); }}
                        className="w-full text-left px-4 py-3 text-sm text-slate-200 hover:bg-slate-800 transition"
                      >
                        <span className="font-bold">{item.label}</span>
                      </button>
                    ))}
                    {adminSearchItems.filter((item) => item.label.toLowerCase().includes(adminSearch.toLowerCase())).length === 0 && (
                      <div className="px-4 py-3 text-xs text-slate-500">No matches found.</div>
                    )}
                  </div>
                )}
              </div>
              <NavLink
                to="/admin/broadcast"
                className="hidden sm:inline-flex items-center gap-2 text-xs font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20 px-3 py-1.5 rounded-xl hover:bg-blue-500/20 transition"
              >
                <i className="fas fa-bullhorn" />
                Broadcast
              </NavLink>
              <button
                onClick={handleLogout}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                title="Sign out"
              >
                <i className="fas fa-sign-out-alt text-sm" />
              </button>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 min-h-0 overflow-y-auto bg-slate-950">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
