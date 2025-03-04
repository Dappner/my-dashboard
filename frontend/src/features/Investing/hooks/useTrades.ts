import { holdingsApiKeys } from "@/api/holdingsApi";
import { tradesApiKeys, tradesApi } from "@/api/tradesApi";
import { TradeView } from "@/types/tradeTypes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UseTradesOptions {
  onAddSuccess?: () => void;
  onUpdateSuccess?: () => void;
  onDeleteSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useTrades = (options?: UseTradesOptions) => {
  const queryClient = useQueryClient();

  const { data: trades, isLoading, isError } = useQuery<TradeView[]>({
    queryKey: tradesApiKeys.all,
    queryFn: () => tradesApi.getTrades(),
  });

  const addTradeMutation = useMutation({
    mutationFn: tradesApi.addTrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tradesApiKeys.all });
      queryClient.invalidateQueries({ queryKey: holdingsApiKeys.all });

      toast.success("Trade added successfully");
      options?.onAddSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add Trade");
      options?.onError?.(error);
    },
  });

  const updateTradeMutation = useMutation({
    mutationFn: tradesApi.updateTrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tradesApiKeys.all });
      queryClient.invalidateQueries({ queryKey: holdingsApiKeys.all });
      toast.success("trade updated successfully");
      options?.onUpdateSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update Trade");
      options?.onError?.(error);
    },
  });

  const deleteTradeMutation = useMutation({
    mutationFn: tradesApi.deleteTrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tradesApiKeys.all });
      queryClient.invalidateQueries({ queryKey: holdingsApiKeys.all });
      toast.success("Trade deleted successfully");
      options?.onDeleteSuccess?.();
    },
    onError: (error: Error) => {
      toast.error("Failed to delete Trade");
      options?.onError?.(error);
    },
  });

  return {
    trades,
    isLoading,
    isError,
    addTrade: addTradeMutation.mutate,
    updateTrade: updateTradeMutation.mutate,
    deleteTrade: deleteTradeMutation.mutate,
    isAdding: addTradeMutation.isPending,
    isUpdating: updateTradeMutation.isPending,
    isDeleting: deleteTradeMutation.isPending,
  };
};

