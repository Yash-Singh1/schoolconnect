// Absences screen

import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { useAtom } from "jotai";

import LoadingWrapper from "../src/components/LoadingWrapper";
import { Navbar } from "../src/components/Navbar";
import { tokenAtom } from "../src/store";
import { api } from "../src/utils/api";

// Dashboard when the user is an admin
const AdminAbsences: React.FC = () => {
  return <View />;
};

// Dashboard when the user is a parent
const ParentAbsences: React.FC = () => {
  return (
    <SafeAreaView className="bg-[#101010]">
      <Stack.Screen />
      <View className="w-full h-full">
        <View className="h-[88%]">
          <Text className="text-white text-3xl mx-4 font-bold">Report Absence</Text>
        </View>
        <Navbar />
      </View>
    </SafeAreaView>
  );
};

const Absences: React.FC = () => {
  const [token] = useAtom(tokenAtom);

  const selfQuery = api.user.self.useQuery({
    token,
  });

  return selfQuery.data ? (
    selfQuery.data.role === "admin" ? (
      <AdminAbsences />
    ) : (
      <ParentAbsences />
    )
  ) : (
    <LoadingWrapper stackName="Absences" />
  );
};

export default Absences;
