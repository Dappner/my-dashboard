import { Card } from "@/components/ui/card";
import {
  ArrowDown,
  ArrowUp,
  DollarSign,
  Percent,
  TrendingUp,
} from "lucide-react";
import { usePortfolioDailyMetrics } from "../hooks/usePortfolioDailyMetrics";
import { calculatePortfolioMetrics } from "@/services/portfolioMetrics";
import { Timeframe } from "@/types/portfolioDailyMetricTypes";
import { useTransactions } from "../hooks/useTransactions";
import { useHoldings } from "../hooks/useHoldings";

interface PortfolioKpisProps {
  timeframe: Timeframe;
  className?: string;
}

export default function PortfolioKpis(
  { timeframe, className }: PortfolioKpisProps,
) {
  const { dailyMetrics, isLoading: metricsLoading, error: metricsError } =
    usePortfolioDailyMetrics(timeframe);
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { holdings, isLoading: holdingsLoading } = useHoldings();

  const isLoading = metricsLoading || transactionsLoading || holdingsLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i} className="h-32 animate-pulse bg-gray-200" />
        ))}
      </div>
    );
  }

  if (metricsError || !dailyMetrics) {
    return (
      <div className="text-red-600 text-center">
        Error loading portfolio data: {metricsError?.message || "Unknown error"}
      </div>
    );
  }

  const metrics = calculatePortfolioMetrics(
    dailyMetrics,
    timeframe,
    transactions,
    holdings,
  );

  const formatCurrency = (value: number): string =>
    `$${
      value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    }`;

  const formatPercent = (value: number): string =>
    `${value >= 0 ? "+" : ""}${Math.abs(value).toFixed(2)}%`;

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 ${className}`}>
      <div className="bg-white rounded-md p-2 flex flex-col justify-between">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500 font-medium">Total Value</span>
          <TrendingUp className="h-3.5 w-3.5 text-gray-400" />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm font-bold">
            {formatCurrency(metrics.currentTotalValue)}
          </span>
          <span
            className={`text-xs ${
              metrics.periodTotalChangePercent >= 0
                ? "text-green-600"
                : "text-red-600"
            } flex items-center`}
          >
            {metrics.periodTotalChangePercent >= 0
              ? <ArrowUp className="h-3 w-3" />
              : <ArrowDown className="h-3 w-3" />}
            {formatPercent(metrics.periodTotalChangePercent)}
          </span>
        </div>
      </div>

      {/* Unrealized P/L */}
      <div className="bg-white rounded-md p-2 flex flex-col justify-between">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500 font-medium">
            Unrealized P/L
          </span>
          {metrics.currentUnrealizedPL >= 0
            ? <ArrowUp className="h-3.5 w-3.5 text-green-400" />
            : <ArrowDown className="h-3.5 w-3.5 text-red-400" />}
        </div>
        <span
          className={`text-sm font-bold ${
            metrics.currentUnrealizedPL >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {formatCurrency(metrics.currentUnrealizedPL)}
        </span>
      </div>

      {/* Realized P/L */}
      <div className="bg-white rounded-md p-2 flex flex-col justify-between">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500 font-medium">
            Realized P/L
          </span>
          <Percent className="h-3.5 w-3.5 text-gray-400" />
        </div>
        <span className="text-sm font-bold text-green-600">
          {formatCurrency(metrics.periodDividendsReceived)}
        </span>
      </div>

      {/* Cash Balance */}
      <div className="bg-white rounded-md p-2 flex flex-col justify-between">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500 font-medium">Cash</span>
          <DollarSign className="h-3.5 w-3.5 text-gray-400" />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm font-bold">
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
