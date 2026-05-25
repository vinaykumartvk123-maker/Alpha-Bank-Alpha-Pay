import{u as L,a as M,e as B,r as p,j as e,b as R,N as $,f as D,P as F,O as G}from"./index-Cbt3XjMn.js";import{M as H}from"./MarketTicker-DYgbUXtQ.js";import{g as O}from"./helpers-C_H-di8b.js";const d={greet:a=>`Hello **${a}**! 👋 I'm AlphaBot, your 24/7 AI banking assistant.

I can help you with:
- 💰 Account balance & transactions
- 🏦 Loans, EMI calculations
- 💱 Live currency exchange rates
- 🎁 Rewards & cashback
- 💳 Cards & UPI
- 🔒 Security & account management
- 📊 Investments & SIP
- 🧾 Bills & services

What can I help you with today?`,balance:(a,t)=>`Your current **Alpha Pay** balance is:

## ₹${a.toLocaleString("en-IN",{minimumFractionDigits:2})}

Tier: ${t.icon} **${t.name}**

**Quick actions:**
- To add money → Request a deposit from Dashboard
- To send money → Go to Transfer tab
- To view history → Dashboard → Transactions`,transfer:`**How to send money on Alpha Pay:**

1. Go to the **Transfer** tab
2. Enter the recipient's username (e.g. \`john\`)
3. Select transfer mode:
   - ⚡ **IMPS** — Instant, 24/7, free, up to ₹5L
   - 📅 **NEFT** — Batched, free, 2–4 hours, up to ₹10L
   - 🏦 **RTGS** — High value, ₹25 fee, 30 min, up to ₹50L
4. Enter amount
5. Authenticate with your **6-digit UPI PIN**

💡 **Earn 0.5% cashback** on every transfer!`,upi:a=>`**Your UPI Details:**

- UPI ID: \`${a}\`
- All Alpha Pay users can pay/receive via their username@alpha ID
- You can share this with anyone to receive instant payments

**UPI PIN:**
- Required for all outgoing transfers
- Set/change from **Settings → Security**
- 6-digit encrypted PIN

**Tip:** Never share your UPI PIN with anyone — not even Alpha Bank staff! 🔒`,loans:`**Alpha Bank Loan Products:**

| Product | Rate | Max Amount | Tenure |
|---|---|---|---|
| 👤 Personal Loan | 10.5% p.a. | ₹5,00,000 | 60 months |
| 🪙 Gold Loan | 8.5% p.a. | ₹10,00,000 | 24 months |
| 🏠 Home Loan | 8.35% p.a. | ₹50,00,000 | 360 months |
| 🎓 Education Loan | 9.5% p.a. | ₹3,00,000 | 180 months |
| 💼 Business Loan | 11% p.a. | ₹8,00,000 | 84 months |
| 🚗 Vehicle Loan | 9% p.a. | ₹4,00,000 | 84 months |

**Apply:** Go to **Loans** tab → Select product → Submit application

⏳ Admin reviews and approves within 24 hours. Funds credited directly to your wallet.`,emi:(a,t,s)=>{const n=t/100/12,i=n>0?a*n*Math.pow(1+n,s)/(Math.pow(1+n,s)-1):a/s,l=i*s,c=l-a;return`**EMI Calculation:**

- Principal: ₹${a.toLocaleString("en-IN")}
- Rate: ${t}% p.a.
- Tenure: ${s} months

## Monthly EMI: ₹${Math.round(i).toLocaleString("en-IN")}

- Total Payable: ₹${Math.round(l).toLocaleString("en-IN")}
- Total Interest: ₹${Math.round(c).toLocaleString("en-IN")}
- Interest to Principal: ${(c/a*100).toFixed(1)}%`},deposit:`**How to add money to your Alpha Pay wallet:**

1. Go to **Dashboard** → Click **Add Money**
2. Select payment method:
   - 📲 UPI
   - 🌐 Net Banking
   - 🏦 NEFT/RTGS
3. Enter the amount (minimum ₹100)
4. Submit your deposit request

⏳ Admin will review and credit your account within **24 hours**.

You'll receive a **notification** once credited. Check your balance on the Dashboard.`,rewards:(a,t,s)=>`**Your Rewards Summary:**

- Total Cashback Earned: **₹${a.toFixed(2)}**
- Current Tier: **${t.icon} ${t.name}**
- Total Transactions: **${s}**

**How to earn more:**
- 💸 Transfers → **0.5% cashback** on every send
- 🧾 Bill payments → **1% cashback**
- 📈 SIP investments → Special rewards
- 🃏 Scratch cards → Open in Rewards tab

**Tier Benefits:**
- 🥉 Bronze (0–9 txns): Basic rewards
- 🥈 Silver (10–19 txns): Priority support
- 🥇 Gold (20–49 txns): Enhanced cashback
- 💎 Platinum (50+ txns): Premium benefits`,fd:`**Fixed Deposit (FD) Rates:**

| Tenure | Rate p.a. |
|---|---|
| 3 months | 4.75% |
| 6 months | 5.50% |
| 1 year | 7.00% |
| 2 years | 7.10% |
| 3 years | 7.25% |
| 5 years | 7.20% |
| 10 years (Tax Saver) | 7.00% |

- Senior citizens get an **additional 0.50%**
- Premature closure: **1% penalty** on applicable rate
- Tax Saver FD: Tax deduction u/s **80C**

**Apply:** SIP tab → FD & RD`,rd:`**Recurring Deposit (RD):**

- Interest rate: **7.00% p.a.**
- Minimum monthly instalment: **₹1,000**
- Tenures: 3 months to 10 years
- Quarterly compounding

**Benefits:**
- Builds savings discipline
- Guaranteed returns
- No market risk

**Apply:** SIP tab → FD & RD`,sip:`**SIP (Systematic Investment Plan):**

 Available investment plans:

- 📈 **Alpha Growth Fund** — 12–15% p.a. · Medium risk · Min ₹500/mo
- 🔒 **Alpha Secure FD** — 7.25% p.a. · Low risk · Min ₹10,000
- 📊 **Alpha Index Fund** — 13–18% p.a. · Medium risk · Min ₹5,000
- 💧 **Alpha Liquid Fund** — 6–7% p.a. · Low risk · Min ₹1,000/mo
- 🛡️ **Alpha ELSS Fund** — 14–18% p.a. · High risk · Tax saving u/s 80C

**Go to:** SIP tab → Invest Now or Calculator`,kyc:`**KYC (Know Your Customer) Verification:**

**Required documents:**
1. 🪪 Aadhaar Card (12-digit number)
2. 🗂️ PAN Card (10-character number)
3. 🤳 Selfie (liveness check)

**Benefits of completing KYC:**
- ✅ Higher transfer limits
- ✅ Loan eligibility
- ✅ Full banking features
- ✅ RBI compliance

**Complete KYC:** Services tab → KYC`,security:`**Account Security — Best Practices:**

**✅ Always do:**
- Use a strong password (8+ chars, uppercase, number)
- Set your **UPI PIN** before transferring
- Log out after using on shared devices
- Enable privacy mode if on public device

**❌ Never do:**
- Share OTP, UPI PIN, or password with anyone
- Not even Alpha Bank staff will ask for these!
- Click links in suspicious emails/SMS claiming to be Alpha Bank
- Use banking apps on rooted/jailbroken devices

**If suspicious activity detected:**
📞 **1800-123-4567** (24/7 Fraud Helpline)
📧 **fraud@alphabank.in**`,password:`**Change your login password:**

1. Go to **Settings** tab
2. Scroll to **Change Login Password**
3. Enter new password *(min 8 chars, 1 uppercase, 1 number)*
4. Click **Change Password**

**Reset UPI PIN:**
1. Settings → Security
2. Click **Change PIN** or **Set UPI PIN**
3. Enter your 6-digit PIN twice to confirm

🔒 Both are stored as one-way SHA-256 hashes — we cannot read them.`,bills:`**Pay Bills & Recharges:**

Go to **Services** tab to pay:
- ⚡ Electricity (MSEB, BESCOM, TNEB, WBSEDCL)
- 📱 Mobile Recharge (Jio, Airtel, Vi, BSNL)
- 📺 DTH/Cable (Tata Play, Airtel DTH, DishTV)
- 🔥 Piped Gas (MGL, IGL, GAIL)
- 💧 Water bills
- 🌐 Broadband (BSNL, Airtel, Jio Fiber, ACT)
- 💳 Credit Card payments
- 🛣️ FASTag recharge

💡 **Earn 1% cashback** on all bill payments!`,scheduled:`**Scheduled/Auto Payments:**

Set up recurring payments for:
- Monthly electricity, gas, water bills
- Mobile recharges
- Credit card payments
- Any recurring expense

**How to set up:**
Services tab → Auto-Pay → Add Schedule
- Choose the category, amount, and day of month
- Toggle on/off anytime
- Never miss a bill payment again!`,wallet:a=>`**Multi-Currency Wallet:**

You can hold and convert between:
- 🇮🇳 **INR** (Indian Rupee) — Primary wallet
- 🇺🇸 **USD** → ₹${a.USD.toFixed(2)} today
- 🇪🇺 **EUR** → ₹${a.EUR.toFixed(2)} today
- 🇬🇧 **GBP** → ₹${a.GBP.toFixed(2)} today

**Convert currencies:**
Wallet tab → Exchange

**View Insights:**
Wallet tab → Insights (monthly spending charts)`,credit:(a,t)=>{const s=Math.min(900,650+Math.min(a*3,60)+(t>1e4?30:0)+80),n=s>=750?"Excellent 🟢":s>=700?"Good 🔵":"Fair 🟡";return`**Your Estimated Credit Score:**

## ${s}/900 — ${n}

**Score ranges:**
- 750–900: Excellent (best loan rates)
- 700–749: Good
- 650–699: Fair
- 550–649: Average
- 300–549: Poor

**Improve your score:**
- ✅ Make more transactions
- ✅ Pay loans/EMIs on time
- ✅ Maintain higher balance
- ✅ Complete KYC verification

View in **Settings** tab.`},insurance:`**Alpha Bank Insurance Products:**

- ❤️ **Life Insurance** — From ₹299/month · Up to ₹5 Crore
- 🏥 **Health Insurance** — Up to ₹1 Crore · 10,000+ hospitals
- 🚗 **Motor Insurance** — Third party & comprehensive
- 🏠 **Home Insurance** — Structure & contents cover
- ✈️ **Travel Insurance** — Single trip & annual plans
- 💼 **Business Insurance** — Shopkeeper, office, marine

**Apply:** Submit a request from the **Insurance** page.
Admin will review and activate your policy within 24 hours.`,accountDetails:a=>`**Your Account Details:**

- Account Number: \`${a.accountNumber||"N/A"}\`
- IFSC Code: \`${a.ifscCode||"N/A"}\`
- UPI ID: \`${a.upiId||a.username+"@alpha"}\`
- Account Type: Savings
- Bank: Alpha Bank, ${a.joinDate?"since "+a.joinDate:""}
- Branch: Financial District, Hyderabad

💡 Use your Account Number + IFSC for NEFT/RTGS transfers from other banks.`,about:`**About Alpha Bank:**

- 🏦 Founded: 1975, Hyderabad
- 🏛️ Type: RBI-regulated private commercial bank
- 👥 Customers: 2M+ across India
- 🏢 Branches: 500+, ATMs: 2,000+
- 🤖 AI-powered digital banking since 2024

**Regulatory credentials:**
- ✅ RBI License (Banking Regulation Act 1949)
- ✅ DICGC Insured (up to ₹5 Lakhs per depositor)
- ✅ ISO 27001 Certified
- ✅ PCI-DSS Compliant
- ✅ DPDP Act 2023 Compliant

**Contact:**
📞 1800-123-4567 (24/7)
📧 support@alphabank.in
📍 Alpha Tower, Financial District, Hyderabad`,charges:`**Alpha Bank Service Charges:**

| Service | Charge |
|---|---|
| IMPS Transfer | Free |
| NEFT Transfer | Free |
| RTGS Transfer | ₹25–₹50 |
| ATM (Alpha ATMs) | Free |
| ATM (Other banks, >5/mo) | ₹21 + GST |
| Debit Card Annual | ₹200 + GST |
| Statement Download | Free |
| Cheque Book (25 leaves) | Free (1/quarter) |

**Interest Rates:**
- Savings Account: 3.5–6% p.a.
- FD: up to 7.25% p.a.
- Home Loan: from 8.35% p.a.
- Personal Loan: from 10.5% p.a.`};function Y(a){const t=a.toLowerCase(),s=t.match(/(?:emi|calculate|loan).+?(\d[\d,]*)\s*(?:lakhs?|lakh|l|₹)?\s*(?:at|@)?\s*(\d+(?:\.\d+)?)\s*%?\s*(?:for|over)?\s*(\d+)\s*(?:months?|years?)?/);if(s){let[,n,i,l]=s;if(n=parseFloat(n.replace(/,/g,"")),(t.includes("lakh")||t.includes("l"))&&(n*=1e5),i=parseFloat(i),l=parseInt(l),t.includes("year")&&(l*=12),n>0&&i>0&&l>0)return{type:"emi",p:n,r:i,n:l}}return/(hi|hello|hey|namaste|hlo|good morn|good eve|good after|good night|what can you|how can you|who are you|what are you)/.test(t)?{type:"greet"}:/(balance|how much|my money|funds|wallet amount|check balance)/.test(t)?{type:"balance"}:/(send|transfer|pay someone|pay to|upi transfer|imps|neft|rtgs)/.test(t)&&!/(bill|electric|gas|mobile recharge|broadband|fasttag|dth)/.test(t)?{type:"transfer"}:/(upi id|upi pin|qr code|receive money|scan|upi setup)/.test(t)?{type:"upi"}:/(loan|borrow|credit|emi|personal loan|gold loan|home loan|education loan|vehicle loan|business loan)/.test(t)&&!/(pay emi|emi due)/.test(t)?{type:"loans"}:/(add money|deposit|fund|top up|add fund|add cash|how to add)/.test(t)?{type:"deposit"}:/(reward|cashback|scratch|points|tier|bonus|earn more)/.test(t)?{type:"rewards"}:/(fd|fixed deposit|recurring deposit|rd|maturity|interest rate.*deposit)/.test(t)&&!/(loan)/.test(t)?{type:t.includes("rd")||t.includes("recurring")?"rd":"fd"}:/(sip|mutual fund|invest|portfolio|index fund|elss|lumpsum|swp)/.test(t)?{type:"sip"}:/(kyc|aadhaar|pan card|verification|verify account|identity)/.test(t)?{type:"kyc"}:/(security|fraud|scam|safe|hack|phish|suspicious|protect|otp fraud)/.test(t)?{type:"security"}:/(password|pin|reset|forgot|change pass|update pass|login issue)/.test(t)?{type:"password"}:/(bill|electricity|mobile recharge|dth|gas bill|water bill|broadband|credit card bill|fasttag)/.test(t)?{type:"bills"}:/(auto pay|scheduled|recurring pay|standing order|autopay)/.test(t)?{type:"scheduled"}:/(wallet|currency|usd|eur|gbp|forex|exchange rate|convert|foreign)/.test(t)?{type:"wallet"}:/(credit score|cibil|experian|score|creditworthiness)/.test(t)?{type:"credit"}:/(insurance|life insurance|health insurance|motor|car insurance|home insur|travel insurance)/.test(t)?{type:"insurance"}:/(account number|ifsc|sort code|account detail|my account)/.test(t)?{type:"account"}:/(about|alpha bank|history|founded|rbi|headquarters|hyderabad|branch count)/.test(t)?{type:"about"}:/(charge|fee|charges|free transfer|cost|pricing|service charge)/.test(t)?{type:"charges"}:{type:"unknown"}}function U(a){const t=a.toLowerCase();return/(open|go to|show me|navigate|take me|take me to|bring me|show|lead me)/.test(t)&&[{regex:/(transfer|send money|beneficiary|beneficiaries|upi)/,path:"/app/transfer",label:"Transfer page"},{regex:/(deposit|add money|top up|fund|request deposit|add cash)/,path:"/app/services?tab=deposit",label:"Deposit page"},{regex:/(bill|recharge|payments|pay bills|auto-pay|auto pay|scheduled)/,path:"/app/services",label:"Services page"},{regex:/(kyc|aadhaar|pan|verification|verify account)/,path:"/app/services?tab=kyc",label:"KYC page"},{regex:/(goal|goals|savings goal|savings)/,path:"/app/sip",label:"Goals page"},{regex:/(budget|budgets|spending limit|budget tracker)/,path:"/app/dashboard",label:"Dashboard budgets"},{regex:/(statement|export|download csv|export csv|transaction export)/,path:"/app/dashboard",label:"Dashboard statement"},{regex:/(rewards|cashback|scratch)/,path:"/app/rewards",label:"Rewards page"},{regex:/(wallet|currency|exchange|forex)/,path:"/app/wallet",label:"Wallet page"},{regex:/(settings|security|upi pin|username|password)/,path:"/app/settings",label:"Settings page"}].find(i=>i.regex.test(t))||null}function W(a,t,s){var f;const n=Y(a),i=((t==null?void 0:t.tx)||[]).length,l=O(i),c=(t==null?void 0:t.balance)||0,m=(t==null?void 0:t.displayName)||(t==null?void 0:t.username)||"there";switch(n.type){case"emi":return d.emi(n.p,n.r,n.n);case"greet":return d.greet(m);case"balance":return d.balance(c,l);case"transfer":return d.transfer;case"upi":return d.upi((t==null?void 0:t.upiId)||(t==null?void 0:t.username)+"@alpha");case"loans":return d.loans;case"deposit":return d.deposit;case"rewards":return d.rewards(((f=t==null?void 0:t.rewards)==null?void 0:f.cashback)||0,l,i);case"fd":return d.fd;case"rd":return d.rd;case"sip":return d.sip;case"kyc":return d.kyc;case"security":return d.security;case"password":return d.password;case"bills":return d.bills;case"scheduled":return d.scheduled;case"wallet":return d.wallet(s);case"credit":return d.credit(i,c);case"insurance":return d.insurance;case"account":return d.accountDetails(t||{});case"about":return d.about;case"charges":return d.charges;default:return`I can help you with banking questions! Try asking about:

- *"What's my balance?"*
- *"How do I send money?"*
- *"Calculate EMI for ₹2,00,000 at 10.5% for 24 months"*
- *"Show me loan options"*
- *"What are today's forex rates?"*
- *"How do I pay bills?"*
- *"What is my credit score?"*

Or call us 24/7 at **1800-123-4567** 📞`}}function q(a){return a?a.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/`([^`]+)`/g,'<code class="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>').replace(/^## (.+)$/gm,'<p class="font-black text-base mt-3 mb-1 text-slate-800 dark:text-white">$1</p>').replace(/^### (.+)$/gm,'<p class="font-bold text-sm mt-2 mb-1 text-slate-700 dark:text-slate-200">$1</p>').replace(/^\| (.+) \|$/gm,t=>t.includes("---")?"":`<tr>${t.split("|").filter(Boolean).map(n=>`<td class="px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-600">${n.trim()}</td>`).join("")}</tr>`).replace(/(<tr>[\s\S]+?<\/tr>)+/g,t=>`<table class="w-full border-collapse my-2 text-xs">${t}</table>`).replace(/^- (.+)$/gm,'<div class="flex gap-2 items-start my-0.5"><span class="text-amber-500 font-bold mt-0.5 flex-none text-sm">•</span><span>$1</span></div>').replace(/^\d+\. (.+)$/gm,'<div class="flex gap-2 items-start my-0.5"><span class="text-amber-500 font-bold mt-0.5 flex-none text-sm">›</span><span>$1</span></div>').replace(/\n\n/g,"<br/><br/>").replace(/\n(?!<)/g,"<br/>"):""}const K=!0;async function z(a,t,s){const n=a.toLowerCase(),i={greet:["**Hello!** 👋 I'm AlphaBot, your AI banking assistant. How can I help you today? You can ask me about account balance, transfers, loans, investments, and more!","**Hi there!** Welcome to AlphaBank. I'm here to assist with all your banking needs. What would you like to know?"],balance:[`Your current balance is **₹${Math.floor(Math.random()*5e4)+1e4}**. This includes your savings and investment accounts.`,`You have **₹${Math.floor(Math.random()*75e3)+15e3}** across all accounts.`],transfer:["To transfer funds, go to **Wallet → Transfer** in the app. You can transfer to any bank account using NEFT, IMPS, or UPI. Standard charges apply.",`**Quick transfer steps:**
1. Open Wallet
2. Click Transfer
3. Enter recipient details
4. Confirm with UPI PIN
Transfers are instant for UPI!`],loan:["We offer personal loans from **₹1,00,000 to ₹50,00,000** at competitive rates. Interest rates start from **7.5% p.a.** Apply instantly in the app!",`**Our Loan Products:**
- **Personal Loan:** ₹1L - ₹50L (7.5% - 12% p.a.)
- **Business Loan:** ₹2L - ₹1Cr (8% - 13% p.a.)
- **Auto Loan:** Up to vehicle value (6.5% - 10% p.a.)`],rewards:[`You currently have **${Math.floor(Math.random()*5e3)+500} AlphaPoints**! Redeem them for cashback, vouchers, or investments.`,`Earn **1 AlphaPoint per ₹100** spent. You have **${Math.floor(Math.random()*8e3)+1e3} points** available.`],security:["Your account is secured with **256-bit encryption** and multi-factor authentication. Never share your UPI PIN or OTP.",`**Security tips:**
1. Enable 2FA
2. Use a strong password
3. Never share OTP/PIN
4. Verify sender in transfers`],charges:["AlphaBank charges **₹0** for most transactions! NEFT/IMPS: ₹2.50 per transfer. Monthly maintenance: ₹0 for savings.",`**Our Fee Structure:**
- Account Maintenance: FREE
- UPI Transfers: FREE
- NEFT/IMPS: ₹2.50
- Card Issuance: FREE`]};for(const[l,c]of Object.entries(i))if(n.includes(l)||n.includes(l==="balance"?"balance":l))return c[Math.floor(Math.random()*c.length)];return`I'd be happy to help! Could you clarify what you need? You can ask about:
- **Account Balance** - Check your funds
- **Transfer** - Send money
- **Loans** - Get financing
- **Rewards** - Redeem points
- **Security** - Protection info
- **Charges** - Fee details`}async function V(a,t,s,n){return await z(a)}const _=["What's my balance?","How to send money?","Open Transfer page","Show my goals","Open KYC page","Request a deposit","Export my statement","Live forex rates"];function Q({text:a}){const[t,s]=p.useState(!1),n=()=>{var l;const i=a.replace(/<[^>]*>/g,"").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">");(l=navigator.clipboard)==null||l.writeText(i).then(()=>{s(!0),setTimeout(()=>s(!1),1500)})};return e.jsxs("button",{onClick:n,className:"opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-slate-400 hover:text-amber-500 flex items-center gap-1 mt-1",children:[e.jsx("i",{className:`fas ${t?"fa-check text-green-500":"fa-copy"}`}),t?"Copied":"Copy"]})}function J(){const a=L(),{currentUser:t}=M(),s=B(),[n,i]=p.useState(!1),[l,c]=p.useState([]),[m,f]=p.useState(""),[x,u]=p.useState(!1),[j,b]=p.useState(!0),v=p.useRef(null),g=p.useRef(null),E=K;p.useEffect(()=>{var o;(o=v.current)==null||o.scrollIntoView({behavior:"smooth"})},[l,x]),p.useEffect(()=>{n&&setTimeout(()=>{var o;return(o=g.current)==null?void 0:o.focus()},150)},[n]);const I=o=>{f(o.target.value);const h=g.current;h&&(h.style.height="auto",h.style.height=Math.min(h.scrollHeight,120)+"px")},N=p.useCallback(async o=>{const h=(o??m).trim();if(!h||x)return;f(""),b(!1),g.current&&(g.current.style.height="auto");const C={role:"user",content:h,rawContent:h};c(w=>[...w,C]),u(!0),await new Promise(w=>setTimeout(w,300+Math.random()*500));let y=null;y=await V(h),y||(y=W(h,t,s));const k=U(h);k&&k.path&&(a(k.path),y+=`

✅ I opened the **${k.label}** for you.`);const T=q(y);u(!1),c(w=>[...w,{role:"assistant",content:T,rawContent:y}])},[m,x,l,E,t,s,a]),P=o=>{o.key==="Enter"&&!o.shiftKey&&(o.preventDefault(),N())},S=()=>{c([]),b(!0)};return e.jsxs("div",{className:"fixed bottom-6 right-6 z-[60] flex flex-col items-end",children:[n&&e.jsxs("div",{className:"mb-4 bg-white dark:bg-slate-900 rounded-3xl flex flex-col overflow-hidden",style:{width:"min(420px,calc(100vw - 24px))",height:"min(640px,calc(100vh - 100px))",boxShadow:"0 32px 80px rgba(0,0,0,0.22),0 0 0 1px rgba(0,0,0,0.06)"},children:[e.jsxs("div",{className:"bg-gradient-to-r from-amber-500 to-yellow-400 px-5 py-4 flex items-center justify-between flex-none",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsxs("div",{className:"relative w-10 h-10 bg-slate-900/20 rounded-2xl flex items-center justify-center",children:[e.jsx("i",{className:"fas fa-robot text-slate-900 text-lg"}),e.jsx("span",{className:"absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-yellow-400 rounded-full"})]}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-black text-slate-900",children:"AlphaBot"}),e.jsx("span",{className:"text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-900/20 text-slate-900",children:"✦ Gemini AI"})]}),e.jsx("p",{className:"text-xs text-slate-900/60 font-medium",children:"Always available · Banking expert"})]})]}),e.jsxs("div",{className:"flex gap-1",children:[l.length>0&&e.jsx("button",{onClick:S,title:"Clear chat",className:"w-8 h-8 bg-slate-900/10 hover:bg-slate-900/20 rounded-xl flex items-center justify-center text-slate-900/70 transition",children:e.jsx("i",{className:"fas fa-trash-alt text-xs"})}),e.jsx("button",{onClick:()=>i(!1),className:"w-8 h-8 bg-slate-900/10 hover:bg-slate-900/20 rounded-xl flex items-center justify-center text-slate-900/70 transition",children:e.jsx("i",{className:"fas fa-times text-sm"})})]})]}),e.jsxs("div",{className:"flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/60 dark:bg-slate-900/60",children:[l.length===0&&e.jsxs("div",{className:"flex flex-col items-center justify-center h-full text-center gap-4 py-6",children:[e.jsx("div",{className:"w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-300 rounded-3xl flex items-center justify-center shadow-lg shadow-amber-200",children:e.jsx("i",{className:"fas fa-robot text-slate-900 text-2xl"})}),e.jsxs("div",{children:[e.jsx("p",{className:"font-black text-slate-800 dark:text-white text-lg",children:"Hi, I'm AlphaBot!"}),e.jsx("p",{className:"text-sm text-slate-500 dark:text-slate-400 mt-1",children:"Powered by Google Gemini AI"}),e.jsx("p",{className:"text-xs text-slate-400 mt-1",children:"Ask me anything about your account"})]})]}),j&&l.length===0&&e.jsx("div",{className:"grid grid-cols-2 gap-2",children:_.map(o=>e.jsx("button",{onClick:()=>N(o),className:"text-left text-xs font-semibold px-3 py-2.5 bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-slate-200 dark:border-slate-700 hover:border-amber-300 text-slate-700 dark:text-slate-300 rounded-2xl transition-all leading-tight",children:o},o))}),l.map((o,h)=>{var C;return e.jsxs("div",{className:`flex gap-3 chat-bubble-in ${o.role==="user"?"justify-end":"justify-start"} group`,children:[o.role==="assistant"&&e.jsx("div",{className:"w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-300 rounded-xl flex items-center justify-center flex-none self-start mt-0.5 shadow-sm",children:e.jsx("i",{className:"fas fa-robot text-slate-900 text-xs"})}),e.jsxs("div",{className:`flex flex-col max-w-[82%] ${o.role==="user"?"items-end":"items-start"}`,children:[e.jsx("div",{className:`px-4 py-3 rounded-2xl text-sm leading-relaxed ${o.role==="user"?"bg-gradient-to-br from-amber-500 to-yellow-400 text-slate-900 rounded-tr-sm font-medium shadow-md shadow-amber-200":"bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-sm border border-slate-100 dark:border-slate-700 shadow-sm"}`,dangerouslySetInnerHTML:{__html:o.role==="user"&&o.rawContent||o.content}}),o.role==="assistant"&&e.jsx(Q,{text:o.content})]}),o.role==="user"&&e.jsx("div",{className:"w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center flex-none self-start mt-0.5 shadow-sm",children:e.jsx("span",{className:"text-slate-900 text-xs font-black",children:((C=t==null?void 0:t.username)==null?void 0:C.charAt(0).toUpperCase())||"U"})})]},h)}),x&&e.jsxs("div",{className:"flex gap-3 items-start chat-bubble-in",children:[e.jsx("div",{className:"w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-300 rounded-xl flex items-center justify-center flex-none shadow-sm",children:e.jsx("i",{className:"fas fa-robot text-slate-900 text-xs"})}),e.jsxs("div",{className:"bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3.5 flex gap-1.5 items-center shadow-sm",children:[e.jsx("span",{className:"typing-dot w-2 h-2 bg-amber-400 rounded-full"}),e.jsx("span",{className:"typing-dot w-2 h-2 bg-amber-400 rounded-full"}),e.jsx("span",{className:"typing-dot w-2 h-2 bg-amber-400 rounded-full"})]})]}),e.jsx("div",{ref:v})]}),e.jsxs("div",{className:"flex-none bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-3",children:[e.jsxs("div",{className:`flex items-end gap-2 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 transition-colors px-4 py-2 ${m?"border-amber-400":"border-slate-200 dark:border-slate-700"}`,children:[e.jsx("textarea",{ref:g,value:m,onChange:I,onKeyDown:P,placeholder:"Ask AlphaBot anything…",rows:1,disabled:x,className:"flex-1 bg-transparent text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none resize-none leading-relaxed disabled:opacity-50",style:{maxHeight:"120px",minHeight:"24px"}}),e.jsx("button",{onClick:()=>N(),disabled:!m.trim()||x,className:`w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-none mb-0.5 ${m.trim()&&!x?"bg-gradient-to-br from-amber-500 to-yellow-400 text-slate-900 shadow-md active:scale-95":"bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"}`,children:e.jsx("i",{className:"fas fa-paper-plane text-xs"})})]}),e.jsx("p",{className:"text-center text-[10px] text-slate-400 mt-1.5",children:"Enter to send · Shift+Enter for new line"})]})]}),e.jsxs("button",{onClick:()=>i(o=>!o),className:"w-14 h-14 bg-gradient-to-br from-amber-500 to-yellow-400 text-slate-900 rounded-2xl flex items-center justify-center text-xl transition-all active:scale-95 relative",style:{animation:"pulseRing 2.5s infinite",boxShadow:"0 8px 24px rgba(245,158,11,0.5)"},title:"AlphaBot — AI Banking Assistant",children:[e.jsx("i",{className:`fas ${n?"fa-times":"fa-robot"} transition-transform`}),!n&&e.jsx("span",{className:"absolute -top-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full flex items-center justify-center",children:e.jsx("span",{className:"text-[8px] font-black text-white",children:"AI"})})]})]})}function X(a){const t=new Date().getHours();return`${t>=5&&t<12?"Good morning":t>=12&&t<17?"Good afternoon":t>=17&&t<21?"Good evening":"Good night"}, ${a}! 👋`}function Z(){const{currentUser:a,markNotificationsRead:t}=M(),[s,n]=p.useState(!1),i=p.useRef(null),l=(a==null?void 0:a.notifications)||[],c=l.filter(u=>!u.read).length,m={success:"fa-check-circle",error:"fa-exclamation-circle",info:"fa-info-circle",warning:"fa-exclamation-triangle"},f={success:"text-green-500",error:"text-red-500",info:"text-blue-500",warning:"text-amber-500"};p.useEffect(()=>{const u=j=>{i.current&&!i.current.contains(j.target)&&n(!1)};return document.addEventListener("mousedown",u),()=>document.removeEventListener("mousedown",u)},[]);const x=()=>{n(u=>!u),!s&&c>0&&t()};return e.jsxs("div",{className:"relative",ref:i,children:[e.jsxs("button",{onClick:x,className:"w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition relative",children:[e.jsx("i",{className:"fas fa-bell text-sm"}),c>0&&e.jsx("span",{className:"absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center",children:c>9?"9+":c})]}),s&&e.jsxs("div",{className:"absolute right-0 top-12 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden",children:[e.jsxs("div",{className:"px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between",children:[e.jsx("p",{className:"font-bold text-slate-800 dark:text-white text-sm",children:"Notifications"}),e.jsxs("span",{className:"text-xs text-slate-400",children:[l.length," total"]})]}),e.jsx("div",{className:"max-h-80 overflow-y-auto",children:l.length===0?e.jsx("div",{className:"text-center py-8 text-slate-400 text-sm",children:"No notifications yet"}):l.map(u=>e.jsxs("div",{className:`px-4 py-3 border-b border-slate-50 dark:border-slate-700/50 flex gap-3 items-start ${u.read?"":"bg-amber-50/50 dark:bg-amber-900/10"}`,children:[e.jsx("i",{className:`fas ${m[u.type]||"fa-info-circle"} ${f[u.type]||"text-blue-500"} text-sm mt-0.5 flex-none`}),e.jsxs("div",{className:"min-w-0",children:[e.jsx("p",{className:"text-xs text-slate-700 dark:text-slate-200 leading-relaxed",children:u.msg}),e.jsx("p",{className:"text-[10px] text-slate-400 mt-1",children:u.date})]})]},u.id))})]})]})}function se(){var T,w;const{currentUser:a,logout:t,isDarkMode:s,setIsDarkMode:n,isPrivacy:i,setIsPrivacy:l,currentCurrency:c,setCurrentCurrency:m}=M(),f=B(),x=R(),u=L(),[j,b]=p.useState(!1),[v,g]=p.useState(""),[E,I]=p.useState(!1),N=p.useRef(null),P=$.map(r=>({label:r.label,path:r.path,icon:r.icon}));p.useEffect(()=>{const r=A=>{N.current&&!N.current.contains(A.target)&&I(!1)};return document.addEventListener("mousedown",r),()=>document.removeEventListener("mousedown",r)},[]);const S=x.pathname.split("/app/")[1]||"dashboard",o=F[S]||"Dashboard",h=(a==null?void 0:a.balance)||0,y=c==="INR"?"₹"+h.toLocaleString("en-IN",{maximumFractionDigits:0}):({INR:"₹",USD:"$",EUR:"€",GBP:"£"}[c]||"₹")+(h/(f[c]||1)).toFixed(2),k=()=>{t(),u("/",{replace:!0})};return p.useEffect(()=>{const r=()=>{window.location.pathname.startsWith("/app")||(t(),window.location.replace("/login"))};return window.addEventListener("popstate",r),()=>window.removeEventListener("popstate",r)},[t]),e.jsxs("div",{className:`alpha-pay-app flex flex-col h-screen min-h-0 ${s?"dark bg-slate-950":"bg-slate-100"}`,children:[e.jsx(H,{}),e.jsxs("div",{className:"flex flex-1 min-h-0 overflow-hidden",children:[e.jsxs("aside",{className:`fixed inset-y-0 left-0 z-50 flex flex-col w-64 pt-9 bg-slate-900 transition-transform duration-300 ${j?"translate-x-0":"-translate-x-full"} lg:relative lg:translate-x-0 lg:pt-0`,children:[e.jsxs("div",{className:"flex items-center gap-3 px-6 py-5 border-b border-white/10",children:[e.jsx("div",{className:"w-9 h-9 bg-gradient-to-br from-amber-400 to-yellow-300 rounded-xl flex items-center justify-center flex-none shadow-lg",children:e.jsx("span",{className:"font-black text-slate-900 text-base",children:"α"})}),e.jsxs("div",{children:[e.jsxs("div",{children:[e.jsx("span",{className:"font-black text-white text-lg",children:"Alpha"}),e.jsx("span",{className:"font-black text-amber-400 text-lg ml-1",children:"Bank"})]}),e.jsx("p",{className:"text-[10px] text-slate-500 font-medium",children:"Personal Banking · Hyderabad"})]}),e.jsx("button",{onClick:()=>b(!1),className:"ml-auto text-slate-500 hover:text-white lg:hidden",children:e.jsx("i",{className:"fas fa-times"})})]}),e.jsxs("div",{className:"mx-4 mt-4 mb-2 bg-white/5 rounded-2xl p-3 flex items-center gap-3",children:[e.jsx("div",{className:"w-9 h-9 bg-gradient-to-br from-amber-400 to-yellow-300 rounded-xl flex items-center justify-center flex-none",children:e.jsx("span",{className:"font-black text-slate-900 text-sm",children:(T=a==null?void 0:a.username)==null?void 0:T.charAt(0).toUpperCase()})}),e.jsxs("div",{className:"min-w-0",children:[e.jsx("p",{className:"text-white font-bold text-sm truncate",children:(a==null?void 0:a.displayName)||(a==null?void 0:a.username)}),e.jsx("p",{className:"text-amber-400 text-[11px] font-mono truncate",children:i?"₹••••••":y})]}),e.jsx("button",{onClick:()=>l(r=>!r),className:"ml-auto text-slate-500 hover:text-amber-400 transition flex-none",children:e.jsx("i",{className:`fas ${i?"fa-eye-slash":"fa-eye"} text-xs`})})]}),e.jsx("div",{className:"mx-4 mb-3",children:e.jsx("select",{value:c,onChange:r=>m(r.target.value),className:"w-full bg-white/5 text-slate-400 text-xs font-bold rounded-xl px-3 py-2 outline-none border border-white/10 focus:border-amber-500 transition cursor-pointer",children:[["INR","Indian Rupee"],["USD","US Dollar"],["EUR","Euro"],["GBP","British Pound"]].map(([r,A])=>e.jsxs("option",{value:r,className:"bg-slate-900",children:[r," — ",A]},r))})}),e.jsx("nav",{className:"flex-1 min-h-0 px-3 space-y-0.5 overflow-y-auto pb-4",children:$.map(r=>e.jsxs(D,{to:r.path,onClick:()=>b(!1),className:({isActive:A})=>`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${A?"bg-amber-500 text-slate-900 shadow-lg shadow-amber-900/30":"text-slate-400 hover:text-white hover:bg-white/8"}`,children:[e.jsx("i",{className:`fas ${r.icon} text-base w-5 text-center`}),r.label]},r.id))}),e.jsxs("div",{className:"mt-auto flex-none border-t border-white/10 p-4 space-y-1",children:[e.jsxs("button",{onClick:()=>n(r=>!r),className:"w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/8 transition",children:[e.jsx("i",{className:`fas ${s?"fa-sun":"fa-moon"} w-5 text-center`}),s?"Light Mode":"Dark Mode"]}),e.jsxs("button",{onClick:k,className:"w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition",children:[e.jsx("i",{className:"fas fa-sign-out-alt w-5 text-center"}),"Sign Out"]})]})]}),j&&e.jsx("div",{className:"fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden",onClick:()=>b(!1)}),e.jsxs("div",{className:"flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden",children:[e.jsxs("header",{className:`flex-none flex items-center justify-between px-4 md:px-8 h-16 border-b sticky top-0 z-30 ${s?"bg-slate-900 border-slate-800":"bg-white border-slate-200"}`,children:[e.jsxs("div",{className:"flex items-center gap-4 min-w-0",children:[e.jsx("button",{onClick:()=>b(!0),className:"lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition",children:e.jsx("i",{className:"fas fa-bars"})}),e.jsxs("div",{className:"min-w-0",children:[e.jsx("h1",{className:`text-base font-black leading-tight truncate ${s?"text-white":"text-slate-900"}`,children:S==="dashboard"?X((a==null?void 0:a.displayName)||(a==null?void 0:a.username)||"there"):o}),S==="dashboard"&&e.jsx("p",{className:`text-xs mt-0.5 hidden sm:block ${s?"text-slate-400":"text-slate-500"}`,children:new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})})]})]}),e.jsxs("div",{className:"flex items-center gap-2 flex-none",children:[e.jsxs("div",{className:"relative hidden xl:block",ref:N,children:[e.jsx("input",{type:"text",value:v,onChange:r=>{g(r.target.value),I(!0)},onFocus:()=>I(!0),placeholder:"Search app…",className:"w-72 bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-2xl px-4 py-2 text-xs outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"}),E&&v.trim()&&e.jsxs("div",{className:"absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden z-50",children:[P.filter(r=>r.label.toLowerCase().includes(v.toLowerCase())).slice(0,5).map(r=>e.jsxs("button",{onClick:()=>{g(""),I(!1),u(r.path),b(!1)},className:"w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition",children:[e.jsx("span",{className:"font-bold",children:r.label}),e.jsx("span",{className:"ml-2 text-xs text-slate-500",children:r.path.replace("/app/","")})]},r.path)),P.filter(r=>r.label.toLowerCase().includes(v.toLowerCase())).length===0&&e.jsx("div",{className:"px-4 py-3 text-xs text-slate-500",children:"No pages match your search."})]})]}),e.jsx("span",{className:`hidden sm:block text-xs font-mono px-3 py-1.5 rounded-xl border font-bold ${s?"bg-slate-800 border-slate-700 text-amber-400":"bg-amber-50 border-amber-200 text-amber-700"}`,children:(a==null?void 0:a.upiId)||`${(w=a==null?void 0:a.username)==null?void 0:w.toLowerCase()}@alpha`}),e.jsx(Z,{}),e.jsx("button",{onClick:k,title:"Sign out",className:"w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition",children:e.jsx("i",{className:"fas fa-sign-out-alt text-sm"})})]})]}),e.jsx("main",{className:"flex-1 min-h-0 overflow-y-auto",children:e.jsx("div",{className:"max-w-7xl mx-auto px-4 md:px-8 py-8",children:e.jsx(G,{})})})]})]}),e.jsx(J,{})]})}export{se as default};
