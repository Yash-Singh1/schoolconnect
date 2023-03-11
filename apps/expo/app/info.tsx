// The settings and information page

import {
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useNavigation, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useAtom } from "jotai";

import LoadingWrapper from "../src/components/LoadingWrapper";
import { Navbar } from "../src/components/Navbar";
import { tokenAtom } from "../src/store";
import { api } from "../src/utils/api";
import { TOKEN_KEY, baseURL } from "../src/utils/constants";
import { getPushToken } from "../src/utils/getPushToken";
import { resetStack } from "../src/utils/resetStack";

const Settings: React.FC = () => {
  const router = useRouter();
  const navigation = useNavigation();

  const [token, setToken] = useAtom(tokenAtom);

  const selfQuery = api.user.self.useQuery({ token });
  const schoolQuery = api.school.get.useQuery({ token });

  const unregisterDeviceMutation = api.user.unregisterDevice.useMutation();

  return selfQuery.data && schoolQuery.data ? (
    <SafeAreaView className="bg-[#101010]">
      <Stack.Screen options={{ title: "Settings" }} />
      <View className="flex h-full w-full flex-col content-center items-center justify-end self-center">
        <ScrollView className="h-[88%] w-full pt-2">
          <Text className="px-4 text-4xl font-bold text-white">
            Settings<Text className="hidden"> </Text>
          </Text>
          <View className="mt-2 flex w-full flex-row items-center bg-[#2c2c2e] px-6 py-4">
            <View className="mr-2 rounded-full border-2 border-white bg-[#1c1c1e] p-4 pt-3">
              <FontAwesomeIcon icon="user" size={50} color="white" />
            </View>
            <Text className="text-xl font-bold text-gray-300 android:font-normal">
              <Text>{selfQuery.data.name || "No name"}</Text>
              <Text className="text-base">
                {"\n"}
                {schoolQuery.data.name}
              </Text>
              <Text className="hidden"> </Text>
            </Text>
          </View>
          <View className="border-b border-gray-200"></View>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {
              router.push("/settings/personal");
            }}
            className="flex w-full flex-row items-center justify-between bg-[#2c2c2e] px-4 py-3"
          >
            <Text className="text-lg font-bold text-white">
              Personal Info<Text className="hidden"> </Text>
            </Text>
            <FontAwesomeIcon icon="chevron-right" color="white" size={15} />
          </TouchableOpacity>
          <View className="border-b border-gray-200"></View>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {
              router.push("/settings/linked");
            }}
            className="flex w-full flex-row items-center justify-between bg-[#2c2c2e] px-4 py-3"
          >
            <Text className="text-lg font-bold text-white">
              Linked Socials<Text className="hidden"> </Text>
            </Text>
            <FontAwesomeIcon icon="chevron-right" color="white" size={15} />
          </TouchableOpacity>
          <View className="border-b border-gray-200"></View>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {
              router.push("/settings/contacts");
            }}
            className="flex w-full flex-row items-center justify-between bg-[#2c2c2e] px-4 py-3"
          >
            <Text className="text-lg font-bold text-white">
              Contact Us<Text className="hidden"> </Text>
            </Text>
            <FontAwesomeIcon icon="chevron-right" color="white" size={15} />
          </TouchableOpacity>
          <View className="border-b border-gray-200"></View>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => router.push("/settings/notifications")}
            className="flex w-full flex-row items-center justify-between bg-[#2c2c2e] px-4 py-3"
          >
            <Text className="text-lg font-bold text-white">
              Notifications <Text className="hidden"> </Text>
            </Text>
            <FontAwesomeIcon icon="chevron-right" color="white" size={15} />
          </TouchableOpacity>
          <View className="border-b border-gray-200"></View>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => router.push("/settings/advanced")}
            className="flex w-full flex-row items-center justify-between bg-[#2c2c2e] px-4 py-3"
          >
            <Text className="text-lg font-bold text-white">
              Advanced Settings <Text className="hidden"> </Text>
            </Text>
            <FontAwesomeIcon icon="chevron-right" color="white" size={15} />
          </TouchableOpacity>
          <View className="border-b border-gray-200"></View>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {
              void SecureStore.deleteItemAsync(TOKEN_KEY).then(async () => {
                setToken("");
                // Unregister notifications from this device
                const pushToken = await getPushToken(false);
                if (pushToken) {
                  await unregisterDeviceMutation.mutateAsync({
                    token,
                    device: pushToken,
                  });
                }
                resetStack({ router, navigation });
              });
            }}
            className="w-full bg-[#2c2c2e] px-4 py-3"
          >
            <Text className="text-xl font-bold text-red-500">
              Logout<Text className="hidden"> </Text>
            </Text>
          </TouchableOpacity>
          {/* TODO: License and term of use and privacy policy */}
          <Text className="mt-4 w-full text-center text-lg text-white">
            Based on the{" "}
            <Text
              onPress={() =>
                void Linking.openURL("https://opensource.org/license/mit/")
              }
              className="text-blue-500"
            >
              MIT License
            </Text>
            {"\n"}
            &#169; 2023 Yash Singh
          </Text>
          <View className="mb-8 mt-1 flex w-full flex-row items-center justify-center">
            <Text
              className="text-lg text-blue-500"
              onPress={() => void Linking.openURL(`${baseURL}privacy`)}
            >
              Privacy Policy
            </Text>
            <Text className="mx-2 text-white">•</Text>
            <Text
              className="text-lg text-blue-500"
              onPress={() => void Linking.openURL(`${baseURL}tos`)}
            >
              Terms of Service
            </Text>
          </View>
        </ScrollView>
        <Navbar />
      </View>
    </SafeAreaView>
  ) : (
    <LoadingWrapper stackName="Settings" />
  );
};

export default Settings;
