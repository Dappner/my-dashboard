import ErrorState from "@/components/layout/components/ErrorState";
import LoadingState from "@/components/layout/components/LoadingState";
import { PageContainer } from "@/components/layout/components/PageContainer";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { CategoryPieChart } from "./components/CategoryPieChart";
import { MonthSwitcher } from "./components/MonthSwitcher";
import { SpendingKpiCards } from "./components/SpendingKpiCards";
import { useRecentReceipts } from "./hooks/spendingMetricsHooks";
import { useSpendingMetrics } from "./hooks/useSpendingMetrics";
import { ActivityFeed } from "./widgets/ActivityFeed";
import { MonthlySpendingChart } from "./widgets/MonthlySpendingChart";

const NoDataState: React.FC = () => (
	<div className="flex items-center justify-center min-h-screen">
		No spending data available
	</div>
);

export default function SpendingOverview() {
	const [selectedDate, setSelectedDate] = useState(new Date());

	const { spendingMetrics, isLoading, error } =
		useSpendingMetrics(selectedDate);

	const { data: recentReceipts } = useRecentReceipts(selectedDate);
	const queryDate = useMemo(() => {
		const date = new Date(selectedDate);
		date.setDate(1); // Use local day setter
		date.setHours(0, 0, 0, 0); // Use local time setter
		return date;
	}, [selectedDate]);

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
				<div className="grid gap-4 md:grid-cols-12">
					{/* Left side content */}
					<div className="md:col-span-8">
						{/* KPI Cards */}
						<div className="mb-6">
							<SpendingKpiCards
								totalSpent={spendingMetrics.totalSpent}
								receiptCount={spendingMetrics.receiptCount}
								categories={spendingMetrics.categories}
								month={format(queryDate, "MMMM yyyy")}
							/>
						</div>

						{/* Monthly Spending Chart - Now below KPI cards */}
						<div>
							<MonthlySpendingChart data={spendingMetrics.monthlyData} />
						</div>
					</div>

					{/* Right column with Pie Chart and Activity Feed */}
					<div className="md:col-span-4">
						{/* Category Pie Chart */}
						<div className="mb-6">
							<CategoryPieChart
								categories={spendingMetrics.categories}
								month={format(queryDate, "MMMM yyyy")}
							/>
						</div>

						{/* Activity Feed */}
						<div>
							<ActivityFeed receipts={recentReceipts || []} />
						</div>
					</div>
				</div>
			</div>
		</PageContainer>
	);
}
