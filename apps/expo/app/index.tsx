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
import { type Event, type Post } from "@prisma/client";
import { FlashList } from "@shopify/flash-list";
import { useAtom } from "jotai";

import LoadingWrapper from "../src/components/LoadingWrapper";
import { Navbar } from "../src/components/Navbar";
import { tokenAtom } from "../src/store/";
import { api } from "../src/utils/api";
import { TOKEN_KEY, supportedSocialMedia } from "../src/utils/constants";

// Main landing page when logged in
const Landing = () => {
  const [token] = useAtom(tokenAtom);

  const selfQuery = api.user.self.useQuery({
    token,
  });

  const schoolQuery = api.school.get.useQuery({
    token,
  });

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

  const utils = api.useContext();
  const editSocialMutation = api.school.editSocial.useMutation({
    onSuccess() {
      setProfileURL("");
      setTab("social");
      void utils.school.invalidate();
    },
  });

  const [tab, setTab] = useState<"news" | "social" | "edit">("news");
  const [profileURL, setProfileURL] = useState("");

  return selfQuery.data && schoolQuery.data ? (
    <SafeAreaView className="bg-[#101010]">
      <Stack.Screen options={{ title: "Home Page" }} />
      <View className="flex h-full w-full flex-col content-center items-center justify-end self-center">
        <View className="h-[88%] w-full p-2">
          <Text className="mx-auto pb-2 text-center text-2xl font-bold text-white android:font-medium">
            Welcome{" "}
            <Text className="text-pink-400">
              {selfQuery.data.name || "Anonymous"}
            </Text>
            !<Text className="hidden"> </Text>
          </Text>
          <View className="flex flex-row gap-x-4">
            <TouchableOpacity
              className="flex flex-row items-center pb-1 px-1 border-b-pink-400"
              activeOpacity={0.5}
              onPress={() => setTab("news")}
              style={{ borderBottomWidth: tab === "news" ? 1 : 0 }}
            >
              <FontAwesomeIcon icon="newspaper" color="white" />
              <Text className="ml-2 text-lg font-bold text-white">News</Text>
            </TouchableOpacity>

            {socialMedia ? <TouchableOpacity
              className="flex flex-row items-center pb-1 px-1 border-b-pink-400"
              activeOpacity={0.5}
              onPress={() => setTab("social")}
              style={{ borderBottomWidth: tab === "social" ? 1 : 0 }}
            >
              <FontAwesomeIcon icon={socialMedia.icon} color="white" />
              <Text className="ml-2 text-lg font-bold text-white">
                {socialMedia.name}
              </Text>
            </TouchableOpacity> : null}

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
            <>
              <Text className="w-full pb-2 text-left text-xl font-bold text-white mt-2">
                Recent Announcements
              </Text>
              <Announcements />
            </>
          ) : tab === "social" ? (
            <WebView
              className="mt-2"
              source={{
                uri: schoolQuery.data.social!,
              }}
            />
          ) : (
            <View className="mt-2">
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

const Announcements = () => {
  const [token] = useAtom(tokenAtom);

  const recentEventsQuery = api.events.all.useQuery({
    token,
    take: 10,
    upOnly: true,
  });

  const recentPostsQuery = api.post.all.useQuery({
    token,
    take: 10,
    upOnly: true,
  });

  const recentAnnouncements = useMemo(() => {
    if (recentEventsQuery.data && recentPostsQuery.data) {
      const result = [];
      let recentPostI = 0;
      for (
        let recentEventI = 0;
        recentEventI < recentEventsQuery.data.length;
        recentEventI++
      ) {
        while (
          recentPostI < recentPostsQuery.data.length &&
          recentPostsQuery.data[recentPostI]!.createdAt <
            recentEventsQuery.data[recentEventI]!.start
        ) {
          result.push(recentPostsQuery.data[recentPostI]!);
          recentPostI++;
        }
        result.push(recentEventsQuery.data[recentEventI]!);
      }
      return result;
    } else {
      return false;
    }
  }, [recentEventsQuery.data, recentPostsQuery.data]);

  return recentAnnouncements ? (
    <View
      style={{
        height: Dimensions.get("screen").height * 0.7,
        width: Dimensions.get("screen").width,
      }}
    >
      <FlashList
        data={recentAnnouncements}
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item }) => <Announcement item={item} />}
        estimatedItemSize={46}
      />
    </View>
  ) : null;
};

const isEvent = (item: Event | Post): item is Event => {
  if (Object.hasOwn(item, "start")) {
    return true;
  }
  return false;
};

const Announcement = ({ item }: { item: Event | Post }) => {
  const eventItem = isEvent(item);

  const [token] = useAtom(tokenAtom);

  let sourceQuery;
  if (eventItem) {
    sourceQuery = item.schoolId
      ? api.school.get.useQuery({
          token,
        })
      : api.class.getOwner.useQuery({
          token,
          classId: item.classId!,
        });
  } else {
    sourceQuery = api.class.getOwner.useQuery({
      token,
      classId: item.classId,
    });
  }

  return (
    <View
      style={{
        width: Dimensions.get("screen").width - 32,
      }}
      className="mb-2 rounded-lg border-2 border-violet-400/50 bg-violet-400/40 p-2"
    >
      <Text className="text-base font-bold text-white">
        {eventItem ? item.name : item.title}
      </Text>
      <Text className="italic text-white">
        {sourceQuery.data ? sourceQuery.data.name : ""}
      </Text>
    </View>
  );
};

// Main login page shown to user, links to respective login/signup pages
const Login: React.FC = () => {
  const router = useRouter();

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
const Index = () => {
  const [token, setToken] = useAtom(tokenAtom);
  const [verifyStatus, setVerifyStatus] = useState<
    "loading" | "error" | "success"
  >("loading");

  const verifyQuery = api.auth.verify.useQuery(
    {
      token,
    },
    {
      enabled: false,
    },
  );

  useEffect(() => {
    async function checkToken() {
      if (token.length > 0) {
        try {
          await verifyQuery.refetch();
          setVerifyStatus("success");
        } catch (error) {
          setVerifyStatus("error");
        }
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
