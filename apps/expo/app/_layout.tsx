// Wraps layout of all pages, initializes providers and router

import React from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { TRPCProvider } from "../src/utils/api";
import "../src/icons";
import {
  Image,
  TouchableOpacity,
  View,
  type ImageSourcePropType,
} from "react-native";
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

const brandImage: ImageSourcePropType = require("../assets/icon_no_bg_no_gap.png");

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
                      className={`flex flex-row flex-nowrap ${
                        back ? "justify-between" : "justify-center"
                      } items-center pr-4 pl-3 py-1`}
                    >
                      {back ? (
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => {
                            router.back();
                          }}
                          className="p-1"
                        >
                          <FontAwesomeIcon icon="chevron-left" color="white" />
                        </TouchableOpacity>
                      ) : null}
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                          resetStack({ router, navigation });
                        }}
                      >
                        <Image
                          alt="Logo"
                          source={brandImage}
                          style={{ height: 40, width: 51 }}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                      <View />
                    </SafeAreaView>
                  </View>
                </View>
              );
            },
          }}
        />
      </SafeAreaProvider>
    </TRPCProvider>
  );
};

export default RootLayout;
