import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MarketTicker from "../components/common/MarketTicker";

// ─── Shared layout ────────────────────────────────────────────────────────────
function StaticLayout({ title, subtitle, children, badge }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MarketTicker />
      {/* Top bar */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition text-sm">
              <i className="fas fa-arrow-left" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-amber-400 to-yellow-300 rounded-lg flex items-center justify-center">
                <span className="font-black text-slate-900 text-sm">α</span>
              </div>
              <span className="font-black text-slate-900">Alpha<span className="text-amber-500">Bank</span></span>
            </Link>
          </div>
          <Link to="/signup"
            className="bg-amber-500 text-slate-900 font-bold text-xs px-4 py-2 rounded-xl hover:bg-amber-600 transition">
            Open Account
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {badge && (
            <span className="inline-block text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full mb-4 uppercase tracking-wider">{badge}</span>
          )}
          <h1 className="text-3xl md:text-4xl font-black mb-3">{title}</h1>
          {subtitle && <p className="text-slate-300 text-base max-w-2xl">{subtitle}</p>}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-12">
        {children}
      </div>

      {/* Footer strip */}
      <div className="bg-slate-900 text-slate-500 text-xs text-center py-5">
        © 2024 Alpha Financial Services Ltd · CIN: U65110MH1975PLC012345 ·{" "}
        <Link to="/terms" className="hover:text-amber-400 transition">Terms</Link> ·{" "}
        <Link to="/privacy" className="hover:text-amber-400 transition">Privacy</Link>
      </div>
    </div>
  );
}

// ─── Section component ────────────────────────────────────────────────────────
function Section({ icon, title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
      {title && (
        <h2 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
          {icon && <i className={`fas ${icon} text-amber-500`} />}
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

function P({ children }) {
  return <p className="text-sm text-slate-600 leading-relaxed mb-3 last:mb-0">{children}</p>;
}
function H({ children }) {
  return <h3 className="font-bold text-slate-700 text-sm mt-5 mb-2">{children}</h3>;
}
function Li({ children }) {
  return (
    <li className="flex gap-2 text-sm text-slate-600 leading-relaxed">
      <span className="text-amber-500 font-bold mt-0.5 flex-none">•</span>
      <span>{children}</span>
    </li>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TERMS & CONDITIONS
// ═══════════════════════════════════════════════════════════════════════════════
export function TermsPage() {
  return (
    <StaticLayout title="Terms & Conditions" badge="Legal" subtitle="Please read these terms carefully before using Alpha Bank services. Last updated: 1 January 2024.">
      <Section icon="fa-handshake" title="1. Acceptance of Terms">
        <P>By accessing or using Alpha Bank's digital banking platform ("Service"), you agree to be bound by these Terms & Conditions and all applicable laws and regulations of India. If you do not agree with any of these terms, you are prohibited from using the Service.</P>
        <P>These terms apply to all users of the Service, including browsers, customers, merchants, and contributors of content.</P>
      </Section>

      <Section icon="fa-user-check" title="2. Eligibility">
        <ul className="space-y-2">
          <Li>You must be at least 18 years of age to create an account.</Li>
          <Li>You must be a resident of India or an Indian citizen as defined under FEMA, 1999.</Li>
          <Li>You must provide accurate, current, and complete information during registration.</Li>
          <Li>One account per individual. Creating multiple accounts is prohibited.</Li>
          <Li>You must not use the Service for any unlawful or unauthorized purpose.</Li>
        </ul>
      </Section>

      <Section icon="fa-lock" title="3. Account Security">
        <P>You are responsible for maintaining the confidentiality of your login credentials. You agree to:</P>
        <ul className="space-y-2">
          <Li>Use a strong, unique password with at least 8 characters, one uppercase letter, and one number.</Li>
          <Li>Never share your password, OTP, or account details with any third party, including Alpha Bank staff.</Li>
          <Li>Immediately notify us at security@alphabank.in of any unauthorized access.</Li>
          <Li>Log out of your account after each session on shared devices.</Li>
        </ul>
        <H>Session Expiry</H>
        <P>For your security, sessions automatically expire after 30 minutes of inactivity. You will be required to log in again.</P>
      </Section>

      <Section icon="fa-rupee-sign" title="4. Financial Services & Transactions">
        <P>All financial products and services offered on this platform (loans, investments, wallet transfers) are simulated for demonstration purposes in this version. In a production deployment:</P>
        <ul className="space-y-2">
          <Li>All transactions are subject to RBI regulations, PMLA, and applicable Indian laws.</Li>
          <Li>Transfer limits, interest rates, and charges are subject to change without prior notice.</Li>
          <Li>Alpha Bank reserves the right to reject any transaction suspected of fraudulent activity.</Li>
          <Li>NEFT/RTGS/IMPS transactions are processed per RBI guidelines and banking hours.</Li>
          <Li>Alpha Bank is not liable for any losses arising from unauthorized transactions reported 7+ days after occurrence.</Li>
        </ul>
      </Section>

      <Section icon="fa-ban" title="5. Prohibited Activities">
        <P>You agree not to use the Service for:</P>
        <ul className="space-y-2">
          <Li>Money laundering, terrorist financing, or any illegal financial activity.</Li>
          <Li>Reverse engineering, hacking, or attempting to gain unauthorized access.</Li>
          <Li>Uploading malware, viruses, or any code designed to disrupt the Service.</Li>
          <Li>Impersonating another person or entity.</Li>
          <Li>Using automated scripts or bots to access the platform.</Li>
        </ul>
      </Section>

      <Section icon="fa-gavel" title="6. Governing Law & Dispute Resolution">
        <P>These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Hyderabad, Telangana.</P>
        <P>For grievances, please contact our Grievance Officer at: <strong>grievance@alphabank.in</strong> · Tel: 040-2356-0001</P>
      </Section>

      <Section icon="fa-edit" title="7. Amendments">
        <P>Alpha Bank reserves the right to modify these terms at any time. Changes will be communicated via email or in-app notification. Continued use of the Service after modifications constitutes acceptance of the new terms.</P>
        <P>For questions about these Terms, contact our legal team at <strong>legal@alphabank.in</strong>.</P>
      </Section>
    </StaticLayout>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRIVACY POLICY
// ═══════════════════════════════════════════════════════════════════════════════
export function PrivacyPage() {
  return (
    <StaticLayout title="Privacy Policy" badge="Privacy" subtitle="Your privacy is important to us. This policy explains how we collect, use, and protect your personal information. Last updated: 1 January 2024.">
      <Section icon="fa-database" title="1. Information We Collect">
        <H>Information you provide directly:</H>
        <ul className="space-y-2">
          <Li>Account registration details: username, email address, phone number.</Li>
          <Li>Financial information: transaction history, balances, loan applications.</Li>
          <Li>Identity documents submitted for KYC verification (Aadhaar, PAN).</Li>
          <Li>Communication data: messages sent to customer support.</Li>
        </ul>
        <H>Information collected automatically:</H>
        <ul className="space-y-2">
          <Li>Device information: browser type, OS, IP address, device identifiers.</Li>
          <Li>Usage data: pages visited, features used, time spent.</Li>
          <Li>Session data: login times, logout times, session duration.</Li>
        </ul>
      </Section>

      <Section icon="fa-cog" title="2. How We Use Your Information">
        <ul className="space-y-2">
          <Li>To provide, operate, and improve our banking services.</Li>
          <Li>To verify your identity and prevent fraud (as required by RBI and PMLA).</Li>
          <Li>To send transaction alerts, account statements, and service communications.</Li>
          <Li>To comply with legal obligations including tax reporting and regulatory requirements.</Li>
          <Li>To personalize your experience and offer relevant financial products.</Li>
          <Li>To analyze usage patterns for service improvements (in anonymized form).</Li>
        </ul>
        <H>Note on this demo version:</H>
        <P>In this demonstration version, all data is stored locally in your browser's localStorage and is not transmitted to any server. No real personal data is collected or shared.</P>
      </Section>

      <Section icon="fa-share-alt" title="3. Data Sharing">
        <P>Alpha Bank does not sell your personal information. We may share data with:</P>
        <ul className="space-y-2">
          <Li><strong>Regulatory authorities:</strong> RBI, SEBI, Income Tax Department, FIU-IND — as required by law.</Li>
          <Li><strong>Payment networks:</strong> NPCI (for UPI), RTGS/NEFT processing — for transaction completion.</Li>
          <Li><strong>Credit bureaus:</strong> CIBIL, Experian — for credit assessment with your consent.</Li>
          <Li><strong>Service providers:</strong> Cloud hosting, SMS/email services — under strict data processing agreements.</Li>
        </ul>
      </Section>

      <Section icon="fa-shield-alt" title="4. Data Security">
        <ul className="space-y-2">
          <Li>Passwords are hashed using SHA-256 with a server-side pepper — never stored in plaintext.</Li>
          <Li>All data transmissions use TLS 1.3 encryption (HTTPS).</Li>
          <Li>Payment card data is processed under PCI-DSS Level 1 standards.</Li>
          <Li>Regular penetration testing and security audits are conducted.</Li>
          <Li>Access to production data is restricted to authorized personnel only.</Li>
        </ul>
      </Section>

      <Section icon="fa-user-shield" title="5. Your Rights (DPDP Act 2023)">
        <P>Under India's Digital Personal Data Protection Act 2023, you have the right to:</P>
        <ul className="space-y-2">
          <Li><strong>Access:</strong> Request a copy of your personal data.</Li>
          <Li><strong>Correction:</strong> Request correction of inaccurate personal data.</Li>
          <Li><strong>Erasure:</strong> Request deletion of your account and data.</Li>
          <Li><strong>Grievance:</strong> File a complaint with our Data Protection Officer.</Li>
          <Li><strong>Nominate:</strong> Nominate a person to exercise rights in the event of death or incapacity.</Li>
        </ul>
        <P>To exercise these rights, contact: <strong>dpo@alphabank.in</strong></P>
      </Section>

      <Section icon="fa-cookie-bite" title="6. Cookies & Tracking">
        <P>We use essential cookies for authentication, security, and functionality. We do not use third-party advertising cookies. You can manage cookie preferences in your browser settings, though disabling essential cookies may affect service functionality.</P>
      </Section>

      <Section icon="fa-phone" title="7. Contact Us">
        <P>Data Protection Officer: <strong>Vikram Mehta</strong></P>
        <P>Email: <strong>dpo@alphabank.in</strong> · Phone: <strong>1800-123-4567</strong></P>
        <P>Alpha Tower, Financial District, Hyderabad — 500032, Telangana, India</P>
      </Section>
    </StaticLayout>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTEREST RATES
// ═══════════════════════════════════════════════════════════════════════════════
export function InterestRatesPage() {
  const table = (rows, headers) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-amber-50">
            {headers.map((h) => <th key={h} className="text-left px-4 py-3 font-bold text-slate-700 text-xs uppercase tracking-wide">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-slate-100 hover:bg-slate-50 transition">
              {r.map((c, j) => <td key={j} className={`px-4 py-3 text-slate-600 ${j === r.length - 1 ? "font-bold text-amber-600" : ""}`}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <StaticLayout title="Interest Rates" badge="Rates & Charges" subtitle="Transparent, competitive rates across all our products. Updated 1 January 2024. Rates subject to change.">
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[["fa-piggy-bank text-green-500","Savings Account","Up to 6.00% p.a."],["fa-lock text-blue-500","Fixed Deposit","Up to 7.25% p.a."],["fa-home text-amber-500","Home Loan","From 8.35% p.a."]].map(([cls,l,v])=>(
          <div key={l} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center">
            <i className={`fas ${cls} text-3xl mb-3`}/>
            <p className="font-bold text-slate-700 text-sm">{l}</p>
            <p className="text-amber-600 font-black text-lg mt-1">{v}</p>
          </div>
        ))}
      </div>

      <Section icon="fa-piggy-bank" title="Savings & Deposits">
        {table([
          ["Regular Savings Account","Balance < ₹1 Lakh","3.50% p.a."],
          ["Regular Savings Account","Balance ≥ ₹1 Lakh","4.00% p.a."],
          ["Alpha Premium Savings","Balance ≥ ₹5 Lakh","5.00% p.a."],
          ["Alpha Elite Savings","Balance ≥ ₹25 Lakh","6.00% p.a."],
        ],["Product","Criteria","Rate"])}
      </Section>

      <Section icon="fa-lock" title="Fixed Deposits (General Public)">
        {table([
          ["7–14 days","—","3.50%"],
          ["15–45 days","—","4.00%"],
          ["46–90 days","—","4.75%"],
          ["91–180 days","—","5.50%"],
          ["181 days – 1 year","—","6.50%"],
          ["1 year – 2 years","—","7.00%"],
          ["2 years – 3 years","—","7.10%"],
          ["3 years – 5 years","—","7.25%"],
          ["5 years – 10 years (Tax Saver)","80C benefit","7.00%"],
        ],["Tenure","Remarks","Rate p.a."])}
        <p className="text-xs text-slate-400 mt-3">* Senior Citizens get an additional 0.50% p.a. · Premature withdrawal penalty: 1% on applicable rate.</p>
      </Section>

      <Section icon="fa-hand-holding-usd" title="Loan Interest Rates">
        {table([
          ["Home Loan","Up to ₹30 Lakh","8.35% – 8.75%"],
          ["Home Loan","₹30L – ₹75L","8.50% – 9.00%"],
          ["Home Loan","Above ₹75 Lakh","8.75% – 9.25%"],
          ["Personal Loan","Salaried (CIBIL 750+)","10.50% – 12.00%"],
          ["Personal Loan","Salaried (CIBIL 700–749)","12.00% – 14.00%"],
          ["Gold Loan","All categories","8.50% – 10.00%"],
          ["Education Loan","Up to ₹4 Lakh","9.50%"],
          ["Education Loan","₹4L – ₹7.5L (no collateral)","10.50%"],
          ["Business Loan","MSME","11.00% – 14.00%"],
          ["Vehicle Loan (New Car)","All categories","9.00% – 10.50%"],
          ["Vehicle Loan (Used Car)","All categories","11.00% – 14.00%"],
        ],["Product","Criteria","Rate p.a."])}
      </Section>

      <Section icon="fa-exchange-alt" title="Service Charges">
        {table([
          ["IMPS Transfer","Up to ₹5 Lakh","Free"],
          ["NEFT Transfer","Any amount","Free"],
          ["RTGS Transfer","₹2 Lakh – ₹5 Lakh","₹25"],
          ["RTGS Transfer","Above ₹5 Lakh","₹50"],
          ["Cheque Book (25 leaves)","—","Free (1 per quarter)"],
          ["Duplicate Account Statement","—","₹100"],
          ["ATM Withdrawal (Alpha ATM)","—","Free (unlimited)"],
          ["ATM Withdrawal (Other banks)","Beyond 5/month","₹21 + GST"],
          ["Debit Card (Annual)","—","₹200 + GST"],
          ["Locker (Small)","Annual","₹3,000 + GST"],
        ],["Service","Criteria","Charge"])}
      </Section>
    </StaticLayout>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEVELOPERS
// ═══════════════════════════════════════════════════════════════════════════════
export function DevelopersPage() {
  const codeBlock = (code) => (
    <pre className="bg-slate-900 text-green-400 rounded-xl p-4 text-xs overflow-x-auto font-mono leading-relaxed mt-2">{code}</pre>
  );

  return (
    <StaticLayout title="Developer Hub" badge="API & Integration" subtitle="Build on Alpha Bank's open banking APIs. Sandbox access, SDKs, and full documentation available.">
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[["fa-key text-amber-500","REST APIs","OpenAPI 3.0 compliant endpoints"],["fa-code text-blue-500","SDKs","JavaScript, Python, Java, Go"],["fa-shield-alt text-green-500","Sandbox","Free testing environment"]].map(([cls,l,v])=>(
          <div key={l} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center">
            <i className={`fas ${cls} text-3xl mb-3`}/>
            <p className="font-bold text-slate-700">{l}</p>
            <p className="text-slate-400 text-xs mt-1">{v}</p>
          </div>
        ))}
      </div>

      <Section icon="fa-rocket" title="Quick Start">
        <P>Get started with Alpha Bank API in 3 steps. All API calls require a Bearer token obtained via OAuth 2.0.</P>
        <H>1. Request API Access</H>
        <P>Register for a developer account at <strong>developer.alphabank.in</strong> and create an application to receive your Client ID and Secret.</P>
        <H>2. Obtain an Access Token</H>
        {codeBlock(`POST https://api.alphabank.in/v1/oauth/token
Content-Type: application/json

{
  "client_id": "your_client_id",
  "client_secret": "your_client_secret",
  "grant_type": "client_credentials",
  "scope": "accounts:read payments:write"
}`)}
        <H>3. Make your first API call</H>
        {codeBlock(`GET https://api.alphabank.in/v1/accounts/balance
Authorization: Bearer {access_token}
X-API-Version: 2024-01

// Response
{
  "account_id": "ACC1234567890",
  "balance": { "amount": 124500.00, "currency": "INR" },
  "as_of": "2024-01-15T10:30:00+05:30"
}`)}
      </Section>

      <Section icon="fa-list" title="Available APIs">
        {[
          ["Account Information API","Read account balance, details, and statements.","GET /v1/accounts/{id}","accounts:read"],
          ["Payment Initiation API","Initiate IMPS, NEFT, RTGS transfers.","POST /v1/payments","payments:write"],
          ["UPI API","Generate UPI QR, collect requests, VPA validation.","POST /v1/upi/collect","upi:write"],
          ["Statement API","Fetch paginated transaction history.","GET /v1/accounts/{id}/transactions","accounts:read"],
          ["Loan API","Check eligibility, apply for loans, track status.","POST /v1/loans/apply","loans:write"],
          ["FX Rate API","Get live and historical forex rates.","GET /v1/fx/rates","public"],
        ].map(([name, desc, endpoint, scope]) => (
          <div key={name} className="border border-slate-100 rounded-xl p-4 mb-3">
            <div className="flex items-start justify-between gap-4 mb-2">
              <p className="font-bold text-slate-800 text-sm">{name}</p>
              <span className="text-[10px] font-mono bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex-none">{scope}</span>
            </div>
            <p className="text-xs text-slate-500 mb-2">{desc}</p>
            <code className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded font-mono">{endpoint}</code>
          </div>
        ))}
      </Section>

      <Section icon="fa-life-ring" title="Support & Resources">
        <div className="grid sm:grid-cols-2 gap-4">
          {[["fa-book","API Reference","Full OpenAPI 3.0 documentation","docs.alphabank.in"],["fa-flask","Sandbox","Test environment with mock data","sandbox.alphabank.in"],["fa-slack","Community","Developer Slack workspace","devs.alphabank.in/slack"],["fa-envelope","Support","Email: api-support@alphabank.in","Response within 1 business day"]].map(([icon,title,desc,link])=>(
            <div key={title} className="bg-slate-50 rounded-xl p-4">
              <i className={`fas ${icon} text-amber-500 mb-2 block`}/>
              <p className="font-bold text-slate-700 text-sm">{title}</p>
              <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
              <p className="text-xs text-amber-500 font-mono mt-1">{link}</p>
            </div>
          ))}
        </div>
      </Section>
    </StaticLayout>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOANS INFO
// ═══════════════════════════════════════════════════════════════════════════════
export function LoansInfoPage() {
  const navigate = useNavigate();
  const products = [
    { icon:"🏠", name:"Home Loan", rate:"8.35% p.a. onwards", max:"₹5,00,00,000", tenure:"30 years", elig:"Salaried / Self-employed, 21–65 yrs", docs:["Aadhaar + PAN","Salary slips / ITR 3 years","Property documents","Bank statement 6 months"], features:["Up to 90% of property value","Balance transfer facility","Tax benefit u/s 24 & 80C","Doorstep service"] },
    { icon:"👤", name:"Personal Loan", rate:"10.50% p.a. onwards", max:"₹25,00,000", tenure:"5 years", elig:"Salaried ≥ ₹25,000/mo, CIBIL ≥ 700", docs:["Aadhaar + PAN","Salary slips 3 months","Bank statement 3 months"], features:["No collateral required","Instant disbursal","Prepayment after 6 EMIs","Flexi-loan option"] },
    { icon:"🪙", name:"Gold Loan", rate:"8.50% p.a. onwards", max:"₹50,00,000", tenure:"2 years", elig:"18+ years, gold purity ≥ 18 carat", docs:["Aadhaar + PAN","Gold to be pledged"], features:["75% LTV on gold value","Same-day disbursal","No income proof needed","Safe gold storage by Alpha"] },
    { icon:"🎓", name:"Education Loan", rate:"9.50% p.a. onwards", max:"₹20,00,000", tenure:"15 years", elig:"Admission to recognized institution", docs:["Admission letter","Fee structure","Aadhaar + PAN (student + parent)","Mark sheets / ITR of co-borrower"], features:["Moratorium during course + 1 year","Covers tuition, hostel, books","Tax deduction u/s 80E","Overseas education covered"] },
    { icon:"💼", name:"Business Loan", rate:"11.00% p.a. onwards", max:"₹50,00,000", tenure:"7 years", elig:"Business vintage ≥ 2 years, turnover ≥ ₹20L", docs:["GST returns 2 years","ITR 2 years","Bank statement 12 months","Business proof / incorporation"], features:["Collateral-free up to ₹10L","Working capital & term loans","Current account integration","GST-based eligibility"] },
    { icon:"🚗", name:"Vehicle Loan", rate:"9.00% p.a. onwards", max:"₹15,00,000", tenure:"7 years", elig:"Salaried / Self-employed, 21–65 yrs", docs:["Aadhaar + PAN","Salary proof","Vehicle quotation / RC"], features:["100% on-road price (new)","Quick RC transfer assistance","500+ dealer tie-ups","Pre-approved for existing customers"] },
  ];

  return (
    <StaticLayout title="Loan Products" badge="Borrow" subtitle="Affordable loans for every need. Instant approvals, minimal documentation, competitive rates.">
      <div className="space-y-6">
        {products.map((p) => (
          <div key={p.name} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-3xl flex-none">{p.icon}</div>
                <div className="flex-1">
                  <h2 className="font-black text-slate-800 text-xl">{p.name}</h2>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm">
                    <span className="text-amber-600 font-bold">📈 {p.rate}</span>
                    <span className="text-slate-500">Max: <strong className="text-slate-700">{p.max}</strong></span>
                    <span className="text-slate-500">Tenure: <strong className="text-slate-700">{p.tenure}</strong></span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Eligibility: {p.elig}</p>
                </div>
                <button onClick={() => navigate("/signup")}
                  className="hidden sm:block bg-amber-500 text-slate-900 font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-amber-600 transition flex-none">
                  Apply Now
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Key Features</p>
                  <ul className="space-y-1.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="w-4 h-4 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-none text-[9px]"><i className="fas fa-check"/></span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Documents Required</p>
                  <ul className="space-y-1.5">
                    {p.docs.map((d) => (
                      <li key={d} className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="w-4 h-4 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center flex-none text-[9px]"><i className="fas fa-file"/></span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="bg-amber-50 border-t border-amber-100 px-6 py-3 flex items-center justify-between">
              <p className="text-xs text-amber-700"><i className="fas fa-bolt mr-1"/>Instant in-app approval · No branch visit required</p>
              <button onClick={() => navigate("/signup")} className="text-xs font-bold text-amber-600 hover:underline sm:hidden">Apply →</button>
            </div>
          </div>
        ))}
      </div>
    </StaticLayout>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ABOUT US
// ═══════════════════════════════════════════════════════════════════════════════
export function AboutPage() {
  const team = [
    { name:"Vinay Kumar", role:"Lead Developer & Full Stack Architect", init:"V", bg:"from-amber-500 to-yellow-400",  quote:"Engineering great banking experiences, one commit at a time." },
    { name:"Sriram",      role:"Frontend Engineer & UI/UX Lead",        init:"S", bg:"from-blue-500 to-blue-700",    quote:"Design is not just how it looks — it's how it works." },
    { name:"Nihar",       role:"Backend Engineer & API Architect",      init:"N", bg:"from-green-500 to-emerald-600",quote:"Robust systems are built with careful design and clean code." },
    { name:"Vikas",       role:"Database Engineer & DevOps Lead",       init:"V", bg:"from-purple-500 to-purple-700",quote:"Performance and reliability are features, not afterthoughts." },
    { name:"Sathwik",     role:"Security Engineer & QA Lead",           init:"S", bg:"from-red-500 to-rose-600",     quote:"Security is a journey, not a destination." },
  ];
  const milestones = [
    ["1975","Founded in Hyderabad as Alpha Cooperative Bank with a single branch."],
    ["1991","Converted to a commercial bank under the Banking Regulation Act."],
    ["2001","Launched internet banking — one of the first private banks in India."],
    ["2010","Crossed 1 Million customers. Expanded to 100 branches across India."],
    ["2016","Launched Alpha Pay mobile app. Integrated UPI on Day 1."],
    ["2020","Crossed 500 branches, 2 crore digital transactions per month."],
    ["2024","Launched AI-powered banking with AlphaBot. 2M+ active customers."],
  ];

  return (
    <StaticLayout title="About Alpha Bank" badge="Our Story" subtitle="50 years of trust, innovation, and financial inclusion. From a single branch in Hyderabad to a pan-India digital banking platform.">
      <Section icon="fa-university" title="Who We Are">
        <P>Alpha Bank (Alpha Financial Services Ltd.) is a full-service private sector bank regulated by the Reserve Bank of India. Established in 1975, we serve over 2 million customers across India through 500+ branches, 2,000+ ATMs, and our digital banking platform.</P>
        <P>We are committed to financial inclusion — bringing accessible, affordable banking to every Indian. From PMJDY savings accounts to MSME business loans, from UPI payments to AI-powered financial advice, we believe banking should work for everyone.</P>
      </Section>

      <Section icon="fa-chart-line" title="Our Journey">
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-amber-200"/>
          {milestones.map(([year, text], i) => (
            <div key={year} className="flex gap-6 mb-6 relative">
              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-none z-10 text-slate-900 font-black text-[10px]">{year.slice(2)}</div>
              <div className="flex-1 pb-2">
                <p className="font-bold text-amber-600 text-sm">{year}</p>
                <p className="text-sm text-slate-600 mt-0.5">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section icon="fa-users" title="Leadership Team">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.map((m) => (
            <div key={m.name} className="bg-slate-50 rounded-2xl p-4 text-center">
              <div className={`w-16 h-16 bg-gradient-to-br ${m.bg} rounded-full flex items-center justify-center text-white font-black text-2xl mx-auto mb-3`}>{m.init}</div>
              <p className="font-bold text-slate-800 text-sm">{m.name}</p>
              <p className="text-xs text-slate-400 mt-0.5 mb-3">{m.role}</p>
              <p className="text-xs text-slate-500 italic">"{m.quote}"</p>
            </div>
          ))}
        </div>
      </Section>

      <Section icon="fa-award" title="Awards & Recognitions">
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            ["Best Digital Bank 2023","IDRBT Banking Technology Excellence Awards"],
            ["Best UPI Participant 2022","NPCI Annual Awards"],
            ["Best Customer Service Bank","Banking Frontiers Finnoviti Awards 2023"],
            ["Top MSME Lender 2023","MSME Banking Excellence Awards"],
            ["ISO 27001 Certified","Information Security Management"],
            ["Great Place to Work 2023","Great Place to Work® India"],
          ].map(([award, body]) => (
            <div key={award} className="flex gap-3 bg-amber-50 rounded-xl p-3">
              <i className="fas fa-trophy text-amber-500 mt-0.5 flex-none text-sm"/>
              <div>
                <p className="font-bold text-slate-700 text-sm">{award}</p>
                <p className="text-xs text-slate-400">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </StaticLayout>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CYBER SECURITY
// ═══════════════════════════════════════════════════════════════════════════════
export function CyberSecurityPage() {
  return (
    <StaticLayout title="Cyber Security" badge="Stay Safe" subtitle="Protect yourself from online fraud. Learn how Alpha Bank keeps you safe and what you can do to protect your account.">
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {[["fa-shield-alt text-green-500","Bank-Grade Security","AES-256 + TLS 1.3"],["fa-eye-slash text-blue-500","Privacy First","SHA-256 password hashing"],["fa-bell text-amber-500","24/7 Monitoring","Real-time fraud alerts"],["fa-lock text-red-500","Zero Tolerance","Auto account lock on suspicious activity"]].map(([cls,l,v])=>(
          <div key={l} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex gap-4 items-center">
            <i className={`fas ${cls} text-3xl flex-none`}/>
            <div><p className="font-bold text-slate-700">{l}</p><p className="text-xs text-slate-400">{v}</p></div>
          </div>
        ))}
      </div>

      <Section icon="fa-shield-alt" title="How Alpha Bank Protects You">
        <ul className="space-y-3">
          {["All passwords are hashed with SHA-256 — even Alpha Bank employees cannot see your password.","All data in transit is encrypted with TLS 1.3 (the latest standard).","Sessions auto-expire after 30 minutes of inactivity.","Multiple failed login attempts trigger a temporary account lock.","Unusual login locations trigger additional verification.","All transactions are logged and monitored for anomalies 24/7.","Our infrastructure is ISO 27001 certified and PCI-DSS Level 1 compliant."].map((t) => (
            <li key={t} className="flex gap-3 text-sm text-slate-600">
              <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-none mt-0.5 text-[10px]"><i className="fas fa-check"/></span>
              {t}
            </li>
          ))}
        </ul>
      </Section>

      <Section icon="fa-user-shield" title="Protect Yourself — Do's and Don'ts">
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <p className="font-bold text-green-600 mb-3 flex items-center gap-2"><i className="fas fa-check-circle"/>DO</p>
            <ul className="space-y-2">
              {["Use a strong, unique password (8+ chars, uppercase, number)","Enable login notifications for all devices","Always log out after banking on shared devices","Verify the website URL starts with https://alphabank.in","Report suspicious activity immediately to 1800-123-4567","Keep your registered mobile number and email updated"].map((t)=><Li key={t}>{t}</Li>)}
            </ul>
          </div>
          <div>
            <p className="font-bold text-red-500 mb-3 flex items-center gap-2"><i className="fas fa-times-circle"/>DON'T</p>
            <ul className="space-y-2">
              {["Never share your password, OTP, or CVV with anyone — including Alpha Bank staff","Never click links in unsolicited emails or SMS claiming to be from Alpha Bank","Never install remote access apps like AnyDesk if asked by someone claiming to be from the bank","Never use banking apps on rooted or jailbroken devices","Don't save passwords in shared computers or public browsers","Never respond to calls asking to verify your account by providing personal details"].map((t)=><Li key={t}>{t}</Li>)}
            </ul>
          </div>
        </div>
      </Section>

      <Section icon="fa-exclamation-triangle" title="Common Frauds — Know Before You Lose">
        {[["Phishing","Fake emails / websites that mimic Alpha Bank to steal credentials.","Always type the URL directly. Check for the padlock icon. We never ask for your password via email."],["Vishing","Fraudulent phone calls claiming to be bank agents asking for OTP or card details.","Alpha Bank will NEVER ask for OTP or full card number over the phone."],["SIM Swap","Fraudsters port your mobile number to a new SIM to intercept OTPs.","Set a port block with your carrier. Monitor for sudden loss of network."],["UPI Fraud","Fake QR codes or collect requests disguised as refunds or rewards.","You never need to enter a PIN to RECEIVE money. Scan only trusted QR codes."]].map(([title,desc,tip])=>(
          <div key={title} className="mb-4 border border-slate-100 rounded-xl p-4">
            <p className="font-bold text-slate-800 text-sm mb-1"><i className="fas fa-exclamation-circle text-red-500 mr-2"/>{title}</p>
            <p className="text-xs text-slate-500 mb-2">{desc}</p>
            <p className="text-xs bg-green-50 text-green-700 p-2 rounded-lg"><i className="fas fa-lightbulb mr-1"/>Tip: {tip}</p>
          </div>
        ))}
      </Section>

      <Section icon="fa-phone-alt" title="Report Fraud Immediately">
        <div className="grid sm:grid-cols-3 gap-4">
          {[["fa-phone","Fraud Helpline","1800-123-FRAUD (37283)\n24/7 · Toll Free"],["fa-envelope","Email","fraud@alphabank.in\nResponse within 2 hours"],["fa-map-marker","Nearest Branch","Visit any Alpha Bank branch\nwith valid ID proof"]].map(([icon,title,desc])=>(
            <div key={title} className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
              <i className={`fas ${icon} text-red-500 text-2xl mb-2`}/>
              <p className="font-bold text-slate-700 text-sm">{title}</p>
              <p className="text-xs text-slate-500 mt-1 whitespace-pre-line">{desc}</p>
            </div>
          ))}
        </div>
      </Section>
    </StaticLayout>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RBI GUIDELINES
// ═══════════════════════════════════════════════════════════════════════════════
export function RBIGuidelinesPage() {
  return (
    <StaticLayout title="RBI Guidelines & Compliance" badge="Regulatory" subtitle="Alpha Bank operates in full compliance with Reserve Bank of India guidelines and directives.">
      <Section icon="fa-university" title="Our Regulatory Status">
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          {[["RBI License No.","INB200001234"],["CIN","U65110MH1975PLC012345"],["BSR Code","0001234"],["SWIFT Code","ALPHINBBXXX"]].map(([k,v])=>(
            <div key={k} className="bg-amber-50 rounded-xl p-4">
              <p className="text-xs text-slate-400">{k}</p>
              <p className="font-bold font-mono text-slate-800">{v}</p>
            </div>
          ))}
        </div>
        <P>Alpha Bank is licensed by the Reserve Bank of India under Section 22 of the Banking Regulation Act, 1949. We are a Scheduled Commercial Bank listed in the Second Schedule of the RBI Act, 1934.</P>
      </Section>

      <Section icon="fa-list-check" title="Applicable RBI Regulations">
        {[["Banking Regulation Act 1949","Governs licensing, operations, and supervision of commercial banks.","Active"],["RBI KYC Master Directions 2016","Governs Know Your Customer (KYC), AML, and CFT procedures.","Active"],["PMLA 2002","Prevention of Money Laundering Act — mandatory reporting obligations.","Active"],["Payment and Settlement Systems Act 2007","Governs UPI, NEFT, RTGS, and digital payment systems.","Active"],["DPDP Act 2023","Digital Personal Data Protection Act — data handling and privacy.","Active"],["RBI Fair Practices Code","Ensures transparent, ethical lending and banking practices.","Active"],["Basel III Framework","Capital adequacy and risk management standards.","Active"],["SARFAESI Act 2002","Governs recovery of non-performing assets (NPAs).","Active"]].map(([name,desc,status])=>(
          <div key={name} className="flex gap-4 p-4 border border-slate-100 rounded-xl mb-3">
            <div className="flex-1">
              <p className="font-bold text-slate-800 text-sm">{name}</p>
              <p className="text-xs text-slate-500 mt-1">{desc}</p>
            </div>
            <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full h-fit flex-none">{status}</span>
          </div>
        ))}
      </Section>

      <Section icon="fa-file-alt" title="Important RBI Circulars">
        <P>Alpha Bank follows all RBI master circulars and directives. Key circulars currently in effect:</P>
        <ul className="space-y-2">
          {["RBI/2023-24/01 — Interest Rate Policy and Repo Rate","RBI/2023-24/45 — UPI Lite and Offline Transactions","RBI/2023-24/89 — Digital Lending Guidelines","RBI/2022-23/156 — Customer Service in Banks","RBI/2023-24/102 — Cyber Security Framework for Banks"].map((c)=>(
            <Li key={c}>{c}</Li>
          ))}
        </ul>
      </Section>

      <Section icon="fa-balance-scale" title="Grievance Redressal — RBI Banking Ombudsman">
        <P>If your complaint is not resolved by Alpha Bank within 30 days, you may escalate to the RBI Banking Ombudsman:</P>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-2">
          <p className="font-bold text-blue-800 mb-2">RBI Integrated Ombudsman Scheme 2021</p>
          <p className="text-sm text-blue-700">Portal: <strong>cms.rbi.org.in</strong></p>
          <p className="text-sm text-blue-700">Email: <strong>crpc@rbi.org.in</strong></p>
          <p className="text-sm text-blue-700">Toll Free: <strong>14448</strong> (9 AM – 5 PM, Mon–Fri)</p>
        </div>
      </Section>
    </StaticLayout>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELP CENTRE
// ═══════════════════════════════════════════════════════════════════════════════
export function HelpCentrePage() {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q:"How do I reset my password?", a:"Go to Settings → Security & Preferences → Change Password. Enter your new password (min 8 chars, 1 uppercase, 1 number). You do not need your old password — it is updated after verification." },
    { q:"My transfer failed — is my money safe?", a:"Yes. If a transfer fails, the amount is instantly reversed to your wallet. You can verify in your transaction history. If the reversal does not appear within 1 hour, call our 24/7 helpline 1800-123-4567." },
    { q:"How do I add money to my wallet?", a:"From the Dashboard, click 'Add Money' (the + button on the balance card or in Quick Actions). Enter the amount, select a quick preset or type a custom amount, and confirm." },
    { q:"What is the daily transfer limit?", a:"IMPS: ₹5,00,000/day. NEFT: ₹10,00,000/day. RTGS: ₹50,00,000/day (minimum ₹2,00,000). Limits can be increased for Gold or Platinum tier customers." },
    { q:"How do I apply for a loan?", a:"Navigate to the Loans tab, select a product, enter the desired amount, review the EMI preview, and click 'Get Instant Credit'. The amount is credited to your wallet immediately." },
    { q:"Can I change my username?", a:"Usernames cannot be changed after account creation as they form your UPI ID (username@alpha). You can add a Display Name in Settings → Profile." },
    { q:"What happens if my session expires?", a:"Sessions auto-expire after 30 minutes of inactivity for security. You will be redirected to the login page. Your data is fully safe — simply log back in." },
    { q:"How do I export my bank statement?", a:"Dashboard → Transaction History → 'Export CSV' button. Or go to Settings → Export Statement. The file downloads instantly to your device." },
    { q:"What is AlphaBot?", a:"AlphaBot is our AI-powered banking assistant, available 24/7 via the chat bubble on any page inside the app. It can answer questions about your account, explain products, calculate EMIs, and more. It uses Google Gemini AI." },
    { q:"How do I delete my account?", a:"Go to Settings → Security & Preferences → Danger Zone → Delete Account. You will be shown a confirmation screen. Note: deletion is permanent and all data is removed." },
  ];

  return (
    <StaticLayout title="Help Centre" badge="Support" subtitle="Find answers to common questions or reach our support team 24/7.">
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[["fa-phone text-green-500","Call Us","1800-123-4567\n24/7 Toll Free"],["fa-envelope text-blue-500","Email","support@alphabank.in\nReply within 2 hrs"],["fa-comments text-amber-500","AlphaBot","Available 24/7\nIn-app AI assistant"]].map(([cls,l,v])=>(
          <div key={l} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center">
            <i className={`fas ${cls} text-3xl mb-3`}/><p className="font-bold text-slate-700">{l}</p>
            <p className="text-xs text-slate-400 mt-1 whitespace-pre-line">{v}</p>
          </div>
        ))}
      </div>

      <Section icon="fa-question-circle" title="Frequently Asked Questions">
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="border border-slate-100 rounded-xl overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex justify-between items-center p-4 font-semibold text-slate-700 text-sm text-left gap-4 hover:bg-slate-50 transition">
                {f.q}
                <i className={`fas fa-chevron-down text-slate-400 transition-transform flex-none text-xs ${open === i ? "rotate-180" : ""}`}/>
              </button>
              {open === i && <p className="px-4 pb-4 text-xs text-slate-500 leading-relaxed border-t border-slate-50 pt-3">{f.a}</p>}
            </div>
          ))}
        </div>
      </Section>
    </StaticLayout>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTACT US
// ═══════════════════════════════════════════════════════════════════════════════
export function ContactPage() {
  return (
    <StaticLayout title="Contact Us" badge="Get in Touch" subtitle="We're available 24/7 by phone, email, and chat. For urgent matters, always call our toll-free helpline.">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[["fa-phone-alt bg-green-100 text-green-600","Toll Free","1800-123-4567","24/7 · Hindi & English"],["fa-headset bg-blue-100 text-blue-600","Priority (Gold+)","1800-123-4568","24/7 · Dedicated line"],["fa-envelope bg-amber-100 text-amber-600","Email","support@alphabank.in","Reply in 2 hours"],["fa-comments bg-purple-100 text-purple-600","AlphaBot","In-app chat","Available now"]].map(([cls,l,v,sub])=>(
          <div key={l} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center">
            <div className={`w-12 h-12 ${cls.split(" ").slice(1).join(" ")} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
              <i className={`fas ${cls.split(" ")[0]} text-xl`}/>
            </div>
            <p className="font-bold text-slate-700 text-sm">{l}</p>
            <p className="font-mono text-xs text-amber-600 mt-1 font-bold">{v}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Section icon="fa-map-marker-alt" title="Head Office">
          <P><strong>Alpha Tower, Financial District</strong><br/>Hyderabad — 500032, Telangana, India</P>
          <P>Mon–Sat: 10:00 AM – 6:00 PM<br/>Sunday: Closed (Digital services available 24/7)</P>
          <div className="bg-slate-100 rounded-xl h-32 flex items-center justify-center mt-3">
            <p className="text-slate-400 text-sm"><i className="fas fa-map mr-2"/>Financial District, Hyderabad</p>
          </div>
        </Section>
        <Section icon="fa-building" title="Regional Offices">
          {[["Delhi","101, Connaught Place, New Delhi — 110001","011-6789-0001"],["Bengaluru","MG Road, Bengaluru — 560001","080-6789-0002"],["Chennai","Anna Salai, Chennai — 600002","044-6789-0003"],["Kolkata","Park Street, Kolkata — 700016","033-6789-0004"],["Hyderabad","Hitech City, Hyderabad — 500081","040-6789-0005"]].map(([city,addr,ph])=>(
            <div key={city} className="mb-3 pb-3 border-b border-slate-100 last:border-0 last:mb-0">
              <p className="font-bold text-slate-700 text-sm">{city}</p>
              <p className="text-xs text-slate-400">{addr}</p>
              <p className="text-xs text-amber-600 font-mono">{ph}</p>
            </div>
          ))}
        </Section>
      </div>
    </StaticLayout>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GRIEVANCE REDRESSAL
// ═══════════════════════════════════════════════════════════════════════════════
export function GrievancePage() {
  return (
    <StaticLayout title="Grievance Redressal" badge="Complaints" subtitle="Alpha Bank is committed to resolving all customer grievances promptly and fairly. We follow RBI's Integrated Ombudsman Scheme.">
      <Section icon="fa-layer-group" title="3-Level Escalation Process">
        <div className="space-y-4">
          {[
            { level:"Level 1", title:"Branch / Customer Care", time:"Within 3 working days", contacts:["Call: 1800-123-4567","Email: support@alphabank.in","Visit nearest branch with ID proof"] },
            { level:"Level 2", title:"Grievance Officer", time:"Within 15 working days", contacts:["Email: grievance@alphabank.in","Write to: Grievance Officer, Alpha Bank, Alpha Tower, Financial District, Hyderabad 400051","Phone: 040-2356-0010 (Mon–Fri, 10am–5pm)"] },
            { level:"Level 3", title:"RBI Ombudsman", time:"If unresolved in 30 days", contacts:["Portal: cms.rbi.org.in","Email: crpc@rbi.org.in","Toll Free: 14448"] },
          ].map((l, i) => (
            <div key={l.level} className={`flex gap-4 p-5 rounded-2xl border-2 ${i === 0 ? "border-green-200 bg-green-50" : i === 1 ? "border-amber-200 bg-amber-50" : "border-blue-200 bg-blue-50"}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white flex-none ${i === 0 ? "bg-green-500" : i === 1 ? "bg-amber-500" : "bg-blue-500"}`}>{i + 1}</div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{l.level}</p>
                <p className="font-bold text-slate-800">{l.title}</p>
                <p className="text-xs text-slate-500 mb-2">Resolution time: <strong>{l.time}</strong></p>
                <ul className="space-y-1">
                  {l.contacts.map((c) => <li key={c} className="text-xs text-slate-600 flex items-center gap-2"><i className="fas fa-chevron-right text-[8px] text-slate-400"/>{c}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section icon="fa-user-tie" title="Grievance Officers">
        {[["Ramesh Iyer","Principal Nodal Officer","nodal@alphabank.in","040-2356-0010","Head Office — Alpha Tower, Financial District, Hyderabad"],["Deepa Sharma","Nodal Officer — South Zone","nodal.south@alphabank.in","080-6789-0099","MG Road, Bengaluru"]].map((o)=>(
          <div key={o[0]} className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="font-bold text-slate-800">{o[0]}</p>
            <p className="text-xs text-amber-600 font-semibold mb-2">{o[1]}</p>
            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
              <span><i className="fas fa-envelope mr-1"/>{o[2]}</span>
              <span><i className="fas fa-phone mr-1"/>{o[3]}</span>
              <span><i className="fas fa-map-marker-alt mr-1"/>{o[4]}</span>
            </div>
          </div>
        ))}
      </Section>
    </StaticLayout>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BRANCH LOCATOR
// ═══════════════════════════════════════════════════════════════════════════════
export function BranchLocatorPage() {
  const [search, setSearch] = useState("");
  const branches = [
    { city:"Hyderabad", area:"Financial District",     addr:"Alpha Tower, Financial District, Nanakramguda, Hyderabad — 500032", ph:"040-6001-0001", atm:true, locker:true  },
    { city:"Hyderabad", area:"Banjara Hills",          addr:"Road No. 12, Banjara Hills, Hyderabad — 500034", ph:"040-6001-0002", atm:true, locker:false },
    { city:"Delhi",     area:"Connaught Place",       addr:"101, Inner Circle, New Delhi — 110001",        ph:"011-6001-0001", atm:true,  locker:true  },
    { city:"Delhi",     area:"Dwarka",                addr:"Sector 10, Dwarka, New Delhi — 110075",        ph:"011-6001-0002", atm:true,  locker:false },
    { city:"Bengaluru", area:"MG Road",               addr:"Brigade Road, Bengaluru — 560001",             ph:"080-6001-0001", atm:true,  locker:true  },
    { city:"Bengaluru", area:"Whitefield",            addr:"ITPL Road, Whitefield, Bengaluru — 560066",   ph:"080-6001-0002", atm:true,  locker:false },
    { city:"Hyderabad", area:"Hitech City",           addr:"Cyber Towers, Hitech City, Hyderabad — 500081",ph:"040-6001-0001", atm:true,  locker:true  },
    { city:"Chennai",   area:"Anna Salai",            addr:"Anna Salai, Chennai — 600002",                 ph:"044-6001-0001", atm:true,  locker:false },
    { city:"Kolkata",   area:"Park Street",           addr:"Park Street, Kolkata — 700016",                ph:"033-6001-0001", atm:true,  locker:false },
    { city:"Pune",      area:"FC Road",               addr:"Fergusson College Road, Pune — 411004",        ph:"020-6001-0001", atm:true,  locker:true  },
  ];
  const filtered = branches.filter((b) => !search || b.city.toLowerCase().includes(search.toLowerCase()) || b.area.toLowerCase().includes(search.toLowerCase()));

  return (
    <StaticLayout title="Branch & ATM Locator" badge="Find Us" subtitle="500+ branches and 2,000+ ATMs across India. Open Mon–Sat 10am–4pm.">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6">
        <div className="relative">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by city or area (e.g. Hyderabad, Bengaluru)…"
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-amber-400 outline-none transition"/>
        </div>
        <p className="text-xs text-slate-400 mt-2">{filtered.length} branch{filtered.length !== 1 ? "es" : ""} found</p>
      </div>

      <div className="space-y-4">
        {filtered.map((b, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-none">
              <i className="fas fa-university text-amber-600"/>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-800">{b.city} — {b.area}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{b.addr}</p>
                  <p className="text-xs text-amber-600 font-mono mt-1">{b.ph}</p>
                </div>
                <div className="flex flex-col gap-1.5 flex-none">
                  {b.atm && <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">ATM</span>}
                  {b.locker && <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Locker</span>}
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                <i className="fas fa-clock text-amber-400"/>Mon–Fri: 10am–4pm · Sat: 10am–2pm · 24/7 ATM
              </p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <i className="fas fa-map-marker-alt text-3xl mb-3 block opacity-40"/>
            <p className="font-medium">No branches found for "{search}"</p>
            <p className="text-xs mt-1">Try a different city name</p>
          </div>
        )}
      </div>
    </StaticLayout>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INSURANCE
// ═══════════════════════════════════════════════════════════════════════════════
export function InsurancePage() {
  const navigate = useNavigate();
  const products = [
    {
      icon: "❤️", name: "Life Insurance",
      types: ["Term Life Plan — from ₹299/month", "Whole Life Plan", "ULIP (Unit Linked)", "Endowment Plan"],
      coverage: "Up to ₹5 Crore",
      highlight: "Tax benefit u/s 80C & 10(10D)",
      color: "from-red-500 to-rose-600",
    },
    {
      icon: "🏥", name: "Health Insurance",
      types: ["Individual Plan", "Family Floater", "Senior Citizen Plan", "Critical Illness Cover"],
      coverage: "Up to ₹1 Crore",
      highlight: "Cashless at 10,000+ hospitals",
      color: "from-blue-500 to-blue-700",
    },
    {
      icon: "🚗", name: "Motor Insurance",
      types: ["Third Party (mandatory)", "Comprehensive Cover", "Zero Depreciation Add-on", "Engine Protect Add-on"],
      coverage: "As per IDV",
      highlight: "Instant policy, garage network 4,000+",
      color: "from-amber-500 to-orange-600",
    },
    {
      icon: "🏠", name: "Home Insurance",
      types: ["Structure Cover", "Contents Cover", "Comprehensive Home Shield", "Tenant Insurance"],
      coverage: "Up to ₹2 Crore",
      highlight: "Covers natural disasters & theft",
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: "✈️", name: "Travel Insurance",
      types: ["Single Trip", "Annual Multi-Trip", "Student Abroad", "Senior Citizen Travel"],
      coverage: "Up to $5,00,000",
      highlight: "Medical evacuation included",
      color: "from-purple-500 to-violet-600",
    },
    {
      icon: "💼", name: "Business Insurance",
      types: ["Shopkeeper Policy", "Office Package Policy", "Marine Cargo", "Professional Indemnity"],
      coverage: "Custom",
      highlight: "Protects against business risks",
      color: "from-teal-500 to-teal-700",
    },
  ];

  return (
    <StaticLayout title="Insurance" badge="Protect What Matters" subtitle="Comprehensive insurance products across life, health, motor, home, and travel. Compare and buy in minutes.">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {products.map((p) => (
          <div key={p.name} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all group">
            <div className={`bg-gradient-to-br ${p.color} p-6 text-white`}>
              <div className="text-4xl mb-2">{p.icon}</div>
              <h2 className="font-black text-xl">{p.name}</h2>
              <p className="text-white/80 text-xs mt-1">Coverage: <strong className="text-white">{p.coverage}</strong></p>
            </div>
            <div className="p-5">
              <p className="text-xs text-green-600 font-bold mb-3 flex items-center gap-1.5">
                <i className="fas fa-check-circle" />{p.highlight}
              </p>
              <ul className="space-y-1.5 mb-4">
                {p.types.map((t) => (
                  <li key={t} className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full flex-none" />{t}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate("/signup")}
                className={`w-full py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r ${p.color} hover:opacity-90 transition active:scale-95`}>
                Get Quote →
              </button>
            </div>
          </div>
        ))}
      </div>

      <Section icon="fa-info-circle" title="Why Buy Insurance Through Alpha Bank?">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            ["fa-bolt text-amber-500",     "Instant Issuance", "Policy documents emailed instantly. No paperwork, no branch visit."],
            ["fa-hospital text-blue-500",  "Cashless Claims",  "10,000+ network hospitals for health insurance cashless treatment."],
            ["fa-headset text-green-500",  "24/7 Claim Support","Dedicated claim support team available round the clock."],
          ].map(([cls, title, desc]) => (
            <div key={title} className="bg-slate-50 rounded-xl p-4 text-center">
              <i className={`fas ${cls} text-3xl mb-3 block`} />
              <p className="font-bold text-slate-700 text-sm mb-1">{title}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section icon="fa-phone" title="Get in Touch">
        <P>Our insurance advisors are available Mon–Sat, 9 AM to 6 PM.</P>
        <div className="flex flex-wrap gap-4 mt-3">
          <a href="tel:18001234569" className="flex items-center gap-2 text-sm font-bold text-amber-600 hover:underline">
            <i className="fas fa-phone" />1800-123-4569 (Insurance Helpline)
          </a>
          <a href="mailto:insurance@alphabank.in" className="flex items-center gap-2 text-sm font-bold text-amber-600 hover:underline">
            <i className="fas fa-envelope" />insurance@alphabank.in
          </a>
        </div>
      </Section>
    </StaticLayout>
  );
}
