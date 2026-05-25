# AlphaBank — Modern Digital Banking Platform

![License](https://img.shields.io/badge/license-MIT-green) ![React](https://img.shields.io/badge/React-18.2-blue) ![Vite](https://img.shields.io/badge/Vite-5.0-purple)

**AlphaBank** is a full-featured, production-ready digital banking platform built with React, Vite, and Tailwind CSS. It demonstrates a complete banking ecosystem with user authentication, multi-currency wallets, instant transfers, loans, investments, and intelligent AI chatbot assistance.

---

## 🚀 Features

### Core Banking
- **🔐 Secure Authentication** — Signup/Login with SHA-256 password hashing + 30-min session timeout
- **👤 Multi-Role Support** — Separate user & admin login flows with role-based access
- **💰 Account Management** — Real-time balance, transaction history, KYC verification
- **🏪 Accounts Page** — View account number, IFSC, UPI ID, account details

### Transactions & Transfers
- **⚡ Instant UPI Transfers** — IMPS (instant, free), NEFT (2-4h, free), RTGS (30min, ₹25 fee)
- **📱 Recipient Management** — Save/manage beneficiaries; recent payee suggestions
- **💳 Bill Payments** — Electricity, Mobile, DTH, Gas, Water, Broadband, Credit Cards, FASTag
- **🔔 Auto-Pay** — Scheduled recurring payments on custom monthly dates
- **📊 Transaction Analytics** — Spending breakdown by category; monthly comparison charts

### Wallet & Investments
- **💱 Multi-Currency Wallet** — Hold INR, USD, EUR, GBP; live forex conversion
- **💚 Fixed Deposits (FD)** — Up to 7.25% p.a. · Quarterly compounding · Tax-saver option
- **📈 Recurring Deposits (RD)** — 7.00% p.a. · Monthly installments from ₹1,000
- **📊 SIP (Systematic Investment Plans)** — 5 mutual funds with returns 6-18% p.a.
- **🎯 Budget Tracker** — Monthly budgets per category; alerts at 80% threshold
- **💡 Expense Insights** — Monthly spending visualization; month-over-month comparison

### Loans
- **👤 Personal Loan** — ₹10K–₹5L @ 10.5% p.a. · 60-month tenure
- **🪙 Gold Loan** — ₹10K–₹10L @ 8.5% p.a. · Same-day disbursal
- **🏠 Home Loan** — ₹2L–₹50L @ 8.35% p.a. · 30-year tenure
- **🎓 Education Loan** — ₹10K–₹3L @ 9.5% p.a. · Moratorium available
- **💼 Business Loan** — ₹25K–₹8L @ 11% p.a. · Working capital + term loan
- **🚗 Vehicle Loan** — ₹25K–₹4L @ 9% p.a. · Up to 84 months
- **📋 EMI Calculator** — Real-time EMI, total payable, interest breakdown
- **⏳ Loan Tracking** — View active loans, EMI due dates, early prepayment options

### Rewards & Gamification
- **🎁 Tier System** — Bronze → Silver → Gold → Platinum with unlock thresholds
- **🎫 Scratch Cards** — 4 interactive scratch cards; one-time wins up to ₹100
- **💳 Vouchers** — Partner vouchers (BookMyShow, Uber, Airtel, etc.)
- **💰 Cashback** — 0.5% on transfers, 1% on bill payments; credited to balance
- **🏆 Achievements** — Unlock badges (First Transfer, Gold Tier, Scratch Master, etc.)

### Admin Console
- **📊 Dashboard** — Real-time stats: users, pending requests, total deposits, approved today
- **📥 Request Management** — Approve/reject loans, deposits, insurance with admin notes
- **👥 User Management** — View all users, credit/debit balances, KYC status, transaction history
- **📢 Broadcast** — Send system-wide notifications to all users; templates for quick messages

### Security & Privacy
- **🔒 Data Protection**
  - SHA-256 password hashing with server-side pepper
  - 6-digit UPI PIN for all transfers
  - Session management with auto-expiry (30 min)
  - Account privacy mode (mask balance display)
  
- **🛡️ Fraud Prevention**
  - Daily transfer limit enforcement
  - UPI PIN verification on every transfer
  - Attempt tracking & lockout mechanism
  - Real-time transaction notifications

- **📱 Regulatory Compliance**
  - RBI-regulated banking model
  - DICGC insurance (up to ₹5L per account)
  - KYC verification (Aadhaar, PAN, Selfie)
  - DPDP Act 2023 compliant

### UI/UX Features
- **🌙 Dark Mode** — Full dark theme support; persistent user preference
- **♿ Accessibility** — Semantic HTML, ARIA labels, keyboard navigation
- **📱 Responsive Design** — Mobile-first; optimized for all screen sizes
- **⚡ Performance** — Lazy-loaded routes, optimized re-renders with React Context
- **🎨 Modern Design** — Gradient cards, smooth animations, Tailwind CSS
- **🤖 AlphaBot AI** — 24/7 chatbot with Gemini API integration; hardcoded KB as fallback

### Static Pages
- Terms & Conditions, Privacy Policy
- Interest Rates comparison table
- Developer API documentation
- Loans information & FAQs
- About Us, Contact, Grievance
- Cyber Security guidelines
- RBI Guidelines, Help Centre
- Branch Locator, Insurance Info

---

## 📦 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 | UI components & state management |
| **Bundler** | Vite 5 | Fast HMR, optimized builds |
| **Styling** | Tailwind CSS 3 | Utility-first CSS framework |
| **Routing** | React Router v6 | Client-side navigation |
| **Storage** | LocalStorage | Session + user database persistence |
| **Icons** | FontAwesome | Comprehensive icon library |
| **AI** | Google Gemini API | Optional AI chatbot backend |
| **Build** | PostCSS + Autoprefixer | CSS vendor prefixing |

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 16+ 
- npm 8+

### Quick Start

```bash
# Clone repository
git clone https://github.com/alphabank/alpha-bank-react.git
cd alpha-bank-react

# Install dependencies
npm install

# Start dev server
npm run dev
```

Server will be available at: **http://localhost:3000**

---

## 📚 Usage Guide

### For Users (Customer Banking)

1. **Sign Up** → `/signup`
   - Create account with username, password, email
   - Optional: Set opening balance (demo)
   - Accept Terms & Conditions

2. **Log In** → `/login`
   - Use credentials from signup
   - Session persists for 30 minutes

3. **Explore Features**
   - **Dashboard** — Overview, balance, recent transactions, quick actions
   - **Transfer** — Send money via IMPS/NEFT/RTGS; manage beneficiaries
   - **Wallet** — Multi-currency holdings; live forex conversion
   - **Services** — Pay bills; set up auto-pay schedules
   - **Loans** — Apply for loans; track active loans; calculate EMI
   - **SIP** — Invest in mutual funds & fixed deposits
   - **Rewards** — View cashback, tier status, scratch cards, vouchers
   - **Settings** — Update profile, change password, set UPI PIN, manage security

### For Admins

1. **Admin Login** → `/admin/login`
   - Default credentials: `alphabank_admin` / `Admin@Alpha2024`
   - Session stored in `sessionStorage` (tab-specific, auto-clears on close)

2. **Manage Platform**
   - **Dashboard** — System stats, pending requests overview
   - **Requests** — Review & approve/reject user loan/deposit/insurance applications
   - **Users** — View all users; credit/debit test balances; monitor KYC
   - **Broadcast** — Send notifications to all users; templates available

---

## 📁 Project Structure

```
src/
├── App.jsx                     # Router configuration & route tree
├── main.jsx                    # React mounting point
├── index.css                   # Global styles, animations, Tailwind imports
│
├── components/
│   ├── common/
│   │   ├── AlphaBot.jsx       # AI chatbot with Gemini + KB fallback
│   │   ├── ErrorBoundary.jsx  # Error boundary wrapper
│   │   ├── GenericModal.jsx   # Reusable modal component
│   │   ├── MarketTicker.jsx   # Live forex & market ticker
│   │   ├── ToastContainer.jsx # Toast notifications
│   │   └── UPIPin.jsx         # 6-digit PIN numpad
│   └── layout/
│       └── AppLayout.jsx      # Main app layout with sidebar, header
│
├── pages/
│   ├── AuthPage.jsx           # Login & Signup page
│   ├── LandingPage.jsx        # Marketing website homepage
│   ├── StaticPages.jsx        # Terms, Privacy, Interest Rates, etc.
│   ├── app/
│   │   ├── Dashboard.jsx      # User home: balance, transactions, QR
│   │   ├── Transfer.jsx       # Send money, manage beneficiaries
│   │   ├── Wallet.jsx         # Multi-currency wallet, forex, insights
│   │   ├── Services.jsx       # Bill payments, auto-pay schedules
│   │   ├── Loans.jsx          # Loan products, application, tracking
│   │   ├── SIP.jsx            # SIP, FD, RD investments
│   │   ├── Rewards.jsx        # Cashback, tier, achievements, scratch cards
│   │   ├── Settings.jsx       # Profile, password, UPI PIN, security
│   │   └── index.js           # App routes export
│   └── admin/
│       ├── AdminLayout.jsx    # Admin sidebar + header
│       ├── AdminLoginPage.jsx # Admin login with 3-attempt lockout
│       ├── AdminDashboard.jsx # Stats, pending requests, recent activity
│       ├── AdminRequests.jsx  # Approve/reject requests modal
│       ├── AdminUsers.jsx     # User management, credit/debit, KYC
│       └── AdminBroadcast.jsx # Send notifications to all users
│
├── router/
│   ├── AdminRoute.jsx         # Admin-only route guard
│   └── ProtectedRoute.jsx     # User-only route guard
│
├── store/
│   ├── AppContext.jsx         # User auth, transactions, UI state
│   └── RatesContext.jsx       # Live forex rates (updates every 3s)
│
├── utils/
│   ├── constants.js           # Routes, admin creds, API keys, rates
│   ├── helpers.js             # Formatting, EMI calc, tier system
│   ├── requests.js            # Loan/deposit/insurance request CRUD
│   ├── security.js            # Password hashing, validators, sanitizers
│   └── storage.js             # LocalStorage, session management
│
├── index.html                 # HTML entry point
├── package.json               # Dependencies
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # Tailwind customization
└── postcss.config.js          # PostCSS plugins
```

---

## 🔐 Authentication Flow

### User Login
```
SignUp → Username validation → Password hashing (SHA-256)
         → Email validation → Create account in localStorage
         → Set session (30 min) → Mount user → Redirect to /app/dashboard

Login → Find user → Verify password → Extend session → Redirect to /app/dashboard
        Session expires → Auto logout → Redirect to /login
```

### Admin Login
```
/admin/login → Verify credentials (hardcoded) → Set sessionStorage flag
              → Redirect to /admin/dashboard
              → On tab close → sessionStorage clears → Logout
              Back button → Check popstate → Clear session → Redirect to /admin/login
```

---

## 💾 Data Persistence

All data is stored in **browser localStorage**:

| Key | Purpose |
|-----|---------|
| `alpha_users_v3` | User database (all accounts) |
| `alpha_requests_v1` | Loan/deposit/insurance requests |
| `alpha_session_v3` | Current session (userId + expiry) |

**Note:** This is a demo. Production would use a backend API with database.

---

## 🤖 AlphaBot AI Assistant

AlphaBot provides 24/7 support with intent classification:

- **Intents:** Balance, Transfer, Loans, EMI calculation, Rewards, FD, SIP, KYC, Security, Account details, About, etc.
- **Knowledge Base:** 20+ hardcoded responses covering all banking topics
- **Gemini API:** Optional; if key is invalid or unavailable, falls back to KB
- **Features:** Copy to clipboard, markdown rendering, suggestion chips, typing indicator

---

## 🎨 Customization

### Tailwind Colors
Edit `tailwind.config.js` to customize brand colors:
```javascript
theme: {
  colors: {
    amber: { 400: '#fbbf24', 500: '#f59e0b', ... },
    // Add custom colors here
  }
}
```

### Interest Rates & Loan Limits
Update in `src/utils/constants.js`:
```javascript
export const LOAN_PRODUCTS = [
  { id: "loan-personal", name: "Personal Loan", rate: "10.5", max: "₹5,00,000", ... }
]
```

### Admin Credentials
Update in `src/utils/constants.js`:
```javascript
export const ADMIN_USERNAME = "alphabank_admin";
export const ADMIN_PASSWORD = "Admin@Alpha2024";
```

---

## 🚀 Deployment

### Build for Production
```bash
npm run build
```
Creates optimized bundle in `dist/` folder.

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm run build
# Drag & drop 'dist' folder to Netlify Dashboard
```

### Environment Variables
Create `.env` file:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 📊 Admin Test Scenarios

### Create Test User
1. Go to `/signup`
2. Username: `testuser` | Password: `Test@1234` | Email: `test@example.com` | Balance: `₹50,000`
3. Creates account with opening balance transaction

### Apply for Loan
1. Log in as test user → Go to `/app/loans`
2. Select "Personal Loan" → Enter amount ₹1,00,000
3. Submit application
4. Check admin console: `/admin/requests` → Approve

### Broadcast Message
1. Log in as admin → Go to `/admin/broadcast`
2. Type message → Select type → Send to all users
3. All logged-in users receive notification

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000 already in use | Kill process: `lsof -i :3000 \| grep LISTEN \| awk '{print $2}' \| xargs kill -9` |
| Styles not loading | Run `npm install` & restart dev server |
| Session expires immediately | Check browser's localStorage is enabled |
| Gemini API not responding | AlphaBot falls back to hardcoded KB automatically |
| Dark mode not persisting | Check `isDarkMode` in AppContext and localStorage |

---

## 📝 API Reference (Demo Mock)

All requests are client-side simulations stored in localStorage. No backend API.

### User Management
```javascript
signup(username, password, email, balance) → Promise<{ ok: true }>
login(username, password) → Promise<{ ok: true }>
logout() → void
updateUser(updates) → void
```

### Transactions
```javascript
addTransaction(tx: {type, desc, amount, category}) → void
addNotification(msg, type) → void
```

### Loan Requests
```javascript
createRequest(type, payload) → void
approveRequest(requestId, adminNote) → void
rejectRequest(requestId, adminNote) → void
getAllRequests() → Request[]
getUserRequests(userId) → Request[]
getPendingCount() → number
```

---

## 📄 License

MIT License — See LICENSE file for details

---

## 🙋 Support

- **User Support:** 📞 1800-123-4567 | 📧 support@alphabank.in
- **Fraud Helpline:** 📞 1800-123-4567 | 📧 fraud@alphabank.in
- **Bug Reports:** Open an issue on GitHub

---

## 🎉 Key Features Implemented

✅ Full authentication system (signup, login, session management)
✅ Multi-currency wallet with live forex
✅ Instant transfers (IMPS, NEFT, RTGS) with cashback
✅ Bill payments & auto-pay schedules
✅ 6 loan products with EMI calculator
✅ Fixed/Recurring deposits with maturity tracking
✅ SIP (Systematic Investment Plans)
✅ Tier-based rewards system with scratch cards
✅ Admin console with request management
✅ AI chatbot with Gemini + KB fallback
✅ Dark mode support
✅ Fully responsive design
✅ Transaction analytics & insights
✅ Security features (UPI PIN, daily limits, attempt tracking)
✅ Error boundaries & comprehensive error handling
✅ Accessibility features (keyboard nav, ARIA labels)

---

**Made with ❤️ by AlphaBank Development Team**

*Version 2.0.0 · Last Updated: May 2026*
