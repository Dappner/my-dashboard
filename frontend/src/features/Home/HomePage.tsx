import KpiCard from "@/components/customs/KpiCard";
import { TrendingUp } from "lucide-react";
import { usePortfolioDailyMetrics } from "../Investing/hooks/usePortfolioDailyMetrics";
import { Card } from "@/components/ui/card";
import { calculatePortfolioMetrics } from "@/services/portfolioMetrics";

export default function HomePage() {
  const { dailyMetrics, isLoading } = usePortfolioDailyMetrics("ALL");
  if (isLoading || !dailyMetrics || dailyMetrics.length === 0) {
    return Array(3).fill(0).map((_, i) => (
      <Card key={i} className="h-32 animate-pulse bg-gray-200" />
    ));
  }
  const metrics = calculatePortfolioMetrics(dailyMetrics);

  return (
    <div>
      <KpiCard
        title="Total Portfolio Value"
        value={`$${metrics.totalPortfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
        changePercent={metrics.timeframeChangePercent}
        icon={TrendingUp}
        positiveChange={metrics.timeframeChange >= 0}
      />
    </div>
  )
}
