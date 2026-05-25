// Isolated context for live forex rates — updates every 3s without re-rendering
// any component that only cares about user/auth state.
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { LIVE_RATES_BASE } from "../utils/constants";

const RatesContext = createContext(LIVE_RATES_BASE);

export function RatesProvider({ children }) {
  const [rates, setRates] = useState(LIVE_RATES_BASE);
  const ref = useRef(null);

  useEffect(() => {
    const flux = (base) => parseFloat((base + (Math.random() * 10 - 5)).toFixed(2));
    const tick = () => setRates({ USD: flux(96.14), EUR: flux(111.79), GBP: flux(129.11) });
    tick();
    ref.current = setInterval(tick, 3000);
    return () => clearInterval(ref.current);
  }, []);

  return <RatesContext.Provider value={rates}>{children}</RatesContext.Provider>;
}

export const useRates = () => useContext(RatesContext);
