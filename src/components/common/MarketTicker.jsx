import { useRates } from "../../store/RatesContext";

export default function MarketTicker() {
  const r = useRates();
  const items = [
    { l: "Gold (24k)",  v: "₹15,885/g",                   c: "text-yellow-400" },
    { l: "USD/INR",     v: `₹${r.USD.toFixed(2)}`,        c: "text-green-400"  },
    { l: "EUR/INR",     v: `₹${r.EUR.toFixed(2)}`,        c: "text-blue-400"   },
    { l: "GBP/INR",     v: `₹${r.GBP.toFixed(2)}`,        c: "text-amber-400"  },
    { l: "NIFTY 50",    v: "23,773.30",                    c: "text-green-400"  },
    { l: "SENSEX",      v: "75,582.23",                    c: "text-green-300"  },
    { l: "BANK NIFTY",  v: "53,562.20",                    c: "text-cyan-400"   },
    { l: "Silver",      v: "₹275/g",                    c: "text-slate-300"  },
  ];
  const doubled = [...items, ...items];
  return (
    <div className="w-full overflow-hidden bg-slate-900 h-9 flex items-center">
      <div className="flex animate-ticker whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="inline-block px-8 text-slate-300 text-sm font-medium">
            {item.l}: <span className={`${item.c} font-bold`}>{item.v}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
