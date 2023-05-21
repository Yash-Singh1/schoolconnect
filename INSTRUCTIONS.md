# Instructions

Here are the instructions for running the SchoolConnect application.

## Prerequisites

To run the SchoolConnect application, you will need to have the following installed:

- Node.js 18 or higher (Mac and Linux users should use [nvm](https://nvm.sh/), Windows users should use [nvm-windows](https://github.com/coreybutler/nvm-windows))
- `npm`, installed by default along with Node.js
- `pnpm` 7 or higher, installed by running `npm install -g pnpm`

Use the `scripts/setup.sh` shell script for help in setting up the tooling.

## Development

### 1. Install Dependencies

To install the dependencies of the project, run the following command:

```bash
pnpm install
```

### 2. Setup the database

To setup the database, we will be using a local instance of SQLite. To do this, copy the `.env.example` file to `.env`. Then, navigate to `packages/db/prisma/schema.prisma` and change the provider field on line 15 from `postgresql` to `sqlite`.

Now, to sync the schema with the client and the database, run the following command:

```bash
pnpm db:push
```

If you don't want to setup a local database, you can [setup](#database) one on the cloud instead.

### 3. Setup GitHub OAuth

To setup GitHub OAuth, you will need to create a new OAuth app on GitHub. To do this, follow the instructions on GitHub's [guide](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app) and copy the client ID and client secret to their respective places in the `.env` file. For the callback URL, use `exp://[YOUR_IP]:19000`. Setting up OAuth is optional if you are not using the OAuth feature of SchoolConnect.

### 4. Setup UploadThing

To do this, sign up for [UploadThing](https://uploadthing.com/) and create a new application. Copy the environment variable values for the secret key and the app ID, and paste it into the `.env` file.

### 5. Setup QStash

To get your QStash keys, create a new Upstash account and navigate to the [QStash console](https://console.upstash.com/qstash). Then, copy the keys underneath **Details > Request Builder** into the `.env` file.

### 6. Find Device

The process of this step depends on whether you choose to run the application on a physical device or an emulator.

#### Emulator

If you are using an emulator for running the application, follow the instructions to setup your emulator on the Expo documentation:

- [IOS Simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Android Studio Emulator](https://docs.expo.dev/workflow/android-studio-emulator/)

Starting up the simulator with Turborepo is a little complicated since Turborepo disables interactivity to allow synchronization of commands. Instead of straight up running `pnpm run dev`, first run the following:

```sh
cd apps/expo
pnpm expo start
```

Then when prompted, press the corresponding keys to start up your simulator(s) (<kbd>a</kbd> for Android and <kbd>i</kbd> for IOS). Once the simulator is started and the application has loaded, end the terminal process with <kbd>Ctrl</kbd>+<kbd>c</kbd>, then go back to the root of the repository and run the dev script:

```sh
cd ../..
pnpm run dev
```

Now refresh the application by accessing the [Developer Menu](https://docs.expo.dev/debugging/tools/#developer-menu) and clicking the refresh button. We do this so the server connection can be reestablished.

#### Physical Device

If you are running the application on a physical device, the first step is to install [Expo Go](https://docs.expo.dev/get-started/expo-go/) from your application distribution store on your physical device. Once you have that installed, you can first go into the application directory and start up Expo so we can get the QR Code:

```sh
cd apps/expo
pnpm expo start
```

When Expo prints out the QR code, scan it with your physical device (Camera app on IOS and Expo Go on Android). This will automatically open up the application. Now, end the running process in your terminal and run the following:

```sh
cd ../..
pnpm run dev
```

This will restart the process, but this time with the server and the database up and running. Now, reload the application on your device through the [Developer Menu](https://docs.expo.dev/debugging/tools/#developer-menu).

### 7. Start up Redis Server

We need to start up a redis server for the event emitter for synchronization between the websocket server and the Next.js server. Start off by [installing](https://redis.io/docs/getting-started/installation/) Redis.

Then run the following command in a seperate terminal window to start up the redis server. Make sure the directory when running this command is the same as for `pnpm run dev`:

```sh
redis-server
```

If you don't want to setup a local Redis instance, you can [host one](#event-emitter) on Upstash instead.

### 8. Start the server

To start the server, run the following command:

```bash
pnpm dev
```

All the packages will be built and run. Expo will give instructions on how to run the application on your device.

## Production

For setting the application up for deployment, you have to setup a few services for deploying the database, event emitter, HTTP server, and websocket server.

### Database

To start up the database, create a PostgresSQL provision on [Railway](https://railway.app/).

Next, click on the provision and copy the `DATABASE_URL` environment variable from the "Connect" tab. Set the environment variable of `DATABASE_URL` in the `.env` file.

### Event Emitter

To setup the event emitter, setup a Redis instance on Upstash. You can do this on the [Upstash Console](https://console.upstash.com/). Copy the URL from the Upstash Console. Set the environment variable of `REDIS_URL` with the copied text in the `.env` file.

### HTTP Server

To start up the HTTP server, deploy the application onto Vercel with the environment variables from the `.env`. Once you deploy the Vercel application, copy the deployment URL and set it as the `https` base URL in [`apps/expo/src/utils/api.tsx`](./apps/expo/src/utils/api.tsx).

### Websocket Server

To start up the WebSocket server, deploy the application onto Railway with the environment variables from the `.env`. Once you deploy the Railway application, copy the deployment URL and set it as the `wss` base URL in [`apps/expo/src/utils/api.tsx`](./apps/expo/src/utils/api.tsx).
