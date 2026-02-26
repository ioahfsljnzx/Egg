import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ember: {
          50: "#fff6e8",
          100: "#ffe8be",
          200: "#ffd586",
          300: "#ffbe58",
          400: "#f79b2d",
          500: "#ea7f16",
          600: "#cc5e0e",
          700: "#a74410",
          800: "#863614",
          900: "#6d2e13",
        },
      },
      boxShadow: {
        panel: "0 14px 40px rgba(13, 18, 24, 0.22)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;

