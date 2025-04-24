import { receiptsApi, receiptsApiKeys } from "@/api/spending/receiptsApi";
import type { Timeframe } from "@my-dashboard/shared";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface UseReceiptsOptions {
	limit?: number;
	offset?: number;
	enabled?: boolean;
}

export const useReceipts = (
	date: Date,
	timeframe: Timeframe = "m",
	options: UseReceiptsOptions = {},
) => {
	const { limit = 10, offset = 0, enabled = true } = options;
	const cacheKey = `${timeframe}-${format(date, "yyyy-MM-dd")}-${limit}-${offset}`;

	return useQuery({
		queryKey: receiptsApiKeys.timeframe(cacheKey),
		queryFn: () =>
			receiptsApi.getReceiptsWithItems(date, timeframe, { limit, offset }),
		enabled: enabled && !!date,
	});
};

export function useRecentReceipts(date: Date, timeframe: Timeframe = "m") {
	const cacheKey = `${timeframe}-${format(date, "yyyy-MM-dd")}`;

	return useQuery({
		queryKey: receiptsApiKeys.recent(cacheKey),
		queryFn: () => receiptsApi.fetchRecentReceipts(date, timeframe),
		staleTime: 2 * 60 * 1000,
	});
}
