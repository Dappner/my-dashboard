import { Database } from "@/supabase";
import { CalendarEventsView } from "@/types";
import { SupabaseClient } from "@supabase/supabase-js";

export const calendarEventsApiKeys = {
  all: ["calendarEvents"] as const,
  upcoming: (limit: number, tickerId?: string) =>
    tickerId
      ? ([...calendarEventsApiKeys.all, "upcoming", limit, tickerId] as const)
      : ([...calendarEventsApiKeys.all, "upcoming", limit] as const),
  upcomingByTickerIds: (limit: number, tickerIds: string[]) =>
    [...calendarEventsApiKeys.all, "upcomingByTickerIds", limit, tickerIds] as const,
};

export function createCalendarEventsApi(supabase: SupabaseClient<Database>) {
  return {
    async getUpcomingEvents(
      limit = 5,
      tickerId?: string,
    ): Promise<CalendarEventsView[]> {
      let query = supabase
        .from("calendar_events_with_tickers")
        .select("*")
        .gte("date", new Date().toISOString().split("T")[0]) // Events from today onward
        .order("date", { ascending: true })
        .limit(limit);

      if (tickerId) {
        query = query.eq("ticker_id", tickerId);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching calendar events:", error);
        throw new Error("Failed to fetch upcoming events");
      }

      return data || [];
    },
    async getUpcomingEventsByTickerIds(
      tickerIds: string[],
      limit = 5,
    ): Promise<CalendarEventsView[]> {
      if (!tickerIds || tickerIds.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from("calendar_events_with_tickers")
        .select("*")
        .gte("date", new Date().toISOString().split("T")[0]) // Events from today onward
        .in("ticker_id", tickerIds) // Filter by list of tickerIds
        .order("date", { ascending: true })
        .limit(limit);

      if (error) {
        console.error("Error fetching calendar events by ticker IDs:", error);
        throw new Error("Failed to fetch upcoming events by ticker IDs");
      }

      return data || [];
    },
  };
}
