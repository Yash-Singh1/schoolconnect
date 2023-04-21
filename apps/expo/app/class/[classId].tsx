// Class page, shows posts and allows teachers to post

import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter, useSearchParams } from "expo-router";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { type Post, type User } from "@prisma/client";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useAtom } from "jotai";

import "dayjs/locale/en";
import LoadingWrapper from "../../src/components/LoadingWrapper";
import { Navbar } from "../../src/components/Navbar";
import { tokenAtom } from "../../src/store";
import { api } from "../../src/utils/api";

// Initialize dayjs for relative time
dayjs.extend(relativeTime);
dayjs.locale("en");

// Card to show for each post inside a class
const PostCard: React.FC<{ item: Post & { author: User } }> = ({ item }) => {
  // NOTE: We don't want to do any queries here because that would lead us to the n+1 query problem

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      className="mx-4 rounded-lg border-2 border-violet-400/50 bg-violet-400/40"
    >
      <View className="flex gap-y-2 px-4 py-2">
        <Text className="text-base font-bold text-white">{item.title}</Text>
        <Text className="text-sm font-semibold text-white">{item.content}</Text>
        {item.image && (
          <Image
            source={{ uri: item.image }}
            alt={item.title}
            className="h-[150px] w-full"
          />
        )}
        <Text className="text-xs font-medium italic text-white">
          Posted by {item.author.name} {dayjs(item.createdAt).fromNow()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const Board: React.FC = () => {
  // Get token from store
  const [token] = useAtom(tokenAtom);

  // Initialize router helper
  const router = useRouter();

  // Get classId from the URL
  const { classId } = useSearchParams();

  // Class query for class information
  const classQuery = api.class.get.useQuery({
    token,
    classId: classId as string,
  });

  // Post query for all the posts in the class
  const postQuery = api.post.all.useQuery({
    token,
    classId: classId as string,
  });

  // Subscribe to the posts in this class
  const util = api.useContext();
  api.post.onPost.useSubscription(
    {
      token,
      classId: classId as string,
    },
    {
      onData() {
        void util.post.all.invalidate();
        void postQuery.refetch();
      },
      onError(error) {
        console.error("Subscription error", error);
        void util.post.all.invalidate();
        void postQuery.refetch();
      },
    },
  );

  // Self query for the user's role
  const selfQuery = api.user.self.useQuery({ token });

  // Show a loading screen while the queries are loading
  return selfQuery.data && postQuery.data && classQuery.data ? (
    <SafeAreaView className="bg-[#101010]">
      {/* Top stack bar */}
      <Stack.Screen options={{ title: `Class ${classQuery.data.name}` }} />

      {/* Content */}
      <View className="flex h-full w-full flex-col">
        <View className="h-[88%]">
          {/* Header for class, including owner and name of class */}
          <Text className="w-full text-center text-2xl font-bold text-white">
            {classQuery.data.name}
            {classQuery.data.owner ? ` - ${classQuery.data.owner}` : ""}
          </Text>

          {/* Ability for teachers to adjust members in a class */}
          {selfQuery.data.role === "teacher" && (
            <TouchableOpacity
              activeOpacity={0.5}
              className="mt-4 mx-4 rounded-lg bg-blue-500 p-2"
              onPress={() => router.push(`/members/${classQuery.data.id}`)}
            >
              <Text className="font-xl w-full text-center font-bold text-white">
                Adjust Members
              </Text>
            </TouchableOpacity>
          )}

          {/* List of all posts and ability for students and teachers to create posts */}
          <View className="mb-4 mt-4 flex flex-row items-center">
            <Text className="ml-8 text-2xl font-bold text-white">Posts</Text>
            <TouchableOpacity
              activeOpacity={0.5}
              className="ml-2 rounded-lg bg-blue-500 p-1"
              onPress={() => router.push(`/newpost/${classId}`)}
            >
              <FontAwesomeIcon icon="plus" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* TODO: Pagination for posts */}
          <FlashList
            data={[...postQuery.data, null]}
            ItemSeparatorComponent={() => <View className="h-3" />}
            estimatedItemSize={117}
            renderItem={({ item }) => item ? <PostCard item={item} /> : <View className="h-10" />}
          />
        </View>
        <Navbar />
      </View>
    </SafeAreaView>
  ) : (
    <LoadingWrapper stackName="Class" />
  );
};

export default Board;
