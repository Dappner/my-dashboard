import { api } from "@/lib/api";
import { queryKeys } from "@my-dashboard/shared";
import { useQuery } from "@tanstack/react-query";

export function useCalendarEvents(limit = 5, tickerId?: string) {
	const {
		data: events,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryFn: () => api.calendarEvents.getUpcomingEvents(limit, tickerId),
		queryKey: queryKeys.calendarEvents.upcoming(limit, tickerId),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	return {
		events: events,
		isLoading,
		isError,
		error: isError
			? error instanceof Error
				? error.message
				: "Unknown error"
			: null,
	};
}
