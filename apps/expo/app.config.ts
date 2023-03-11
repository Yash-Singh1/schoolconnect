// Main configuration file for the application

import type { ExpoConfig } from "@expo/config";

const defineConfig = (): ExpoConfig => ({
  name: "SchoolConnect",
  slug: "schoolconnect",
  scheme: "schoolconnect",
  version: "1.0.0",
  owner: "yashsingh1",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#101010",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.expo.schoolconnect",
    buildNumber: "1.0.0",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/icon.png",
      backgroundColor: "#101010",
    },
    package: "com.expo.schoolconnect",
    versionCode: 1,
  },
  extra: {
    eas: {
      projectId: "7f85a595-e978-430d-ace7-12bb23f6e57c",
    },
    dev: process.env.DEV === "true",
  },
  plugins: [
    "./expo-plugins/with-modify-gradle.js",
    [
      "expo-build-properties",
      {
        ios: {
          flipper: true,
        },
      },
    ],
  ],
});

export default defineConfig;
