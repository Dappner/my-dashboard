import { useMemo } from "react";
import { formatDate, parseDate } from "@/lib/utils";
import type { Timeframe } from "@my-dashboard/shared";
import { usePortfolioDailyMetrics } from "@/features/Investing/hooks/usePortfolioDailyMetrics";
import { useTickerHistoricalPrices } from "@/features/Investing/pages/Research/hooks/useTickerHistoricalPrices";
import { subDays } from "date-fns";
import type { ChartDataPoint } from "../types";

export type ChartViewType = "absolute" | "percentual";

/**
 * Hook that provides chart data for portfolio performance charts
 *
 * @param timeframe The time range to fetch data for
 * @param type The chart type (absolute value or percentual change)
 * @param tickerId Optional benchmark ticker ID for percentual view
 * @returns Chart data and loading state
 */
export function usePortfolioChartData(
  timeframe: Timeframe,
  type: ChartViewType,
  tickerId?: string | null,
): {
  data: ChartDataPoint[];
  isLoading: boolean;
  hasHistoricalData: boolean;
} {
  const { dailyMetrics, isLoading: metricsLoading } =
    usePortfolioDailyMetrics(timeframe);

  const shouldFetchHistorical = type === "percentual" && Boolean(tickerId);

  const { historicalPrices, historicalPricesLoading } =
    useTickerHistoricalPrices(tickerId ?? "", timeframe, shouldFetchHistorical);

  const data = useMemo<ChartDataPoint[]>(() => {
    // Return empty array if still loading or no data
    if (metricsLoading || (shouldFetchHistorical && historicalPricesLoading)) {
      return [];
    }

    if (!dailyMetrics || dailyMetrics.length === 0) {
      return [];
    }

    // Handle absolute view (portfolio value)
    if (type === "absolute") {
      const result: ChartDataPoint[] = [];

      for (const metric of dailyMetrics) {
        if (!metric.current_date) continue;

        const date = parseDate(metric.current_date);
        const totalValue = Number(metric.total_portfolio_value ?? Number.NaN);

        if (!date || !Number.isFinite(totalValue)) continue;

        result.push({ date, totalPortfolio: totalValue });
      }

      return result;
    }

    // Handle percentual view (performance comparison)
    if (!tickerId) return [];

    // Create benchmark price lookup map
    const benchmarkPriceMap = new Map<string, number>();

    if (historicalPrices) {
      for (const price of historicalPrices) {
        if (!price.date || typeof price.close_price !== "number") continue;

        const parsedDate = parseDate(price.date);
        if (!parsedDate) continue;

        const dateKey = formatDate(parsedDate);
        if (dateKey && Number.isFinite(price.close_price)) {
          benchmarkPriceMap.set(dateKey, price.close_price);
        }
      }
    }

    // Calculate performance over time
    let cumulativePortfolio = 100;
    let cumulativeBenchmark = 100;
    const results: ChartDataPoint[] = [];

    // Process each data point
    for (let i = 0; i < dailyMetrics.length; i++) {
      const metric = dailyMetrics[i];
      if (!metric.current_date) continue;

      const date = parseDate(metric.current_date);
      if (!date) continue;

      const dateKey = formatDate(date);

      // Calculate portfolio performance
      const portfolioReturn = Number(metric.daily_investment_twrr_percent ?? 0);
      if (i > 0 && Number.isFinite(portfolioReturn)) {
        cumulativePortfolio *= 1 + portfolioReturn / 100;
      }

      // Calculate benchmark performance
      const benchmarkPrice = benchmarkPriceMap.get(dateKey);
      if (benchmarkPrice !== undefined && Number.isFinite(benchmarkPrice)) {
        // Find previous benchmark price for comparison
        let previousPrice: number | undefined;
        let lookbackDate = subDays(date, 1);

        // Look back up to 7 days to find a previous price
        for (let attempt = 0; attempt < 7; attempt++) {
          const previousDateKey = formatDate(lookbackDate);
          if (previousDateKey) {
            previousPrice = benchmarkPriceMap.get(previousDateKey);
            if (previousPrice !== undefined) break;
          }
          lookbackDate = subDays(lookbackDate, 1);
        }

        // Calculate benchmark percent change
        if (
          previousPrice !== undefined &&
          Number.isFinite(previousPrice) &&
          previousPrice !== 0
        ) {
          const dailyBenchmarkReturn =
            (benchmarkPrice / previousPrice - 1) * 100;
          if (i > 0 && Number.isFinite(dailyBenchmarkReturn)) {
            cumulativeBenchmark *= 1 + dailyBenchmarkReturn / 100;
          }
        }
      }

      // Calculate performance relative to starting point
      const portfolioPercent = cumulativePortfolio - 100;
      const benchmarkPercent = cumulativeBenchmark - 100;

      results.push({
        date,
        portfolio: Number.isFinite(portfolioPercent)
          ? portfolioPercent
          : undefined,
        indexFund: Number.isFinite(benchmarkPercent)
          ? benchmarkPercent
          : undefined,
      });
    }

    // Set first point to zero for both series
    if (results.length > 0) {
      results[0].portfolio = 0;
      results[0].indexFund = benchmarkPriceMap.size > 0 ? 0 : undefined;
    }

    // Filter out points with no valid data
    return results.filter(
      (point) =>
        typeof point.portfolio === "number" ||
        typeof point.indexFund === "number",
    );
  }, [
    dailyMetrics,
    historicalPrices,
    type,
    tickerId,
    metricsLoading,
    historicalPricesLoading,
    shouldFetchHistorical,
  ]);

  const isLoading =
    metricsLoading || (shouldFetchHistorical && historicalPricesLoading);
  const hasHistoricalData = Boolean(
    historicalPrices && historicalPrices.length > 0,
  );

  return {
    data,
    isLoading,
    hasHistoricalData,
  };
}
