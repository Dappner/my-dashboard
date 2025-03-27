import { ArrowDown, ArrowUp, DollarSign, Percent } from "lucide-react";
import { usePortfolioDailyMetrics } from "../hooks/usePortfolioDailyMetrics";
import { calculatePortfolioMetrics } from "@/services/portfolioMetrics";
import { Timeframe } from "@/types/portfolioDailyMetricTypes";
import { useTransactions } from "../hooks/useTransactions";
import { useHoldings } from "../hooks/useHoldings";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatting";

interface SidebarKpisProps {
  timeframe: Timeframe; // Keep timeframe if needed for Realized P/L context, though calculation might only use period txns
  className?: string;
}

export default function SidebarKpis(
  { timeframe, className }: SidebarKpisProps,
) {
  // Note: We still need all hooks if calculations depend on them
  const {
    dailyMetrics,
    isLoading: metricsLoading,
    error: metricsError,
  } = usePortfolioDailyMetrics(timeframe);
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { holdings, isLoading: holdingsLoading } = useHoldings();

  const isLoading = metricsLoading || transactionsLoading || holdingsLoading;

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <Skeleton className="h-16 w-full rounded-md" />
        <Skeleton className="h-16 w-full rounded-md" />
        <Skeleton className="h-16 w-full rounded-md" />
      </div>
    );
  }

  // --- Error State ---
  // Display a general error or specific errors for components that fail
  if (metricsError || !dailyMetrics) {
    // Or !transactions, !holdings depending on requirements
    return (
      <div className={`text-red-600 ${className}`}>Error loading KPIs.</div>
    );
  }

  // --- Success State ---
  const metrics = calculatePortfolioMetrics(
    dailyMetrics,
    timeframe,
    transactions,
    holdings,
  );

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Unrealized P/L */}
      <div className="bg-white rounded-md p-3 flex flex-col justify-between border">
        {/* Added border */}
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500 font-medium">
            Unrealized P/L
          </span>
          {metrics.currentUnrealizedPL >= 0
            ? <ArrowUp className="h-3.5 w-3.5 text-green-500" />
            : <ArrowDown className="h-3.5 w-3.5 text-red-500" />}
        </div>
        <span
          className={`text-sm font-semibold ${
            // Semibold instead of bold
            metrics.currentUnrealizedPL >= 0
              ? "text-green-600"
              : "text-red-600"}`}
        >
          {formatCurrency(metrics.currentUnrealizedPL)}
        </span>
      </div>

      {/* Realized P/L (Consider if this should be timeframe dependent) */}
      <div className="bg-white rounded-md p-3 flex flex-col justify-between border">
        {/* Added border */}
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500 font-medium">
            Realized P/L ({timeframe}) {/* Clarify timeframe */}
          </span>
          <Percent className="h-3.5 w-3.5 text-gray-400" />
        </div>
        {/* Assuming periodDividendsReceived is the relevant metric for realized */}
        <span className="text-sm font-semibold text-gray-700">
          {/* Semibold */}
          {formatCurrency(metrics.periodDividendsReceived)}{" "}
          {/* Or other realized metric */}
        </span>
      </div>

      {/* Cash Balance */}
      <div className="bg-white rounded-md p-3 flex flex-col justify-between border">
        {/* Added border */}
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500 font-medium">Cash</span>
          <DollarSign className="h-3.5 w-3.5 text-gray-400" />
        </div>
        <div className="flex items-baseline gap-1">
          {/* Use baseline align */}
          <span className="text-sm font-semibold">
            {/* Semibold */}
            {formatCurrency(metrics.currentCashBalance)}
          </span>
          <span className="text-xs text-gray-500">
            ({metrics.currentCashPercentage.toFixed(1)}%)
          </span>
        </div>
      </div>
    </div>
  );
}
