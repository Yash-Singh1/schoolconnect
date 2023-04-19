// Wrapper that adds the loading screen to all of the pages components

import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";

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
        <FontAwesomeIcon icon="circle-notch" color="white" />
      </Animated.View>
      {props.children || null}
    </View>
  ) : (
    // Make the loading wrapper fullscreen
    <SafeAreaView className={`bg-[#101010] ${props.safeAreaViewClass || ""}`}>
      {props.stackName && <Stack.Screen options={{ title: props.stackName }} />}
      <Animated.View
        className="flex h-full w-full items-center justify-center"
        style={{
          transform: [
            {
              rotate: spin,
            },
          ],
        }}
      >
        <FontAwesomeIcon icon="circle-notch" color="white" />
      </Animated.View>
    </SafeAreaView>
  );
};

export default LoadingWrapper;
