// Wraps layout of all pages, initializes providers and router

import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { TRPCProvider } from "../src/utils/api";
import "../src/icons";

const RootLayout = () => {
  return (
    <TRPCProvider>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: "#f472b6",
            },
          }}
        />
        <StatusBar />
      </SafeAreaProvider>
    </TRPCProvider>
  );
};

export default RootLayout;
