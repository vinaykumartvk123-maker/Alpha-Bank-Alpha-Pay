import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { calculateEMI } from "../utils/helpers";
import MarketTicker from "../components/common/MarketTicker";

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen,   setMoreOpen]   = useState(false);

  const MORE_ITEMS = [
    { to: "/about",          icon: "fa-university",    label: "About Us & Team"       },
    { to: "/cyber-security", icon: "fa-shield-alt",    label: "Cyber Security"        },
    { to: "/rbi-guidelines", icon: "fa-balance-scale", label: "RBI Guidelines"        },
    { to: "/privacy",        icon: "fa-lock",          label: "Privacy Policy"        },
    { to: "/terms",          icon: "fa-file-alt",      label: "Terms & Conditions"    },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-none">
          <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-yellow-300 rounded-xl flex items-center justify-center shadow-md">
            <span className="font-black text-slate-900 text-xl">α</span>
          </div>
          <span className="font-black text-slate-900 text-xl">Alpha<span className="text-amber-500">Bank</span></span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 text-sm font-semibold text-slate-600">
          <Link to="/" className="px-4 py-2 rounded-xl hover:bg-slate-100 hover:text-amber-600 transition">Home</Link>
          <Link to="/interest-rates" className="px-4 py-2 rounded-xl hover:bg-slate-100 hover:text-amber-600 transition">Interest Rates</Link>
          <Link to="/developers"     className="px-4 py-2 rounded-xl hover:bg-slate-100 hover:text-amber-600 transition">Developers</Link>
          <Link to="/loans-info"     className="px-4 py-2 rounded-xl hover:bg-slate-100 hover:text-amber-600 transition">Loans</Link>

          {/* More dropdown */}
          <div className="relative" onMouseLeave={() => setMoreOpen(false)}>
            <button onMouseEnter={() => setMoreOpen(true)} onClick={() => setMoreOpen((v) => !v)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${moreOpen ? "bg-amber-50 text-amber-600" : "hover:bg-slate-100 hover:text-amber-600"}`}>
              More <i className={`fas fa-chevron-down text-xs transition-transform ${moreOpen ? "rotate-180" : ""}`} />
            </button>
            {moreOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden z-50">
                {MORE_ITEMS.map((item) => (
                  <Link key={item.to} to={item.to} onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-amber-50 hover:text-amber-700 transition">
                    <i className={`fas ${item.icon} w-4 text-amber-500 text-xs`} />
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CTA buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login"  className="text-slate-700 font-bold text-sm px-4 py-2 hover:bg-slate-100 rounded-xl transition">Sign In</Link>
          <Link to="/signup" className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 font-bold text-sm px-5 py-2.5 rounded-xl hover:opacity-90 transition shadow-md">Open Account</Link>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen((v) => !v)} className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200">
          <i className={`fas ${mobileOpen ? "fa-times" : "fa-bars"} text-slate-600`} />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4">
          <div className="space-y-1 mb-3">
            {[
              ["/", "Home"], ["/interest-rates", "Interest Rates"],
              ["/developers", "Developers"], ["/loans-info", "Loans"],
            ].map(([to, label]) => (
              <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                className="block py-2.5 px-3 font-semibold text-slate-700 text-sm rounded-xl hover:bg-slate-50 transition">{label}</Link>
            ))}
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 pt-2 pb-1">More</p>
            {MORE_ITEMS.map((item) => (
              <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 py-2.5 px-3 font-semibold text-slate-600 text-sm rounded-xl hover:bg-amber-50 transition">
                <i className={`fas ${item.icon} text-amber-500 w-4 text-xs`} />{item.label}
              </Link>
            ))}
          </div>
          <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
            <Link to="/login"  onClick={() => setMobileOpen(false)} className="text-center py-2.5 border border-slate-200 rounded-xl font-bold text-sm text-slate-700">Sign In</Link>
            <Link to="/signup" onClick={() => setMobileOpen(false)} className="text-center py-2.5 bg-amber-500 rounded-xl font-bold text-sm text-slate-900">Open Account</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const navigate = useNavigate();
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 py-24 overflow-hidden">
      <div className="absolute w-[700px] h-[700px] bg-amber-500 opacity-10 -top-40 -right-40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] bg-amber-600 opacity-10 bottom-0 left-0 rounded-full blur-[100px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-300/30 text-amber-300 px-4 py-2 rounded-full text-xs font-bold mb-6 uppercase tracking-widest">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Trusted by 2 Million+ Indians
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-6">
              Banking for the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">Digital Era</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-xl">
              Alpha Bank delivers a seamless digital banking experience — instant UPI transfers, multi-currency wallets, smart loans, and AI-powered financial assistance. All in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button onClick={() => navigate("/login")}
                className="group bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 px-8 py-4 rounded-2xl font-bold text-base hover:opacity-90 transition-all shadow-2xl shadow-amber-900/40 flex items-center justify-center gap-3">
                <i className="fas fa-rocket group-hover:translate-x-0.5 transition-transform" /> Open Free Account
              </button>
              <a href="#products"
                className="group border-2 border-white/20 text-white px-8 py-4 rounded-2xl font-bold text-base hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                <i className="fas fa-chart-bar" /> Explore Products
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-5">
              {[["fa-shield-alt text-green-400", "RBI Regulated"], ["fa-lock text-blue-400", "AES-256 Encrypted"], ["fa-certificate text-yellow-400", "DICGC Insured"], ["fa-award text-amber-400", "ISO 27001"]].map(([ic, lbl]) => (
                <div key={lbl} className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                  <i className={`fas ${ic}`} /> {lbl}
                </div>
              ))}
            </div>
          </div>

          {/* Floating card UI */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative">
              <div className="w-80 bg-gradient-to-br from-amber-500 to-yellow-400 rounded-[2rem] p-6 shadow-2xl text-slate-900 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-amber-200 text-xs font-bold uppercase tracking-widest">Alpha Pay</p>
                    <p className="font-bold text-lg">Digital Wallet</p>
                  </div>
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <i className="fas fa-wallet" />
                  </div>
                </div>
                <p className="text-amber-200 text-xs mb-1">Available Balance</p>
                <p className="text-4xl font-black mb-6">₹ 1,24,500</p>
                <div className="flex justify-between items-center">
                  <div><p className="text-xs text-amber-200">UPI ID</p><p className="font-mono text-sm">yourname@alpha</p></div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-xs"><i className="fas fa-paper-plane" /></div>
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-xs"><i className="fas fa-qrcode" /></div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-6 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-2 text-sm font-bold text-green-600">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"><i className="fas fa-arrow-down text-green-600 text-xs" /></div>
                +₹5,000 received
              </div>
              <div className="absolute -bottom-4 -left-6 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-2 text-sm font-bold text-amber-600">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center"><i className="fas fa-star text-amber-600 text-xs" /></div>
                Rewards: ₹2,340
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 pt-10 border-t border-white/10">
          {[["2M+", "Active Customers"], ["₹500Cr+", "Loans Disbursed"], ["200+", "Branches Pan-India"], ["50 yrs", "Banking Excellence"]].map(([v, l]) => (
            <div key={l} className="text-center">
              <p className="text-3xl font-black text-white">{v}</p>
              <p className="text-slate-400 text-sm mt-1">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Products ──────────────────────────────────────────────────────────────────
const PRODUCTS = [
  { icon: "fa-coins",          name: "Gold Loan",        desc: "Instant loan against gold. Minimal documentation. Same-day disbursal.",                         rate: "8.50% p.a.",    bg: "from-yellow-400 to-amber-500",   shadow: "shadow-yellow-200" },
  { icon: "fa-home",           name: "Home Loan",         desc: "Turn your dream home into reality. Up to ₹5 Crore, 30-year tenure.",                           rate: "From 8.35% p.a.", bg: "from-blue-500 to-blue-700",     shadow: "shadow-blue-200"   },
  { icon: "fa-user-tag",       name: "Personal Loan",    desc: "Instant personal loan up to ₹25 Lakhs. No collateral required.",                                rate: "From 10.50% p.a.", bg: "from-amber-600 to-amber-800",  shadow: "shadow-amber-200"  },
  { icon: "fa-graduation-cap", name: "Education Loan",   desc: "Finance your studies in India or abroad. Moratorium period available.",                          rate: "From 9.50% p.a.", bg: "from-green-500 to-emerald-600", shadow: "shadow-green-200"  },
  { icon: "fa-briefcase",      name: "Business Loan",    desc: "Fuel your enterprise. SME, MSME, Startup & Working Capital loans.",                              rate: "From 11.00% p.a.", bg: "from-orange-500 to-red-500",   shadow: "shadow-orange-200" },
  { icon: "fa-shield-alt",     name: "Insurance",        desc: "Life, Health, Vehicle & Home insurance. Protect what matters most.",                             rate: "From ₹299/month",  bg: "from-teal-500 to-teal-700",    shadow: "shadow-teal-200"   },
  { icon: "fa-flag",           name: "Govt. Schemes",    desc: "PM Jan Dhan, MUDRA, Atal Pension, Suraksha Bima & more government schemes.",                     rate: "Zero to low fees", bg: "from-amber-500 to-yellow-400", shadow: "shadow-amber-200"  },
  { icon: "fa-piggy-bank",     name: "Fixed Deposits",   desc: "Earn up to 7.25% p.a. Flexible tenure from 7 days to 10 years.",                                rate: "Up to 7.25% p.a.", bg: "from-pink-500 to-rose-600",    shadow: "shadow-pink-200"   },
];

function ProductsSection() {
  const navigate = useNavigate();
  return (
    <section id="products" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <p className="text-amber-600 font-bold text-xs uppercase tracking-widest mb-2">Our Products</p>
        <h2 className="text-4xl font-black text-slate-900">Everything you need, in one place</h2>
        <p className="text-slate-500 mt-3 max-w-2xl mx-auto text-sm">From daily banking to long-term investments — Alpha Bank has a product for every financial goal.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {PRODUCTS.map((p) => (
          <div key={p.name} onClick={() => navigate("/login")}
            className="group bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer">
            <div className={`w-14 h-14 bg-gradient-to-br ${p.bg} rounded-2xl flex items-center justify-center text-2xl text-white mb-4 group-hover:scale-110 transition-transform shadow-lg ${p.shadow}`}>
              <i className={`fas ${p.icon}`} />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">{p.name}</h3>
            <p className="text-slate-500 text-sm mb-4 leading-relaxed">{p.desc}</p>
            <div className="flex items-center justify-between">
              <span className="text-amber-600 font-bold text-sm">{p.rate}</span>
              <i className="fas fa-arrow-right text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── How it works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const STEPS = [
    ["fa-user-check", "Open account in minutes", "Create your profile and verify using simple KYC checks."],
    ["fa-paper-plane", "Transfer instantly", "Send money, pay bills or fund wallets with instant UPI and bank transfers."],
    ["fa-piggy-bank", "Grow with rewards", "Earn cashback, manage SIPs, and save smarter with tailored insights."],
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-amber-600 font-bold text-xs uppercase tracking-widest mb-2">How it works</p>
          <h2 className="text-4xl font-black text-slate-900">Three simple steps to smarter banking</h2>
          <p className="text-slate-500 mt-3 max-w-2xl mx-auto text-sm">From account opening to instant transfer and savings automation, Alpha Bank makes every step effortless.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map(([icon, title, desc]) => (
            <div key={title} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-lg transition">
              <div className="w-16 h-16 rounded-3xl bg-amber-50 flex items-center justify-center text-2xl text-amber-500 mb-6">
                <i className={`fas ${icon}`} />
              </div>
              <h3 className="font-bold text-slate-900 text-xl mb-3">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Alpha Pay Highlights ──────────────────────────────────────────────────────────
function AlphaPaySection() {
  const navigate = useNavigate();
  const features = [
    ["fa-bolt",              "Instant UPI Transfers",   "Send and receive money instantly to any UPI ID. 0.5% cashback on every transfer."],
    ["fa-coins",             "Multi-Currency Wallet",   "Hold USD, EUR, GBP and convert at live rates. Perfect for international use."],
    ["fa-hand-holding-usd",  "Instant Loan Disbursal",  "Apply for loans within the app and get funds credited directly to your wallet."],
    ["fa-gift",              "Rewards & Cashback",      "Tier-based loyalty program with scratch cards, vouchers, and referral bonuses."],
    ["fa-robot",             "AlphaBot AI Assistant",   "Ask anything about your account, loans, rates, or banking. Available 24/7."],
  ];
  const cards = [
    ["fa-chart-pie",  "Spending Analytics", "Visual charts of your monthly spending patterns."],
    ["fa-bullseye",   "Savings Goals",      "Set targets and track progress toward your goals."],
    ["fa-star",       "Credit Score",       "Real-time credit score estimation with factors."],
    ["fa-moon",       "Dark Mode",          "Eye-friendly dark theme for night-time banking."],
  ];
  return (
    <section id="invest" className="bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-white">
            <p className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-3">Alpha Pay App</p>
            <h2 className="text-4xl font-black mb-6">Your entire bank in your pocket</h2>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              Send money, pay bills, apply for loans, earn rewards — all from the Alpha Pay digital wallet.
            </p>
            <div className="space-y-5">
              {features.map(([icon, title, desc]) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center flex-none mt-0.5">
                    <i className={`fas ${icon} text-amber-300`} />
                  </div>
                  <div>
                    <p className="font-bold text-white mb-0.5">{title}</p>
                    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => navigate("/login")}
              className="mt-8 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 px-8 py-4 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg flex items-center gap-3">
              <i className="fas fa-wallet" /> Open Alpha Pay Now
            </button>
          </div>
          <div className="hidden lg:grid grid-cols-2 gap-4">
            {cards.map(([icon, title, desc], i) => (
              <div key={title}
                className={`bg-white/8 backdrop-blur-sm border border-white/15 rounded-3xl p-5 text-white hover:bg-white/12 transition-all ${i % 2 === 1 ? "mt-6" : ""}`}>
                <i className={`fas ${icon} text-2xl text-amber-400 mb-3`} />
                <h4 className="font-bold mb-1">{title}</h4>
                <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  const brands = ["RBI", "DICGC", "Mastercard", "Visa", "NSE", "BSE"];
  return (
    <section className="py-20 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-10">
          <div>
            <p className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-2">Trusted Infrastructure</p>
            <h2 className="text-3xl md:text-4xl font-black">Built on compliance, security, and scale</h2>
            <p className="text-slate-300 max-w-2xl mt-3 text-sm leading-relaxed">Alpha Bank is designed to give you banking confidence with regulated safeguards, data privacy, and secure digital services.</p>
          </div>
          <a href="#why" className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-900 shadow-lg hover:bg-amber-400 transition">
            <i className="fas fa-shield-alt" /> Learn More
          </a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
          {brands.map((brand) => (
            <div key={brand} className="rounded-3xl border border-white/10 bg-white/5 py-6 px-4">
              <p className="text-2xl font-black text-amber-300">{brand}</p>
              <p className="text-[11px] text-slate-400 mt-2 uppercase tracking-[0.22em]">Verified</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Why Us ────────────────────────────────────────────────────────────────────
function WhyUs() {
  return (
    <section id="why" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <p className="text-amber-600 font-bold text-xs uppercase tracking-widest mb-2">Why Choose Us</p>
        <h2 className="text-4xl font-black text-slate-900">Banking you can trust</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-10">
        {[
          ["fa-shield-alt", "Bank-Grade Security", "AES-256 encryption, session management, and real-time fraud monitoring protect your money 24/7."],
          ["fa-bolt",        "Lightning Fast",      "Instant transfers, real-time notifications, and rapid loan disbursal — no waiting, no delays."],
          ["fa-headset",     "24/7 Support",        "Round-the-clock support via AlphaBot AI, phone, email, or branch visit. We're always here."],
        ].map(([icon, title, desc]) => (
          <div key={title} className="text-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition">
            <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center text-4xl text-amber-600 mx-auto mb-6">
              <i className={`fas ${icon}`} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────
const REVIEWS = [
  { init: "R", color: "bg-indigo-100 text-indigo-600",  name: "Rahul Sharma",  role: "Software Engineer, Bengaluru", stars: 5,   text: "Alpha Pay has transformed how I manage my money. The instant transfer feature is incredible and the cashback rewards are genuinely useful!" },
  { init: "P", color: "bg-purple-100 text-purple-600",  name: "Priya Nair",    role: "Teacher, Kochi",               stars: 5,   text: "Got my gold loan approved in under 2 hours. Completely paperless. The interest rate was the lowest I found anywhere." },
  { init: "A", color: "bg-emerald-100 text-emerald-600",name: "Arjun Mehta",   role: "CA, Hyderabad",                   stars: 4.5, text: "The AlphaBot AI assistant is surprisingly helpful — answered all my EMI questions instantly. Highly recommended!" },
];

function Testimonials() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-black text-slate-900">What Our Customers Say</h2>
          <p className="text-slate-500 mt-2 text-sm">Trusted by millions across India</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {REVIEWS.map((r) => (
            <div key={r.name} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition">
              <div className="flex items-center gap-0.5 text-yellow-400 mb-5">
                {Array.from({ length: Math.floor(r.stars) }).map((_, i) => <i key={i} className="fas fa-star text-sm" />)}
                {r.stars % 1 ? <i className="fas fa-star-half-alt text-sm" /> : null}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">"{r.text}"</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${r.color} rounded-full flex items-center justify-center font-bold`}>{r.init}</div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{r.name}</p>
                  <p className="text-xs text-slate-400">{r.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── EMI Calculator ────────────────────────────────────────────────────────────
function EMICalc() {
  const [principal, setPrincipal] = useState("");
  const [rate,      setRate]      = useState("");
  const [tenure,    setTenure]    = useState("");

  const emi      = principal && rate && tenure ? calculateEMI(parseFloat(principal), parseFloat(rate), parseInt(tenure)) : 0;
  const total    = emi * (parseInt(tenure) || 0);
  const interest = total - (parseFloat(principal) || 0);
  const fmtN     = (v) => "₹" + Math.round(v).toLocaleString("en-IN");

  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-gradient-to-br from-amber-500 to-yellow-400 rounded-3xl p-8 text-slate-900 shadow-2xl shadow-amber-200">
          <h3 className="font-black text-2xl mb-1">📊 EMI Calculator</h3>
          <p className="text-amber-800/70 text-sm mb-8">Calculate your monthly installment before applying</p>
          <div className="grid md:grid-cols-4 gap-4 items-end">
            {[
              ["Principal (₹)", principal, setPrincipal, "e.g. 500000"],
              ["Rate (% p.a.)", rate,      setRate,      "e.g. 8.5"   ],
              ["Tenure (months)", tenure,  setTenure,    "e.g. 24"    ],
            ].map(([label, val, set, ph]) => (
              <div key={label}>
                <label className="text-xs font-bold text-amber-900/60 uppercase block mb-2">{label}</label>
                <input type="number" placeholder={ph} value={val} onChange={(e) => set(e.target.value)}
                  className="w-full bg-white/25 border border-white/30 rounded-xl p-3.5 text-slate-900 placeholder-amber-800/40 focus:ring-2 focus:ring-white outline-none font-bold text-sm transition" />
              </div>
            ))}
            <div className="bg-slate-900/15 rounded-2xl p-4 text-center border border-slate-900/10">
              <p className="text-xs text-amber-900/70 font-semibold mb-1">Monthly EMI</p>
              <p className="text-3xl font-black">{emi ? fmtN(emi) : "₹ 0"}</p>
              {emi > 0 && (
                <div className="mt-2 flex justify-center gap-4 text-xs text-amber-900/70">
                  <div>Total: <span className="font-bold text-slate-900">{fmtN(total)}</span></div>
                  <div>Interest: <span className="font-bold text-slate-900">{fmtN(Math.max(0, interest))}</span></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
const FAQS = [
  ["How do I open an Alpha Bank account?", "Click 'Open Free Account'. Fill in your username and a strong password (min 8 characters). Your account is ready instantly and you can fund it right away."],
  ["Is Alpha Pay safe? How is my money protected?", "Passwords are hashed using SHA-256 — they are never stored in plain text. Sessions expire automatically after 30 minutes of inactivity. Data is stored locally in your browser for this demo."],
  ["How quickly can I get a loan?", "All loan products in the app are disbursed instantly to your wallet for demonstration purposes. In a real deployment, disbursal would follow RBI-mandated KYC and underwriting processes."],
  ["What currencies does the multi-currency wallet support?", "Alpha Pay currently supports INR, USD, EUR, and GBP. Live exchange rates are simulated and update every 3 seconds."],
  ["What is AlphaBot?", "AlphaBot is our AI banking assistant powered by Google Gemini. It can answer questions about your account, loans, rates, rewards, and general banking topics — available 24/7 from any page inside the app."],
];

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-black text-slate-900 text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {FAQS.map(([q, a], i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex justify-between items-center p-6 font-bold text-slate-800 text-left text-sm gap-4">
                <span>{q}</span>
                <i className={`fas fa-chevron-down text-slate-400 transition-transform flex-none ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && (
                <p className="px-6 pb-6 text-slate-500 text-sm leading-relaxed border-t border-slate-50 pt-4">{a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const COLS = [
    {
      title: "Products",
      links: [
        ["Savings Account",    "/interest-rates"],
        ["Fixed Deposits",     "/interest-rates"],
        ["Personal Loans",     "/loans-info"    ],
        ["Home Loans",         "/loans-info"    ],
        ["Gold Loans",         "/loans-info"    ],
        ["Vehicle Loans",      "/loans-info"    ],
        ["Business Loans",     "/loans-info"    ],
        ["Insurance",          "/insurance"     ],
      ],
    },
    {
      title: "Support",
      links: [
        ["Help Centre",        "/help"           ],
        ["Contact Us",         "/contact"        ],
        ["Grievance Redressal","/grievance"       ],
        ["RBI Ombudsman",      "/rbi-guidelines" ],
        ["Branch Locator",     "/branches"       ],
        ["Interest Rates",     "/interest-rates" ],
        ["Developers",         "/developers"     ],
      ],
    },
    {
      title: "Company",
      links: [
        ["About Us & Team",    "/about"          ],
        ["Cyber Security",     "/cyber-security" ],
        ["RBI Guidelines",     "/rbi-guidelines" ],
        ["Privacy Policy",     "/privacy"        ],
        ["Terms & Conditions", "/terms"          ],
      ],
    },
  ];

  return (
    <footer className="bg-slate-900 text-slate-400">
      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand column — spans 2 on large */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-300 rounded-xl flex items-center justify-center shadow-lg flex-none">
                <span className="font-black text-slate-900 text-xl">α</span>
              </div>
              <span className="font-black text-white text-2xl">Alpha<span className="text-amber-400">Bank</span></span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs mb-6">
              India's modern digital banking platform. RBI regulated. Trusted by 2M+ customers since 1975.
            </p>
            {/* Contact block inside brand col */}
            <div className="space-y-2.5">
              <a href="tel:18001234567" className="flex items-center gap-3 text-sm hover:text-amber-400 transition group">
                <span className="w-7 h-7 bg-white/8 rounded-lg flex items-center justify-center group-hover:bg-amber-500/20 transition flex-none">
                  <i className="fas fa-phone text-amber-400 text-[11px]" />
                </span>
                1800-123-4567 (24/7 Toll Free)
              </a>
              <a href="mailto:support@alphabank.in" className="flex items-center gap-3 text-sm hover:text-amber-400 transition group">
                <span className="w-7 h-7 bg-white/8 rounded-lg flex items-center justify-center group-hover:bg-amber-500/20 transition flex-none">
                  <i className="fas fa-envelope text-amber-400 text-[11px]" />
                </span>
                support@alphabank.in
              </a>
              <div className="flex items-start gap-3 text-sm">
                <span className="w-7 h-7 bg-white/8 rounded-lg flex items-center justify-center flex-none mt-0.5">
                  <i className="fas fa-map-marker-alt text-amber-400 text-[11px]" />
                </span>
                <span>Alpha Tower, G-Block, BKC<br />Hyderabad — 500032, Telangana</span>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="font-bold text-white text-xs mb-5 uppercase tracking-widest">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map(([label, to]) => (
                  <li key={label}>
                    <Link to={to} className="text-sm text-slate-400 hover:text-amber-400 transition leading-none">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Legal text */}
            <p className="text-xs text-slate-500 text-center md:text-left">
              © 2024 Alpha Financial Services Ltd. All rights reserved.{" "}
            <span className="hidden sm:inline">·</span>
            <a href="/admin/login" className="hidden sm:inline hover:text-red-400 transition text-slate-700 ml-1">Staff Portal</a>
            {" "}
              <span className="hidden sm:inline">· CIN: U65110MH1975PLC012345</span>
              <span className="mx-2">·</span>
              <Link to="/terms"   className="hover:text-amber-400 transition">Terms</Link>
              <span className="mx-1">·</span>
              <Link to="/privacy" className="hover:text-amber-400 transition">Privacy</Link>
            </p>
            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-3">
              {[
                ["fa-shield-alt", "RBI Regulated",  "text-green-400" ],
                ["fa-lock",       "DICGC Insured",   "text-blue-400"  ],
                ["fa-certificate","ISO 27001",        "text-amber-400" ],
                ["fa-credit-card","PCI-DSS",          "text-purple-400"],
              ].map(([icon, label, cls]) => (
                <span key={label} className={`flex items-center gap-1.5 text-[11px] font-semibold ${cls}`}>
                  <i className={`fas ${icon} text-[10px]`} />{label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <MarketTicker />
      <Navbar />
      <Hero />
      <ProductsSection />
      <HowItWorks />
      <AlphaPaySection />
      <TrustBar />
      <WhyUs />
      <Testimonials />
      <EMICalc />
      <FAQ />
      <Footer />
    </div>
  );
}
