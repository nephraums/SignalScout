import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#18202f",
        steel: "#58677f",
        mist: "#eef2f6",
        line: "#d8dee8",
        board: "#005a70",
        signal: "#bd6f22",
        success: "#1e7a4d"
      },
      boxShadow: {
        panel: "0 1px 2px rgba(24, 32, 47, 0.06), 0 10px 30px rgba(24, 32, 47, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
