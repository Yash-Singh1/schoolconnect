// Form to create a new class

import { useCallback, useState } from "react";
import { Dimensions, Image, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Stack, useRouter } from "expo-router";
import { useAtom } from "jotai";

import LoadingWrapper from "../src/components/LoadingWrapper";
import { tokenAtom } from "../src/store";
import { api } from "../src/utils/api";

const NewClass: React.FC = () => {
  const [file, setFile] = useState<ImagePicker.ImagePickerResult | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fileError, setFileError] = useState(false);

  const [token] = useAtom(tokenAtom);

  // Callback to launch image picker
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

  // Mutation to create a new class, invalidates current cached data
  const util = api.useContext();
  const createClass = api.class.create.useMutation({
    async onSuccess() {
      setName("");
      setDescription("");
      setFileError(false);
      await util.class.all.invalidate();
      router.back();
    },
  });

  // TODO: Validate that a teacher or admin is doing this client-side

  return (
    <SafeAreaView className="bg-[#101010]">
      <Stack.Screen options={{ title: "New Class" }} />
      <View className="flex h-full w-full flex-col items-center justify-center">
        <TextInput
          className="mx-4 mb-1 rounded bg-white/10 p-2 text-white"
          style={{ width: Dimensions.get("screen").width - 32 }}
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          value={name}
          onChangeText={setName}
          placeholder="Name of the class"
        />
        {createClass?.error?.data?.zodError?.fieldErrors?.name && (
          <Text className="ml-8 mb-1 w-full text-left text-red-500">
            {createClass.error.data.zodError.fieldErrors.name[0]}
          </Text>
        )}
        <TextInput
          className="mx-4 mb-1 rounded bg-white/10 p-2 text-white"
          style={{ width: Dimensions.get("screen").width - 32 }}
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          value={description}
          onChangeText={setDescription}
          placeholder="Description of the class"
        />
        {createClass?.error?.data?.zodError?.fieldErrors?.description && (
          <Text className="ml-8 mb-1 w-full text-left text-red-500">
            {createClass.error.data.zodError.fieldErrors.description[0]}
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
              alt={"Selected file"}
              style={{ width: 200, height: 200 }}
            />
          ) : (
            <Text className="text-xl font-semibold text-white">
              No image selected
            </Text>
          )}
        </View>
        {fileError ? (
          <Text className="ml-8 w-full text-left text-red-500">
            Error: You must select a banner image
          </Text>
        ) : null}
        <Text
          className="mx-4 mt-2 rounded-lg bg-blue-500/80 py-2 text-center text-lg font-bold text-white"
          style={{ width: Dimensions.get("screen").width - 32 }}
          onPress={() => void selectDocument()}
        >
          Upload Banner
        </Text>
        {createClass.isLoading ? (
          <LoadingWrapper
            small
            spinClass="bg-green-500/80 mt-2 py-2 rounded-lg flex flex-row justify-center items-center gap-x-4 ml-1"
            spinStyle={{
              width: Dimensions.get("screen").width - 32,
            }}
          >
            <Text className="font-bold text-white text-lg">Submit</Text>
          </LoadingWrapper>
        ) : (
          <Text
            className="mx-4 mt-2 rounded-lg bg-green-500/80 py-2 text-center text-lg font-bold text-white"
            style={{ width: Dimensions.get("screen").width - 32 }}
            onPress={() => {
              if (!file || file.canceled) {
                setFileError(true);
                return;
              } else {
                setFileError(false);
              }
              createClass.mutate({
                token,
                name,
                description,
                image: file.assets[0]?.base64 as string,
              });
            }}
          >
            Submit
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default NewClass;
