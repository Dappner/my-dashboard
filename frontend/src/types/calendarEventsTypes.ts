import { Database } from "./supabase";

export type CalendarEventsView = Database["public"]["Views"]["calendar_events_with_tickers"]["Row"];
