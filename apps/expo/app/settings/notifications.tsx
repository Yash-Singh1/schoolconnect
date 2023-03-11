import { useCallback, useEffect, useState } from "react";
import { ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { useAtom } from "jotai";

import { Navbar } from "../../src/components/Navbar";
import { tokenAtom } from "../../src/store";
import { api } from "../../src/utils/api";
import { getPushToken } from "../../src/utils/getPushToken";

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
