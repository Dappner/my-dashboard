import ErrorState from "@/components/layout/components/ErrorState";
import LoadingState from "@/components/layout/components/LoadingState";
import { PageContainer } from "@/components/layout/components/PageContainer";
import { AppRoutes } from "@/navigation";
import { format } from "date-fns";
import { PieChartIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { CategoryPieChart } from "./components/CategoryPieChart";
import { MonthSwitcher } from "./components/MonthSwitcher";
import { SpendingKpiCards } from "./components/SpendingKpiCards";
import { useRecentReceipts } from "./hooks/spendingMetricsHooks";
import { useAverageDailySpend } from "./hooks/useAverageDailySpend";
import { useDailySpending } from "./hooks/useDailySpending";
import { useSpendingMetrics } from "./hooks/useSpendingMetrics";
import { ActivityFeed } from "./widgets/ActivityFeed";
import { SpendingChartTabs } from "./widgets/SpendingChartTabs";

const NoDataState = () => (
	<div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
		<div className="text-center text-muted-foreground">
			<PieChartIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
			<h3 className="text-xl font-medium mb-2">No spending data available</h3>
			<p>Start by uploading your first receipt</p>
		</div>
	</div>
);

export default function SpendingOverview() {
	const [selectedDate, setSelectedDate] = useState(new Date());

	// Fetch required data with React Query
	const { spendingMetrics, isLoading, error } =
		useSpendingMetrics(selectedDate);
	const { data: dailySpending, isLoading: isDailySpendingLoading } =
		useDailySpending({ selectedDate });
	const { data: recentReceipts, isLoading: isReceiptsLoading } =
		useRecentReceipts(selectedDate);

	// Calculate average daily spend
	const averageDailySpend = useAverageDailySpend({
		dailySpending,
		selectedDate,
	});

	// Properly format date for display
	const formattedMonth = format(selectedDate, "MMMM yyyy");

	// Show loading state when any of the main data is loading
	if (isLoading || isDailySpendingLoading) {
		return <LoadingState />;
	}

	// Show error state if any main query fails
	if (error) {
		return <ErrorState message="Error loading spending data" />;
	}

	// Show no data state when metrics are missing
	if (!spendingMetrics || !spendingMetrics.totalSpent) {
		return <NoDataState />;
	}

	return (
		<PageContainer className="min-h-screen">
			<header className="mb-6 flex flex-row justify-center sm:justify-between items-start sm:items-center gap-4">
				<div className="hidden sm:block">
					<h1 className="text-2xl md:text-3xl font-bold tracking-tight">
						Spending Overview
					</h1>
				</div>
				<MonthSwitcher
					selectedDate={selectedDate}
					onDateChange={setSelectedDate}
				/>
			</header>

			<div className="grid gap-4 md:grid-cols-12">
				<div className="md:col-span-8">
					<div className="mb-6">
						<SpendingKpiCards
							totalSpent={spendingMetrics.totalSpent}
							receiptCount={spendingMetrics.receiptCount}
							categories={spendingMetrics.categories}
							trend={spendingMetrics.monthlyTrend}
							averageDailySpend={averageDailySpend}
							month={formattedMonth}
						/>
					</div>

					<SpendingChartTabs
						dailySpending={dailySpending || []}
						selectedDate={selectedDate}
						monthlyData={spendingMetrics.monthlyData || []}
					/>
				</div>

				<div className="md:col-span-4 gap-4 flex flex-col">
					<div className="hover:shadow-md transition-shadow rounded-lg border bg-card text-card-foreground">
						<div className="flex flex-col space-y-1.5 p-6 pb-2">
							<h3 className="text-lg font-semibold flex items-center">
								<PieChartIcon className="h-4 w-4 mr-2" />
								<Link
									to={AppRoutes.spending.categories.list()}
									className="hover:underline"
								>
									Spending by Category
								</Link>
							</h3>
							<p className="text-sm text-muted-foreground">{formattedMonth}</p>
						</div>
						<div className="p-6 pt-0">
							{spendingMetrics.categories.length > 0 ? (
								<CategoryPieChart categories={spendingMetrics.categories} />
							) : (
								<div className="h-[200px] flex items-center justify-center text-muted-foreground">
									No categories for this month
								</div>
							)}
						</div>
					</div>

					<ActivityFeed
						receipts={recentReceipts || []}
						isLoading={isReceiptsLoading}
					/>
				</div>
			</div>
		</PageContainer>
	);
}
