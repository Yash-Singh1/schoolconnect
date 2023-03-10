// Manage linked social accounts, such as GitHub, Facebook, etc.

import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useAtom } from "jotai";

import LoadingWrapper from "../../src/components/LoadingWrapper";
import { Navbar } from "../../src/components/Navbar";
import { tokenAtom } from "../../src/store";
import { api } from "../../src/utils/api";

const Settings: React.FC = () => {
  const [token] = useAtom(tokenAtom);

  const selfQuery = api.user.self.useQuery({ token });
  const schoolQuery = api.school.get.useQuery({ token });

  const linkedAccountsQuery = api.user.linkedAccounts.useQuery({ token });

  return selfQuery.data && schoolQuery.data && linkedAccountsQuery.data ? (
    <SafeAreaView className="bg-[#101010]">
      <Stack.Screen options={{ title: "Settings" }} />
      <View className="flex h-full w-full flex-col content-center items-center justify-end self-center">
        <ScrollView className="h-[88%] w-full pt-2">
          <Text className="px-4 text-3xl font-bold text-white">
            Linked Accounts<Text className="hidden"> </Text>
          </Text>
          <View className="mt-2 flex w-full flex-row items-center justify-between bg-[#2c2c2e] px-4 py-2">
            <View className="flex flex-row items-center">
              <View className="mr-2 rounded-full bg-[#1c1c1e] p-1">
                <FontAwesomeIcon
                  icon={["fab", "github"]}
                  size={50}
                  color="white"
                />
              </View>
              <Text className="text-xl font-bold text-gray-300 android:font-normal">
                GitHub<Text> </Text>
              </Text>
            </View>
            {linkedAccountsQuery.data["github"] ? (
              <FontAwesomeIcon icon="check" size={30} color="#3b82f6" />
            ) : (
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => {
                  // TODO: Implement account linking
                }}
              >
                <FontAwesomeIcon icon="plus" size={30} color="white" />
              </TouchableOpacity>
            )}
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
