import KpiCard from "@/components/customs/KpiCard";
import LoadingSpinner from "@/components/layout/components/LoadingSpinner";
import { PageContainer } from "@/components/layout/components/PageContainer";
import { calculatePortfolioMetrics } from "@/services/portfolioMetrics";
import { TrendingUp } from "lucide-react";
import { usePortfolioDailyMetrics } from "@/features/Investing/hooks/usePortfolioDailyMetrics";

export default function HomePage() {
	const { dailyMetrics, isLoading } = usePortfolioDailyMetrics("ALL");

	if (isLoading) return <LoadingSpinner />;

	const metrics = calculatePortfolioMetrics(dailyMetrics || [], "ALL");

	return (
		<PageContainer>
			<div className="grid sm:grid-cols-2 gap-4">
				<KpiCard
					title="Total Portfolio Value"
					value={`$${metrics.currentTotalValue.toLocaleString(undefined, {
						maximumFractionDigits: 2,
					})}`}
					changePercent={metrics.periodTotalChangePercent}
					icon={TrendingUp}
					positiveChange={metrics.periodInvestmentChange >= 0}
				/>
				<div>Spending Chart</div>
			</div>
		</PageContainer>
	);
}
