# `@acme/ws`

This package contains the WebSocket Server.

## Directory Architecture

This package contains one file, `index.ts` that detects the environment and starts up a WebSocket server.

## Scripts

Here are the scripts that this package exposes.

### `dev`

The `dev` script watches the `index.ts` file and restarts the server and its connections whenever changes are made.

### `start`

The `start` script runs the `index.ts` file without any watching features enabled. This script is intended for production.

## Stack

The WebSocket server is written in TypeScript and is simply a wrapper around the tRPC server.
