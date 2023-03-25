// Wraps layout of all pages, initializes providers and router

import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { TRPCProvider } from "../src/utils/api";
import "../src/icons";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const RootLayout = () => {
  return (
    <TRPCProvider>
      <SafeAreaProvider>
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
