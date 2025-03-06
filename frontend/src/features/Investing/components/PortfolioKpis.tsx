import { Card } from "@/components/ui/card";
import { ArrowDown, ArrowUp, TrendingUp, DollarSign } from "lucide-react";
import { usePortfolioDailyMetrics } from '../hooks/usePortfolioDailyMetrics';
import useUser from '@/hooks/useUser';
import KpiCard from "@/components/customs/KpiCard";
import { calculatePortfolioMetrics } from "@/services/portfolioMetrics";
import { Timeframe } from "@/types/portfolioDailyMetricTypes";

interface PortfolioKpisProps {
  timeframe: Timeframe;
}

export default function PortfolioKpis({ timeframe }: PortfolioKpisProps) {
  const { dailyMetrics, isLoading } = usePortfolioDailyMetrics(timeframe);
  const { user } = useUser();

  if (isLoading || !dailyMetrics) {
    return Array(4)
      .fill(0)
      .map((_, i) => <Card key={i} className="h-32 animate-pulse bg-gray-200" />);
  }

  const metrics = calculatePortfolioMetrics(dailyMetrics, timeframe);

  return (
    <>
      <KpiCard
        title="Total Portfolio Value"
        value={`$${metrics.totalPortfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
        changePercent={metrics.timeframeChangePercent}
        icon={TrendingUp}
        positiveChange={metrics.timeframeChange >= 0}
        additionalInfo={`Over ${timeframe}`}
      />
      <KpiCard
        title="Investment Return"
        value={`${metrics.timeframeReturn >= 0 ? '+' : '-'}$${Math.abs(metrics.timeframeReturn).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
        changePercent={metrics.timeframeReturnPercent}
        icon={metrics.timeframeReturn >= 0 ? ArrowUp : ArrowDown}
        positiveChange={metrics.timeframeReturn >= 0}
        additionalInfo={`Over ${timeframe}`}
      />
      <KpiCard
        title="Investment Growth"
        value={`${metrics.investmentGrowth >= 0 ? '+' : '-'}$${Math.abs(metrics.investmentGrowth).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
        changePercent={metrics.investmentGrowthPercent}
        icon={metrics.investmentGrowth >= 0 ? ArrowUp : ArrowDown}
        positiveChange={metrics.investmentGrowth >= 0}
        additionalInfo={`Over ${timeframe}`}
      />
      <KpiCard
        title="Cash Balance"
        value={`$${(user?.cash_balance || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
        percent={metrics.cashPercentage}
        icon={DollarSign}
        percentOnly
        additionalInfo="Current"
      />
      <KpiCard
        title="Volatility"
        value={`${(metrics.volatility || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
        icon={DollarSign}
        percentOnly
        additionalInfo="Current"
      />
    </>
  );
}
