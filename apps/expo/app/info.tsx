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
import { TOKEN_KEY } from "../src/utils/constants";
import { getPushToken } from "../src/utils/getPushToken";
import { resetStack, type NavigatorOverride } from "../src/utils/resetStack";
import Links from "../src/components/Links";

const Settings: React.FC = () => {
  // Initialize router helpers
  const router = useRouter();
  const navigation = useNavigation() as NavigatorOverride;

  // Get token from store
  const [token, setToken] = useAtom(tokenAtom);

  // Queries for getting the user's data
  const selfQuery = api.user.self.useQuery({ token });
  const schoolQuery = api.school.get.useQuery({ token });

  // Mutation for unregistering a device
  const unregisterDeviceMutation = api.user.unregisterDevice.useMutation();

  return selfQuery.data && schoolQuery.data ? (
    <SafeAreaView className="bg-[#101010]">
      <Stack.Screen options={{ title: "Settings" }} />
      <View className="flex h-full w-full flex-col content-center items-center justify-end self-center">
        <ScrollView className="h-[88%] w-full pt-2">
          <Text className="px-4 text-4xl font-bold text-white">Settings</Text>
          {/* Basic info on the user */}
          <View className="mt-2 flex w-full flex-row items-center bg-[#2c2c2e] px-6 py-4">
            <View className="mr-2 rounded-full border-2 border-white bg-[#1c1c1e] p-4 pt-3">
              <FontAwesomeIcon icon="user" size={50} color="white" />
            </View>
            <Text className="text-xl font-bold text-gray-300">
              <Text>{selfQuery.data.name || "No name"}</Text>
              <Text className="text-base">
                {"\n"}
                {schoolQuery.data.name}
              </Text>
            </Text>
          </View>

          {/* Personal Info Settings Link */}
          <View className="border-b border-gray-200"></View>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {
              router.push("/settings/personal");
            }}
            className="flex w-full flex-row items-center justify-between bg-[#2c2c2e] px-4 py-3"
          >
            <Text className="text-lg font-bold text-white">Personal Info</Text>
            <FontAwesomeIcon icon="chevron-right" color="white" size={15} />
          </TouchableOpacity>

          {/* Linked Accounts Settings */}
          <View className="border-b border-gray-200"></View>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {
              router.push("/settings/linked");
            }}
            className="flex w-full flex-row items-center justify-between bg-[#2c2c2e] px-4 py-3"
          >
            <Text className="text-lg font-bold text-white">Linked Socials</Text>
            <FontAwesomeIcon icon="chevron-right" color="white" size={15} />
          </TouchableOpacity>

          {/* Contacts Settings */}
          <View className="border-b border-gray-200"></View>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {
              router.push("/settings/contacts");
            }}
            className="flex w-full flex-row items-center justify-between bg-[#2c2c2e] px-4 py-3"
          >
            <Text className="text-lg font-bold text-white">Contact Us</Text>
            <FontAwesomeIcon icon="chevron-right" color="white" size={15} />
          </TouchableOpacity>

          {/* Notifications Settings */}
          <View className="border-b border-gray-200"></View>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => router.push("/settings/notifications")}
            className="flex w-full flex-row items-center justify-between bg-[#2c2c2e] px-4 py-3"
          >
            <Text className="text-lg font-bold text-white">Notifications</Text>
            <FontAwesomeIcon icon="chevron-right" color="white" size={15} />
          </TouchableOpacity>

          {/* Advanced Settings Link */}
          <View className="border-b border-gray-200"></View>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => router.push("/settings/advanced")}
            className="flex w-full flex-row items-center justify-between bg-[#2c2c2e] px-4 py-3"
          >
            <Text className="text-lg font-bold text-white">
              Advanced Settings
            </Text>
            <FontAwesomeIcon icon="chevron-right" color="white" size={15} />
          </TouchableOpacity>

          {/* Logout Option */}
          <View className="border-b border-gray-200"></View>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {
              // Delete the token from written store
              void SecureStore.deleteItemAsync(TOKEN_KEY).then(async () => {
                // Delete the token from the in-memory store
                setToken("");

                // Unregister notifications from this device
                const pushToken = await getPushToken(false);
                if (pushToken) {
                  await unregisterDeviceMutation.mutateAsync({
                    token,
                    device: pushToken,
                  });
                }

                // Reset the route back to the login screen
                resetStack({ router, navigation });
              });
            }}
            className="w-full bg-[#2c2c2e] px-4 py-3"
          >
            <Text className="text-xl font-bold text-red-500">Logout</Text>
          </TouchableOpacity>

          {/* Links to licenses, privacy policy, etc. */}
          <Links />
        </ScrollView>
        <Navbar />
      </View>
    </SafeAreaView>
  ) : (
    // SHow loading bar if queries are still loading
    <LoadingWrapper stackName="Settings" />
  );
};

export default Settings;
