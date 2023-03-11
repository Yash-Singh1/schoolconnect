// WIP: Schedule page

import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

const Schedule: React.FC = () => {
  return (
    <SafeAreaView className="bg-[#101010]">
      <Stack.Screen options={{ title: "Schedule" }} />
      <View className="flex h-full w-full items-center justify-center">
        <Text className="text-3xl font-bold text-white">
          WIP<Text className="hidden"> </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default Schedule;
