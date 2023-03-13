// Classes page, displays all the classes of a teacher or student

import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { type Class, type User } from "@prisma/client";
import { FlashList } from "@shopify/flash-list";
import { useAtom } from "jotai";

import LoadingWrapper from "../src/components/LoadingWrapper";
import { Navbar } from "../src/components/Navbar";
import { tokenAtom } from "../src/store";
import { api } from "../src/utils/api";

// Card for a class, displays the class name, description, and banner
const ClassCard: React.FC<{ item: Class & { owner: User } }> = ({ item }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={() => router.push(`/class/${item.id}`)}
      className="mb-2 rounded-lg border-2 border-violet-400/50 bg-violet-400/40"
    >
      {item.banner && (
        <Image
          source={{ uri: item.banner }}
          alt={item.name}
          className="h-[150px] w-full rounded-t-lg"
        />
      )}
      <View className="px-4 py-2">
        <Text className="text-2xl font-bold text-white">
          {item.name}
          {item.owner.name ? ` - ${item.owner.name}` : ""}
        </Text>
        <Text className="text-lg text-white">{item.description}</Text>
      </View>
    </TouchableOpacity>
  );
};

const Classes: React.FC = () => {
  const [token] = useAtom(tokenAtom);

  const selfQuery = api.user.self.useQuery({ token });
  const classesQuery = api.class.all.useQuery({ token });

  const router = useRouter();

  return selfQuery.data && classesQuery.data ? (
    <SafeAreaView className="bg-[#101010]">
      <Stack.Screen options={{ title: "Classes" }} />
      <View className="flex h-full w-full items-center justify-center">
        <View className="h-[88%] w-full">
          {/* Teachers have the ability to create a new class */}
          {selfQuery.data.role === "teacher" ? (
            <Text
              onPress={() => router.push("/newclass")}
              className="mx-4 mt-4 rounded-lg bg-blue-500/80 py-2 text-center text-lg font-bold text-white"
              style={{ width: Dimensions.get("screen").width - 32 }}
            >
              Create New Class
            </Text>
          ) : null}
          {/* Display all the classes of the user, used some formatting tricks to give enough space */}
          {classesQuery.data.length > 0 ? (
            <View
              className="p-4"
              style={{
                height: Dimensions.get("screen").height * 0.7,
                width: Dimensions.get("screen").width,
              }}
            >
              <FlashList
                data={classesQuery.data}
                ItemSeparatorComponent={() => <View className="h-3" />}
                renderItem={({ item }) => <ClassCard item={item} />}
                estimatedItemSize={117}
              />
            </View>
          ) : (
            <Text className="mt-4 w-full text-center text-xl font-semibold text-white">
              No classes
            </Text>
          )}
        </View>
        <Navbar />
      </View>
    </SafeAreaView>
  ) : (
    <LoadingWrapper stackName="Classes" />
  );
};

export default Classes;
