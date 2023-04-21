// Declare types for remark-remove-comments, which does not expose types

declare module "remark-remove-comments" {
  declare const plugin: import("unified").Pluggable;
  export default plugin;
}
