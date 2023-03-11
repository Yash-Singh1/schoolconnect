// Main configuration file for the application

import type { ExpoConfig } from "@expo/config";

const defineConfig = (): ExpoConfig => ({
  name: "expo",
  slug: "schoolconnect",
  scheme: "exp",
  version: "1.0.0",
  owner: "yashsingh1",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/icon.png",
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
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/icon.png",
      backgroundColor: "#101010",
    },
    package: "com.expo.schoolconnect",
  },
  extra: {
    eas: {
      projectId: process.env.EAS_PROJECT_ID!,
    },
    dev: process.env.DEV === "true",
  },
  plugins: ["./expo-plugins/with-modify-gradle.js"],
});

export default defineConfig;
