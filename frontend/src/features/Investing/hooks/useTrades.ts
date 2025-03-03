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

  const { data: trades, isLoading } = useQuery<TradeView[]>({
    queryKey: tradesApiKeys.all,
    queryFn: () => tradesApi.getTrades(),
  });

  const addTradeMutation = useMutation({
    mutationFn: tradesApi.addTrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tradesApiKeys.all });
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
      toast.success("trade updated successfully");
      options?.onUpdateSuccess?.(); // Call the success callback if provided
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update trade");
      options?.onError?.(error); // Call the error callback if provided
    },
  });

  const deleteTradeMutation = useMutation({
    mutationFn: tradesApi.deleteTrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tradesApiKeys.all });
      toast.success("Trade deleted successfully");
      options?.onDeleteSuccess?.(); // Call the success callback if provided
    },
    onError: (error: Error) => {
      toast.error("Failed to delete trade");
      options?.onError?.(error); // Call the error callback if provided
    },
  });

  return {
    trades,
    isLoading,
    addTrade: addTradeMutation.mutate,
    updateTrade: updateTradeMutation.mutate,
    deleteTrade: deleteTradeMutation.mutate,
    isAdding: addTradeMutation.isPending,
    isUpdating: updateTradeMutation.isPending,
    isDeleting: deleteTradeMutation.isPending,
  };
};

