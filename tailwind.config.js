/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0E1A17",
          soft: "#15261F",
          line: "#22362D",
        },
        vault: {
          DEFAULT: "#143C30",
          light: "#1C5443",
          deep: "#0A2018",
        },
        brass: {
          DEFAULT: "#C8932F",
          light: "#E0B45C",
          dark: "#9C7320",
        },
        seal: {
          DEFAULT: "#B23B3B",
          light: "#D4716A",
        },
        mint: {
          DEFAULT: "#4FD1AE",
          light: "#9AE6D4",
          dark: "#2E9B82",
        },
        paper: {
          DEFAULT: "#F3F5F2",
          dim: "#E7EBE6",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-manrope)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        seal: "0 12px 40px -8px rgba(20, 60, 48, 0.45)",
        card: "0 2px 12px rgba(14, 26, 23, 0.06)",
      },
      backgroundImage: {
        "grain": "radial-gradient(circle at 1px 1px, rgba(247,243,233,0.06) 1px, transparent 0)",
      },
      keyframes: {
        "spin-slow": { to: { transform: "rotate(360deg)" } },
        "rise": { "0%": { opacity: 0, transform: "translateY(10px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
      },
      animation: {
        "spin-slow": "spin-slow 14s linear infinite",
        "rise": "rise 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};
