import KpiCard from "@/components/customs/KpiCard";
import { PageContainer } from "@/components/layout/components/PageContainer";
import { calculatePortfolioMetrics } from "@/services/portfolioMetrics";
import { TrendingUp } from "lucide-react";
import { usePortfolioDailyMetrics } from "../Investing/hooks/usePortfolioDailyMetrics";
import LoadingSpinner from "@/components/layout/components/LoadingSpinner";

export default function HomePage() {
	const { dailyMetrics, isLoading } = usePortfolioDailyMetrics("ALL");

	if (isLoading) return <LoadingSpinner />;

	const metrics = calculatePortfolioMetrics(dailyMetrics || [], "ALL");

	return (
		<PageContainer>
			<KpiCard
				title="Total Portfolio Value"
				value={`$${metrics.currentTotalValue.toLocaleString(undefined, {
					maximumFractionDigits: 2,
				})}`}
				changePercent={metrics.periodTotalChangePercent}
				icon={TrendingUp}
				positiveChange={metrics.periodInvestmentChange >= 0}
			/>
		</PageContainer>
	);
}
