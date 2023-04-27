// Events page, displays calendar with posted events

import { useEffect, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { Agenda, CalendarProvider } from "react-native-calendars";
import { type MarkedDates } from "react-native-calendars/src/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import dayjs from "dayjs";
import { atom, useAtom } from "jotai";

import LoadingWrapper from "../src/components/LoadingWrapper";
import { Navbar } from "../src/components/Navbar";
import { tokenAtom } from "../src/store";
import { api, type RouterOutputs } from "../src/utils/api";

// Data type for an event to be displayed
type DataEntry = {
  hour: string;
  name: string;
};

// Temporary atom to store events data fetching response
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
  // Make use of the atom storing the events
  const [events] = useAtom(eventsAtom);

  // Memoize the event we are currently displaying
  const event = events[Number(item.name)]!;

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={() => setModalVisible(true)}
      className="border-b border-[lightgray] bg-white pb-4 -z-10"
    >
      {/* Card for the event */}
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

      {/* Modal for displaying more information on the event */}
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

// Calendar and agenda list containing all the events
const Events: React.FC = () => {
  // Get token from store
  const [token] = useAtom(tokenAtom);

  // Setter for temporary state on events data fetching result
  const [_, setEvents] = useAtom(eventsAtom);

  // Get information on the user
  const selfQuery = api.user.self.useQuery({ token });

  // Get list of all events
  const eventsQuery = api.events.all.useQuery({
    token,
    includeSource: true,
  });

  // Cache-invalidation utility
  const util = api.useContext();

  // Subscribe to event changes
  api.events.onCreate.useSubscription(
    {
      token,
      userId: selfQuery.data?.id,
    },
    {
      enabled: !!selfQuery.data,
      onData() {
        void eventsQuery.refetch();
        void util.events.all.invalidate();
      },
    },
  );

  // Initialize router helper
  const router = useRouter();

  // All of the events preprocessed for input into react-native-calendars
  const [eventsGrouped, setEventsGrouped] = useState<
    Record<
      // | {
      //     title: string;
      //     data: DataEntry[];
      //   }[]
      string,
      DataEntry[]
    >
  >({});
  const [markedDates, setMarkedDates] = useState<MarkedDates | undefined>(
    undefined,
  );
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  // Preprocessed the events for usage in calendars when fetched
  useEffect(() => {
    if (!currentDate) return;

    // Initialize event query data
    if (!eventsQuery.data) return;
    setEvents(eventsQuery.data);

    const marked: MarkedDates = {};

    // Some messy manipulation of API data to get it into the format the calendar API wants
    const hs = eventsQuery.data.reduce<Record<string, DataEntry[]>>(
      (acc, event, eventIdx) => {
        const date = event!.start.toISOString().split("T")[0] as string;
        marked[date] = { marked: true };
        if (!event) return acc;
        const hr = event.start.getHours();
        if (!acc[date]) acc[date] = [];
        acc[date]!.push({
          hour: `${hr > 12 ? hr - 12 : hr}${hr >= 12 ? "pm" : "am"}`,
          name: eventIdx.toString(),
        });
        return acc;
      },
      {},
    );

    // Set the preprocessed data into the state
    setMarkedDates(marked);
    // setEventsGrouped(keys.map((key) => ({ title: key, data: hs[key]! })));
    setEventsGrouped(hs);
  }, [eventsQuery.data, currentDate]);

  // Show a loading indicator if the data is still fetching
  return eventsQuery.data && selfQuery.data ? (
    <SafeAreaView className="bg-[#101010]">
      <Stack.Screen options={{ title: "Events" }} />
      <View className="flex h-full w-full items-center justify-center">
        <View className="h-[88%] w-full">
          <View className="flex flex-row">
            {/* Header */}
            <Text className="pl-4 text-2xl font-bold text-white">Events</Text>

            {/* Option to create another event */}
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

          {/* Display calendars and agenda list */}
          {eventsGrouped ? (
            <CalendarProvider
              date={new Date().toISOString().split("T")[0]!}
              showTodayButton
              className="mt-4 mb-[10%]"
            >
              <Agenda
                // initialDate="2023-04-24"
                items={eventsGrouped}
                markedDates={markedDates}
                showClosingKnob={true}
                loadItemsForMonth={(date) => {
                  setCurrentDate(new Date(date.dateString));
                }}
                renderEmptyData={() => {
                  return (
                    <View className="p-4">
                      <Text className="text-6xl w-full text-center">🗓️</Text>
                      <Text className="text-base font-semibold w-full text-center">
                        No events scheduled for this date
                      </Text>
                    </View>
                  );
                }}
                renderDay={(day: Date | undefined, item: DataEntry) => {
                  return (
                    <View className={`w-full ${day ? "mt-4" : ""}`}>
                      {day ? (
                        <View className="mb-2">
                          <Text className="text-xl text-slate-600/80 px-4">
                            {day.getDate()}
                          </Text>
                          <Text className="text-base text-slate-600/80 px-4">
                            {dayjs(day).format("ddd")}
                          </Text>
                        </View>
                      ) : null}
                      {item ? (
                        <AgendaItem item={item} />
                      ) : (
                        <Text>There are no events on this day</Text>
                      )}
                    </View>
                  );
                }}
                pastScrollRange={10}
                futureScrollRange={10}
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
