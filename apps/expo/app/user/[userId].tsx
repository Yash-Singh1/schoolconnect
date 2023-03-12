// WIP: Modify User Page

import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useSearchParams } from "expo-router";

import { Navbar } from "../../src/components/Navbar";

const ModifyUser: React.FC = () => {
  const params = useSearchParams();

  return (
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
  );
};

export default ModifyUser;
