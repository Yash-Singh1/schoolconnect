// Events page, displays calendar with posted events

import { useEffect, useMemo, useState } from "react";
import { Modal, Text, TouchableOpacity, View, type ImageURISource } from "react-native";
import {
  AgendaList,
  CalendarProvider,
  ExpandableCalendar,
} from "react-native-calendars";
import { type MarkedDates } from "react-native-calendars/src/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { type Event } from "@prisma/client";
import dayjs from "dayjs";
import { atom, useAtom } from "jotai";

// @ts-expect-error -- TODO: Figure out how to configure these modules correctly
import nextIcon from "../assets/next.png";
// @ts-expect-error -- Also should cause ESLint errors fix
import previousIcon from "../assets/previous.png";
import LoadingWrapper from "../src/components/LoadingWrapper";
import { Navbar } from "../src/components/Navbar";
import { tokenAtom } from "../src/store";
import { api } from "../src/utils/api";

type DataEntry = {
  hour: string;
  duration: string;
  title: string;
};

const eventsAtom = atom<Event[]>([]);

// Helper function for formatting time for event
function formatTwo(firstDate: Date, secondDate: Date): string {
  return (
    dayjs(firstDate).format("h:mmA") +
    (secondDate.getTime() - firstDate.getTime() <= 60 * 1000
      ? ""
      : `-${dayjs(secondDate).format("h:mmA")}`)
  );
}

// Component for displaying each event in agenda list
const AgendaItem: React.FC<{
  item: DataEntry;
}> = ({ item }) => {
  const [events] = useAtom(eventsAtom);
  const [token] = useAtom(tokenAtom);

  const event = useMemo(() => {
    return events[Number(item.title)]!;
  }, [events, item.title]);

  // Get the source of the event for UI
  const sourceQuery = event.schoolId
    ? api.school.get.useQuery({
        token,
      })
    : api.class.get.useQuery({
        token,
        classId: event.classId!,
      });

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
          {sourceQuery.data ? `Posted by ${sourceQuery.data.name}` : ""}
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
                  {sourceQuery.data ? `Posted by ${sourceQuery.data.name}` : ""}
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

  const eventsQuery = api.events.all.useQuery({ token });

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
    setEvents(eventsQuery.data as Event[]);

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

  return eventsQuery.data ? (
    <SafeAreaView className="bg-[#101010]">
      <Stack.Screen options={{ title: "Events" }} />
      <View className="flex h-full w-full items-center justify-center">
        <View className="h-[88%] w-full">
          {eventsGrouped ? (
            <CalendarProvider
              date={new Date().toISOString().split("T")[0]!}
              showTodayButton
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
