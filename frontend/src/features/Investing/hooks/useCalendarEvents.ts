import { calendarEventsApi, calendarEventsApiKeys } from "@/api/calendarEventsApi";
import { useQuery } from "@tanstack/react-query";

export function useCalendarEvents(limit: number = 5, tickerId?: string) {
  const { data: events, isLoading, isError, error } = useQuery({
    queryFn: () => calendarEventsApi.getUpcomingEvents(limit, tickerId),
    queryKey: calendarEventsApiKeys.upcoming(limit, tickerId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    events: events || [],
    isLoading,
    isError,
    error: isError ? (error instanceof Error ? error.message : "Unknown error") : null,
  };
}
