// Modify User Page -- provided to admin for managing their school's users

import { useState } from "react";
import { Dimensions, ScrollView, Text, TextInput, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter, useSearchParams } from "expo-router";
import { useAtom } from "jotai";

import LoadingWrapper from "../../src/components/LoadingWrapper";
import { Navbar } from "../../src/components/Navbar";
import { tokenAtom } from "../../src/store";
import { api, type RouterInputs } from "../../src/utils/api";

const ModifyUser: React.FC = () => {
  // Get the user ID from the URL
  const params = useSearchParams();

  // Get token from store
  const [token] = useAtom(tokenAtom);

  // Form data states
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [roleValue, setRoleValue] = useState<string | null>(null);
  const [newName, setNewName] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState<string | null>(null);

  // Query for getting the user's data
  const selfQuery = api.user.self.useQuery(
    {
      userId: params.userId as string,
      token,
    },
    {
      onSuccess(data) {
        // Populate form data if user exists
        if (data) {
          setRoleValue(data.role);
          setNewName(data.name || "");
          setNewEmail(data.email || "");
        } else {
          setRoleValue("student");
          setNewName("");
          setNewEmail("");
        }
      },
    },
  );

  // Initialize router helper
  const router = useRouter();

  // Mutation for updating the user
  const util = api.useContext();
  const updateUserMutation = api.user.update.useMutation({
    async onSuccess() {
      // Invalidate the user query to update the UI
      await util.user.invalidate();

      // Navigate back to the admin members page
      router.back();
    },
  });

  // Show loading indicator if query is loading
  return selfQuery.data && roleValue ? (
    <SafeAreaView className="bg-[#101010]">
      <Stack.Screen options={{ title: "Modify User" }} />
      <View className="w-full h-full">
        <ScrollView className="w-full h-[88%] px-4">
          {/* Header */}
          <Text className="text-white text-3xl font-bold">Modify User</Text>

          <View className="flex gap-y-1 mt-2">
            {/* Role Dropdown */}
            <Text className="mt-4 text-white text-lg">Role</Text>
            <View className="z-10">
              <DropDownPicker
                open={roleDropdownOpen}
                value={roleValue}
                items={[
                  {
                    label: "Admin",
                    value: "admin",
                  },
                  {
                    label: "Teacher",
                    value: "teacher",
                  },
                  {
                    label: "Student",
                    value: "student",
                  },
                  {
                    label: "Parent",
                    value: "parent",
                  },
                ]}
                placeholder="Select a role"
                setOpen={setRoleDropdownOpen}
                setValue={setRoleValue}
                theme="DARK"
              />
            </View>
          </View>

          {/* Name Input */}
          <View className="flex gap-y-1 mt-2">
            <Text className="mt-4 text-white text-lg">Name</Text>
            <TextInput
              style={{ width: Dimensions.get("screen").width - 32 }}
              className="mb-1 mt-2 rounded bg-white/10 p-2 text-white"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={newName!}
              onChangeText={setNewName}
              // @ts-expect-error -- TODO: Contribute to react-native typings, they support enterKeyHint but didn't document it
              enterKeyHint="done"
              placeholder="New name"
            />
          </View>

          {/* Email Input -- only for non-registered pending users */}
          {selfQuery.data.pending ? (
            <View className="flex gap-y-1 mt-2">
              <Text className="mt-4 text-white text-lg">Email</Text>
              <TextInput
                style={{ width: Dimensions.get("screen").width - 32 }}
                className="mb-1 mt-2 rounded bg-white/10 p-2 text-white"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={newEmail!}
                onChangeText={setNewEmail}
                // @ts-expect-error -- TODO: Contribute to react-native typings, they support enterKeyHint but didn't document it
                enterKeyHint="done"
                placeholder="New email"
              />
            </View>
          ) : null}

          {/* Reset form data button */}
          <Text
            onPress={() => {
              setNewName(selfQuery.data!.name || "");
              setNewEmail(selfQuery.data!.email || "");
              setRoleValue(selfQuery.data!.role);
            }}
            className="mt-2 rounded-lg bg-red-500/80 py-2 text-center text-lg font-bold text-white"
          >
            Reset
          </Text>

          {/* Update user button -- show loading disabled button if mutation currently running */}
          {updateUserMutation.isLoading ? (
            <LoadingWrapper
              small
              spinClass="bg-green-500/80 mt-2 py-2 rounded-lg flex flex-row justify-center items-center gap-x-4 ml-1"
              spinStyle={{
                width: Dimensions.get("screen").width - 32,
              }}
            >
              <Text className="font-bold text-white text-lg">Update user</Text>
            </LoadingWrapper>
          ) : (
            <Text
              onPress={() => {
                updateUserMutation.mutate({
                  userId: params.userId as string,
                  token,
                  role: roleValue as RouterInputs["user"]["update"]["role"],
                  name: newName!,
                  email: selfQuery.data!.pending ? newEmail! : undefined,
                });
              }}
              className="mt-2 rounded-lg bg-green-500/80 py-2 text-center text-lg font-bold text-white"
            >
              Update User
            </Text>
          )}
        </ScrollView>
        <Navbar />
      </View>
    </SafeAreaView>
  ) : (
    <LoadingWrapper stackName="Modify User" />
  );
};

export default ModifyUser;
