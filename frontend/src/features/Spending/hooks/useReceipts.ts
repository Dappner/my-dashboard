import { receiptsApi, receiptsApiKeys } from "@/api/receiptsApi";
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
		queryKey: receiptsApiKeys.monthlyData(cacheKey),
		queryFn: () =>
			receiptsApi.getReceiptsWithItems(date, timeframe, { limit, offset }),
		enabled: enabled && !!date,
	});
};
