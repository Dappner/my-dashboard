import { holdingsApiKeys } from "@/api/holdingsApi";
import { transactionsApi, transactionsApiKeys } from "@/api/tradesApi";
import { TradeView } from "@/types/transactionsTypes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UseTransactionsOptions {
  onAddSuccess?: () => void;
  onUpdateSuccess?: () => void;
  onDeleteSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useTransactions = (options?: UseTransactionsOptions) => {
  const queryClient = useQueryClient();

  const { data: transactions, isLoading, isError, refetch } = useQuery<TradeView[]>({
    queryFn: () => transactionsApi.getTransactions(),
    queryKey: transactionsApiKeys.all,
  });

  const addTransactionMutation = useMutation({
    mutationFn: transactionsApi.addTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionsApiKeys.all });
      queryClient.invalidateQueries({ queryKey: holdingsApiKeys.all });
      queryClient.invalidateQueries({ queryKey: "user" })

      toast.success("Transaction added successfully");
      options?.onAddSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add Transaction");
      options?.onError?.(error);
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: transactionsApi.updateTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionsApiKeys.all });
      queryClient.invalidateQueries({ queryKey: holdingsApiKeys.all });
      queryClient.invalidateQueries({ queryKey: "user" })
      toast.success("Transcation updated successfully");
      options?.onUpdateSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update transaction");
      options?.onError?.(error);
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: transactionsApi.deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionsApiKeys.all });
      queryClient.invalidateQueries({ queryKey: holdingsApiKeys.all });
      queryClient.invalidateQueries({ queryKey: "user" })

      toast.success("Transaction deleted successfully");
      options?.onDeleteSuccess?.();
    },
    onError: (error: Error) => {
      toast.error("Failed to delete Transaction");
      options?.onError?.(error);
    },
  });

  return {
    transactions,
    isLoading,
    isError,
    refetch,
    addTransaction: addTransactionMutation.mutate,
    updateTransaction: updateTransactionMutation.mutate,
    deleteTransaction: deleteTransactionMutation.mutate,
    isAdding: addTransactionMutation.isPending,
    isUpdating: updateTransactionMutation.isPending,
    isDeleting: deleteTransactionMutation.isPending,
  };
};

