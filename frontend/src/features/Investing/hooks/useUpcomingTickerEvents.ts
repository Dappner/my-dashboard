import { api } from "@/lib/api";
import { queryKeys } from "@my-dashboard/shared";
import { useQuery } from "@tanstack/react-query";
import { useHoldings } from "./useHoldings";

export function useUpcomingTickerEvents(limit = 5) {
	const {
		holdings,
		isLoading: isHoldingsLoading,
		isError: isHoldingsError,
	} = useHoldings();

	// Extract tickerIds from holdings
	const tickerIds = (holdings?.map((holding) => holding.ticker_id) ??
		[]) as string[];

	const {
		data: events,
		isLoading: isEventsLoading,
		isError: isEventsError,
		error: eventsError,
	} = useQuery({
		queryFn: () =>
			api.calendarEvents.getUpcomingEventsByTickerIds(tickerIds, limit),
		queryKey: queryKeys.calendarEvents.upcomingByTickerIds(limit, tickerIds),
		staleTime: 5 * 60 * 1000, // 5 minutes
		enabled: !!tickerIds.length && !isHoldingsError, // Only fetch if there are tickerIds and no holdings error
	});

	return {
		events: events ?? [],
		isLoading: isHoldingsLoading || isEventsLoading,
		isError: isHoldingsError || isEventsError,
		error:
			isHoldingsError || isEventsError
				? eventsError instanceof Error
					? eventsError.message
					: "Failed to fetch events or holdings"
				: null,
	};
}
