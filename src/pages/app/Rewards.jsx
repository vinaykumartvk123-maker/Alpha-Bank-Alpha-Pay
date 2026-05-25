import { useState } from "react";
import { useApp } from "../../store/AppContext";
import { getUserTier, launchConfetti } from "../../utils/helpers";
import { uid } from "../../utils/security";
import ErrorBoundary from "../../components/common/ErrorBoundary";

// Scratch cards — IDs are stable, scratched state is persisted in user.rewards.scratchedCards
const SCRATCH_CARDS = [
  { id: "sc_swiggy",  brand: "Swiggy",  offer: "₹50 Off",   icon: "🍔", cashback: 50,  color: "from-orange-500 to-red-500"    },
  { id: "sc_amazon",  brand: "Amazon",  offer: "₹100 Off",  icon: "📦", cashback: 100, color: "from-yellow-500 to-orange-500"  },
  { id: "sc_myntra",  brand: "Myntra",  offer: "₹75 Off",   icon: "👗", cashback: 75,  color: "from-pink-500 to-rose-500"     },
  { id: "sc_zomato",  brand: "Zomato",  offer: "₹30 Off",   icon: "🍕", cashback: 30,  color: "from-red-500 to-pink-500"      },
];

const VOUCHERS = [
  { brand: "BookMyShow", discount: "25% Off",      code: "ALPHA25",     expiry: "31 Mar 2026", bg: "#e50914" },
  { brand: "Uber",       discount: "₹50 Off",      code: "ALPHABANK50", expiry: "28 Feb 2026", bg: "#000000" },
  { brand: "Airtel",     discount: "1 Month Free", code: "ALPHAAIR",    expiry: "30 Apr 2026", bg: "#ef4444" },
];

const TIER_GRADIENTS = {
  Bronze:   "from-amber-700 to-amber-900",
  Silver:   "from-slate-400 to-slate-600",
  Gold:     "from-yellow-400 to-amber-600",
  Platinum: "from-slate-300 to-slate-500",
};

export default function Rewards() {
  const { currentUser, updateUser, addTransaction, showToast, addNotification } = useApp();
  const [copiedCode, setCopiedCode] = useState(null);

  const txCount  = (currentUser?.tx || []).length;
  const tier     = getUserTier(txCount);
  const cashback = currentUser?.rewards?.cashback || 0;
  const tierPct  = tier.next ? Math.min(((txCount % 10) / 10) * 100, 100) : 100;

  // Persisted in user data — survives page refresh
  const scratchedIds = new Set(currentUser?.rewards?.scratchedCards || []);

  const reveal = (card) => {
    if (scratchedIds.has(card.id)) {
      showToast("Already scratched!", "info");
      return;
    }

    // Update user — add card id to scratchedCards array so it persists
    const newScratchedCards = [...(currentUser?.rewards?.scratchedCards || []), card.id];
    updateUser({
      balance: (currentUser.balance || 0) + card.cashback,
      rewards: {
        ...currentUser.rewards,
        cashback:      (cashback + card.cashback),
        scratchWins:   (currentUser.rewards?.scratchWins || 0) + 1,
        scratchedCards: newScratchedCards,
      },
    });
    addTransaction({ type: "credit", desc: `Scratch Card Win: ${card.brand}`, amount: card.cashback, category: "deposit" });
    addNotification(`🎉 You won ₹${card.cashback} from ${card.brand} scratch card!`, "success");
    launchConfetti();
    showToast(`🎉 You won ₹${card.cashback} from ${card.brand}!`, "success");
  };

  const copyCode = (code) => {
    navigator.clipboard?.writeText(code)
      .then(() => { setCopiedCode(code); setTimeout(() => setCopiedCode(null), 1500); })
      .catch(() => showToast(`Code: ${code}`, "info"));
  };

  const achievements = [
    { icon: "🎯", label: "First Transfer",   done: txCount >= 1,                                     desc: "Complete your first transfer"        },
    { icon: "🔟", label: "10 Transactions",  done: txCount >= 10,                                    desc: "Reach 10 total transactions"         },
    { icon: "🥇", label: "Gold Tier",        done: tier.name === "Gold" || tier.name === "Platinum", desc: "Reach Gold tier"                     },
    { icon: "💰", label: "₹500 Cashback",    done: cashback >= 500,                                  desc: "Earn ₹500 in total cashback"         },
    { icon: "🃏", label: "Scratch Master",   done: scratchedIds.size >= 4,                           desc: "Reveal all scratch cards"            },
    { icon: "💎", label: "Platinum Member",  done: tier.name === "Platinum",                         desc: "Reach Platinum tier"                 },
  ];

  return (
    <ErrorBoundary>
      <div className="space-y-8 page-fade-in">

        {/* ── Tier Card ── */}
        <div className={`relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl bg-gradient-to-br ${TIER_GRADIENTS[tier.name] || TIER_GRADIENTS.Bronze}`}>
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="absolute w-32 h-32 bg-white rounded-full"
                style={{ top: `${[10,60,80,20,50,30][i]}%`, left: `${[5,70,40,85,15,55][i]}%`, transform: "translate(-50%,-50%)" }} />
            ))}
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-1">Your Tier</p>
              <h2 className="text-4xl font-black">{tier.icon} {tier.name}</h2>
              <p className="text-white/60 text-sm mt-1">Member since {currentUser?.joinDate || "today"}</p>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-sm">Total Cashback</p>
              <h3 className="text-3xl font-black">₹{cashback.toFixed(2)}</h3>
              <p className="text-white/60 text-xs mt-1">{txCount} transactions</p>
            </div>
          </div>
          {tier.next ? (
            <>
              <div className="h-2.5 bg-white/20 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${tierPct}%` }} />
              </div>
              <p className="text-xs text-white/70">
                <strong>{tier.txNeeded} more transactions</strong> to reach <strong>{tier.next}</strong> tier
              </p>
            </>
          ) : (
            <p className="text-sm text-white/80 font-semibold">💎 Maximum tier achieved — enjoy all premium benefits!</p>
          )}
        </div>

        {/* ── Scratch Cards ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-lg">Scratch Cards</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Each card can only be scratched once · Winnings go to your wallet
              </p>
            </div>
            <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full font-bold">
              {scratchedIds.size}/{SCRATCH_CARDS.length} revealed
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SCRATCH_CARDS.map((card) => {
              const isScratched = scratchedIds.has(card.id);
              return (
                <div key={card.id}
                  onClick={() => !isScratched && reveal(card)}
                  className={`relative rounded-2xl overflow-hidden aspect-square transition-transform ${isScratched ? "cursor-default" : "cursor-pointer hover:scale-[1.02] active:scale-[0.98]"}`}>
                  {/* Revealed face — always in DOM */}
                  <div className="absolute inset-0 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                    <div className="text-4xl mb-2">{card.icon}</div>
                    <p className="font-bold text-slate-800 dark:text-white text-sm">{card.brand}</p>
                    <p className="text-green-600 font-black text-lg">{card.offer}</p>
                    <p className="text-[10px] text-slate-400 mt-1">+₹{card.cashback} added to wallet</p>
                    <div className="mt-2 bg-green-100 dark:bg-green-900/30 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <i className="fas fa-check mr-1" />Claimed
                    </div>
                  </div>

                  {/* Unscratched overlay — hidden when scratched */}
                  {!isScratched && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.color} flex flex-col items-center justify-center text-white rounded-2xl`}>
                      <i className="fas fa-hand-pointer text-3xl mb-2 opacity-90" />
                      <p className="font-black text-sm">{card.brand}</p>
                      <p className="text-xs text-white/70 mt-1">Tap to scratch!</p>
                      <div className="mt-2 bg-white/20 rounded-full px-3 py-0.5 text-[10px] font-bold">
                        ₹{card.cashback} inside
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {scratchedIds.size === SCRATCH_CARDS.length && (
            <div className="mt-4 text-center bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/30 rounded-2xl p-4">
              <p className="text-green-700 dark:text-green-400 font-bold text-sm">
                🎉 All cards scratched! You earned ₹{SCRATCH_CARDS.reduce((s, c) => s + c.cashback, 0)} total cashback.
              </p>
              <p className="text-xs text-slate-400 mt-1">New scratch cards refresh on the 1st of every month.</p>
            </div>
          )}
        </div>

        {/* ── Achievements ── */}
        <div>
          <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-4">Achievements</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {achievements.map((a) => (
              <div key={a.label}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                  a.done
                    ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/30"
                    : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 opacity-55"
                }`}>
                <span className="text-3xl flex-none">{a.icon}</span>
                <div className="min-w-0">
                  <p className={`font-bold text-sm ${a.done ? "text-amber-700 dark:text-amber-400" : "text-slate-600 dark:text-slate-300"}`}>
                    {a.label}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{a.desc}</p>
                </div>
                <div className="ml-auto flex-none">
                  {a.done
                    ? <i className="fas fa-check-circle text-green-500 text-lg" />
                    : <i className="fas fa-lock text-slate-300 dark:text-slate-600 text-sm" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Vouchers ── */}
        <div>
          <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-4">Exclusive Vouchers</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {VOUCHERS.map((v) => (
              <div key={v.brand} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 hover:-translate-y-1 transition-all shadow-sm hover:shadow-lg">
                <div className="p-5" style={{ background: v.bg }}>
                  <p className="text-white font-black text-lg">{v.brand}</p>
                  <p className="text-white/80 text-xs mt-0.5">Expires {v.expiry}</p>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white text-base">{v.discount}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{v.code}</p>
                  </div>
                  <button onClick={() => copyCode(v.code)}
                    className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-3 py-2 rounded-xl text-xs font-bold hover:bg-amber-100 transition">
                    <i className={`fas ${copiedCode === v.code ? "fa-check text-green-500" : "fa-copy"} text-xs`} />
                    {copiedCode === v.code ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── How to earn ── */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white">
          <h3 className="font-bold text-lg mb-4">How to Earn More</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              ["fa-paper-plane text-amber-400", "Transfer Money",     "0.5% cashback on every UPI transfer"],
              ["fa-bolt text-blue-400",          "Pay Bills",          "1% cashback on all bill payments"   ],
              ["fa-chart-pie text-green-400",    "Invest via SIP",     "Special rewards on SIP & FD creation"],
            ].map(([cls, title, desc]) => (
              <div key={title} className="bg-white/8 rounded-2xl p-4 border border-white/10">
                <i className={`fas ${cls} text-2xl mb-3 block`} />
                <p className="font-bold text-sm mb-1">{title}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
