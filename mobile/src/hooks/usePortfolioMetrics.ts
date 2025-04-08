import { useMemo } from "react";
import type { Timeframe } from "@/types/portfolioDailyMetricTypes";
import { usePortfolioDailyMetrics } from "./usePortfolioMetrics";
import { useHoldings } from "./useHoldings";
import { useTransactions } from "./useTransactions";
import { calculatePortfolioMetrics } from "@/services/portfolioMetrics";

export function usePortfolioMetrics(timeframe: Timeframe = "ALL") {
  const { data: dailyMetrics, isLoading: metricsLoading, error: metricsError } =
    usePortfolioDailyMetrics(timeframe);
  const { data: transactions, isLoading: transactionsLoading } =
    useTransactions();
  const { data: holdings, isLoading: holdingsLoading } = useHoldings();

  // Combine loading states
  const isLoading = metricsLoading || transactionsLoading || holdingsLoading;

  // Calculate metrics only when all data is available
  const metrics = useMemo(() => {
    if (isLoading || metricsError || !dailyMetrics) {
      return null;
    }

    return calculatePortfolioMetrics(
      dailyMetrics,
      timeframe,
      transactions || [],
      holdings || [],
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
}
