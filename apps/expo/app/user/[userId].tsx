// WIP: Modify User Page

import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useSearchParams } from "expo-router";
import { useAtom } from "jotai";

import LoadingWrapper from "../../src/components/LoadingWrapper";
import { Navbar } from "../../src/components/Navbar";
import { tokenAtom } from "../../src/store";
import { api } from "../../src/utils/api";

const ModifyUser: React.FC = () => {
  const params = useSearchParams();

  const [token] = useAtom(tokenAtom);

  const selfQuery = api.user.self.useQuery({
    userId: params.userId as string,
    token,
  });

  return selfQuery.data ? (
    <SafeAreaView className="bg-[#101010]">
      <Stack.Screen options={{ title: "Modify User" }} />
      <View className="w-full h-full">
        <View className="w-full h-[88%]">
          <Text className="text-white text-3xl font-bold mx-4">
            Modify User
          </Text>
          <Text className="mt-4 text-white">Role</Text>
        </View>
        <Navbar />
      </View>
    </SafeAreaView>
  ) : (
    <LoadingWrapper stackName="Modify User" />
  );
};

export default ModifyUser;
