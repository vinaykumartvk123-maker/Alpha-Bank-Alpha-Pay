import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../../store/AppContext";
import { useRates } from "../../store/RatesContext";
import { NAV_ITEMS, PAGE_TITLES } from "../../utils/constants";
import MarketTicker from "../common/MarketTicker";
import AlphaBot from "../common/AlphaBot";

// ── Dynamic greeting ──────────────────────────────────────────────────────────
function getGreeting(name) {
  const h = new Date().getHours();
  const salutation =
    h >= 5  && h < 12 ? "Good morning"   :
    h >= 12 && h < 17 ? "Good afternoon" :
    h >= 17 && h < 21 ? "Good evening"   : "Good night";
  return `${salutation}, ${name}! 👋`;
}

// ── Notification Bell ─────────────────────────────────────────────────────────
function NotificationBell() {
  const { currentUser, markNotificationsRead } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const notifications = currentUser?.notifications || [];
  const unread = notifications.filter((n) => !n.read).length;

  const TYPE_ICONS  = { success: "fa-check-circle", error: "fa-exclamation-circle", info: "fa-info-circle", warning: "fa-exclamation-triangle" };
  const TYPE_COLORS = { success: "text-green-500",  error: "text-red-500",         info: "text-blue-500",  warning: "text-amber-500"          };

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open && unread > 0) markNotificationsRead();
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={handleOpen}
        className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition relative">
        <i className="fas fa-bell text-sm" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <p className="font-bold text-slate-800 dark:text-white text-sm">Notifications</p>
            <span className="text-xs text-slate-400">{notifications.length} total</span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">No notifications yet</div>
            ) : notifications.map((n) => (
              <div key={n.id} className={`px-4 py-3 border-b border-slate-50 dark:border-slate-700/50 flex gap-3 items-start ${!n.read ? "bg-amber-50/50 dark:bg-amber-900/10" : ""}`}>
                <i className={`fas ${TYPE_ICONS[n.type] || "fa-info-circle"} ${TYPE_COLORS[n.type] || "text-blue-500"} text-sm mt-0.5 flex-none`} />
                <div className="min-w-0">
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">{n.msg}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{n.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── App Layout ────────────────────────────────────────────────────────────────
export default function AppLayout() {
  const { currentUser, logout, isDarkMode, setIsDarkMode, isPrivacy, setIsPrivacy, currentCurrency, setCurrentCurrency } = useApp();
  const liveRates = useRates();                              // ← fixed: called at component top level
  const location  = useLocation();
  const navigate  = useNavigate();
  const [sideOpen, setSideOpen] = useState(false);
  const [appSearch, setAppSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const searchItems = NAV_ITEMS.map((item) => ({ label: item.label, path: item.path, icon: item.icon }));

  useEffect(() => {
    const handleClick = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const currentPage = location.pathname.split("/app/")[1] || "dashboard";
  const pageTitle   = PAGE_TITLES[currentPage] || "Dashboard";
  const balance     = currentUser?.balance || 0;
  const syms        = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };
  const displayBal  = currentCurrency === "INR"
    ? "₹" + balance.toLocaleString("en-IN", { maximumFractionDigits: 0 })
    : (syms[currentCurrency] || "₹") + (balance / (liveRates[currentCurrency] || 1)).toFixed(2);

  const handleLogout = () => { logout(); navigate("/", { replace: true }); };

  useEffect(() => {
    const handlePopState = () => {
      if (!window.location.pathname.startsWith("/app")) {
        logout();
        window.location.replace("/login");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [logout]);

  return (
    <div className={`alpha-pay-app flex flex-col h-screen min-h-0 ${isDarkMode ? "dark bg-slate-950" : "bg-slate-100"}`}>
      <MarketTicker />
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Sidebar ────────────────────────────────────────────── */}
        <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 pt-9 bg-slate-900 transition-transform duration-300 ${sideOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0 lg:pt-0`}>
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-yellow-300 rounded-xl flex items-center justify-center flex-none shadow-lg">
              <span className="font-black text-slate-900 text-base">α</span>
            </div>
            <div>
              <div><span className="font-black text-white text-lg">Alpha</span><span className="font-black text-amber-400 text-lg ml-1">Bank</span></div>
              <p className="text-[10px] text-slate-500 font-medium">Personal Banking · Hyderabad</p>
            </div>
            <button onClick={() => setSideOpen(false)} className="ml-auto text-slate-500 hover:text-white lg:hidden">
              <i className="fas fa-times" />
            </button>
          </div>

          {/* User chip */}
          <div className="mx-4 mt-4 mb-2 bg-white/5 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-yellow-300 rounded-xl flex items-center justify-center flex-none">
              <span className="font-black text-slate-900 text-sm">{currentUser?.username?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-sm truncate">{currentUser?.displayName || currentUser?.username}</p>
              <p className="text-amber-400 text-[11px] font-mono truncate">{isPrivacy ? "₹••••••" : displayBal}</p>
            </div>
            <button onClick={() => setIsPrivacy((v) => !v)} className="ml-auto text-slate-500 hover:text-amber-400 transition flex-none">
              <i className={`fas ${isPrivacy ? "fa-eye-slash" : "fa-eye"} text-xs`} />
            </button>
          </div>

          {/* Currency */}
          <div className="mx-4 mb-3">
            <select value={currentCurrency} onChange={(e) => setCurrentCurrency(e.target.value)}
              className="w-full bg-white/5 text-slate-400 text-xs font-bold rounded-xl px-3 py-2 outline-none border border-white/10 focus:border-amber-500 transition cursor-pointer">
              {[["INR","Indian Rupee"],["USD","US Dollar"],["EUR","Euro"],["GBP","British Pound"]].map(([c,l]) => (
                <option key={c} value={c} className="bg-slate-900">{c} — {l}</option>
              ))}
            </select>
          </div>

          {/* Nav */}
          <nav className="flex-1 min-h-0 px-3 space-y-0.5 overflow-y-auto pb-4">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.id} to={item.path} onClick={() => setSideOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    isActive ? "bg-amber-500 text-slate-900 shadow-lg shadow-amber-900/30" : "text-slate-400 hover:text-white hover:bg-white/8"
                  }`
                }>
                <i className={`fas ${item.icon} text-base w-5 text-center`} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Bottom */}
          <div className="mt-auto flex-none border-t border-white/10 p-4 space-y-1">
            <button onClick={() => setIsDarkMode((v) => !v)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/8 transition">
              <i className={`fas ${isDarkMode ? "fa-sun" : "fa-moon"} w-5 text-center`} />
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </button>
            <button onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition">
              <i className="fas fa-sign-out-alt w-5 text-center" />Sign Out
            </button>
          </div>
        </aside>

        {/* Backdrop */}
        {sideOpen && <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSideOpen(false)} />}

        {/* ── Main ───────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <header className={`flex-none flex items-center justify-between px-4 md:px-8 h-16 border-b sticky top-0 z-30 ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <div className="flex items-center gap-4 min-w-0">
              <button onClick={() => setSideOpen(true)} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <i className="fas fa-bars" />
              </button>
              <div className="min-w-0">
                <h1 className={`text-base font-black leading-tight truncate ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                  {currentPage === "dashboard"
                    ? getGreeting(currentUser?.displayName || currentUser?.username || "there")
                    : pageTitle}
                </h1>
                {currentPage === "dashboard" && (
                  <p className={`text-xs mt-0.5 hidden sm:block ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                    {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-none">
              <div className="relative hidden xl:block" ref={searchRef}>
                <input
                  type="text"
                  value={appSearch}
                  onChange={(e) => { setAppSearch(e.target.value); setSearchOpen(true); }}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Search app…"
                  className="w-72 bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-2xl px-4 py-2 text-xs outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
                />
                {searchOpen && appSearch.trim() && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden z-50">
                    {searchItems.filter((item) => item.label.toLowerCase().includes(appSearch.toLowerCase())).slice(0, 5).map((item) => (
                      <button
                        key={item.path}
                        onClick={() => { setAppSearch(""); setSearchOpen(false); navigate(item.path); setSideOpen(false); }}
                        className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <span className="font-bold">{item.label}</span>
                        <span className="ml-2 text-xs text-slate-500">{item.path.replace("/app/", "")}</span>
                      </button>
                    ))}
                    {searchItems.filter((item) => item.label.toLowerCase().includes(appSearch.toLowerCase())).length === 0 && (
                      <div className="px-4 py-3 text-xs text-slate-500">No pages match your search.</div>
                    )}
                  </div>
                )}
              </div>
              <span className={`hidden sm:block text-xs font-mono px-3 py-1.5 rounded-xl border font-bold ${isDarkMode ? "bg-slate-800 border-slate-700 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-700"}`}>
                {currentUser?.upiId || `${currentUser?.username?.toLowerCase()}@alpha`}
              </span>
              <NotificationBell />
              <button onClick={handleLogout} title="Sign out"
                className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                <i className="fas fa-sign-out-alt text-sm" />
              </button>
            </div>
          </header>

          <main className="flex-1 min-h-0 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <AlphaBot />
    </div>
  );
}
