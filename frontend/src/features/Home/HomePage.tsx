import KpiCard from "@/components/customs/KpiCard";
import LoadingSpinner from "@/components/layout/components/LoadingSpinner";
import { PageContainer } from "@/components/layout/components/PageContainer";
import { Card } from "@/components/ui/card";
import useUser from "@/hooks/useUser";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CheckSquare, DollarSign, GitCommit, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import PortfolioChart from "../Investing/components/PortfolioChart";
import { usePortfolioMetrics } from "../Investing/hooks/usePortfolioMetrics";
import { CategoryPieChart } from "../Spending/components/CategoryPieChart";
import { useSpendingMetrics } from "../Spending/hooks/useSpendingMetrics";

type ChessDay = { date: string; played: boolean };
type CommitDay = { date: string; count: number };
type HabitsData = { chess: ChessDay[]; commits: CommitDay[] };

// Query hooks
const useHabitsData = (userId?: string) => {
	return useQuery<HabitsData, Error>({
		queryKey: ["habitsData", userId],
		queryFn: async () => {
			if (!userId) throw new Error("User ID is required");
			return {
				chess: [
					{ date: "2025-03-25", played: true },
					{ date: "2025-03-26", played: false },
					{ date: "2025-03-27", played: true },
					{ date: "2025-03-28", played: true },
					{ date: "2025-03-29", played: false },
					{ date: "2025-03-30", played: true },
					{ date: "2025-03-31", played: false },
				],
				commits: [
					{ date: "2025-03-25", count: 3 },
					{ date: "2025-03-26", count: 5 },
					{ date: "2025-03-27", count: 0 },
					{ date: "2025-03-28", count: 7 },
					{ date: "2025-03-29", count: 2 },
					{ date: "2025-03-30", count: 0 },
					{ date: "2025-03-31", count: 4 },
				],
			};
		},
		enabled: !!userId, // Only run query if userId exists
	});
};

const CompactHabitsTracker: React.FC<{ habitsData: HabitsData }> = ({
	habitsData,
}) => {
	const chessStreak = habitsData.chess.reduce(
		(streak, day) => (day.played ? streak + 1 : 0),
		0,
	);
	const commitsThisWeek = habitsData.commits.reduce(
		(total, day) => total + day.count,
		0,
	);

	return (
		<div className="grid grid-cols-2 gap-2">
			<Card className="p-2">
				<div className="flex items-center space-x-1">
					<CheckSquare className="h-3 w-3" />
					<span className="text-xs">Chess: {chessStreak}d</span>
				</div>
				<div className="flex mt-1">
					{habitsData.chess.map((day) => (
						<div
							key={day.date}
							className={`w-2 h-2 mx-0.5 rounded-sm ${
								day.played ? "bg-green-500" : "bg-gray-200"
							}`}
							title={day.date}
						/>
					))}
				</div>
			</Card>
			<Card className="p-2">
				<div className="flex items-center space-x-1">
					<GitCommit className="h-3 w-3" />
					<span className="text-xs">Commits: {commitsThisWeek}</span>
				</div>
				<div className="flex mt-1">
					{habitsData.commits.map((day) => (
						<div
							key={day.date}
							className="flex flex-col items-center mx-0.5"
							title={day.date}
						>
							<div
								className={`w-2 h-2 rounded-sm ${
									day.count === 0
										? "bg-gray-200"
										: day.count < 3
											? "bg-green-200"
											: day.count < 5
												? "bg-green-400"
												: "bg-green-600"
								}`}
							/>
							<span className="text-[9px]">{day.count}</span>
						</div>
					))}
				</div>
			</Card>
		</div>
	);
};

export default function HomePage() {
	const { user } = useUser();
	const userId = user?.id;
	const { metrics, isLoading: metricsLoading } = usePortfolioMetrics("ALL");

	const queryDate = new Date();
	const currentMonth = format(queryDate, "MMMM yyyy");
	const { spendingMetrics, isLoading: spendingLoading } =
		useSpendingMetrics(queryDate);
	const { data: habitsData, isLoading: habitsLoading } = useHabitsData(userId);

	const isLoading = metricsLoading || spendingLoading || habitsLoading;

	if (isLoading) return <LoadingSpinner />;

	return (
		<PageContainer>
			<div className="container mx-auto px-4 py-4 space-y-4">
				<section className="space-y-2">
					<div className="flex justify-between items-center">
						<h2 className="text-base font-semibold sm:text-lg">Investing</h2>
						<Link
							to="/investing"
							className="text-xs text-blue-500 hover:underline sm:text-sm"
						>
							Details
						</Link>
					</div>
					<div className="grid grid-cols-2 gap-2">
						<KpiCard
							title="Portfolio Value"
							value={`$${metrics?.currentTotalValue.toLocaleString(undefined, {
								maximumFractionDigits: 0,
							})}`}
							icon={TrendingUp}
							// compact
						/>
						<KpiCard
							title="Gain/Loss"
							value={`$${metrics?.currentUnrealizedPL.toLocaleString(
								undefined,
								{
									maximumFractionDigits: 0,
								},
							)}`}
							icon={TrendingUp}
						/>
						<div className="col-span-2">
							<PortfolioChart
								timeframe="1M"
								type="absolute"
								// isDashboard={true}
							/>
						</div>
					</div>
				</section>

				<section className="space-y-2">
					<div className="flex justify-between items-center">
						<h2 className="text-base font-semibold sm:text-lg">
							Spending
							<span className="text-sm font-normal text-gray-600">
								(this Month)
							</span>
						</h2>
						<Link
							to="/spending"
							className="text-xs text-blue-500 hover:underline sm:text-sm"
						>
							Details
						</Link>
					</div>
					<div className="grid grid-cols-2 gap-2">
						<KpiCard
							title="Total Spent"
							value={`$${spendingMetrics?.totalSpent.toLocaleString(undefined, {
								maximumFractionDigits: 0,
							})}`}
							changePercent={spendingMetrics?.monthlyTrend || 0}
							icon={DollarSign}
							positiveChange={(spendingMetrics?.monthlyTrend || 0) <= 0}
							// compact
						/>
						<KpiCard
							title="Receipts"
							value={spendingMetrics?.receiptCount.toString() || "0"}
							changePercent={0} // Add logic if needed
							icon={DollarSign}
							positiveChange={true}
							// compact
						/>
						<div className="col-span-2">
							<CategoryPieChart
								categories={spendingMetrics.categories}
								month={currentMonth}
							/>
						</div>
					</div>
				</section>

				{/* Habits Section */}
				<section className="space-y-2">
					<div className="flex justify-between items-center">
						<h2 className="text-base font-semibold sm:text-lg">Habits</h2>
						<Link
							to="/habits"
							className="text-xs text-blue-500 hover:underline sm:text-sm"
						>
							Details
						</Link>
					</div>
					<CompactHabitsTracker
						habitsData={habitsData || { chess: [], commits: [] }}
					/>
				</section>
			</div>
		</PageContainer>
	);
}

// Helper function for category colors
