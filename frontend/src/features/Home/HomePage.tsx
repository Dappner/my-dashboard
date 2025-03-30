import KpiCard from "@/components/customs/KpiCard";
import { TrendingUp } from "lucide-react";
import { usePortfolioDailyMetrics } from "../Investing/hooks/usePortfolioDailyMetrics";
import { Card } from "@/components/ui/card";
import { calculatePortfolioMetrics } from "@/services/portfolioMetrics";
import { PageContainer } from "@/components/layout/components/PageContainer";

export default function HomePage() {
  const { dailyMetrics, isLoading } = usePortfolioDailyMetrics("ALL");
  if (isLoading || !dailyMetrics || dailyMetrics.length === 0) {
    return Array(3).fill(0).map((_, i) => (
      <Card key={i} className="h-32 animate-pulse bg-gray-200" />
    ));
  }
  const metrics = calculatePortfolioMetrics(dailyMetrics, "ALL");

  return (
    <PageContainer>
      <KpiCard
        title="Total Portfolio Value"
        value={`$${metrics.currentTotalValue.toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })
          }`}
        changePercent={metrics.periodTotalChangePercent}
        icon={TrendingUp}
        positiveChange={metrics.periodInvestmentChange >= 0}
      />
    </PageContainer>
  );
}
