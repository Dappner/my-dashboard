import { ArrowDown, ArrowUp, DollarSign, Percent } from "lucide-react";
import { usePortfolioDailyMetrics } from "../hooks/usePortfolioDailyMetrics";
import { calculatePortfolioMetrics } from "@/services/portfolioMetrics";
import { Timeframe } from "@/types/portfolioDailyMetricTypes";
import { useTransactions } from "../hooks/useTransactions";
import { useHoldings } from "../hooks/useHoldings";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatting";
import { cn } from "@/lib/utils";

interface SidebarKpisProps {
  timeframe: Timeframe;
  className?: string;
}

export default function SidebarKpis(
  { timeframe, className }: SidebarKpisProps,
) {
  const {
    dailyMetrics,
    isLoading: metricsLoading,
    error: metricsError,
  } = usePortfolioDailyMetrics(timeframe);
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { holdings, isLoading: holdingsLoading } = useHoldings();
  const isLoading = metricsLoading || transactionsLoading || holdingsLoading;

  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <Skeleton className="h-16 w-full rounded-md" />
        <Skeleton className="h-16 w-full rounded-md" />
        <Skeleton className="h-16 w-full rounded-md" />
      </div>
    );
  }

  if (metricsError || !dailyMetrics) {
    return (
      <div className={`text-red-600 ${className}`}>Error loading KPIs.</div>
    );
  }

  const metrics = calculatePortfolioMetrics(
    dailyMetrics,
    timeframe,
    transactions,
    holdings,
  );

  return (
    <div className="grid grid-cols-3 sm:gap-2 w-full">
      <div className="bg-white/80 backdrop-blur-sm sm:rounded-lg px-3 py-2 sm:border border-gray-200 shadow-sm">
        <div className="text-xs text-gray-600 mb-1">Unrealized P/L</div>
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "text-lg font-semibold",
              metrics.currentUnrealizedPL >= 0
                ? "text-green-700"
                : "text-red-600",
            )}
          >
            {formatCurrency(metrics.currentUnrealizedPL)}
          </div>
          {metrics.currentUnrealizedPL >= 0
            ? <ArrowUp className="h-4 w-4 text-green-500" />
            : <ArrowDown className="h-4 w-4 text-red-500" />}
        </div>
      </div>
      <div className="bg-white/80 backdrop-blur-sm sm:rounded-lg px-3 py-2 sm:border border-gray-200 shadow-sm">
        <div className="text-xs text-gray-600 mb-1">
          Realized P/L ({timeframe})
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-700">
            {formatCurrency(metrics.periodDividendsReceived)}
          </span>
          <Percent className="h-4 w-4 text-gray-400" />
        </div>
      </div>
      <div className="bg-white/80 backdrop-blur-sm sm:rounded-lg px-3 py-2 sm:border border-gray-200 shadow-sm">
        <div className="text-xs text-gray-600 mb-1">Cash</div>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-semibold">
              {formatCurrency(metrics.currentCashBalance)}
            </span>
            <span className="text-xs text-gray-500">
              ({metrics.currentCashPercentage.toFixed(1)}%)
            </span>
          </div>
          <DollarSign className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
}
