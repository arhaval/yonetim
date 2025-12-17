import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          dark: "#1e293b",
          primary: "#3b82f6",
          accent: "#f59e0b",
          secondary: "#2563eb",
          gray: "#f8fafc",
        },
      },
    },
  },
  plugins: [],
};
export default config;






