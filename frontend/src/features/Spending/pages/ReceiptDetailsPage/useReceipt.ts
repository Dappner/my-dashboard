import { receiptsApi, receiptsApiKeys } from "@/api/receiptsApi";
import type { UpdateReceipt } from "@/api/receiptsApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useReceipt(receiptId: string | undefined) {
  const queryClient = useQueryClient();

  // Fetch the receipt data
  const {
    data: receipt,
    isLoading,
    error,
  } = useQuery({
    queryKey: receiptsApiKeys.detail(receiptId || ""),
    queryFn: () => receiptsApi.getReceiptById(receiptId || ""),
    enabled: !!receiptId,
  });

  // Update receipt mutation
  const updateReceiptMutation = useMutation({
    mutationFn: (updatedReceipt: UpdateReceipt) =>
      receiptsApi.updateReceipt(updatedReceipt),
    onSuccess: () => {
      // Invalidate the receipt and receipts list queries to refetch data
      queryClient.invalidateQueries({
        queryKey: receiptsApiKeys.all,
      });
    },
  });

  const updateReceipt = async (updatedReceipt: UpdateReceipt) => {
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
      if (!receiptId) {
        return Promise.reject("Missing receipt ID");
      }
      return receiptsApi.updateReceiptItemCategory(itemId, categoryId);
    },
    onSuccess: () => {
      // Invalidate the receipt query to refetch data
      if (receiptId) {
        queryClient.invalidateQueries({
          queryKey: receiptsApiKeys.detail(receiptId),
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
      if (!receiptId) {
        return Promise.reject("Missing or receipt ID");
      }
      return receiptsApi.deleteReceipt(receiptId);
    },
    onSuccess: () => {
      // Invalidate and remove the receipt query
      if (receiptId) {
        queryClient.removeQueries({
          queryKey: receiptsApiKeys.detail(receiptId),
        });
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
