// Tailwind config for Next.js imported from @acme/tailwind-config

/** @type {import("tailwindcss").Config} */
const config = {
  content: ["./src/**/*.tsx"],
  presets: [require("@acme/tailwind-config")],
};

module.exports = config;
