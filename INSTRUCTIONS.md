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

#### Production

If you would like to deploy a production version of the database, 

### 3. Setup GitHub OAuth

To setup GitHub OAuth, you will need to create a new OAuth app on GitHub. To do this, follow the instructions on GitHub's [guide](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app) and copy the client ID and client secret to their respective places in the `.env` file. For the callback URL, use `exp://[YOUR_IP]:19000`.

### 4. Setup Imgbb API

To do this, simply navigate to [Imgbb](https://imgbb.com/) and create an account. Then, create and copy the API key from the [dashboard](https://api.imgbb.com/) to the `.env` file.

### 5. Setup QStash

To get your QStash keys, create a new Upstash account and navigate to the [QStash console](https://console.upstash.com/qstash). Then, copy the keys underneath **Details > Request Builder** into the `.env` file.

### 6. Find Device

The process of this step depends on whether you choose to run the application on a physical device or an emulator.

### Emulator

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

### Physical Device

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

### 7. Start the server

To start the server, run the following command:

```bash
pnpm dev
```

All the packages will be built and run. Expo will give instructions on how to run the application on your device.
