import { receiptsApi, receiptsApiKeys } from "@/api/receiptsApi";
import { useQuery } from "@tanstack/react-query";

export const useReceipts = (userId?: string) => {
	return useQuery({
		queryKey: userId ? receiptsApiKeys.user(userId) : receiptsApiKeys.all,
		queryFn: () => {
			if (!userId) throw new Error("User ID is required");
			return receiptsApi.getReceiptsWithItems(userId);
		},
		enabled: !!userId, // Only fetch if userId is provided
	});
};
