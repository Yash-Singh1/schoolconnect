// Personal information, name, email, etc.

import { useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useAtom } from "jotai";

import LoadingWrapper from "../../src/components/LoadingWrapper";
import { Navbar } from "../../src/components/Navbar";
import { tokenAtom } from "../../src/store";
import { api } from "../../src/utils/api";

// Convert role to localized string
function formatRole(role: string) {
  switch (role) {
    case "student":
      return "Student";
    case "teacher":
      return "Teacher";
    case "admin":
      return "Admin";
    case "parent":
      return "Parent/Guardian";
    default:
      return "Unknown";
  }
}

const Personal: React.FC = () => {
  // Get token from store
  const [token] = useAtom(tokenAtom);

  // Queries for getting the user's data
  const selfQuery = api.user.self.useQuery({ token });
  const schoolQuery = api.school.get.useQuery({ token });

  // State for modal form data
  const [modalVisible, setModalVisible] = useState<string | boolean>(false);
  const [newName, setNewName] = useState("");

  // Mutations for changing user data
  const utils = api.useContext();
  const setNameMutation = api.user.setName.useMutation({
    onSuccess: () => {
      // Invalidate the user's data and reset form data
      void utils.user.invalidate();
      setModalVisible(false);
      setNewName("");
    },
  });
  const setPasswordMutation = api.user.setPassword.useMutation({
    onSuccess: () => {
      // Invalidate the user's data and reset form data
      void utils.user.invalidate();
      setModalVisible(false);
      setNewName("");
    },
  });

  return selfQuery.data && schoolQuery.data ? (
    <SafeAreaView className="bg-[#101010]">
      <Stack.Screen options={{ title: "Personal Settings" }} />
      <View className="flex h-full w-full flex-col content-center items-center justify-end self-center">
        <ScrollView className="h-[88%] w-full pt-2">
          {/* Header + basic info on user */}
          <Text className="px-4 text-3xl font-bold text-white">
            Personal Info
          </Text>
          <View className="mt-2 flex w-full flex-row items-center bg-[#2c2c2e] px-6 py-4">
            <View className="mr-2 rounded-full border-2 border-white bg-[#1c1c1e] p-4 pt-3">
              <FontAwesomeIcon icon="user" size={50} color="white" />
            </View>
            <Text className="text-xl font-bold text-gray-300">
              <Text>{selfQuery.data.name || "No name"}</Text>
              <Text className="text-base">
                {"\n"}
                {schoolQuery.data.name}
              </Text>
            </Text>
          </View>

          {/* Role Section */}
          <View className="border-b border-gray-200"></View>
          <TouchableOpacity
            activeOpacity={0.5}
            className="flex w-full flex-row items-center justify-between bg-[#2c2c2e] px-4 py-3"
          >
            <Text className="text-lg font-bold text-white">Role</Text>
            <Text className="text-lg font-normal text-white">
              {formatRole(selfQuery.data.role)}
            </Text>
          </TouchableOpacity>

          {/**
           * Email Section
           * NOTE: Emails can't be changed because they are used internally for authentication
           */}
          <View className="border-b border-gray-200"></View>
          <TouchableOpacity
            activeOpacity={0.5}
            className="flex w-full flex-row items-center justify-between bg-[#2c2c2e] px-4 py-3"
          >
            <Text className="text-lg font-bold text-white">Email</Text>
            <Text className="text-lg font-normal text-white">
              {selfQuery.data.email!.slice(0, 15) +
                (selfQuery.data.email!.length > 17 ? "..." : "")}
            </Text>
          </TouchableOpacity>

          {/* Name Section */}
          <View className="border-b border-gray-200"></View>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => setModalVisible("name")}
            className="flex w-full flex-row items-center justify-between bg-[#2c2c2e] px-4 py-3"
          >
            <Text className="text-lg font-bold text-white">Name</Text>
            <Text className="text-lg font-normal text-white">
              {selfQuery.data.name}
            </Text>
          </TouchableOpacity>

          {/* Password Section */}
          <View className="border-b border-gray-200"></View>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => setModalVisible("password")}
            className="flex w-full flex-row items-center justify-between bg-[#2c2c2e] px-4 py-3"
          >
            <Text className="text-lg font-bold text-white">Password</Text>
            <Text className="text-lg font-normal text-white">
              {selfQuery.data.password ? "*********" : "None"}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Modal for changing name/password */}
        <Modal
          transparent={true}
          visible={
            modalVisible === "password" ||
            (modalVisible === "name" && selfQuery.data.role !== "student")
          }
        >
          <SafeAreaView>
            <View className="flex h-full w-full flex-col items-center justify-center">
              <View
                style={{ width: Dimensions.get("screen").width - 32 }}
                className="h-1/2 rounded-lg border-2 border-gray-200 bg-[#101010]"
              >
                {/* Button for closing modal */}
                <View className="flex w-full items-end">
                  <TouchableOpacity
                    onPress={() => {
                      setNewName("");
                      setModalVisible(false);
                    }}
                    activeOpacity={0.5}
                    className="mr-2 mt-2"
                  >
                    <FontAwesomeIcon
                      icon="square-xmark"
                      color="white"
                      size={20}
                    />
                  </TouchableOpacity>
                </View>

                {/* Form for new name/password */}
                <View className="flex h-1/2 w-full items-center justify-center">
                  {/* Label and text input */}
                  <Text className="px-4 text-lg font-bold text-white">
                    Enter your new {modalVisible}:
                  </Text>
                  <TextInput
                    style={{ width: Dimensions.get("screen").width - 64 }}
                    className="mx-4 mb-1 mt-2 rounded bg-white/10 p-2 text-center text-white"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={newName}
                    onChangeText={setNewName}
                    secureTextEntry={modalVisible === "password"}
                    // @ts-expect-error -- React Native doesn't have enterKeyHint because it thinks this is web
                    enterKeyHint="done"
                    placeholder={`Your new ${modalVisible}`}
                  />

                  {/* Submit button */}
                  <Text
                    style={{ width: Dimensions.get("screen").width - 64 }}
                    onPress={() => {
                      if (modalVisible === "name") {
                        void setNameMutation.mutateAsync({
                          token,
                          name: newName,
                        });
                      } else {
                        void setPasswordMutation.mutateAsync({
                          token,
                          password: newName,
                        });
                      }
                    }}
                    className="mt-2 rounded-lg bg-blue-500 p-1 text-center text-lg font-semibold uppercase text-white"
                  >
                    Submit
                  </Text>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
        <Navbar />
      </View>
    </SafeAreaView>
  ) : (
    <LoadingWrapper stackName="Personal Settings" />
  );
};

export default Personal;
