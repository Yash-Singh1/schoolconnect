// New post page, allows teachers to create new posts for one of their classes

import { useCallback, useState } from "react";
import { Dimensions, Image, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Stack, useRouter, useSearchParams } from "expo-router";
import { useAtom } from "jotai";

import LoadingWrapper from "../../src/components/LoadingWrapper";
import { tokenAtom } from "../../src/store";
import { api } from "../../src/utils/api";

const NewPost: React.FC = () => {
  const [file, setFile] = useState<ImagePicker.ImagePickerResult | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [token] = useAtom(tokenAtom);

  const selectDocument = useCallback(async () => {
    try {
      const response = await ImagePicker.launchImageLibraryAsync({
        base64: true,
      });
      if (!response.canceled) setFile(response);
    } catch (error) {
      console.warn(error);
    }
  }, []);

  const router = useRouter();

  const { classId } = useSearchParams();

  const classQuery = api.class.get.useQuery({
    token,
    classId: classId as string,
  });

  const util = api.useContext();
  const createPost = api.post.create.useMutation({
    async onSuccess() {
      setTitle("");
      setContent("");
      await util.post.all.invalidate();
      router.back();
    },
  });

  // TODO: Validate that a teacher or admin is doing this client-side

  return classQuery.data ? (
    <SafeAreaView className="bg-[#101010]">
      <Stack.Screen options={{ title: "New Post" }} />
      <View className="flex h-full w-full flex-col items-center justify-center">
        {/* Form for creating the post */}
        <Text className="ml-8 mb-2 w-full text-left text-2xl text-white">
          Posting to {classQuery.data?.name}
        </Text>
        <TextInput
          className="mx-4 mb-1 rounded bg-white/10 p-2 text-white"
          style={{ width: Dimensions.get("screen").width - 32 }}
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          value={title}
          onChangeText={setTitle}
          // @ts-expect-error -- TODO: Contribute to react-native typings, they support enterKeyHint but didn't document it
          enterKeyHint="done"
          placeholder="Title of the post"
        />
        {createPost?.error?.data?.zodError?.fieldErrors?.title && (
          <Text className="ml-8 mb-1 w-full text-left text-red-500">
            {createPost.error.data.zodError.fieldErrors.title[0]}
          </Text>
        )}
        <TextInput
          className="mx-4 mb-1 rounded bg-white/10 p-2 text-white"
          style={{ width: Dimensions.get("screen").width - 32 }}
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          value={content}
          textAlignVertical="top"
          // @ts-expect-error -- TODO: See above comment
          enterKeyHint={"done"}
          onChangeText={setContent}
          placeholder="Content of the post"
        />
        {createPost?.error?.data?.zodError?.fieldErrors?.content && (
          <Text className="ml-8 mb-1 w-full text-left text-red-500">
            {createPost.error.data.zodError.fieldErrors.content[0]}
          </Text>
        )}
        <View
          className="mx-4 my-1 flex h-1/2 items-center justify-center rounded-lg border-2 border-white"
          style={{ width: Dimensions.get("screen").width - 32 }}
        >
          {file && !file.canceled && file.assets && file.assets.length > 0 ? (
            <Image
              source={{
                uri: `data:image/jpeg;base64,${file.assets[0]!.base64}`,
              }}
              alt={"Selected image"}
              style={{ width: 200, height: 200 }}
            />
          ) : (
            <Text className="text-xl font-semibold text-white">
              No image selected
            </Text>
          )}
        </View>
        <Text
          className="mx-4 mt-2 rounded-lg bg-blue-500/80 py-2 text-center text-lg font-bold text-white"
          style={{ width: Dimensions.get("screen").width - 32 }}
          onPress={() => void selectDocument()}
        >
          Upload Banner
        </Text>
        {/** TODO: Loading button similar to newclass */}
        <Text
          className="mx-4 mt-2 rounded-lg bg-green-500/80 py-2 text-center text-lg font-bold text-white"
          style={{ width: Dimensions.get("screen").width - 32 }}
          onPress={() => {
            // Create the post with the form data
            // Will automatically return server-side form validation errors if required
            createPost.mutate({
              token,
              classId: classQuery.data.id,
              title,
              content,
              image:
                file && file.assets
                  ? (file.assets[0]?.base64 as string)
                  : undefined,
            });
          }}
        >
          Submit
        </Text>
      </View>
    </SafeAreaView>
  ) : (
    <LoadingWrapper stackName="New Post" />
  );
};

export default NewPost;
