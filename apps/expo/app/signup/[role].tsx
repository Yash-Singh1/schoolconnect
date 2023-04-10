// Signup page specific for a role

import { useEffect, useState } from "react";
import {
  Dimensions,
  Linking,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker, { type ItemType } from "react-native-dropdown-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useNavigation, useRouter, useSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useAtom } from "jotai";

import { tokenAtom } from "../../src/store";
import { api, type RouterInputs } from "../../src/utils/api";
import { TOKEN_KEY } from "../../src/utils/constants";
import { resetStack, type NavigatorOverride } from "../../src/utils/resetStack";
import useCode from "../../src/utils/useCode";

const antiState = Math.random().toString();

const Signup = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ItemType<string>[]>([]);
  const [error, setError] = useState(false);
  const [schooled, setSchooled] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const schoolsQuery = api.school.all.useQuery();
  const signupMutation = api.auth.signup.useMutation();

  const params = useSearchParams();

  const [_request, response, promptAsync] = useCode(
    antiState,
    `/signup/${params.role}`,
  );

  const router = useRouter();
  const navigation = useNavigation() as NavigatorOverride;

  const [_, setToken] = useAtom(tokenAtom);

  // Once client-side authentication complete, we pass on to backend to finish authentication and fetch token
  useEffect(() => {
    if (response?.type === "success") {
      // Check if the GitHub API returns with the same state we provided
      // Otherwise, it's a possible CSRF attack because someone in the middle could have intercepted the message
      if (response.params.state !== antiState) {
        throw new Error("State mismatch, possible CSRF Attack");
      }

      // If the state matches, we can safely proceed with the authentication to the backend
      signupMutation.mutate({
        code: response.params.code!,
        state: antiState,
        schoolId: value!,
        role: params.role as RouterInputs["auth"]["signup"]["role"],
      });
    }
  }, [response]);

  // Once back-end authentication complete, we store token in secure store and redirect to home page
  useEffect(() => {
    if (signupMutation?.data?.length && signupMutation?.data?.length > 1) {
      // Store the token in secure store for remembering the user
      void SecureStore.setItemAsync(TOKEN_KEY, signupMutation.data);

      // Set the token in the global store for other routes to use
      setToken(signupMutation?.data || "");

      // Reset the stack to the home page
      resetStack({ router, navigation });
    }
  }, [signupMutation.data]);

  // Once schools are fetched, we stop the loading spinner on the dropdown
  useEffect(() => {
    if (loading && schoolsQuery.data && schoolsQuery.data.length > 0)
      setLoading(false);
  }, [schoolsQuery.data]);

  // Once schools are fetched, we populate the dropdown with the schools values
  useEffect(() => {
    if (schoolsQuery.data) {
      setItems(
        schoolsQuery.data.map((school) => ({
          label: school.name,
          value: school.id,
        })),
      );
    }
  }, [loading]);

  return (
    <SafeAreaView className="bg-[#101010]">
      <Stack.Screen options={{ title: "Signup" }} />
      {params.role === "admin" ? (
        <View className="flex h-full w-full flex-col flex-wrap items-center self-center p-4 align-middle">
          {/* We can't allow people to sign up as admin, they must contact us to start a school */}
          <Text className="text-lg text-white">
            To begin using SchoolConnect for your school, contact one of our
            support agents:
          </Text>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => void Linking.openURL(`tel:+17866181083`)}
            className="mt-2 flex flex-row flex-nowrap items-center justify-center gap-x-2 rounded-lg bg-green-300 p-4"
          >
            <FontAwesomeIcon color="white" icon="phone" size={30} />
            <Text className="text-xl font-semibold text-white">
              Request a quote
            </Text>
          </TouchableOpacity>
        </View>
      ) : schooled ? (
        <View className="ml-2 flex h-full w-full items-center">
          {/* If school is selected, we proceed to show the signup form */}

          {/* Sign in with some social */}
          <TouchableOpacity
            activeOpacity={0.5}
            style={{ width: Dimensions.get("screen").width - 32 }}
            className="mt-2 flex w-full flex-row items-center justify-center gap-x-4 rounded-lg bg-[#444444] p-1 py-2"
            onPress={() => void promptAsync()}
          >
            <FontAwesomeIcon icon={["fab", "github"]} size={50} color="#fff" />
            <Text className="text-center text-lg uppercase text-white">
              Signup with GitHub
            </Text>
          </TouchableOpacity>

          {/* Or sign in with traditional email/password */}
          <Text className="text-white w-full text-center text-lg mt-2">OR</Text>
          <TextInput
            className="mt-2 mb-1 w-full mr-4 rounded bg-white/10 p-2 text-white"
            style={{ width: Dimensions.get("screen").width - 32 }}
            placeholder="Email"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            className="mt-2 mb-1 w-full mr-4 rounded bg-white/10 p-2 text-white"
            style={{ width: Dimensions.get("screen").width - 32 }}
            placeholder="Password"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={password}
            secureTextEntry={true}
            onChangeText={setPassword}
          />

          {/* Submit button signup request */}
          <Text
            onPress={() => {
              signupMutation.mutate({
                email,
                code: password,
                state: antiState,
                schoolId: value!,
                role: params.role as RouterInputs["auth"]["signup"]["role"],
              });
            }}
            style={{ width: Dimensions.get("screen").width - 32 }}
            className="mr-4 mt-2 rounded-lg bg-blue-500 p-1 text-center text-lg font-semibold uppercase text-white"
          >
            Submit
          </Text>
        </View>
      ) : (
        <View className="flex h-full w-full items-center self-center p-4 align-middle">
          {/* Dropdown picker for the schools, initial step for signing up */}
          {/* TODO: Lazy pagination and searching for massive amounts of schools */}
          <View className="z-10">
            <DropDownPicker
              open={open}
              value={value}
              items={items}
              setItems={setItems}
              searchable={true}
              placeholder="Select a school"
              setOpen={setOpen}
              setValue={setValue}
              loading={loading}
              onOpen={() => {
                void schoolsQuery.refetch();
              }}
              theme="DARK"
            />
          </View>

          {/* Validation to ensure school selected */}
          <Text
            className={`mt-1 w-full font-light text-red-500 ${
              error ? "" : "hidden"
            } -z-10`}
          >
            Error: You must select a school to signup for
          </Text>

          {/* Next button to proceed to the signup form */}
          <Text
            className="mt-2 w-full rounded-lg bg-blue-500 p-1 text-center text-lg font-semibold uppercase text-white -z-10"
            onPress={() => {
              if (!value) {
                setError(true);
              } else {
                setSchooled(true);
              }
            }}
          >
            Next
          </Text>

          {/* If school not listed, ask to contact admin */}
          <Text className="mt-2 w-full text-center text-xs text-white -z-10">
            Don&rsquo;t see your school here? Contact your school admin.
          </Text>

          {/* If already have an account, go to login */}
          <Text className="mt-2 w-full text-center text-xs text-white -z-10">
            Already have an account?{" "}
            <Text
              className="text-blue-400"
              onPress={() => router.replace(`/login/${params.role}`)}
            >
              Login
            </Text>
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Signup;
