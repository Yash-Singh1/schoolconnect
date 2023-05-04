// Contacts and links to support tracker, email, and documentation

import { Linking, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";

import Links from "../../src/components/Links";
import { Navbar } from "../../src/components/Navbar";

const Contacts: React.FC = () => {
  return (
    <SafeAreaView className="bg-[#101010]">
      <Stack.Screen options={{ title: "Contacts" }} />
      <View className="flex h-full w-full flex-col content-center items-center justify-end self-center">
        <ScrollView className="h-[88%] w-full pt-2">
          {/* Static page with information on the contacts */}
          <Text className="w-full px-4 text-center text-4xl font-bold text-white">
            Contacts
          </Text>
          <Text className="w-full text-center text-xl mt-2 text-white">
            Found a bug? Have a suggestion?
          </Text>
          <View className="mt-10 flex w-full items-center justify-center">
            <Text
              className="text-2xl font-bold text-white"
              onPress={() =>
                void Linking.openURL("mailto:schoolconnect@yashsingh.us")
              }
            >
              <FontAwesomeIcon icon="envelope" color="white" size={24} /> Email
            </Text>
            <Text
              className="text-2xl font-bold text-white"
              onPress={() =>
                void Linking.openURL(
                  "https://yash-singh1.github.io/schoolconnect/",
                )
              }
            >
              <FontAwesomeIcon icon="newspaper" color="white" size={24} />{" "}
              Documentation
            </Text>
            <Text
              className="text-2xl font-bold text-white"
              onPress={() =>
                void Linking.openURL(
                  "https://github.com/Yash-Singh1/schoolconnect/issues",
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

            {/* Links to privacy policy, etc. */}
            <Links />
          </View>
        </ScrollView>
        <Navbar />
      </View>
    </SafeAreaView>
  );
};

export default Contacts;
