import { Card } from "@/components/ui/card";
import { ArrowDown, ArrowUp, TrendingUp, DollarSign } from "lucide-react";
import { usePortfolioDailyMetrics } from '../hooks/usePortfolioDailyMetrics';
import useUser from '@/hooks/useUser';
import KpiCard from "@/components/customs/KpiCard";
import { calculatePortfolioMetrics } from "@/services/portfolioMetrics";

export default function PortfolioKpis() {
  const { dailyMetrics, isLoading } = usePortfolioDailyMetrics();
  const { user } = useUser();

  if (isLoading || !dailyMetrics) {
    return Array(3)
      .fill(0)
      .map((_, i) => <Card key={i} className="h-32 animate-pulse bg-gray-200" />);
  }

  const metrics = calculatePortfolioMetrics(dailyMetrics);

  return (
    <>
      <KpiCard
        title="Total Portfolio Value"
        value={`$${metrics.totalPortfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
        changePercent={metrics.monthChangePercent}
        icon={TrendingUp}
        positiveChange={metrics.monthChange >= 0}
        additionalInfo="This month"
      />
      <KpiCard
        title="Investment Return"
        value={`${metrics.totalReturn >= 0 ? '+' : '-'}$${Math.abs(metrics.totalReturn).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
        changePercent={metrics.totalReturnPercent}
        icon={metrics.totalReturn >= 0 ? ArrowUp : ArrowDown}
        positiveChange={metrics.totalReturn >= 0}
      />
      <KpiCard
        title="Cash Balance"
        value={`$${(user?.cash_balance || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
        percent={metrics.cashPercentage}
        icon={DollarSign}
        percentOnly
      />
      <KpiCard
        title="Cash Balance"
        value={`$${(user?.cash_balance || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
        percent={metrics.cashPercentage}
        icon={DollarSign}
        percentOnly
      />
    </>
  );
}
