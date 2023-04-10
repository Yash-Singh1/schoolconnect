// Advanced settings, currently only allows deleting accounts

import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useNavigation, useRouter } from "expo-router";
import { useAtom } from "jotai";

import { Navbar } from "../../src/components/Navbar";
import { tokenAtom } from "../../src/store";
import { api } from "../../src/utils/api";
import { resetStack, type NavigatorOverride } from "../../src/utils/resetStack";

const Advanced: React.FC = () => {
  // Initialize router helper
  const router = useRouter();
  const navigation = useNavigation() as NavigatorOverride;

  // Get token from store
  const [token] = useAtom(tokenAtom);

  // Mutation for deleting the user
  const deleteMutation = api.user.delete.useMutation();

  return (
    <SafeAreaView className="bg-[#101010]">
      <Stack.Screen options={{ title: "Advanced Settings" }} />
      <View className="flex h-full w-full flex-col content-center items-center justify-end self-center">
        <ScrollView className="h-[88%] w-full pt-2">
          {/* Header */}
          <Text className="px-4 text-3xl font-bold text-white">
            Advanced Settings
          </Text>

          {/* Delete User Button */}
          <TouchableOpacity
            activeOpacity={0.5}
            className="flex mt-4 w-full flex-row items-center justify-between bg-[#2c2c2e] px-4 py-3"
          >
            <Text
              className="text-lg font-semibold text-red-500"
              onPress={() => {
                if (
                  confirm(
                    "Are you sure you want to delete your account? This will permenantly delete all information and links associated with it.",
                  )
                ) {
                  deleteMutation.mutate({ token });
                  resetStack({ router, navigation });
                }
              }}
            >
              Delete User
            </Text>
          </TouchableOpacity>
        </ScrollView>
        <Navbar />
      </View>
    </SafeAreaView>
  );
};

export default Advanced;
