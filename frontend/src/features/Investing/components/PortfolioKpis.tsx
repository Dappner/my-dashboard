import { Card } from "@/components/ui/card";
import {
  ArrowDown,
  ArrowUp,
  DollarSign,
  Percent,
  TrendingUp,
} from "lucide-react";
import { usePortfolioDailyMetrics } from "../hooks/usePortfolioDailyMetrics";
import KpiCard from "@/components/customs/KpiCard";
import { calculatePortfolioMetrics } from "@/services/portfolioMetrics";
import { Timeframe } from "@/types/portfolioDailyMetricTypes";
import { useTransactions } from "../hooks/useTransactions";
import { useHoldings } from "../hooks/useHoldings";

interface PortfolioKpisProps {
  timeframe: Timeframe;
}

export default function PortfolioKpis({ timeframe }: PortfolioKpisProps) {
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

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
      <KpiCard
        title="Total Portfolio Value"
        value={formatCurrency(metrics.currentTotalValue)}
        changePercent={metrics.periodTotalChangePercent}
        icon={TrendingUp}
        positiveChange={metrics.periodTotalChange >= 0}
        additionalInfo={`Growth: ${metrics.periodTotalChange >= 0 ? "+" : ""}${
          formatCurrency(metrics.periodTotalChange)
        }`}
        tooltip={`Total value change over ${timeframe}`}
      />
      <KpiCard
        title="Unrealized P/L"
        value={`${metrics.currentUnrealizedPL >= 0 ? "+" : ""}${
          formatCurrency(metrics.currentUnrealizedPL)
        }`}
        icon={metrics.currentUnrealizedPL >= 0 ? ArrowUp : ArrowDown}
        positiveChange={metrics.currentUnrealizedPL >= 0}
        tooltip="Current unrealized profit/loss including dividends"
      />
      <KpiCard
        title="Realized P/L"
        value={formatCurrency(metrics.periodDividendsReceived)}
        icon={Percent}
        positiveChange={true}
        additionalInfo={`Over ${timeframe}`}
        tooltip="Total dividends received in selected timeframe"
      />
      <KpiCard
        title="Cash Balance"
        value={formatCurrency(metrics.currentCashBalance)}
        percent={metrics.currentCashPercentage}
        icon={DollarSign}
        percentOnly
        additionalInfo="of portfolio"
        tooltip="Current cash position and percentage of total portfolio"
      />
    </div>
  );
}
