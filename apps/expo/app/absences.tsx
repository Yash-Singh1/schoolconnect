// Absences screen

import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import DropDownPicker, { type ItemType } from "react-native-dropdown-picker";
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
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ItemType<string>[]>([]);

  const [token] = useAtom(tokenAtom);

  const childrenQuery = api.user.children.useQuery({
    token,
  });

  useEffect(() => {
    if (loading && childrenQuery.data && childrenQuery.data.length > 0)
      setLoading(false);
  }, [childrenQuery.data]);

  return (
    <SafeAreaView className="bg-[#101010]">
      <Stack.Screen />
      <View className="w-full h-full flex">
        <View className="h-[88%] mx-4">
          <Text className="text-white text-3xl font-bold">Report Absence</Text>
          <View className="flex">
            <Text className="text-white text-lg mt-4">Child to report</Text>
            <View className="z-10 mt-1">
              <DropDownPicker
                open={open}
                value={value}
                items={items}
                setItems={setItems}
                searchable={true}
                placeholder="Select a child"
                setOpen={setOpen}
                setValue={setValue}
                loading={loading}
                onOpen={() => {
                  void childrenQuery.refetch();
                }}
              />
            </View>
          </View>
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
