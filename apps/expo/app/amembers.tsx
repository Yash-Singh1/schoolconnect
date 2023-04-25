// Members page allowing admin to manage members of a school

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
import { Stack, useNavigation, useRouter } from "expo-router";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { type User } from "@prisma/client";
import { FlashList } from "@shopify/flash-list";
import { useAtom } from "jotai";

import LoadingWrapper from "../src/components/LoadingWrapper";
import { Navbar } from "../src/components/Navbar";
import { tokenAtom } from "../src/store";
import { api } from "../src/utils/api";
import { resetStack, type NavigatorOverride } from "../src/utils/resetStack";

/**
 * Component for a specific member
 * @param props Takes in an item that is the user information and a boolean on whether the user is pending registration
 */
const Member: React.FC<{ item: User; pending: boolean }> = ({
  item,
  pending,
}) => {
  // Get token from store
  const [token] = useAtom(tokenAtom);

  // State for modal
  const [modalShown, setModalShown] = useState(false);

  // Mutation for deleting a user
  const deleteMutation = api.user.delete.useMutation();

  // Initialize router helper
  const router = useRouter();
  const navigation = useNavigation() as unknown as NavigatorOverride;

  return (
    <>
      {/* Modal for options on user */}
      <Modal transparent visible={modalShown} animationType="fade">
        <SafeAreaView>
          <View className="h-full w-full flex justify-center items-center">
            <View
              className="bg-[#101010] rounded-lg border-2 border-gray-400/50 flex items-end"
              style={{
                width: Dimensions.get("screen").width * 0.8,
              }}
            >
              {/* Button for closing a modal */}
              <TouchableOpacity
                onPress={() => setModalShown(false)}
                className="p-2"
                activeOpacity={0.5}
              >
                <FontAwesomeIcon icon="square-xmark" color="white" size={20} />
              </TouchableOpacity>

              {/* All options in this modal usually redirect to the same user modification page, other than the delete option and children page */}
              <View className="border-t border-gray-200/50 flex w-full">
                {/* Option to change the user's name */}
                <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={() => {
                    setModalShown(false);
                    router.push(`/user/${item.id}`);
                  }}
                  className="px-2 py-1"
                >
                  <Text className="text-lg font-normal text-white">
                    Change Name
                  </Text>
                </TouchableOpacity>

                {/* Option to change the user's email */}
                <View className="border-t border-gray-200/50" />
                {pending ? (
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => {
                      setModalShown(false);
                      router.push(`/user/${item.id}`);
                    }}
                    className="px-2 py-1"
                  >
                    <Text className="text-lg font-normal text-white">
                      Change Email
                    </Text>
                  </TouchableOpacity>
                ) : null}

                {/* Manage Children option */}
                {pending ? null : (
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => {
                      setModalShown(false);
                      router.push(`/children/${item.id}`);
                    }}
                    className="px-2 py-1"
                  >
                    <Text className="text-lg font-normal text-white">
                      Manage Children
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Option to change role */}
                <View className="border-t border-gray-200/50" />
                <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={() => {
                    setModalShown(false);
                    router.push(`/user/${item.id}`);
                  }}
                  className="px-2 py-1"
                >
                  <Text className="text-lg font-normal text-white">
                    Change Role
                  </Text>
                </TouchableOpacity>

                {/* Option to delete user */}
                <View className="border-t border-gray-200/50" />
                <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={() => {
                    deleteMutation.mutate({
                      token,
                      userId: item.id,
                    });
                    resetStack({ router, navigation });
                  }}
                  className="px-2 py-1"
                >
                  <Text className="text-lg font-normal text-red-500">
                    {pending ? "Cancel Invitation" : "Delete User"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      <View className="border-t border-gray-200 p-4 flex flex-row items-center justify-between">
        <View className="flex flex-row gap-x-2 items-center">
          <FontAwesomeIcon icon="user" color="white" />
          <Text className="text-white font-semibold text-lg">{item.name}</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => setModalShown(true)}
        >
          <FontAwesomeIcon icon="ellipsis-vertical" color="white" />
        </TouchableOpacity>
      </View>
    </>
  );
};

const Members: React.FC = () => {
  // By default the pending invites and invited members accordions are not expanded
  const [pendingShown, setPendingShown] = useState(false);
  const [invitedShown, setInvitedShown] = useState(false);

  // We keep a boolean to track whether the pending invites and invited members have been drawn
  // Once they are drawn, we resize the list to match their needed heights
  const [drawnPending, setDrawnPending] = useState(false);
  const [drawnInvited, setDrawnInvited] = useState(false);

  // State for the new invite modal
  const [newInviteModalShown, setNewInviteModalShown] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");

  const [token] = useAtom(tokenAtom);

  const pendingMembers = api.school.pending.useQuery({
    token,
  });
  const invitedMembers = api.school.invited.useQuery({
    token,
  });

  const util = api.useContext();
  const createPending = api.user.createPending.useMutation({
    async onSuccess() {
      await util.school.pending.invalidate();
    },
  });

  return pendingMembers.data && invitedMembers.data ? (
    <SafeAreaView className="bg-[#101010]">
      <Stack.Screen options={{ title: "Members" }} />
      <ScrollView className="flex h-[88%] w-full">
        <Text className="text-3xl font-bold text-white px-4">Members</Text>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            if (invitedShown) setDrawnInvited(false);
            setInvitedShown((current) => !current);
          }}
          className="mt-4 flex w-full flex-row justify-between items-center bg-[#2c2c2e] px-6 py-2"
        >
          <Text className="color-white font-semibold text-lg">
            Invited Members
          </Text>
          <FontAwesomeIcon
            icon={invitedShown ? "chevron-down" : "chevron-right"}
            color="white"
          />
        </TouchableOpacity>
        {invitedShown ? (
          <View
            style={{
              width: Dimensions.get("screen").width,
            }}
            className={`flex h-1/3 ${drawnInvited ? "flex-shrink" : ""}`}
          >
            {invitedMembers.data.length ? (
              <FlashList
                data={invitedMembers.data}
                estimatedItemSize={100}
                onLoad={() => {
                  setDrawnInvited(true);
                }}
                renderItem={({ item }) => (
                  <Member item={item} pending={false} />
                )}
              />
            ) : (
              <Text className="text-white text-lg italic px-4">
                No invited members found
              </Text>
            )}
          </View>
        ) : null}
        <View
          className={`border-b border-gray-200 ${
            invitedShown && pendingShown ? "mt-4" : ""
          }`}
        ></View>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            if (pendingShown) setDrawnPending(false);
            setPendingShown((current) => !current);
          }}
          className="flex w-full flex-row justify-between items-center bg-[#2c2c2e] px-6 py-2"
        >
          <Text className="color-white font-semibold text-lg">
            Pending Invites
          </Text>
          <FontAwesomeIcon
            icon={pendingShown ? "chevron-down" : "chevron-right"}
            color="white"
          />
        </TouchableOpacity>
        {pendingShown ? (
          <>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => setNewInviteModalShown(true)}
              className="p-4 pb-2 flex flex-row gap-x-2 items-center"
            >
              <FontAwesomeIcon icon="user-plus" color="white" size={25} />
              <Text className="text-white text-lg font-semibold">Add User</Text>
            </TouchableOpacity>

            <Modal
              transparent={true}
              visible={newInviteModalShown}
              animationType="slide"
              onRequestClose={() => setNewInviteModalShown(false)}
            >
              <SafeAreaView>
                <View className="h-full w-full flex justify-center items-center">
                  <View
                    className="bg-[#101010] p-4 rounded-lg border border-gray-400/50 flex items-end"
                    style={{
                      width: Dimensions.get("screen").width * 0.8,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => setNewInviteModalShown(false)}
                      activeOpacity={0.5}
                    >
                      <FontAwesomeIcon
                        icon="square-xmark"
                        color="white"
                        size={20}
                      />
                    </TouchableOpacity>
                    <View className="w-full">
                      <Text className="text-white text-2xl font-semibold">
                        New Invite
                      </Text>
                      <TextInput
                        className="mt-2 mb-1 rounded bg-white/10 p-2 text-white"
                        placeholder="Name of user (optional)"
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        value={newUserName}
                        onChangeText={setNewUserName}
                      />
                      <TextInput
                        className="mt-2 mb-1 rounded bg-white/10 p-2 text-white"
                        placeholder="Email"
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        value={newUserEmail}
                        onChangeText={setNewUserEmail}
                      />
                      <Text
                        onPress={() => {
                          createPending.mutate({
                            ...(newUserName ? { name: newUserName } : {}),
                            email: newUserEmail,
                            token,
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

            <ScrollView
              style={{
                width: Dimensions.get("screen").width,
              }}
              className={`flex h-1/3 ${drawnPending ? "flex-shrink" : ""}`}
            >
              {pendingMembers.data.length ? (
                <FlashList
                  data={pendingMembers.data}
                  estimatedItemSize={100}
                  onLoad={() => setDrawnPending(true)}
                  renderItem={({ item }) => <Member item={item} pending />}
                />
              ) : (
                <Text className="text-white text-lg italic px-4">
                  No pending members found
                </Text>
              )}
            </ScrollView>
          </>
        ) : null}
      </ScrollView>
      <Navbar />
    </SafeAreaView>
  ) : (
    <LoadingWrapper stackName="Members" />
  );
};

export default Members;
