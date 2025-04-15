import ErrorState from "@/components/layout/components/ErrorState";
import LoadingState from "@/components/layout/components/LoadingState";
import { PageContainer } from "@/components/layout/components/PageContainer";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useMonthParam } from "@/hooks/useMonthParam";
import { spendingCategoriesRoute } from "@/routes/spending-routes";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { PieChartIcon } from "lucide-react";
import { CategoryPieChart } from "./components/CategoryPieChart";
import { MonthSwitcher } from "./components/MonthSwitcher";
import { SpendingKpiCards } from "./components/SpendingKpiCards";
import { useRecentReceipts } from "./hooks/spendingMetricsHooks";
import { useAverageDailySpend } from "./hooks/useAverageDailySpend";
import { useDailySpending } from "./hooks/useDailySpending";
import { useSpendingMetrics } from "./hooks/useSpendingMetrics";
import { ActivityFeed } from "./widgets/ActivityFeed";
import { SpendingChartTabs } from "./widgets/SpendingChartTabs";

export default function SpendingOverview() {
	const { selectedDate, setSelectedDate } = useMonthParam();

	const { spendingMetrics, isLoading, error } =
		useSpendingMetrics(selectedDate);
	const { data: dailySpending, isLoading: isDailySpendingLoading } =
		useDailySpending({ selectedDate });
	const { data: recentReceipts, isLoading: isReceiptsLoading } =
		useRecentReceipts(selectedDate);

	const averageDailySpend = useAverageDailySpend({
		dailySpending,
		selectedDate,
	});

	const formattedMonth = format(selectedDate, "MMMM yyyy");

	if (isLoading || isDailySpendingLoading) {
		return <LoadingState />;
	}

	if (error) {
		return <ErrorState message="Error loading spending data" />;
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
			{!spendingMetrics || !spendingMetrics.totalSpent ? (
				<div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
					<div className="text-center text-muted-foreground">
						<PieChartIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
						<h3 className="text-xl font-medium mb-2">
							No spending data available for {formattedMonth}
						</h3>
						<p>Use the month selector above to navigate to a month with data</p>
					</div>
				</div>
			) : (
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
						<Card>
							<CardHeader className="flex flex-col">
								<CardTitle className="text-lg font-semibold flex items-center">
									<PieChartIcon className="size-4 mr-2" />
									<Link
										to={spendingCategoriesRoute.to}
										className="hover:underline"
									>
										Spending by Category
									</Link>
								</CardTitle>
								<p className="text-sm text-muted-foreground">
									{formattedMonth}
								</p>
							</CardHeader>
							<div className="p-6 pt-0">
								{spendingMetrics.categories.length > 0 ? (
									<CategoryPieChart categories={spendingMetrics.categories} />
								) : (
									<div className="h-[200px] flex items-center justify-center text-muted-foreground">
										No categories for this month
									</div>
								)}
							</div>
						</Card>

						<ActivityFeed
							receipts={recentReceipts || []}
							isLoading={isReceiptsLoading}
						/>
					</div>
				</div>
			)}
		</PageContainer>
	);
}
