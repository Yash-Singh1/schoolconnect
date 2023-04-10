// Login page for a certain role

import { useEffect, useState } from "react";
import {
  Dimensions,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useNavigation, useRouter, useSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useAtom } from "jotai";

import { tokenAtom } from "../../src/store";
import { api } from "../../src/utils/api";
import { TOKEN_KEY } from "../../src/utils/constants";
import { resetStack, type NavigatorOverride } from "../../src/utils/resetStack";
import useCode from "../../src/utils/useCode";

// Anti-state to prevent CSRF attacks
const antiState = Math.random().toString();

const Login: React.FC = () => {
  // Initialize router helper
  const router = useRouter();
  const navigation = useNavigation() as NavigatorOverride;

  // Get role from the URL
  const params = useSearchParams();

  // Use authentication helper hook
  const [_request, response, promptAsync] = useCode(
    antiState,
    `/login/${params.role}`,
  );

  // Login mutation
  const loginMutation = api.auth.login.useMutation();

  // Store token in store
  const [_token, setToken] = useAtom(tokenAtom);

  // First step of authentication on client-side over, relay to backend
  useEffect(() => {
    if (response && response?.type === "success") {
      // Check if anti-state matches
      if (response.params.state !== antiState) {
        throw new Error("State mismatch, possible CSRF Attack");
      }

      // Relay to backend
      loginMutation.mutate({
        code: response.params.code!,
      });
    }
  }, [response]);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Backend authentication complete, store token in secure store and redirect to home page
  useEffect(() => {
    // Make sure successfully completed
    if (loginMutation?.data?.length && loginMutation?.data?.length > 1) {
      // Store token on client for further data fetching
      void SecureStore.setItemAsync(TOKEN_KEY, loginMutation.data);

      // Store token in memory store
      setToken(loginMutation?.data || "");

      // Redirect to home page
      resetStack({ router, navigation });
    }
  }, [loginMutation.data]);

  return (
    <SafeAreaView className="bg-[#101010]">
      <Stack.Screen options={{ title: "Signin" }} />
      <View className="flex h-full w-full items-center self-center p-4 align-middle">
        {/* UI for login page, shows social buttons */}
        <TouchableOpacity
          activeOpacity={0.5}
          className="mt-2 -mr-4 flex w-full flex-row items-center justify-center gap-x-4 rounded-lg bg-[#444444] p-1 py-2"
          onPress={() => void promptAsync()}
        >
          <FontAwesomeIcon icon={["fab", "github"]} size={50} color="#fff" />
          <Text className="text-center text-lg uppercase text-white">
            Login with GitHub
          </Text>
        </TouchableOpacity>

        {/* Give option to use classic email-password auth */}
        <Text className="text-white w-full text-center text-lg mt-2">OR</Text>
        <View className="w-full">
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

          {/* Submit button and link to signup page */}
          <Text
            onPress={() => {
              loginMutation.mutate({
                email,
                code: password,
              });
            }}
            style={{ width: Dimensions.get("screen").width - 32 }}
            className="mr-4 mt-2 rounded-lg bg-blue-500 p-1 text-center text-lg font-semibold uppercase text-white"
          >
            Submit
          </Text>
        </View>
        <Text className="mt-2 text-white">
          Don&rsquo;t have an account yet?{" "}
          <Text
            className="text-blue-400"
            onPress={() => router.replace(`/signup/${params.role!}`)}
          >
            Signup
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default Login;
