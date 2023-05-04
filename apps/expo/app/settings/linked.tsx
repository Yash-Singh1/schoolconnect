// Manage linked social accounts

import { useEffect } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useAtom } from "jotai";

import LoadingWrapper from "../../src/components/LoadingWrapper";
import { Navbar } from "../../src/components/Navbar";
import { tokenAtom } from "../../src/store";
import { api } from "../../src/utils/api";
import useCode from "../../src/utils/useCode";

// Anti-state to prevent CSRF attacks
const antiState = Math.random().toString();

const Linked: React.FC = () => {
  // Get token from store
  const [token] = useAtom(tokenAtom);

  // Queries for getting the user's data
  const selfQuery = api.user.self.useQuery({ token });
  const schoolQuery = api.school.get.useQuery({ token });

  // Query for getting the user's linked accounts
  const linkedAccountsQuery = api.user.linkedAccounts.useQuery({ token });

  // Cache invalidation utilities
  const util = api.useContext();

  // Mutation for linking a social account
  const { mutate: linkAccount } = api.auth.link.useMutation({
    onSuccess() {
      void util.user.linkedAccounts.refetch();
      void linkedAccountsQuery.refetch();
    },
  });

  // Use authentication helper hook
  const [_request, response, promptAsync] = useCode(
    antiState,
    `/settings/linked`,
  );

  // First step of authentication on client-side over, relay to backend
  useEffect(() => {
    if (response && response?.type === "success") {
      // Check if anti-state matches
      if (response.params.state !== antiState) {
        throw new Error("State mismatch, possible CSRF Attack");
      }

      // Relay to backend
      linkAccount({
        token,
        code: response.params.code!,
      });
    }
  }, [response]);

  return selfQuery.data && schoolQuery.data && linkedAccountsQuery.data ? (
    <SafeAreaView className="bg-[#101010]">
      <Stack.Screen options={{ title: "Linked Accounts" }} />
      <View className="flex h-full w-full flex-col content-center items-center justify-end self-center">
        <ScrollView className="h-[88%] w-full pt-2">
          <Text className="px-4 text-3xl font-bold text-white">
            Linked Accounts
          </Text>

          {/* List of socials to link with */}
          <View className="mt-2 flex w-full flex-row items-center justify-between bg-[#2c2c2e] px-4 py-2">
            <View className="flex flex-row items-center">
              <View className="mr-2 rounded-full bg-[#1c1c1e] p-1">
                <FontAwesomeIcon
                  icon={["fab", "github"]}
                  size={50}
                  color="white"
                />
              </View>
              <Text className="text-xl font-bold text-gray-300">GitHub</Text>
            </View>
            {linkedAccountsQuery.data["github"] ? (
              <FontAwesomeIcon icon="check" size={30} color="#3b82f6" />
            ) : (
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => {
                  void promptAsync();
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
    <LoadingWrapper stackName="Linked Accounts" />
  );
};

export default Linked;
