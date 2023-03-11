// Form to create a new event

import { useState } from "react";
import { Dimensions, Platform, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { useAtom } from "jotai";

import LoadingWrapper from "../src/components/LoadingWrapper";
import { tokenAtom } from "../src/store";
import { api } from "../src/utils/api";

const NewEvent: React.FC = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());

  const [token] = useAtom(tokenAtom);

  const router = useRouter();

  // Mutation to create a new class, invalidates current cached data
  const util = api.useContext();
  const createEvent = api.events.create.useMutation({
    async onSuccess() {
      setTitle("");
      setContent("");
      await util.events.all.invalidate();
      router.back();
    },
  });

  const showStartDatePicker = (mode: "date" | "time") => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: start,
        onChange: (_, value) => value && setStart(value),
        mode,
        is24Hour: true,
      });
    }
  };

  const showEndDatePicker = (mode: "date" | "time") => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: end,
        onChange: (_, value) => value && setEnd(value),
        mode,
        is24Hour: true,
      });
    }
  };

  return (
    <SafeAreaView className="bg-[#101010]">
      <Stack.Screen options={{ title: "New Event" }} />
      <View className="flex h-full w-full flex-col items-center justify-center">
        <TextInput
          className="mx-4 mb-1 rounded bg-white/10 p-2 text-white"
          style={{ width: Dimensions.get("screen").width - 32 }}
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          value={title}
          onChangeText={setTitle}
          placeholder="Title of the event"
        />
        {createEvent?.error?.data?.zodError?.fieldErrors?.title && (
          <Text className="ml-8 mb-1 w-full text-left text-red-500">
            {createEvent.error.data.zodError.fieldErrors.title[0]}
          </Text>
        )}
        <TextInput
          className="mx-4 mb-1 rounded bg-white/10 p-2 text-white"
          style={{ width: Dimensions.get("screen").width - 32 }}
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          value={content}
          onChangeText={setContent}
          placeholder="Content of the event"
        />
        {createEvent?.error?.data?.zodError?.fieldErrors?.description && (
          <Text className="ml-8 mb-1 w-full text-left text-red-500">
            {createEvent.error.data.zodError.fieldErrors.description[0]}
          </Text>
        )}
        <View
          className="my-2 flex flex-row justify-between items-center"
          style={{ width: Dimensions.get("screen").width - 32 }}
        >
          <Text className="text-white text-lg">Start</Text>
          {Platform.OS === "ios" ? (
            <DateTimePicker
              value={start}
              // @ts-expect-error -- Android Mode required, but we will do separately
              mode="datetime"
              is24Hour={true}
              maximumDate={end}
              onChange={(_, value) => value && setStart(value)}
            />
          ) : (
            <View className="flex flex-row">
              <Text
                className="text-white mr-2 text-base"
                onPress={() => {
                  showStartDatePicker("date");
                }}
              >
                {start.toDateString().split(" ").slice(1).join(" ")}
              </Text>
              <Text
                className="text-white mr-2 text-base"
                onPress={() => {
                  showStartDatePicker("time");
                }}
              >
                {start
                  .toLocaleTimeString()
                  .split(" ")
                  .map((t, i) =>
                    i === 0 ? t.split(":").slice(0, 2).join(":") : t,
                  )
                  .join(" ")
                  .toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <View
          className="my-2 flex flex-row justify-between items-center"
          style={{ width: Dimensions.get("screen").width - 32 }}
        >
          <Text className="text-white text-lg">End</Text>
          {Platform.OS === "ios" ? (
            <DateTimePicker
              value={end}
              // @ts-expect-error -- Android Mode required, but we will do separately
              mode="datetime"
              is24Hour={true}
              minimumDate={start}
              onChange={(_, value) => value && setEnd(value)}
            />
          ) : (
            <View className="flex flex-row">
              <Text
                className="text-white mr-2 text-base"
                onPress={() => {
                  showEndDatePicker("date");
                }}
              >
                {end.toDateString().split(" ").slice(1).join(" ")}
              </Text>
              <Text
                className="text-white mr-2 text-base"
                onPress={() => {
                  showEndDatePicker("time");
                }}
              >
                {end
                  .toLocaleTimeString()
                  .split(" ")
                  .map((t, i) =>
                    i === 0 ? t.split(":").slice(0, 2).join(":") : t,
                  )
                  .join(" ")
                  .toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        {createEvent.isLoading ? (
          <LoadingWrapper
            small
            spinClass="bg-green-500/80 mt-2 py-2 flex flex-row justify-center items-center gap-x-4 ml-1"
            spinStyle={{
              width: Dimensions.get("screen").width - 32,
            }}
          >
            <Text className="font-bold text-white text-lg">Submit</Text>
          </LoadingWrapper>
        ) : (
          <Text
            className="mx-4 mt-2 rounded-lg bg-green-500/80 py-1 text-center text-lg font-bold android:font-normal text-white"
            style={{ width: Dimensions.get("screen").width - 32 }}
            onPress={() => {
              createEvent.mutate({
                token,
                title,
                content,
                start,
                end,
              });
            }}
          >
            Submit<Text className="hidden"> </Text>
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default NewEvent;
