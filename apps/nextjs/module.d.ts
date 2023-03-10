// Declare types for remark-remove-comments, which does not expose types

declare module "remark-remove-comments" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports -- Some reason import types disabled
  declare const plugin: import("unified").Pluggable;
  export default plugin;
}
