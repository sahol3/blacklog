import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#10b77f",
        "secondary": "#3b82f6",
        "accent": "#f59e0b",
        "danger": "#ef4444",
        "background-light": "#f6f8f7",
        "background-dark": "#050505",
        "panel-dark": "#0c0c0c",
        "border-dark": "#1f1f1f",
        "surface": "#0a100e",
        "surface-highlight": "#141a18",
        "border": "#283933",
        "slate-panel": "#1c2723",
        "sidebar-bg": "#0c1a15",
      },
      fontFamily: {
        "display": ["var(--font-inter)", "sans-serif"],
        "mono": ["var(--font-jetbrains-mono)", "monospace"]
      },
      borderRadius: {
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
};
export default config;
