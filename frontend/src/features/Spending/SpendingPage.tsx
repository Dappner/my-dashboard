import TimeframeControls from "@/components/controls/CustomTimeframeControl";
import ErrorState from "@/components/layout/components/ErrorState";
import LoadingState from "@/components/layout/components/LoadingState";
import { PageContainer } from "@/components/layout/components/PageContainer";
import { Button } from "@/components/ui/button";
import { useTimeframeParams } from "@/hooks/useTimeframeParams";
import { PieChartIcon } from "lucide-react";
import { SpendingKpiCards } from "./components/SpendingKpiCards";
import { useSpendingMetrics } from "./hooks/useSpendingMetrics";
import { ActivityFeed } from "./widgets/ActivityFeed";
import CurrentMonthCategoryChart from "./widgets/CurrentMonthCategoryChart";
import { SpendingChartTabs } from "./widgets/SpendingChartTabs";

export default function SpendingOverview() {
	const { timeframe, date, setTimeframe, setDate } = useTimeframeParams();
	const { spendingMetrics, isLoading, error } = useSpendingMetrics(
		date,
		timeframe,
	);

	if (isLoading) {
		return <LoadingState />;
	}

	if (error) {
		return <ErrorState message="Error loading spending data" />;
	}

	return (
		<PageContainer className="min-h-screen">
			<header className="mb-6 flex flex-row justify-center sm:justify-between items-start sm:items-center gap-4">
				<h1 className="hidden sm:block text-xl md:text-3xl font-semibold tracking-tight">
					Spending Overview
				</h1>
				<TimeframeControls
					timeframe={timeframe}
					date={date}
					onTimeframeChange={setTimeframe}
					onDateChange={setDate}
				/>
			</header>

			{!spendingMetrics ? (
				<div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
					<div className="text-center text-muted-foreground">
						<PieChartIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
						<h3 className="text-xl font-medium mb-2">
							No spending data available
						</h3>
						<Button>Reset to this month!</Button>
					</div>
				</div>
			) : (
				<div className="grid gap-4 md:grid-cols-12">
					<div className="md:col-span-8">
						<div className="mb-6">
							<SpendingKpiCards />
						</div>

						<SpendingChartTabs />
					</div>

					<div className="md:col-span-4 gap-4 flex flex-col">
						<CurrentMonthCategoryChart />
						<ActivityFeed />
					</div>
				</div>
			)}
		</PageContainer>
	);
}
