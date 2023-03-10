// A bunch of random constants thrown into one file for convenience

import Constants from "expo-constants";

export const TOKEN_KEY = "TOKEN_KEY";

export const GITHUB_CLIENT_ID = "a6be1920325c23aa5ab7"
  .split("")
  .reverse()
  .join("");

export const discovery = {
  authorizationEndpoint: "https://github.com/login/oauth/authorize",
  tokenEndpoint: "https://github.com/login/oauth/access_token",
  revocationEndpoint: `https://github.com/settings/connections/applications/${GITHUB_CLIENT_ID}`,
};

export const baseURL = Constants.expoConfig?.extra!.dev
  ? "http://localhost:3000/"
  : "https://schoolconnect-mu.vercel.app/";

export const supportedSocialMedia = {
  facebook: {
    start: "https://www.facebook.com",
    icon: ["fab", "facebook"] as ["fab", "facebook"],
    name: "Facebook",
  },
  instagram: {
    start: "https://www.instagram.com",
    icon: ["fab", "instagram"] as ["fab", "instagram"],
    name: "Instagram",
  },
  twitter: {
    start: "https://twitter.com",
    icon: ["fab", "twitter"] as ["fab", "twitter"],
    name: "Twitter",
  },
};
