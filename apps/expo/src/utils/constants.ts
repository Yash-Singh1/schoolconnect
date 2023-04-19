// A bunch of random constants thrown into one file for convenience

import Constants from "expo-constants";

// Local Storage Key
export const TOKEN_KEY = "TOKEN_KEY";

// Github Client ID
export const GITHUB_CLIENT_ID = "a6be1920325c23aa5ab7"
  .split("")
  .reverse()
  .join("");

// Discovery URLs for OAuth2
export const discovery = {
  authorizationEndpoint: "https://github.com/login/oauth/authorize",
  tokenEndpoint: "https://github.com/login/oauth/access_token",
  revocationEndpoint: `https://github.com/settings/connections/applications/${GITHUB_CLIENT_ID}`,
};

// Base URL for API
export const baseURL = Constants.manifest?.debuggerHost?.split(":")[0]
  ? "http://localhost:3000/"
  : "https://schoolconnect-mu.vercel.app/";

// Supported Social Media services
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
