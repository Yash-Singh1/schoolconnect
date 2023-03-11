// Main navigation bar
// Some pages are only shown to certain roles

import { Text, TouchableOpacity, View } from "react-native";
import { useNavigation, useRouter } from "expo-router";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useAtom } from "jotai";

import { tokenAtom } from "../store";
import { api } from "../utils/api";
import { resetStack } from "../utils/resetStack";

export const Navbar = () => {
  const router = useRouter();
  const navigation = useNavigation();

  const [token] = useAtom(tokenAtom);
  const selfQuery = api.user.self.useQuery({
    token,
  });

  return (
    <View className="flex h-[12%] w-full flex-row flex-nowrap justify-between bg-pink-400 py-2 px-4">
      {selfQuery.data && selfQuery.data.role === "admin" ? (
        <TouchableOpacity
          onPress={() => resetStack({ router, navigation }, "/amembers")}
          activeOpacity={0.5}
          className="flex flex-col flex-wrap items-center justify-center px-4"
        >
          <FontAwesomeIcon icon="users" size={30} color="white" />
          <Text className="text-center text-xs text-white">Members</Text>
        </TouchableOpacity>
      ) : null}
      {selfQuery.data &&
      (selfQuery.data.role === "teacher" ||
        selfQuery.data.role === "student") ? (
        <TouchableOpacity
          onPress={() => resetStack({ router, navigation }, "/classes")}
          activeOpacity={0.5}
          className="flex flex-col flex-wrap items-center justify-center px-4"
        >
          <FontAwesomeIcon icon="school" size={30} color="white" />
          <Text className="text-center text-xs text-white">Classes</Text>
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity
        onPress={() => resetStack({ router, navigation }, "/schedule")}
        activeOpacity={0.5}
        className="flex flex-col flex-wrap items-center justify-center px-4"
      >
        <FontAwesomeIcon icon="clock" size={30} color="white" />
        <Text className="text-center text-xs text-white">Schedule</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => resetStack({ router, navigation }, "/events")}
        activeOpacity={0.5}
        className="flex flex-col flex-wrap items-center justify-center px-4"
      >
        <FontAwesomeIcon icon="calendar" size={30} color="white" />
        <Text className="text-center text-xs text-white">Events</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => resetStack({ router, navigation }, "/info")}
        activeOpacity={0.5}
        className="flex flex-col flex-wrap items-center justify-center px-4"
      >
        <FontAwesomeIcon icon="gear" size={30} color="white" />
        <Text className="text-center text-xs text-white">Settings</Text>
      </TouchableOpacity>
    </View>
  );
};
