// Wraps layout of all pages, initializes providers and router

import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { TRPCProvider } from "../src/utils/api";
import "../src/icons";

// Set notification handler for the application
Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    };
  },
});

const RootLayout = () => {
  return (
    // Initialize TRPC Client wrapper
    <TRPCProvider>
      {/* Initialize SafeAreaProvider for preventing intersection with system UI */}
      <SafeAreaProvider>
        {/* Initialize routing system */}
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: "#f472b6",
            },
            headerBackTitleVisible: false,
          }}
        />
        <StatusBar />
      </SafeAreaProvider>
    </TRPCProvider>
  );
};

export default RootLayout;
