// Types for the Tailwind and Postcss config

declare module "@acme/tailwind-config" {
  declare const Config: import("tailwindcss").Config;
  export = Config;
}

declare module "@acme/tailwind-config/postcss" {
  declare const Config: {
    plugins: {
      [key: string]: {};
    };
  };
  export = Config;
}
