// Absences screen

import { useEffect, useState } from "react";
import { Dimensions, Text, TextInput, View } from "react-native";
import DropDownPicker, { type ItemType } from "react-native-dropdown-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { useAtom } from "jotai";

import { DatePicker } from "../src/components/DatePicker";
import { Navbar } from "../src/components/Navbar";
import { tokenAtom } from "../src/store";
import { api } from "../src/utils/api";

// Dashboard when the user is a parent
const ParentAbsences: React.FC = () => {
  // Form state for reporting an absence
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ItemType<string>[]>([]);
  const [reason, setReason] = useState("");
  const [dateTill, setDateTill] = useState(new Date());

  // Get token from store
  const [token] = useAtom(tokenAtom);

  // Query for getting the user's children
  const childrenQuery = api.user.children.useQuery({
    token,
  });

  // Mutation for reporting an absence
  const reportAbsence = api.absence.reportAbsence.useMutation({
    async onSuccess() {
      // Reset form state
      setValue(null);
      setReason("");
      setDateTill(new Date());
      setOpen(false);
    },
  });

  // When the children query is done loading, set the items for the dropdown
  useEffect(() => {
    if (loading && childrenQuery.data && childrenQuery.data.length > 0) {
      setLoading(false);
      setItems(
        childrenQuery.data.map((child) => ({
          label: child.name!,
          value: child.id,
        })),
      );
    }
  }, [childrenQuery.data]);

  return (
    <SafeAreaView className="bg-[#101010]">
      <Stack.Screen options={{ title: "Absences" }} />
      <View className="w-full h-full flex">
        <View className="h-[88%] mx-2">
          {/* Header */}
          <Text className="text-white text-3xl font-bold mx-1">
            Report Absence
          </Text>

          {/* Child to report */}
          <View className="flex mx-2">
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
                theme="DARK"
              />
            </View>
          </View>

          {/* Reason of absence */}
          <View className="mx-2 -z-10">
            <Text className="text-white text-lg mt-4">Reason</Text>
            <TextInput
              className="mt-2 mb-1 rounded bg-white/10 p-2 text-white"
              placeholder="Reason of absence"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={reason}
              onChangeText={setReason}
            />
          </View>

          {/* Date absent till */}
          <View className="flex flex-col items-start -z-10">
            <Text className="text-white text-lg mt-4 mb-1 mx-2">
              Date absent till
            </Text>
            <DatePicker
              value={dateTill}
              mode="date"
              themeVariant="dark"
              onChange={(_, value) => value && setDateTill(value)}
            />
          </View>

          {/* Submit button */}
          <Text
            style={{
              width: Dimensions.get("screen").width - 32,
            }}
            className="text-white text-lg font-semibold text-center mt-4 bg-green-500/80 rounded-lg mx-2"
            onPress={() => {
              if (value && reason) {
                void reportAbsence.mutateAsync({
                  userId: value,
                  token,
                  reason,
                  dateTill,
                });
              }
            }}
          >
            Report Absence
          </Text>
        </View>
        <Navbar />
      </View>
    </SafeAreaView>
  );
};

export default ParentAbsences;
