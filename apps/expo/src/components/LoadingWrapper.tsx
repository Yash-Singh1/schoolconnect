// Wrapper that adds the loading screen to all of the pages components

import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";
import { Stack } from "expo-router";

type LoadingWrapperProps = {
  safeAreaViewClass?: string;
  spinClass?: string;
  spinStyle?: StyleProp<ViewStyle>;
  stackName?: string;
  small?: boolean;
  children?: React.ReactNode;
};

const LoadingWrapper: React.FC<LoadingWrapperProps> = (props = {}) => {
  // Setup the animation
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start(() => {
      spinAnim.setValue(0);
    });

    return () => {
      loop.stop();
    };
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return props.small ? (
    // Make the loading wrapper inline
    <View className={props.spinClass} style={props.spinStyle || {}}>
      {/* Rotate a circle notch with the given animation */}
      <Animated.View
        style={{
          transform: [
            {
              rotate: spin,
            },
          ],
        }}
        className="flex h-0 w-0 justify-center items-center"
      >
        <View
          style={{
            width: 20,
            height: 20,
            borderWidth: 2,
            borderColor: "white",
            borderRadius: 10,
            borderStyle: "solid",
            borderTopColor: "transparent",
          }}
        />
      </Animated.View>
      {props.children || null}
    </View>
  ) : (
    // Make the loading wrapper fullscreen
    <SafeAreaView style={{ height: "100%", backgroundColor: "#101010" }}>
      {props.stackName && <Stack.Screen options={{ title: props.stackName }} />}
      <WebView
        source={{ uri: "https://rive.app/s/OUXW6BquM0axnjcmijgC4A/embed" }}
        style={{
          width: Dimensions.get("screen").width,
          height: Dimensions.get("screen").height * 0.88,
          backgroundColor: "#101010",
          // resizeMode: "cover",
        }}
        injectedJavaScript="container.style.backgroundColor = '#101010'; window.observer.disconnect();"
        injectedJavaScriptBeforeContentLoaded="document.documentElement.style.backgroundColor = '#101010'; window.observer = new MutationObserver(() => document.documentElement.style.backgroundColor = '#101010').observe(document.documentElement, { subtree: true });"
        startInLoadingState={false}
        onShouldStartLoadWithRequest={() => true}
      />
      <Text className="bg-[#101010] text-white mb-8 text-base text-center">
        Loading...
      </Text>
    </SafeAreaView>
  );
};

LoadingWrapper.displayName = "LoadingWrapper";

export default LoadingWrapper;
