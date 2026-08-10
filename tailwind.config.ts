import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#101613",
        surface: "#1B2420",
        text: "#ECE9E1",
        muted: "#9BA69C",
        amber: "#E2A33D",
        "signal-red": "#D65C4F",
        "signal-green": "#5FA777",
        hairline: "#2B362F",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
