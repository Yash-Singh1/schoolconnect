# Instructions

Here are the instructions for running the SchoolConnect application.

## Prerequisites

To run the SchoolConnect application, you will need to have the following installed:

- Node.js 18 or higher (Mac and Linux users should use [nvm](https://nvm.sh/), Windows users should use [nvm-windows](https://github.com/coreybutler/nvm-windows))
- `npm`, installed by default along with Node.js
- `pnpm` 7 or higher, installed by running `npm install -g pnpm`

## Development

### 1. Install Dependencies

To install the dependencies of the project, run the following command:

```bash
pnpm install
```

### 2. Setup the database

To setup the database, we will be using a local instance of SQLite. To do this, copy the `.env.example` file to `.env`. Then, navigate to `packages/db/prisma/schema.prisma` and change the provider field on line 11 from `postgresql` to `sqlite`.

Now, to sync the schema with the client and the database, run the following command:

```bash
pnpm db:push
```

### 3. Setup GitHub OAuth

To setup GitHub OAuth, you will need to create a new OAuth app on GitHub. To do this, follow the instructions on GitHub's [guide](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app) and copy the client ID and client secret to their respective places in the `.env` file. For the callback URL, use `exp://[YOUR_IP]:19000`.

### 4. Setup Imgbb API

To do this, simply navigate to [Imgbb](https://imgbb.com/) and create an account. Then, create and copy the API key from the [dashboard](https://api.imgbb.com/) to the `.env` file.

### 5. Setup QStash

To get your QStash keys, create a new Upstash account and navigate to the [QStash console](https://console.upstash.com/qstash). Then, copy the keys underneath **Details > Request Builder** into the `.env` file.

### 6. Start the server

To start the server, run the following command:

```bash
pnpm dev
```

All the packages will be built and run. Expo will give instructions on how to run the application on your device.
