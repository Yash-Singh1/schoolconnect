// A react hook to wrap `useAuthRequest` with GitHub authentication configuration

import {
  ResponseType,
  makeRedirectUri,
  useAuthRequest,
} from "expo-auth-session";

import { GITHUB_CLIENT_ID, discovery } from "./constants";

export default function useCode(antiState: string, path: string) {
  const redirect_uri = makeRedirectUri({
    scheme: "exp",
    path,
  });

  // Here we are simply wrapping the `useAuthRequest` hook
  // This makes there less duplication configuration when using GitHub authentication
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: GITHUB_CLIENT_ID,
      scopes: ["user"],
      state: antiState,
      redirectUri: redirect_uri,
      responseType: ResponseType.Token,
    },
    discovery,
  );

  return [request, response, promptAsync] as const;
}
