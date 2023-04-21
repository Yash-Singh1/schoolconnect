# SchoolConnect

This is the main repository and source code for the SchoolConnect application. It contains the backend, frontend, website, and database of the application. If you are looking for the documentation, check out our [support tracker](https://github.com/Yash-Singh1/schoolconnect/issues).

## Stack

The technology stack of this application consists of the following:

- React Native and Expo for the Frontend
  - NativeWind for Tailwind mimicry
  - Tanstack Query for the caching layer
  - tRPC client (wraps around Tanstack Query)
  - Jotai for global state management
- Next.js for the backend and website
  - Backend written using tRPC
  - PostgreSQL for the database
  - Prisma for the database ORM
  - Kumiko for the styling
  - QStash for scheduling tasks
  - `expo-server-sdk` for sending push notifications
  - GitHub OAuth for authentication
- TypeScript for the JavaScript typing
- GitHub Actions for CI to make sure the code is always working
- Deployment
  - Expo for the mobile application
  - Vercel for the backend and website
  - Railway for the database/websockets

## Architecture

The architecture of how the packages interact with each other is as shown in the following diagram:

<img src="./docs/assets/highlevel.png" alt="Architecture Diagram" width="50%" />

For more information on the specifics of the packages, check out the READMEs in their packages.

## Getting Started

To get started running this application, check out the [instructions](./INSTRUCTIONS.md). For more information this application, view our [documentation](https://schoolconnect-docs.vercel.app/).
