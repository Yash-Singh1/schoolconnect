# `@acme/db`

This package contains the database schema and Prisma client.

## Scripts

Here are the scripts exposed by this package:

### `pnpm db:push`

Push the Prisma schema to your database, generally followed with `pnpm db:generate` to generate types and rest of the client.

### `pnpm db:generate`

Generate the Prisma client. You can think of this as a codegen step, but instead we run it only when we change the schema manually. Sometimes the editor doesn't pick up the changes, so you might need to restart your TypeScript Language Server.
