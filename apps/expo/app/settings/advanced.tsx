// Advanced settings, currently only allows deleting accounts

import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useNavigation, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useAtom, useSetAtom } from "jotai";

import { Navbar } from "../../src/components/Navbar";
import { tokenAtom, userIdAtom } from "../../src/store";
import { api } from "../../src/utils/api";
import { TOKEN_KEY } from "../../src/utils/constants";
import { resetStack, type NavigatorOverride } from "../../src/utils/resetStack";

const Advanced: React.FC = () => {
  // Initialize router helper
  const router = useRouter();
  const navigation = useNavigation() as unknown as NavigatorOverride;

  // Get token from store
  const [token, setToken] = useAtom(tokenAtom);

  // Setter for user ID
  const setUserId = useSetAtom(userIdAtom);

  // Caching utilities
  const util = api.useContext();

  // Mutation for deleting the user
  const deleteMutation = api.user.delete.useMutation({
    onSuccess() {
      // Delete token from persistent store
      void SecureStore.deleteItemAsync(TOKEN_KEY).then(async () => {
        // Delete token and data on user from in-memory store
        setToken("");
        setUserId("");

        // Invalidate all cache
        void util.invalidate();

        // Reset router to login page
        resetStack({ router, navigation });
      });
    },
  });

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
