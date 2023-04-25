// Wraps layout of all pages, initializes providers and router

import React from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { TRPCProvider } from "../src/utils/api";
import "../src/icons";
import { Image, Platform, TouchableOpacity, View } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";

import { resetStack } from "../src/utils/resetStack";

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
  const router = useRouter();

  return (
    // Initialize TRPC Client wrapper
    <TRPCProvider>
      <StatusBar style="light" />

      {/* Initialize SafeAreaProvider for preventing intersection with system UI */}
      <SafeAreaProvider>
        {/* Initialize routing system */}
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: "#f472b6",
            },
            headerBackTitleVisible: false,
            header: ({ back, navigation }) => {
              return (
                <View className="bg-[#101010]">
                  <View className="bg-cyan-600/80">
                    <SafeAreaView
                      className={`flex flex-row justify-center items-center px-4 pt-1 ${
                        Platform.OS === "ios" ? "pb-0" : "pb-1"
                      }`}
                    >
                      {back ? (
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => {
                            router.back();
                          }}
                        >
                          <FontAwesomeIcon icon="chevron-left" color="white" />
                        </TouchableOpacity>
                      ) : null}
                      <View>
                        {
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => {
                              resetStack({ router, navigation });
                            }}
                          >
                            <Image
                              alt="Logo"
                              source={{
                                uri: "https://schoolconnect-mu.vercel.app/icon.png",
                              }}
                              className="h-10"
                              resizeMode="contain"
                            />
                          </TouchableOpacity>
                        }
                      </View>
                      <View />
                    </SafeAreaView>
                  </View>
                </View>
              );
            },
          }}
        />
        <StatusBar />
      </SafeAreaProvider>
    </TRPCProvider>
  );
};

export default RootLayout;
