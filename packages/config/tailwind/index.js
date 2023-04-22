// Configuration for tailwindcss
// @see https://tailwindcss.com/docs/configuration

/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    screens: {
      xs: "100px",
      sm: "640px",
    },
    extend: {},
  },
  plugins: [],
};

module.exports = config;
