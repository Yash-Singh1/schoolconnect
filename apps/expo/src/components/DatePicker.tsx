// Platform-agnostic date picker

import { useState } from "react";
import { Platform, Text, View } from "react-native";
import DateTimePicker, {
  type AndroidNativeProps,
  type DateTimePickerEvent,
  type IOSNativeProps,
} from "@react-native-community/datetimepicker";

type DatePickerProps = IOSNativeProps & {
  android?: AndroidNativeProps | Record<string, never>;
  ios?: IOSNativeProps | Record<string, never>;
};

export const DatePicker = ({
  value,
  onChange,
  android,
  ios,
  ...other
}: DatePickerProps) => {
  const [date, setDate] = useState(value);
  const [shown, setShown] = useState(false);
  const [mode, setMode] = useState<"date" | "time" | "datetime" | "countdown">(
    (Platform.OS === "ios" ? ios && ios.mode : android && android.mode) ||
      other.mode ||
      "date",
  );

  const showAndroidPicker = (newMode: "date" | "time") => {
    setShown(true);
    setMode(newMode);
  };

  return (
    <View className={other.className || ""}>
      {Platform.OS === "ios" || shown ? (
        <DateTimePicker
          value={date}
          onChange={(_, newValue) => {
            if (Platform.OS !== "ios") setShown(false);
            if (!newValue) return;
            setDate(newValue);
            onChange && onChange({} as DateTimePickerEvent, newValue);
          }}
          {...other}
          {...ios}
          mode={mode}
          themeVariant="dark"
        />
      ) : null}
      {Platform.OS === "android" ? (
        <View className="flex flex-row self-start">
          {((android && android.mode) || other.mode)?.includes("date") ? (
            <Text
              className={`text-white mr-2 text-base bg-[#2c2c2c] p-2 rounded-lg ${
                shown && mode === "date" ? "text-blue-300/70" : ""
              }`}
              onPress={() => {
                showAndroidPicker("date");
              }}
            >
              {date
                .toDateString()
                .split(" ")
                .slice(1)
                .join(" ")
                .replace(/(\d) (\d)/, "$1, $2")}
            </Text>
          ) : null}
          {((android && android.mode) || other.mode)?.includes("time") ? (
            <Text
              className={`text-white mr-2 text-base bg-[#2c2c2c] p-2 rounded-lg ${
                shown && mode === "time" ? "text-blue-300/70" : ""
              }`}
              onPress={() => {
                showAndroidPicker("time");
              }}
            >
              {date
                .toLocaleTimeString()
                .split(" ")
                .map((t, i) =>
                  i === 0 ? t.split(":").slice(0, 2).join(":") : t,
                )
                .join(" ")
                .toUpperCase()}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};
