// Enable and disable notifications about events and posts

import { useCallback, useEffect, useState } from "react";
import { ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { useAtom } from "jotai";

import LoadingWrapper from "../../src/components/LoadingWrapper";
import { Navbar } from "../../src/components/Navbar";
import { tokenAtom } from "../../src/store";
import { api } from "../../src/utils/api";
import { getPushToken } from "../../src/utils/getPushToken";

const NotificationSettings: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);

  const [token] = useAtom(tokenAtom);

  const [pushToken, setPushToken] = useState("");
  const [evaluated, setEvaluated] = useState(false);

  const registerDeviceMutation = api.user.registerDevice.useMutation();
  const unregisterDeviceMutation = api.user.unregisterDevice.useMutation();
  const devicePresentQuery = api.user.devicePresent.useQuery(
    {
      token,
      device: pushToken,
    },
    {
      enabled: false,
      onSuccess: (data) => {
        setIsEnabled(data);
        setEvaluated(true);
      },
    },
  );

  useEffect(() => {
    async function pushTokenWork() {
      const newPushToken = await getPushToken();
      if (newPushToken) {
        setPushToken(newPushToken);
        await devicePresentQuery.refetch();
      } else {
        setIsEnabled(false);
        setEvaluated(true);
      }
    }
    void pushTokenWork();
  }, []);

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

  return evaluated ? (
    <SafeAreaView className="bg-[#101010]">
      <Stack.Screen options={{ title: "Notifications" }} />
      <View className="w-full h-full">
        <ScrollView className="h-[88%] w-full pt-2">
          <Text className="px-4 text-3xl font-bold text-white">
            Notifications<Text className="hidden"> </Text>
          </Text>
          <View className="mt-4 flex w-full flex-row items-center justify-between bg-[#2c2c2e] px-4 py-2">
            <View className="flex flex-row justify-between items-center w-full">
              <Text className="text-lg font-bold android:font-normal text-white">
                Enable Notifications<Text className="hidden"> </Text>
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
          <Text className="w-full text-white text-left px-4 mt-2">
            We will notify you on the latest posts and upcoming events scheduled
          </Text>
        </ScrollView>
        <Navbar />
      </View>
    </SafeAreaView>
  ) : (
    <LoadingWrapper stackName="Notifications" />
  );
};

export default NotificationSettings;
