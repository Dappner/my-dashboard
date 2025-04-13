import { receiptsApi, receiptsApiKeys } from "@/api/receiptsApi";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useReceipts = (userId?: string) => {
	return useInfiniteQuery({
		queryKey: userId ? receiptsApiKeys.user(userId) : receiptsApiKeys.all,
		queryFn: ({ pageParam = 1 }) => {
			return receiptsApi.getReceiptsWithItems(userId || "", pageParam);
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) => lastPage.nextPage,
		enabled: !!userId,
	});
};
