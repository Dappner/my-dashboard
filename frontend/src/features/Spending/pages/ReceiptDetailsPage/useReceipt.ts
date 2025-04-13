import { receiptsApi, receiptsApiKeys } from "@/api/receiptsApi";
import type { ReceiptWithItems } from "@/api/receiptsApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useReceipt(
	receiptId: string | undefined,
	userId: string | undefined,
) {
	const queryClient = useQueryClient();

	// Fetch the receipt data
	const {
		data: receipt,
		isLoading,
		error,
	} = useQuery({
		queryKey:
			userId && receiptId
				? receiptsApiKeys.detail(userId, receiptId)
				: ["receipt", "empty"],
		queryFn: () => {
			if (!userId || !receiptId) {
				throw new Error("Missing user ID or receipt ID");
			}
			return receiptsApi.getReceiptById(userId, receiptId);
		},
		enabled: !!userId && !!receiptId,
	});

	// Update receipt mutation
	const updateReceiptMutation = useMutation({
		mutationFn: (updatedReceipt: Partial<ReceiptWithItems>) => {
			if (!userId || !receiptId) {
				return Promise.reject("Missing user ID or receipt ID");
			}
			return receiptsApi.updateReceipt(userId, receiptId, updatedReceipt);
		},
		onSuccess: () => {
			// Invalidate the receipt and receipts list queries to refetch data
			if (userId && receiptId) {
				queryClient.invalidateQueries({
					queryKey: receiptsApiKeys.detail(userId, receiptId),
				});
				queryClient.invalidateQueries({
					queryKey: receiptsApiKeys.user(userId),
				});
			}
		},
	});

	const updateReceipt = async (updatedReceipt: Partial<ReceiptWithItems>) => {
		return updateReceiptMutation.mutateAsync(updatedReceipt);
	};
	const updateItemCategoryMutation = useMutation({
		mutationFn: ({
			itemId,
			categoryId,
		}: {
			itemId: string;
			categoryId: string | null;
		}) => {
			if (!userId || !receiptId) {
				return Promise.reject("Missing user ID or receipt ID");
			}
			return receiptsApi.updateReceiptItemCategory(
				receiptId,
				itemId,
				categoryId,
			);
		},
		onSuccess: () => {
			// Invalidate the receipt query to refetch data
			if (userId && receiptId) {
				queryClient.invalidateQueries({
					queryKey: receiptsApiKeys.detail(userId, receiptId),
				});
			}
		},
	});
	const updateItemCategory = async (
		itemId: string,
		categoryId: string | null,
	) => {
		return updateItemCategoryMutation.mutateAsync({ itemId, categoryId });
	};

	// Delete receipt mutation
	const deleteReceiptMutation = useMutation({
		mutationFn: () => {
			if (!userId || !receiptId) {
				return Promise.reject("Missing user ID or receipt ID");
			}
			return receiptsApi.deleteReceipt(userId, receiptId);
		},
		onSuccess: () => {
			// Invalidate and remove the receipt query
			if (userId) {
				queryClient.invalidateQueries({
					queryKey: receiptsApiKeys.user(userId),
				});
				if (receiptId) {
					queryClient.removeQueries({
						queryKey: receiptsApiKeys.detail(userId, receiptId),
					});
				}
			}
		},
	});

	const deleteReceipt = async () => {
		return deleteReceiptMutation.mutateAsync();
	};

	return {
		receipt,
		isLoading:
			isLoading ||
			updateReceiptMutation.isPending ||
			deleteReceiptMutation.isPending,
		error: error || updateReceiptMutation.error || deleteReceiptMutation.error,
		updateItemCategory,
		isUpdatingCategory: updateItemCategoryMutation.isPending,
		updateReceipt,
		deleteReceipt,
		isUpdating: updateReceiptMutation.isPending,
		isDeleting: deleteReceiptMutation.isPending,
	};
}
