// Provider wrapper for the HUD

import { useEffect, useRef } from "react";
import {
  Alert,
  Animated,
  Easing,
  Linking,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { atom, useAtomValue, useSetAtom } from "jotai";

type HUD =
  | false
  | {
      title: string;
      id?: string;
      type: "error" | "loading" | "success" | "info" | "warning";
    };

export const hudAtom = atom<HUD>(false);
hudAtom.debugLabel = "HUD";

export function useHUD() {
  const setHUD = useSetAtom(hudAtom);

  function showHUD(hud: HUD, delay: number | "none" = 3000) {
    if (!hud) {
      setHUD(false);
      return;
    }
    const id = `${Date.now()}-${Math.random().toString().slice(2)}`;
    setHUD({
      id,
      ...hud,
    });
    if (delay !== "none") {
      setTimeout(() => {
        setHUD(false);
      }, delay);
    }
    return id;
  }

  function hideHUD(id = "all") {
    if (id === "all") setHUD(false);
    else {
      setHUD((currentHUD) => {
        if (currentHUD && currentHUD.id === id) {
          return false;
        }
        return currentHUD;
      });
    }
  }

  return {
    showHUD,
    hideHUD,
  };
}

export const HUDProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const hud = useAtomValue(hudAtom);
  const { hideHUD } = useHUD();

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

  return (
    <>
      {children}
      {hud && (
        <TouchableOpacity
          activeOpacity={hud.type === "error" ? 0.8 : 1}
          onPress={() => {
            hideHUD(hud.id);
            if (hud.type === "error") {
              Alert.alert(
                "Report error?",
                `Would you like to report this error? ${hud.title}`,
                [
                  {
                    text: "No",
                    style: "cancel",
                  },
                  {
                    text: "Yes",
                    onPress: () => {
                      void Linking.openURL(
                        "https://github.com/Yash-Singh1/schoolconnect/issues/new?assignees=Yash-Singh1&labels=bug%2Ctriage&projects=&template=bug_report.yml&title=%5BBUG%5D%3A+",
                      );
                    },
                  },
                ],
                { cancelable: true },
              );
            }
          }}
          className={`absolute bg-slate-900 rounded-xl flex flex-row justify-center items-center py-2 px-8 bottom-20 w-1/2 left-1/4`}
        >
          {hud.type === "loading" ? (
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: spin,
                  },
                ],
              }}
              className="flex h-0 w-0 justify-center items-center px-2 mr-4"
            >
              <FontAwesomeIcon icon="circle-notch" color="#fff" size={20} />
            </Animated.View>
          ) : (
            <View className="mr-2">
              <FontAwesomeIcon
                icon={
                  hud.type === "info"
                    ? "circle-info"
                    : hud.type === "error"
                    ? "circle-exclamation"
                    : hud.type === "warning"
                    ? "triangle-exclamation"
                    : hud.type === "success"
                    ? "circle-check"
                    : "circle-notch"
                }
                color={
                  hud.type === "info"
                    ? "#0891b2"
                    : hud.type === "error"
                    ? "#dc2626"
                    : hud.type === "warning"
                    ? "#d97706"
                    : hud.type === "success"
                    ? "#059669"
                    : "#fff"
                }
                size={20}
              />
            </View>
          )}
          <Text numberOfLines={1} className="text-white text-xl font-semibold">
            {hud.title}
          </Text>
        </TouchableOpacity>
      )}
    </>
  );
};
