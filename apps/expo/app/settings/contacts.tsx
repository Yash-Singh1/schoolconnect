// Contacts and links to support tracker, email, and documentation

import { Linking, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";

import { Navbar } from "../../src/components/Navbar";
import { baseURL } from "../../src/utils/constants";

const Contacts: React.FC = () => {
  return (
    <SafeAreaView className="bg-[#101010]">
      <Stack.Screen options={{ title: "Contacts" }} />
      <View className="flex h-full w-full flex-col content-center items-center justify-end self-center">
        <ScrollView className="h-[88%] w-full pt-2">
          <Text className="w-full px-4 text-center text-4xl font-bold text-white">
            Contacts<Text className="hidden"> </Text>
          </Text>
          <Text className="w-full text-center text-xl mt-2 text-white">
            Found a bug? Have a suggestion?
          </Text>
          <View className="mt-10 flex w-full items-center justify-center">
            <Text
              className="text-2xl font-bold text-white android:font-normal"
              onPress={() =>
                void Linking.openURL("mailto:schoolconnect@yashsingh.us")
              }
            >
              <FontAwesomeIcon icon="envelope" color="white" size={24} /> Email
              <Text> </Text>
            </Text>
            <Text
              className="text-2xl font-bold text-white android:font-normal"
              onPress={() =>
                void Linking.openURL(
                  "https://yash-singh1.github.io/schoolconnect-support-tracker/",
                )
              }
            >
              <FontAwesomeIcon icon="newspaper" color="white" size={24} />{" "}
              Documentation<Text className="hidden"> </Text>
            </Text>
            <Text
              className="text-2xl font-bold text-white android:font-normal"
              onPress={() =>
                void Linking.openURL(
                  "https://github.com/Yash-Singh1/schoolconnect-support-tracker/issues",
                )
              }
            >
              <FontAwesomeIcon
                icon={["fab", "github"]}
                color="white"
                size={24}
              />{" "}
              Issue Tracker
            </Text>
            <Text className="mt-4 w-full text-center text-lg text-white">
              Based on the{" "}
              <Text
                onPress={() =>
                  void Linking.openURL("https://opensource.org/license/mit/")
                }
                className="text-blue-500"
              >
                MIT License
              </Text>
              {"\n"}
              &#169; 2023 Yash Singh
            </Text>
            <View className="mb-8 mt-1 flex w-full flex-row items-center justify-center">
              <Text
                className="text-lg text-blue-500"
                onPress={() => void Linking.openURL(`https://schoolconnect-mu.vercel.app/privacy`)}
              >
                Privacy Policy
              </Text>
              <Text className="mx-2 text-white">•</Text>
              <Text
                className="text-lg text-blue-500"
                onPress={() => void Linking.openURL(`https://schoolconnect-mu.vercel.app/tos`)}
              >
                Terms of Service
              </Text>
            </View>
          </View>
        </ScrollView>
        <Navbar />
      </View>
    </SafeAreaView>
  );
};

export default Contacts;
