// Page that allows admin to modify a parent's children

import { useState } from "react";
import {
  Dimensions,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useSearchParams } from "expo-router";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useAtom } from "jotai";

import LoadingWrapper from "../../src/components/LoadingWrapper";
import { Navbar } from "../../src/components/Navbar";
import { tokenAtom } from "../../src/store";
import { api } from "../../src/utils/api";

const ManageChildren: React.FC = () => {
  // Get the user id from the url
  const params = useSearchParams();
  const userId = params.userId as string;

  // Get the token from the store
  const [token] = useAtom(tokenAtom);

  // Get information on the user, their children and the current school
  const selfQuery = api.user.self.useQuery({
    userId,
    token,
  });
  const childrenQuery = api.user.children.useQuery({
    userId,
    token,
  });
  const schoolQuery = api.school.get.useQuery({
    token,
  });

  // Create user modal form states
  const [createUserModalShown, setCreateUserModalShown] = useState(false);
  const [newChildEmail, setNewChildEmail] = useState("");

  // Mutation to delete a child
  const util = api.useContext();
  const deleteChildMutation = api.user.removeChild.useMutation({
    async onSuccess() {
      // Invalidate the user and children queries
      await util.user.invalidate();
      await childrenQuery.refetch();
    },
  });

  // Mutation to add a child
  const addChildMutation = api.user.addChild.useMutation({
    async onSuccess() {
      // Invalidate the user and children queries and reset the modal form state
      setCreateUserModalShown(false);
      setNewChildEmail("");
      await util.user.invalidate();
      await childrenQuery.refetch();
    },
  });

  // If the queries are loading, show a loading screen
  return selfQuery.data && schoolQuery.data && childrenQuery.data ? (
    <SafeAreaView className="bg-[#101010]">
      {/* Top stack bar */}
      <Stack.Screen options={{ title: "Manage Children" }} />
      
      {/* Content */}
      <View className="h-full w-full flex">
        <View className="h-[88%] w-full">
          <Text className="text-white text-2xl font-bold px-4">
            Manage Children
          </Text>

          {/* Parent information */}
          <View className="mt-2 flex w-full flex-row items-center bg-[#2c2c2e] px-6 py-4">
            <View className="mr-3 rounded-full border-2 border-white bg-[#1c1c1e] p-3 pt-2">
              <FontAwesomeIcon icon="user" size={40} color="white" />
            </View>

            <Text className="text-xl font-bold text-gray-300">
              <Text>{selfQuery.data.name || "No name"}</Text>
              <Text className="text-base">
                {"\n"}
                {schoolQuery.data.name}
              </Text>
            </Text>
          </View>

          {/* Add child button */}
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => setCreateUserModalShown(true)}
            className="flex flex-row gap-x-2 p-4 items-center"
          >
            <FontAwesomeIcon icon="user-plus" color="white" size={22} />
            <Text className="text-white text-lg font-bold">Add Child</Text>
          </TouchableOpacity>

          {/* List of all existing children */}
          {childrenQuery.data.length ? (
            <View className="flex w-full bg-[#2c2c2e]">
              {childrenQuery.data.map((child, index) => {
                return (
                  <View
                    className="flex flex-row items-center px-4 justify-between"
                    key={index}
                  >
                    <Text className="text-white p-4 pl-0 text-lg font-normal">
                      {child.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        deleteChildMutation.mutate({
                          userId,
                          childId: child.id,
                          token,
                        });
                      }}
                      activeOpacity={0.5}
                    >
                      <FontAwesomeIcon
                        icon="trash-can"
                        color="white"
                        size={20}
                      />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text className="text-white italic w-full text-center mt-4">
              No children found
            </Text>
          )}

          {/* Add child modal */}
          <Modal
            transparent
            animationType="none"
            visible={createUserModalShown}
          >
            <SafeAreaView>
              <View className="h-full w-full flex justify-center items-center">
                <View
                  className="bg-[#101010] rounded-lg border-2 border-gray-400/50 flex items-end"
                  style={{
                    width: Dimensions.get("screen").width * 0.8,
                  }}
                >
                  {/* Button to close modal */}
                  <TouchableOpacity
                    onPress={() => setCreateUserModalShown(false)}
                    className="p-2"
                    activeOpacity={0.5}
                  >
                    <FontAwesomeIcon
                      icon="square-xmark"
                      color="white"
                      size={20}
                    />
                  </TouchableOpacity>

                  {/* Form to add a child */}
                  <View className="w-full p-4 pt-0">
                    <TextInput
                      className="mt-2 mb-1 rounded bg-white/10 p-2 text-white"
                      placeholder="Email"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      value={newChildEmail}
                      onChangeText={setNewChildEmail}
                    />

                    {/* Form validation error if email is invalid */}
                    {addChildMutation?.error?.data?.zodError?.fieldErrors
                      ?.childEmail && (
                      <Text className="mb-1 w-full text-left text-red-500">
                        {
                          addChildMutation.error.data.zodError.fieldErrors
                            .childEmail[0]
                        }
                      </Text>
                    )}

                    <Text
                      onPress={() => {
                        // Run the mutation to add the child
                        addChildMutation.mutate({
                          childEmail: newChildEmail,
                          userId,
                          token,
                        });
                      }}
                      className="mt-2 rounded-lg bg-blue-500 p-1 text-center text-lg font-semibold uppercase text-white"
                    >
                      Add child
                    </Text>
                  </View>
                </View>
              </View>
            </SafeAreaView>
          </Modal>
        </View>
        <Navbar />
      </View>
    </SafeAreaView>
  ) : (
    <LoadingWrapper stackName="Manage Children" />
  );
};

export default ManageChildren;
