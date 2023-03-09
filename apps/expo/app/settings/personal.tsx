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

const Settings: React.FC = () => {
  const [token] = useAtom(tokenAtom);

  const selfQuery = api.user.self.useQuery({ token });
  const schoolQuery = api.school.get.useQuery({ token });

  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState("");

  const utils = api.useContext();
  const setNameMutation = api.user.setName.useMutation({
    onSuccess: () => {
      void utils.user.invalidate();
      setModalVisible(false);
      setNewName("");
    },
  });

  return selfQuery.data && schoolQuery.data ? (
    <SafeAreaView className="bg-[#101010]">
      <Stack.Screen options={{ title: "Settings" }} />
      <View className="flex h-full w-full flex-col content-center items-center justify-end self-center">
        <ScrollView className="h-[88%] w-full pt-2">
          <Text className="px-4 text-3xl font-bold text-white">
            Personal Info<Text className="hidden"> </Text>
          </Text>
          <View className="mt-2 flex w-full flex-row items-center bg-[#2c2c2e] px-6 py-4">
            <View className="mr-2 rounded-full border-2 border-white bg-[#1c1c1e] p-4 pt-3">
              <FontAwesomeIcon icon="user" size={50} color="white" />
            </View>
            <Text className="text-xl font-bold text-gray-300 android:font-normal">
              <Text>{selfQuery.data.name || "No name"}</Text>
              <Text className="text-base">
                {"\n"}
                {schoolQuery.data.name}
              </Text>
              <Text className="hidden"> </Text>
            </Text>
          </View>
          <View className="border-b border-gray-200"></View>
          <TouchableOpacity
            activeOpacity={0.5}
            className="flex w-full flex-row items-center justify-between bg-[#2c2c2e] px-4 py-3"
          >
            <Text className="text-lg font-bold text-white">
              Role<Text className="hidden"> </Text>
            </Text>
            <Text className="text-lg font-bold text-white android:font-normal">
              {formatRole(selfQuery.data.role)}
              <Text className="hidden"> </Text>
            </Text>
          </TouchableOpacity>
          <View className="border-b border-gray-200"></View>
          <TouchableOpacity
            activeOpacity={0.5}
            className="flex w-full flex-row items-center justify-between bg-[#2c2c2e] px-4 py-3"
          >
            <Text className="text-lg font-bold text-white android:font-bold">
              Email<Text className="hidden"> </Text>
            </Text>
            <Text className="text-lg font-bold text-white android:font-normal">
              {selfQuery.data.email!.slice(0, 15) +
                (selfQuery.data.email!.length > 17 ? "..." : "")}
              <Text className="hidden"> </Text>
            </Text>
          </TouchableOpacity>
          <View className="border-b border-gray-200"></View>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => setModalVisible(true)}
            className="flex w-full flex-row items-center justify-between bg-[#2c2c2e] px-4 py-3"
          >
            <Text className="text-lg font-bold text-white">
              Name<Text className="hidden"> </Text>
            </Text>
            <Text className="text-lg font-bold text-white android:font-normal">
              {selfQuery.data.name}
            </Text>
          </TouchableOpacity>
        </ScrollView>
        {selfQuery.data.role !== "student" ? (
          <Modal transparent={true} visible={modalVisible}>
            <SafeAreaView>
              <View className="flex h-full w-full flex-col items-center justify-center">
                <View
                  style={{ width: Dimensions.get("screen").width - 32 }}
                  className="h-1/2 rounded-lg border-2 border-gray-200 bg-[#101010]"
                >
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
                  <View className="flex h-1/2 w-full items-center justify-center">
                    <Text className="px-4 text-lg font-bold text-white">
                      Enter your new name:
                    </Text>
                    <TextInput
                      style={{ width: Dimensions.get("screen").width - 64 }}
                      className="mx-4 mb-1 mt-2 rounded bg-white/10 p-2 text-center text-white"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      value={newName}
                      onChangeText={setNewName}
                      // @ts-expect-error -- TODO: Contribute to react-native typings, they support enterKeyHint but didn't document it
                      enterKeyHint="done"
                      placeholder="Your new name"
                    />
                    <Text
                      style={{ width: Dimensions.get("screen").width - 64 }}
                      onPress={() => {
                        void setNameMutation.mutateAsync({
                          token,
                          name: newName,
                        });
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
        ) : null}
        <Navbar />
      </View>
    </SafeAreaView>
  ) : (
    <LoadingWrapper stackName="Settings" />
  );
};

export default Settings;
