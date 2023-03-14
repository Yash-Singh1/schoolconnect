// Events page, displays calendar with posted events

import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  type ImageURISource,
} from "react-native";
import {
  AgendaList,
  CalendarProvider,
  ExpandableCalendar,
} from "react-native-calendars";
import { type MarkedDates } from "react-native-calendars/src/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import dayjs from "dayjs";
import { atom, useAtom } from "jotai";

// @ts-expect-error -- TODO: Figure out how to configure these modules correctly
import nextIcon from "../assets/next.png";
// @ts-expect-error -- Also should cause ESLint errors fix
import previousIcon from "../assets/previous.png";
import LoadingWrapper from "../src/components/LoadingWrapper";
import { Navbar } from "../src/components/Navbar";
import { tokenAtom } from "../src/store";
import { api, type RouterOutputs } from "../src/utils/api";

type DataEntry = {
  hour: string;
  duration: string;
  title: string;
};

const eventsAtom = atom<RouterOutputs["events"]["all"]>([]);

// Helper function for formatting time for event
function formatTwo(firstDate: Date, secondDate: Date): string {
  const format = `${
    firstDate.toDateString() === secondDate.toDateString() ? "" : "M/D"
  }${
    firstDate.getFullYear() === secondDate.getFullYear() ? "" : "/YYYY"
  } h:mmA`.trim();

  return (
    dayjs(firstDate).format(format) +
    (secondDate.getTime() - firstDate.getTime() <= 120 * 1000 - 1
      ? ""
      : ` - ${dayjs(secondDate).format(format)}`)
  );
}

// Component for displaying each event in agenda list
const AgendaItem: React.FC<{
  item: DataEntry;
}> = ({ item }) => {
  const [events] = useAtom(eventsAtom);

  const event = useMemo(() => {
    return events[Number(item.title)]!;
  }, [events, item.title]);

  const [modalVisible, setModalVisible] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={() => setModalVisible(true)}
      className="border-b border-[lightgray] bg-white pb-4"
    >
      <View className="ml-4 flex flex-col">
        <Text className="text-lg font-bold text-black">{event.name}</Text>
        <Text className="mb-1 text-sm font-light italic text-[lightgray]">
          Posted by {"School" in event ? event.School!.name : event.Class!.name}
        </Text>
        <View className="flex flex-row items-center">
          <Text className="text-black">
            {formatTwo(event.start, event.end)}
          </Text>
        </View>
      </View>
      <Modal transparent={true} visible={modalVisible} animationType="slide">
        <SafeAreaView>
          <View className="flex h-full w-full flex-col items-center justify-end">
            <View className="flex h-4/5 w-[99.5%] items-end rounded-t-lg bg-[#101010] p-4">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                activeOpacity={0.5}
              >
                <FontAwesomeIcon icon="square-xmark" color="white" size={20} />
              </TouchableOpacity>
              <View className="w-full">
                <Text className="text-left text-2xl font-bold text-white">
                  {event.name}
                </Text>
                <Text className="mb-1 text-sm font-light italic text-gray-200">
                  Posted by{" "}
                  {"School" in event ? event.School!.name : event.Class!.name}
                </Text>
                <Text className="mt-2 text-left text-lg font-semibold text-white">
                  {event.description}
                </Text>
                <Text className="mt-2 text-left text-base font-normal text-white">
                  {formatTwo(event.start, event.end)}
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </TouchableOpacity>
  );
};

const Events: React.FC = () => {
  const [token] = useAtom(tokenAtom);
  const [_, setEvents] = useAtom(eventsAtom);

  const eventsQuery = api.events.all.useQuery({
    token,
    includeSource: true,
  });
  const selfQuery = api.user.self.useQuery({ token });

  const router = useRouter();

  const [eventsGrouped, setEventsGrouped] = useState<
    | null
    | {
        title: string;
        data: DataEntry[];
      }[]
  >(null);
  const [markedDates, setMarkedDates] = useState<MarkedDates | null>(null);

  useEffect(() => {
    if (!eventsQuery.data) return;
    const marked: MarkedDates = {};
    setEvents(eventsQuery.data);

    // Some messy manipulation of API data to get it into the format the calendar API wants
    const hs = eventsQuery.data.reduce<Record<string, DataEntry[]>>(
      (acc, event, eventIdx) => {
        const date = event!.start.toISOString().split("T")[0] as string;
        const hr = event!.start.getHours();
        if (!acc[date]) acc[date] = [];
        acc[date]!.push({
          hour: `${hr > 12 ? hr - 12 : hr}${hr >= 12 ? "pm" : "am"}`,
          duration: "1h",
          title: eventIdx.toString(),
        });
        marked[date] = { marked: true };
        return acc;
      },
      {},
    );

    const keys = Object.keys(hs).sort();
    setMarkedDates(marked);
    setEventsGrouped(keys.map((key) => ({ title: key, data: hs[key]! })));
  }, [eventsQuery.data]);

  return eventsQuery.data && selfQuery.data ? (
    <SafeAreaView className="bg-[#101010]">
      <Stack.Screen options={{ title: "Events" }} />
      <View className="flex h-full w-full items-center justify-center">
        <View className="h-[88%] w-full">
          <View className="flex flex-row">
            <Text className="pl-4 text-2xl font-bold text-white">Events</Text>
            {selfQuery.data.role === "admin" ||
            selfQuery.data.role === "teacher" ? (
              <TouchableOpacity
                activeOpacity={0.5}
                className="ml-2 rounded-lg bg-blue-500 p-1"
                onPress={() => router.push(`/newevent`)}
              >
                <FontAwesomeIcon icon="plus" size={24} color="white" />
              </TouchableOpacity>
            ) : null}
          </View>
          {eventsGrouped ? (
            <CalendarProvider
              date={new Date().toISOString().split("T")[0]!}
              showTodayButton
              className="mt-4"
            >
              <ExpandableCalendar
                firstDay={1}
                markedDates={markedDates || {}}
                leftArrowImageSource={previousIcon as ImageURISource}
                rightArrowImageSource={nextIcon as ImageURISource}
              />
              <AgendaList
                sections={eventsGrouped}
                renderItem={({ item }: { item: DataEntry }) => (
                  <AgendaItem item={item} />
                )}
              />
            </CalendarProvider>
          ) : null}
        </View>
        <Navbar />
      </View>
    </SafeAreaView>
  ) : (
    <LoadingWrapper stackName="Events" />
  );
};

export default Events;
