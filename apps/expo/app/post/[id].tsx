import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { View } from "react-native";

const Post: React.FC = () => {
  

  return (
    <SafeAreaView className="bg-[#101010]">
      <Stack.Screen options={{ title: "Post" }} />
      <View></View>
    </SafeAreaView>
  );
};

export default Post;
