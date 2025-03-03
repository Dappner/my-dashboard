import { tickersApiKeys, tickersApi } from "@/api/tickersApi";
import { Ticker } from "@/types/tickerTypes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"; // Assuming you're using Sonner for notifications

interface UseTickerOptions {
  onAddSuccess?: () => void;
  onUpdateSuccess?: () => void;
  onDeleteSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useTicker = (options?: UseTickerOptions) => {
  const queryClient = useQueryClient();

  const { data: tickers, isLoading } = useQuery<Ticker[]>({
    queryKey: tickersApiKeys.all,
    queryFn: () => tickersApi.getTickers(),
  });

  const addTickerMutation = useMutation({
    mutationFn: tickersApi.addTicker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tickersApiKeys.all });
      toast.success("Ticker added successfully");
      options?.onAddSuccess?.(); // Call the success callback if provided
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add ticker");
      options?.onError?.(error); // Call the error callback if provided
    },
  });

  const updateTickerMutation = useMutation({
    mutationFn: tickersApi.updateTicker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tickersApiKeys.all });
      toast.success("Ticker updated successfully");
      options?.onUpdateSuccess?.(); // Call the success callback if provided
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update ticker");
      options?.onError?.(error); // Call the error callback if provided
    },
  });

  const deleteTickerMutation = useMutation({
    mutationFn: tickersApi.deleteTicker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tickersApiKeys.all });
      toast.success("Ticker deleted successfully");
      options?.onDeleteSuccess?.(); // Call the success callback if provided
    },
    onError: (error: Error) => {
      toast.error("Failed to delete ticker");
      options?.onError?.(error); // Call the error callback if provided
    },
  });

  return {
    tickers,
    isLoading,
    addTicker: addTickerMutation.mutate,
    updateTicker: updateTickerMutation.mutate,
    deleteTicker: deleteTickerMutation.mutate,
    isAdding: addTickerMutation.isPending,
    isUpdating: updateTickerMutation.isPending,
    isDeleting: deleteTickerMutation.isPending,
  };
};

