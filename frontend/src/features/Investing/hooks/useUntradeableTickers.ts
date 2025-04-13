import { api } from "@/lib/api";
import { queryKeys } from "@my-dashboard/shared";
import { useQuery } from "@tanstack/react-query";

export default function useUntradeableTickers() {
	return useQuery({
		initialData: [],
		queryKey: queryKeys.tickers.list({ tradeable: false }),
		queryFn: () => api.tickers.getTickers({ tradeable: false }),
	});
}
