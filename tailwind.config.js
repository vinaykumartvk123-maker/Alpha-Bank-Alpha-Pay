/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: { sans: ["'DM Sans'", "sans-serif"], mono: ["'DM Mono'", "monospace"] },
      animation: {
        ticker: "ticker 40s linear infinite",
        "slide-in": "slideIn 0.3s cubic-bezier(0.4,0,0.2,1)",
        "pulse-ring": "pulseRing 2.5s cubic-bezier(0.455,0.03,0.515,0.955) infinite",
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        slideIn: {
          from: { transform: "translateX(100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        pulseRing: {
          "0%": { boxShadow: "0 0 0 0 rgba(245,158,11,0.7)" },
          "70%": { boxShadow: "0 0 0 16px rgba(245,158,11,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(245,158,11,0)" },
        },
      },
    },
  },
  plugins: [],
  safelist: [
    { pattern: /^(bg|text|border|shadow|ring|from|to)-(slate|indigo|purple|blue|green|yellow|orange|red|pink|teal|emerald|amber|cyan|violet|rose)-(50|100|200|300|400|500|600|700|800|900)$/ },
    { pattern: /^(w|h)-(1|2|3|4|5|6|7|8|9|10|11|12|14|16|20|24|32|36|48|52|56|64|72|80|96)$/ },
    "rotate-180", "translate-x-1", "fa-spin",
  ],
}
