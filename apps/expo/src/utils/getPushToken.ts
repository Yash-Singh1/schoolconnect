import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

export async function getPushToken(greedy = true) {
  let token;
  if (Device.isDevice) {
    let { status: permission } = await Notifications.getPermissionsAsync();
    if (permission !== "granted") {
      if (!greedy) return;
      permission = (await Notifications.requestPermissionsAsync()).status;
    }
    if (permission !== "granted") {
      alert(
        "You must enable push notifications in settings to use this feature",
      );
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    if (!greedy) return;
    alert("Must use physical device for Push Notifications");
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}
