# `@acme/expo`

The Expo application is the main frontend mobile application of the SchoolConnect application. It is built using Expo and React Native.

## Stack

The stack of this project is as follows:

- Expo SDK 48
- React Native 0.71
- NativeWind for Tailwind mimicry
- Tanstack Query for the caching layer
- tRPC client (wraps around Tanstack Query)
- Jotai for global state management

## Deployment

There are three different deployment methods for this application:

### Expo Go

Expo Go creates an instant HMR feedback loop for the application. It is the fastest way to test the application, while developing it. Expo Go is available on both Android and iOS and handles the configuration for push notifications and doesn't require credentials.

### Development Build

Development builds run on Expo's servers and allow the application to then be downloaded onto a device. The development build still features HMR, but the configuration has to be done by the developer. This is useful for testing out how the application would look like on a device, without having to publish it. On Android, it's as simple as downloading the APK file and installing it. On iOS, it's a bit more complicated, and requires a Apple Developer Account. For this reason, the iOS demo only features the application in Expo Go.

### Production Build

A production build is similar to a development build but all the HMR and other developer features for debugging are stripped off the application and it is optimized for production. This is the build that is published to the App Store and Play Store.
