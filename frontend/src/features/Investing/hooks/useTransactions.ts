import { userApiKeys } from "@/api/usersApi";
import { api } from "@/lib/api";
import { queryKeys, type TradeView } from "@my-dashboard/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface TransactionQueryOptions {
	ticker?: { exchange: string; tickerSymbol: string };
	staleTime?: number;
	retry?: number | boolean;
}

interface UseTransactionsOptions {
	queryOptions?: TransactionQueryOptions;
	onAddSuccess?: () => void;
	onUpdateSuccess?: () => void;
	onDeleteSuccess?: () => void;
	onError?: (error: Error) => void;
}

export const useTransactions = (options: UseTransactionsOptions = {}) => {
	const queryClient = useQueryClient();
	const { queryOptions = {} } = options;
	const { ticker } = queryOptions;

	const queryKey = ticker
		? queryKeys.transactions.ticker(ticker.exchange, ticker.tickerSymbol)
		: queryKeys.transactions.all;

	const queryFn = ticker
		? () =>
				api.transactions.getTickerTrades(ticker.exchange, ticker.tickerSymbol)
		: () => api.transactions.getTransactions();

	const {
		data: transactions = [],
		isLoading,
		isError,
		refetch,
	} = useQuery<TradeView[]>({
		queryFn,
		queryKey,
		staleTime: queryOptions.staleTime || 60 * 1000,
		retry: queryOptions.retry ?? 2,
	});

	const addTransactionMutation = useMutation({
		mutationFn: api.transactions.addTransaction,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
			queryClient.invalidateQueries({ queryKey: queryKeys.holdings.all });
			queryClient.invalidateQueries({ queryKey: userApiKeys.all });

			toast.success("Transaction added successfully");
			options?.onAddSuccess?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to add Transaction");
			options?.onError?.(error);
		},
	});

	const updateTransactionMutation = useMutation({
		mutationFn: api.transactions.updateTransaction,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
			queryClient.invalidateQueries({ queryKey: queryKeys.holdings.all });
			queryClient.invalidateQueries({ queryKey: userApiKeys.all });
			toast.success("Transcation updated successfully");
			options?.onUpdateSuccess?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update transaction");
			options?.onError?.(error);
		},
	});

	const deleteTransactionMutation = useMutation({
		mutationFn: api.transactions.deleteTransaction,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
			queryClient.invalidateQueries({ queryKey: queryKeys.holdings.all });
			queryClient.invalidateQueries({ queryKey: userApiKeys.all });

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
