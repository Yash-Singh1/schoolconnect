// Class page, shows posts and allows teachers to post

import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ImageZoom from "react-native-image-pan-zoom";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter, useSearchParams } from "expo-router";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import type { Post, User } from "@prisma/client";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useAtom, useAtomValue } from "jotai";

import "dayjs/locale/en";
import { useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";

import LoadingWrapper from "../../src/components/LoadingWrapper";
import { Navbar } from "../../src/components/Navbar";
import { tokenAtom, userIdAtom } from "../../src/store";
import { api } from "../../src/utils/api";
import { usePostSubscription } from "../../src/utils/usePostSubscription";

// Initialize dayjs for relative time
dayjs.extend(relativeTime);
dayjs.locale("en");

// Card to show for each post inside a class
const PostCard: React.FC<{
  item: Post & { author: User };
  self: { id: string };
}> = ({ item, self }) => {
  // NOTE: We don't want to do any queries here because that would lead us to the n+1 query problem

  // State for resizing the image (we can't anticipate aspect ratio, so expect layout shifts)
  const imageRef = useRef<Image | null>(null);
  const [width, setWidth] = useState<number | null>(null);
  const [realWidth, setRealWidth] = useState<number | null>(null);
  const [realHeight, setRealHeight] = useState<number | null>(null);

  // Whether or not the pan/zoom modal is open
  const [modalOpen, setModalOpen] = useState(false);

  // Get the token from the store
  const [token] = useAtom(tokenAtom);

  // Get classId from the URL
  const { classId } = useSearchParams();

  // Get utilities for cache invalidation
  const util = api.useContext();

  // Mutation for deleting a post
  const deletePost = api.post.delete.useMutation({
    onSuccess() {
      util.post.all.setInfiniteData(
        {
          token,
          classId,
          take: 10,
        },
        (data) => {
          if (!data) {
            return {
              pageParams: [],
              pages: [],
            };
          }
          return {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              posts: page.posts.filter((post) => post.id !== item.id),
            })),
          };
        },
      );
    },
    onError() {
      void util.post.invalidate();
    },
  });

  return (
    <View className="mx-4 rounded-lg border-2 border-sky-400/50 bg-sky-400/40">
      <View className="flex gap-y-2 px-4 py-2">
        <View className="w-full flex flex-row justify-between items-center">
          <Text className="text-base sm:text-lg font-bold text-white">
            {item.title}
          </Text>
          {item.authorId === self.id ? (
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  "Delete post",
                  "Are you sure you want to delete this post?",
                  [
                    {
                      text: "Cancel",
                      style: "cancel",
                    },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => {
                        void deletePost.mutate({
                          token,
                          postId: item.id,
                        });
                      },
                    },
                  ],
                  { cancelable: true },
                );
              }}
              activeOpacity={0.8}
            >
              <FontAwesomeIcon size={18} color="#EF4444" icon="trash-can" />
            </TouchableOpacity>
          ) : null}
        </View>
        <Text className="text-sm sm:text-base font-semibold text-white">
          {item.content}
        </Text>
        {item.image && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setModalOpen(true)}
            className="flex flex-col"
          >
            <Image
              resizeMode="contain"
              onLoadEnd={() => {
                // Some ratio algebra to get the width of the image with the aspect ratio in place
                Image.getSize(item.image!, (width, height) => {
                  setWidth(
                    (Dimensions.get("screen").height / 10 / height) * width,
                  );
                  setRealWidth(width);
                  setRealHeight(height);
                });
              }}
              ref={imageRef}
              style={{ width: width || "100%" }}
              source={{ uri: item.image }}
              alt={item.title}
              className={`h-[10vh] flex-grow`}
            />
            <Modal visible={modalOpen} transparent={true}>
              <SafeAreaView className="bg-slate-900">
                <StatusBar
                  style={Platform.OS === "android" ? "dark" : "light"}
                />
                <View className="w-full h-full flex justify-center items-center">
                  <View className="flex items-end w-full px-4 mt-4">
                    <TouchableOpacity
                      onPress={() => setModalOpen(false)}
                      activeOpacity={0.5}
                    >
                      <FontAwesomeIcon
                        icon="square-xmark"
                        color="white"
                        size={20}
                      />
                    </TouchableOpacity>
                  </View>
                  <ImageZoom
                    cropWidth={Dimensions.get("window").width}
                    cropHeight={Dimensions.get("window").height - 50}
                    imageWidth={realWidth!}
                    imageHeight={realHeight!}
                  >
                    <Image
                      style={{
                        width: realWidth!,
                        height: realHeight!,
                      }}
                      source={{ uri: item.image }}
                      alt={item.title}
                    />
                  </ImageZoom>
                </View>
              </SafeAreaView>
            </Modal>
          </TouchableOpacity>
        )}
        {item.author && (
          <Text className="text-xs sm:text-sm font-medium italic text-white">
            Posted by {item.author.name} {dayjs(item.createdAt).fromNow()}
          </Text>
        )}
      </View>
    </View>
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
  const postParams = {
    token,
    classId: classId as string,
    take: 10,
  };
  const postQuery = api.post.all.useInfiniteQuery(postParams, {
    // Get the next cursor for paginating
    getNextPageParam(lastPage) {
      return lastPage.nextCursor;
    },
  });

  // Self query for the user's role
  const selfQuery = api.user.self.useQuery({ token });

  // Subscribe to the posts in this class
  const userId = useAtomValue(userIdAtom);
  usePostSubscription(postParams, userId, postQuery);

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
              <Text className="text-xl w-full text-center font-bold text-white">
                Adjust Members
              </Text>
            </TouchableOpacity>
          )}

          {/* List of all posts and ability to create posts */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push(`/newpost/${classId}`)}
            className="mx-4 mt-4 rounded-lg border-2 border-sky-400/50 bg-sky-400/40"
          >
            <View className="flex gap-y-2 px-4 py-2">
              <View className="w-full flex flex-row justify-between items-center">
                <Text className="text-sm sm:text-base font-semibold text-gray-100">
                  Write a post...
                </Text>
              </View>
            </View>
          </TouchableOpacity>
          <View className="h-3" />

          <FlashList
            data={[
              ...postQuery.data.pages.map((page) => page.posts).flat(),
              null,
            ]}
            ItemSeparatorComponent={() => <View className="h-3" />}
            estimatedItemSize={117}
            renderItem={({ item }) =>
              item ? (
                <PostCard item={item} self={selfQuery.data!} />
              ) : (
                <View className="h-10" />
              )
            }
            onEndReached={() => {
              void postQuery.fetchNextPage();
            }}
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
