import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import {
	type InsertTicker,
	type Ticker,
	queryKeys,
} from "@my-dashboard/shared";
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
		data: tickers = [],
		isLoading,
		isError,
		refetch,
	} = useQuery<Ticker[]>({
		queryKey: queryKeys.tickers.list({ tradeable: true }),
		queryFn: () => api.tickers.getTickers({ tradeable: true }),
		staleTime: queryOptions.staleTime,
		retry: queryOptions.retry,
		enabled: queryOptions.enabled ?? true,
	});

	const addTickerMutation = useMutation({
		mutationFn: async (values: InsertTicker) => {
			// Ensure backfill is true
			const tickerData = { ...values, backfill: true };

			// First add the ticker to the database
			const ticker = await api.tickers.addTicker(tickerData);

			// Then invoke the Edge Function to initiate backfill
			try {
				const { error } = await supabase.functions.invoke(
					"process-new-ticker",
					{
						body: { ticker },
					},
				);

				if (error) {
					console.error("Failed to initiate backfill", error);
				}
			} catch (error) {
				// Log but don't throw - we still want the UI to update even if backfill fails
				console.error("Failed to initiate backfill", error);
			}

			return ticker;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.tickers.lists() });
			toast.success("Ticker  added", {
				description: "Backfill process has been initiated",
			});
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
			queryClient.invalidateQueries({ queryKey: queryKeys.tickers.lists() });
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
			queryClient.invalidateQueries({ queryKey: queryKeys.tickers.lists() });
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
