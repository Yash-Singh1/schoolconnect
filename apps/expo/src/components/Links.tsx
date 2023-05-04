// Links for the contacts page

import { Linking, Text, View } from "react-native";

const Links: React.FC = () => {
  return (
    <>
      <Text className="mt-4 w-full text-center text-lg text-white">
        {/* Copyright */}
        &#169; 2023 Yash Singh
      </Text>

      {/* Privacy Policy and Terms of Service */}
      <View className="mb-8 mt-1 flex w-full flex-row items-center justify-center">
        <Text
          className="text-lg text-blue-500"
          onPress={() =>
            void Linking.openURL(`https://schoolconnect-mu.vercel.app/privacy`)
          }
        >
          Privacy Policy
        </Text>
        <Text className="mx-2 text-white">•</Text>
        <Text
          className="text-lg text-blue-500"
          onPress={() =>
            void Linking.openURL(`https://schoolconnect-mu.vercel.app/tos`)
          }
        >
          Terms of Service
        </Text>
      </View>
    </>
  );
};

export default Links;
