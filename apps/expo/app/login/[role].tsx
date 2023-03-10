// Login page for a certain role

import { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useNavigation, useRouter, useSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useAtom } from "jotai";

import { tokenAtom } from "../../src/store";
import { api } from "../../src/utils/api";
import { TOKEN_KEY } from "../../src/utils/constants";
import { resetStack } from "../../src/utils/resetStack";
import useCode from "../../src/utils/useCode";

const antiState = Math.random().toString();

const Login: React.FC = () => {
  const router = useRouter();
  const navigation = useNavigation();

  const params = useSearchParams();

  const [_request, response, promptAsync] = useCode(
    antiState,
    `/login/${params.role}`,
  );

  const loginMutation = api.auth.login.useMutation();

  const [_token, setToken] = useAtom(tokenAtom);

  // First step of authentication on client-side over, relay to backend
  useEffect(() => {
    if (response && response?.type === "success") {
      if (response.params.state !== antiState) {
        throw new Error("State mismatch, possible CSRF Attack");
      }
      loginMutation.mutate({
        code: response.params.code!,
      });
    }
  }, [response]);

  // Backend authentication complete, store token in secure store and redirect to home page
  useEffect(() => {
    if (loginMutation?.data?.length && loginMutation?.data?.length > 1) {
      void SecureStore.setItemAsync(TOKEN_KEY, loginMutation.data);
      setToken(loginMutation?.data || "");
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
