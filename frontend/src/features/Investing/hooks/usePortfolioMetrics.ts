import { services } from "@/lib/api";
import type { Timeframe } from "@my-dashboard/shared";
import { useMemo } from "react";
import { useHoldings } from "./useHoldings";
import { usePortfolioDailyMetrics } from "./usePortfolioDailyMetrics";
import { useTransactions } from "./useTransactions";

export const usePortfolioMetrics = (timeframe: Timeframe = "ALL") => {
	const {
		dailyMetrics,
		isLoading: metricsLoading,
		error: metricsError,
	} = usePortfolioDailyMetrics(timeframe);

	const { transactions, isLoading: transactionsLoading } = useTransactions();

	const { holdings, isLoading: holdingsLoading } = useHoldings();

	// Combine loading states
	const isLoading = metricsLoading || transactionsLoading || holdingsLoading;

	// Calculate metrics only when all data is available
	const metrics = useMemo(() => {
		if (isLoading || metricsError || !dailyMetrics) {
			return null;
		}
		return services.portfolioCalculation.calculatePortfolioMetrics(
			dailyMetrics,
			timeframe,
			transactions,
			holdings,
		);
	}, [
		dailyMetrics,
		timeframe,
		transactions,
		holdings,
		isLoading,
		metricsError,
	]);

	return {
		metrics,
		isLoading,
		error: metricsError,
	};
};
