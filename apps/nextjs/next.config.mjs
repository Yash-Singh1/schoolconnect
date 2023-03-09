/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds and Linting.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env.mjs"));

// Add support for markdown within the project
import addMDX from '@next/mdx';
import remarkGfm from "remark-gfm";
import remarkComment from "remark-remove-comments";

const withMDX = addMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm, remarkComment]
  }
})

/** @type {import("next").NextConfig} */
let config = {
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: ["@acme/api", "@acme/db"],
  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: !!process.env.CI },
  typescript: { ignoreBuildErrors: !!process.env.CI },
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'mdx']
};

export default withMDX(config);
