import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx,css}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx,css}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx,css}",
    "./app/**/*.{js,ts,jsx,tsx,mdx,css}",
    "./components/**/*.{js,ts,jsx,tsx,mdx,css}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;