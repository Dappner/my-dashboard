import { api } from "@/lib/api";
import { type Ticker, queryKeys } from "@my-dashboard/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface TickersQueryOptions {
	staleTime?: number;
	retry?: number | boolean;
	enabled?: boolean;
}

interface UseTickersOptions {
	queryOptions?: TickersQueryOptions;
	onAddSuccess?: () => void;
	onUpdateSuccess?: () => void;
	onDeleteSuccess?: () => void;
	onError?: (error: Error) => void;
}

export const useTickers = (options: UseTickersOptions = {}) => {
	const queryClient = useQueryClient();
	const {
		queryOptions = {},
		onAddSuccess,
		onUpdateSuccess,
		onDeleteSuccess,
		onError,
	} = options;

	const {
		data: tickers = [], // Default to empty array if no data
		isLoading,
		isError,
		refetch,
	} = useQuery<Ticker[]>({
		queryKey: queryKeys.tickers.all,
		queryFn: () => api.tickers.getTickers(),
		staleTime: queryOptions.staleTime,
		retry: queryOptions.retry,
		enabled: queryOptions.enabled ?? true,
	});

	const addTickerMutation = useMutation({
		mutationFn: api.tickers.addTicker,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.tickers.all });
			toast.success("Ticker added successfully");
			onAddSuccess?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to add ticker");
			onError?.(error);
		},
	});

	const updateTickerMutation = useMutation({
		mutationFn: api.tickers.updateTicker,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.tickers.all });
			toast.success("Ticker updated successfully");
			onUpdateSuccess?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update ticker");
			onError?.(error);
		},
	});

	const deleteTickerMutation = useMutation({
		mutationFn: api.tickers.deleteTicker,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.tickers.all });
			toast.success("Ticker deleted successfully");
			onDeleteSuccess?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete ticker");
			onError?.(error);
		},
	});

	return {
		tickers,
		isLoading,
		isError,
		refetch,
		addTicker: addTickerMutation.mutate,
		updateTicker: updateTickerMutation.mutate,
		deleteTicker: deleteTickerMutation.mutate,
		isAdding: addTickerMutation.isPending,
		isUpdating: updateTickerMutation.isPending,
		isDeleting: deleteTickerMutation.isPending,
	};
};
