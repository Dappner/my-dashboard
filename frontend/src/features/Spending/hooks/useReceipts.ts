import { receiptsApi, receiptsApiKeys } from "@/api/receiptsApi";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useReceipts = () => {
	return useInfiniteQuery({
		queryKey: receiptsApiKeys.all,
		queryFn: ({ pageParam = 1 }) => {
			return receiptsApi.getReceiptsWithItems(pageParam);
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) => lastPage.nextPage,
	});
};
