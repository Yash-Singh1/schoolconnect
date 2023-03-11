import { useCallback, useEffect, useState } from "react";
import { Platform, ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { useAtom } from "jotai";

import { Navbar } from "../../src/components/Navbar";
import { tokenAtom } from "../../src/store";
import { api } from "../../src/utils/api";

async function getPushToken() {
  let token;
  if (Device.isDevice) {
    let { status: permission } = await Notifications.getPermissionsAsync();
    if (permission !== "granted") {
      permission = (await Notifications.requestPermissionsAsync()).status;
    }
    if (permission !== "granted") {
      alert(
        "You must enable push notifications in settings to use this feature",
      );
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    alert("Must use physical device for Push Notifications");
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}

const NotificationSettings: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);

  const [token] = useAtom(tokenAtom);

  const [pushToken, setPushToken] = useState("");

  const registerDeviceMutation = api.user.registerDevice.useMutation();
  const unregisterDeviceMutation = api.user.unregisterDevice.useMutation();
  const devicePresentQuery = api.user.devicePresent.useQuery(
    {
      token,
      device: pushToken,
    },
    {
      enabled: false,
    },
  );

  useEffect(() => {
    async function pushTokenWork() {
      const newPushToken = await getPushToken();
      if (newPushToken && pushToken !== newPushToken) {
        setPushToken(newPushToken);
      } else {
        await devicePresentQuery.refetch();
      }
    }
    void pushTokenWork();
  }, [pushToken]);

  const toggleSwitch = useCallback(async () => {
    const pushToken = await getPushToken();
    if (!pushToken) {
      setIsEnabled(false);
      return;
    }
    if (!isEnabled) {
      registerDeviceMutation.mutate({ token, device: pushToken });
    } else {
      unregisterDeviceMutation.mutate({ token, device: pushToken });
    }
    setIsEnabled((previousState) => !previousState);
  }, [isEnabled]);

  return (
    <SafeAreaView className="bg-[#101010]">
      <Stack.Screen options={{ title: "Notifications" }} />
      <View className="w-full h-full">
        <ScrollView className="h-[88%] w-full pt-2">
          <Text className="px-4 text-3xl font-bold text-white">
            Notifications<Text className="hidden"> </Text>
          </Text>
          <View className="mt-4 flex w-full flex-row items-center justify-between bg-[#2c2c2e] px-4 py-2">
            <View className="flex flex-row justify-between w-full">
              <Text className="text-lg font-bold text-white">
                Enable Notifications
              </Text>
              <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor="#f4f3f4"
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={isEnabled}
              />
            </View>
          </View>
        </ScrollView>
        <Navbar />
      </View>
    </SafeAreaView>
  );
};

export default NotificationSettings;
