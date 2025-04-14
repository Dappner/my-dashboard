import ErrorState from "@/components/layout/components/ErrorState";
import LoadingState from "@/components/layout/components/LoadingState";
import { PageContainer } from "@/components/layout/components/PageContainer";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { ActivityFeed } from "./components/ActivityFeed";
import { CategoryPieChart } from "./components/CategoryPieChart";
import { MonthSwitcher } from "./components/MonthSwitcher";
import { MonthlySpendingChart } from "./components/MonthlySpendingChart";
import { SpendingKpiCards } from "./components/SpendingKpiCards";
import { useRecentReceipts } from "./hooks/spendingMetricsHooks";
import { useSpendingMetrics } from "./hooks/useSpendingMetrics";

const NoDataState: React.FC = () => (
	<div className="flex items-center justify-center min-h-screen">
		No spending data available
	</div>
);

export default function SpendingOverview() {
	const [selectedDate, setSelectedDate] = useState(() => new Date());

	const { spendingMetrics, isLoading, error } =
		useSpendingMetrics(selectedDate);

	const { data: recentReceipts } = useRecentReceipts(selectedDate);
	const queryDate = useMemo(() => {
		const date = new Date(selectedDate);
		date.setDate(1); // Use local day setter
		date.setHours(0, 0, 0, 0); // Use local time setter
		return date;
	}, [selectedDate]);

	console.log(spendingMetrics);
	if (isLoading) return <LoadingState />;
	if (error) return <ErrorState message={"Error loading Spending"} />;
	if (!spendingMetrics) return <NoDataState />;

	return (
		<PageContainer className="min-h-screen">
			<div>
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

				{/* Top Row with Summary Cards and Category Pie Chart */}
				<div className="grid gap-4 md:grid-cols-12 mb-6">
					{/* Summary Cards - Left Side */}
					<div className="md:col-span-8">
						<SpendingKpiCards
							totalSpent={spendingMetrics.totalSpent}
							receiptCount={spendingMetrics.receiptCount}
							categories={spendingMetrics.categories}
							month={format(queryDate, "MMMM yyyy")}
						/>
					</div>

					{/* Category Pie Chart - Right Side */}
					<div className="md:col-span-4">
						<CategoryPieChart
							categories={spendingMetrics.categories}
							month={format(queryDate, "MMMM yyyy")}
						/>
					</div>
				</div>

				{/* Bottom Row with Charts and Activity Feed */}
				<div className="grid gap-4 md:grid-cols-12">
					{/* Charts */}
					<div className="md:col-span-8">
						<MonthlySpendingChart data={spendingMetrics.monthlyData} />
					</div>

					<div className="md:col-span-4">
						<ActivityFeed receipts={recentReceipts || []} />
					</div>
				</div>
			</div>
		</PageContainer>
	);
}
