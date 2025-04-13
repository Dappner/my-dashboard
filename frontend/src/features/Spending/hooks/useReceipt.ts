import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { receiptsApi, receiptsApiKeys } from "@/api/receiptsApi";
import type { ReceiptWithItems } from "@/api/receiptsApi";

export function useReceipt(
	receiptId: string | undefined,
	userId: string | undefined,
) {
	const queryClient = useQueryClient();

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
		updateReceipt,
		deleteReceipt,
		isUpdating: updateReceiptMutation.isPending,
		isDeleting: deleteReceiptMutation.isPending,
	};
}
