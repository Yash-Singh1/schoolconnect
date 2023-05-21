// Landing page for mobile application

import React, { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { Stack, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { FlashList } from "@shopify/flash-list";
import { useAtom, useSetAtom } from "jotai";

import LoadingWrapper from "../src/components/LoadingWrapper";
import { Navbar } from "../src/components/Navbar";
import { tokenAtom, userIdAtom } from "../src/store/";
import { api, type RouterOutputs } from "../src/utils/api";
import { TOKEN_KEY, supportedSocialMedia } from "../src/utils/constants";
import { usePostSubscription } from "../src/utils/usePostSubscription";

// Main landing page when logged in
const Landing: React.FC = () => {
  // Get token from store
  const [token] = useAtom(tokenAtom);

  // Query information on the user
  const selfQuery = api.user.self.useQuery({ token }, { enabled: !!token });
  const schoolQuery = api.school.get.useQuery({ token }, { enabled: !!token });

  // Store the user ID for synchronous use in future
  const setUserId = useSetAtom(userIdAtom);
  useEffect(() => {
    if (selfQuery.data) {
      setUserId(selfQuery.data.id);
    }
  }, [selfQuery.data]);

  // Query the social media that the user is using
  const socialMedia = useMemo(() => {
    if (!schoolQuery.data || !schoolQuery.data.social) return null;
    for (const key of Object.keys(supportedSocialMedia)) {
      if (
        schoolQuery.data.social.startsWith(
          supportedSocialMedia[key as keyof typeof supportedSocialMedia].start,
        )
      ) {
        return supportedSocialMedia[key as keyof typeof supportedSocialMedia];
      }
    }
  }, [schoolQuery.data]);

  // Mutation to edit the social media (admin only)
  const utils = api.useContext();
  const editSocialMutation = api.school.editSocial.useMutation({
    onSuccess() {
      // Reset form data
      setProfileURL("");
      setTab("social");

      // Invalidate the current query to refetch
      void utils.school.invalidate();
    },
  });

  // Current tab shown
  const [tab, setTab] = useState<"news" | "social" | "edit">("news");

  // Form data for editing the social
  const [profileURL, setProfileURL] = useState("");

  // Show a loading indicator if the data is still fetching
  return selfQuery.data && schoolQuery.data ? (
    <SafeAreaView className="bg-[#101010]">
      <Stack.Screen options={{ title: "Home Page" }} />
      <View className="flex h-full w-full flex-col content-center items-center justify-end self-center">
        <View className="h-[88%] w-full p-2">
          {/* Header */}
          <Text className="mx-auto pb-2 text-center text-2xl sm:text-4xl font-bold text-white">
            Welcome{" "}
            <Text className="text-pink-400">
              {selfQuery.data.name || "Anonymous"}
            </Text>
            !
          </Text>

          {/* Tabs bar for new, social, and editing social */}
          <View className="flex flex-row gap-x-4">
            <TouchableOpacity
              className="flex flex-row items-center pb-1 px-1 border-b-pink-400"
              activeOpacity={0.5}
              onPress={() => setTab("news")}
              style={{ borderBottomWidth: tab === "news" ? 1 : 0 }}
            >
              <FontAwesomeIcon icon="newspaper" color="white" />
              <Text className="ml-2 text-lg sm:text-2xl font-bold text-white">
                News
              </Text>
            </TouchableOpacity>

            {socialMedia ? (
              <TouchableOpacity
                className="flex flex-row items-center pb-1 px-1 border-b-pink-400"
                activeOpacity={0.5}
                onPress={() => setTab("social")}
                style={{ borderBottomWidth: tab === "social" ? 1 : 0 }}
              >
                <FontAwesomeIcon icon={socialMedia.icon} color="white" />
                <Text className="ml-2 text-lg sm:text-2xl font-bold text-white">
                  {socialMedia.name}
                </Text>
              </TouchableOpacity>
            ) : null}

            {selfQuery.data.role === "admin" ? (
              <TouchableOpacity
                className="flex flex-row items-center pb-1 px-1 border-b-pink-400"
                activeOpacity={0.5}
                onPress={() => setTab("edit")}
                style={{ borderBottomWidth: tab === "edit" ? 1 : 0 }}
              >
                <FontAwesomeIcon icon="pen" color="white" />
                <Text className="ml-2 text-lg font-bold text-white">
                  Social
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {tab === "news" ? (
            // Recent announcements tab, uses Announcments component
            <View className="flex flex-col">
              <Text className="w-full pb-2 text-center text-xl sm:text-2xl sm:mb-4 font-bold text-white mt-2 flex-grow-0">
                Recent Announcements
              </Text>
              <Announcements userId={selfQuery.data.id} />
            </View>
          ) : tab === "social" ? (
            // Social tab, embeds configured social
            <WebView
              className="mt-2"
              source={{
                uri: schoolQuery.data.social!,
              }}
            />
          ) : (
            // Editing social tab (admin only)
            <View className="mt-2">
              {/* Input for social profile URL and it's form validation */}
              <TextInput
                className="mx-4 mt-2 mb-1 rounded bg-white/10 p-2 text-white"
                placeholder="URL to Social Media Profile"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={profileURL}
                onChangeText={setProfileURL}
              />
              {editSocialMutation?.error?.data?.zodError?.fieldErrors
                ?.social && (
                <Text className="mt-1 mx-4 mb-1 w-full text-left text-red-500">
                  {editSocialMutation.error.data.zodError.fieldErrors.social[0]}
                </Text>
              )}

              {/* Submit button and info */}
              <Text
                onPress={() => {
                  editSocialMutation.mutate({
                    token,
                    social: profileURL,
                  });
                }}
                className="mt-2 mx-4 rounded-lg bg-blue-500 p-1 text-center text-lg font-semibold uppercase text-white"
              >
                Submit
              </Text>
              <Text className="mt-2 text-white mx-4">
                As of now, we only support Instagram, Facebook, and Twitter
              </Text>
            </View>
          )}
        </View>
        <Navbar />
      </View>
    </SafeAreaView>
  ) : (
    <LoadingWrapper stackName="Home Page" />
  );
};

// Component for fetching and displaying announcements
const Announcements: React.FC<{ userId: string }> = ({ userId }) => {
  // Get token from store
  const [token] = useAtom(tokenAtom);

  // Fetch recent events and posts

  const recentEventsParams = {
    token,
    take: 10,
    includeSource: true,
  };
  const recentEventsQuery = api.events.all.useQuery(recentEventsParams, {
    enabled: !!token,
  });

  const recentPostsParams = {
    token,
    take: 10,
  };
  const recentPostsQuery = api.post.all.useInfiniteQuery(recentPostsParams, {
    enabled: !!token,
    // Send the next cursor for pagination
    getNextPageParam(lastPage) {
      return lastPage.nextCursor;
    },
  });

  // Cache utilities
  const util = api.useContext();

  // Subscribe to posts
  usePostSubscription(recentPostsParams, userId, recentPostsQuery);

  // Subscribe to events
  api.events.onCreate.useSubscription(
    { token, userId },
    {
      onData(data) {
        const events = util.events.all.getData(recentEventsParams);
        if (events) {
          util.events.all.setData(recentEventsParams, [data, ...events]);
        } else {
          void util.post.all.invalidate();
          void recentPostsQuery.refetch();
        }
      },
      onError(err) {
        console.error("Subscription error", err);
        void util.post.all.invalidate();
        void recentPostsQuery.refetch();
      },
    },
  );

  // Combine the two into one array, sorted by date using two pointers (linear time)

  const recentAnnouncements = useMemo(() => {
    if (
      typeof recentEventsQuery.data !== "undefined" &&
      typeof recentPostsQuery.data !== "undefined"
    ) {
      const posts = recentPostsQuery.data.pages
        .map((page) => page.posts)
        .flat();

      if (!recentEventsQuery.data.length) {
        return posts;
      }
      const result = [];
      let recentPostI = 0;
      for (
        let recentEventI = 0;
        recentEventI < recentEventsQuery.data.length;
        recentEventI++
      ) {
        while (
          recentPostI < posts.length &&
          posts[recentPostI]!.createdAt >
            recentEventsQuery.data[recentEventI]!.start
        ) {
          result.push(posts[recentPostI]!);
          recentPostI++;
        }
        result.push(recentEventsQuery.data[recentEventI]!);
      }
      return result;
    } else {
      return false;
    }
  }, [recentEventsQuery.data, recentPostsQuery.data]);

  // Render the announcements
  return recentAnnouncements ? (
    recentAnnouncements.length ? (
      <View
        className="flex-grow"
        style={{
          height: Dimensions.get("screen").height,
          width: Dimensions.get("screen").width,
        }}
      >
        <FlashList
          data={[...recentAnnouncements, null]}
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={({ item }) =>
            item ? <Announcement item={item} /> : <View className="h-20" />
          }
          estimatedItemSize={46}
          onEndReached={() => {
            void recentPostsQuery.fetchNextPage();
          }}
        />
      </View>
    ) : (
      // No view when there aren't any announcements
      <Text className="text-white text-center mt-2 sm:text-lg">
        No Recent Announcements
      </Text>
    )
  ) : null;
};

type AnnouncementType =
  | RouterOutputs["post"]["all"]["posts"][number]
  | RouterOutputs["events"]["all"][number];

// Helper function checking if the union of an Event and a Post is a Event (acts as a type guard)
const isEvent = (
  item: AnnouncementType,
): item is RouterOutputs["events"]["all"][number] => {
  if (item && Object.hasOwn(item, "start")) {
    return true;
  }
  return false;
};

// Component for displaying a specific announcement
const Announcement: React.FC<{
  item: AnnouncementType;
}> = ({ item }) => {
  // Restrict item to be a Event or a Post using type guard helper
  const eventItem = isEvent(item);

  return (
    <View
      style={{
        width: Dimensions.get("screen").width - 32,
      }}
      className="mb-2 rounded-lg border-2 border-sky-400/50 bg-sky-400/40 p-2"
    >
      {/* Title */}
      <Text className="text-base sm:text-xl font-bold text-white">
        {eventItem ? item!.name : item.title}
      </Text>

      {/* Source */}
      <Text className="italic text-white sm:text-lg">
        {eventItem
          ? "School" in item!
            ? item.School!.name
            : item!.Class!.name
          : item.author.name}
      </Text>
    </View>
  );
};

// Main login page shown to user, links to respective login/signup pages
const Login: React.FC = () => {
  const router = useRouter();

  // Display options for role to choose and redirect to respective page
  return (
    <SafeAreaView className="bg-[#101010]">
      <Stack.Screen options={{ title: "Landing" }} />
      <View className="mb-8 flex h-full w-full flex-row	flex-wrap content-center items-center justify-center gap-8 self-center p-4">
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => router.push("/login/admin")}
          className="flex w-fit flex-grow-0 rounded-lg bg-zinc-800 p-[26px]"
        >
          <FontAwesomeIcon icon="user-secret" size={80} color="#9CA3AF" />
          <Text className="mt-2 w-full text-center text-xl font-semibold text-white">
            Admin
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => router.push("/signup/teacher")}
          className="flex w-fit flex-grow-0 rounded-lg bg-zinc-800 p-4"
        >
          <FontAwesomeIcon
            icon="person-chalkboard"
            size={100}
            color="#9CA3AF"
          />
          <Text className="mt-2 w-full text-center text-xl font-semibold text-white">
            Teacher
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => router.push("/signup/parent")}
          className="flex w-fit flex-grow-0 rounded-lg bg-zinc-800 p-4"
        >
          <FontAwesomeIcon icon="people-roof" size={100} color="#9CA3AF" />
          <Text className="mt-2 w-full text-center text-xl font-semibold text-white">
            Parent
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => router.push("/signup/student")}
          className="flex w-fit flex-grow-0 rounded-lg bg-zinc-800 p-[26px]"
        >
          <FontAwesomeIcon icon="user" size={80} color="#9CA3AF" />
          <Text className="mt-2 w-full text-center text-xl font-semibold text-white">
            Student
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Index page, decides whether to display landing page or login page based on API verification
const Index: React.FC = () => {
  // Get token from store
  const [token, setToken] = useAtom(tokenAtom);

  // State on whether the token is verified
  const [verifyStatus, setVerifyStatus] = useState<
    "loading" | "error" | "success"
  >("loading");

  // Verify token (loaded on demand)
  const verifyQuery = api.auth.verify.useQuery(
    {
      token,
    },
    {
      enabled: false,
      onError() {
        // Disabling this for presentations because I don't want to mess up authentication setup due to network
        // void SecureStore.deleteItemAsync(TOKEN_KEY);
      },
    },
  );

  useEffect(() => {
    // Check the current token and verify it
    async function checkToken() {
      if (token.length > 0) {
        try {
          await verifyQuery.refetch();
          setVerifyStatus("success");
        } catch (error) {
          setVerifyStatus("error");
        }
      } else if (verifyQuery.isSuccess) {
        await verifyQuery.refetch();
      }
      if (verifyStatus !== "success") {
        const val = await SecureStore.getItemAsync(TOKEN_KEY);
        if (val && token !== val) {
          setToken(val);
        }
      }
    }
    void checkToken();
  }, [token]);

  // Show loading if verifying token, show landing page if verified, show login page if not verified
  return (
    <>
      {verifyQuery.isFetching ? (
        <LoadingWrapper stackName="Logging in..." />
      ) : verifyQuery.isSuccess ? (
        <Landing />
      ) : (
        <Login />
      )}
    </>
  );
};

export default Index;
