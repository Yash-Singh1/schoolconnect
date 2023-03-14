// Form to create a new event

import { useEffect, useState } from "react";
import { Dimensions, Text, TextInput, View } from "react-native";
import DropDownPicker, { type ItemType } from "react-native-dropdown-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { useAtom } from "jotai";

import { DatePicker } from "../src/components/DatePicker";
import LoadingWrapper from "../src/components/LoadingWrapper";
import { tokenAtom } from "../src/store";
import { api } from "../src/utils/api";

const NewEvent: React.FC = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [classId, setClassId] = useState<string | null>(null);
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);

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

  const selfQuery = api.user.self.useQuery({ token });
  const classesQuery = api.class.all.useQuery(
    {
      token,
    },
    {
      enabled: false,
    },
  );

  const [items, setItems] = useState<ItemType<string>[]>([]);

  useEffect(() => {
    if (selfQuery.data && selfQuery.data.role === "teacher") {
      void classesQuery.refetch();
    }
  }, [selfQuery.data]);

  useEffect(() => {
    if (classesQuery.data) {
      setItems(
        classesQuery.data.map((_class) => ({
          label: _class.name,
          value: _class.id,
        })),
      );
    }
  }, [classesQuery.data]);

  return selfQuery.data &&
    (selfQuery.data.role === "teacher" ? classesQuery.data : true) ? (
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
          <DatePicker
            value={start}
            mode="datetime"
            maximumDate={end}
            onChange={(_, value) => value && setStart(value)}
          />
        </View>
        <View
          className="my-2 flex flex-row justify-between items-center"
          style={{ width: Dimensions.get("screen").width - 32 }}
        >
          <Text className="text-white text-lg">End</Text>
          <DatePicker
            value={end}
            mode="datetime"
            minimumDate={start}
            onChange={(_, value) => value && setEnd(value)}
          />
        </View>
        {selfQuery.data.role === "teacher" ? (
          <View className="z-10 mx-4">
            <DropDownPicker
              open={classDropdownOpen}
              setOpen={setClassDropdownOpen}
              value={classId}
              setValue={setClassId}
              items={items}
              setItems={setItems}
              theme="DARK"
            />
          </View>
        ) : null}
        {createEvent.isLoading ? (
          <LoadingWrapper
            small
            spinClass="bg-green-500/80 -z-10 rounded-lg mt-2 py-2 flex flex-row justify-center items-center gap-x-4 ml-1"
            spinStyle={{
              width: Dimensions.get("screen").width - 32,
            }}
          >
            <Text className="font-bold text-white text-lg">Submit</Text>
          </LoadingWrapper>
        ) : (
          <Text
            className="mx-4 mt-2 -z-10 rounded-lg bg-green-500/80 py-1 text-center text-lg font-bold text-white"
            style={{ width: Dimensions.get("screen").width - 32 }}
            onPress={() => {
              createEvent.mutate({
                token,
                title,
                content,
                start,
                end,
                classId: classId || undefined,
              });
            }}
          >
            Submit
          </Text>
        )}
      </View>
    </SafeAreaView>
  ) : (
    <LoadingWrapper stackName="New Event" />
  );
};

export default NewEvent;
