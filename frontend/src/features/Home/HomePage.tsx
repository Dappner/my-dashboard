import KpiCard from "@/components/customs/KpiCard";
import LoadingSpinner from "@/components/layout/components/LoadingSpinner";
import { PageContainer } from "@/components/layout/components/PageContainer";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
} from "@/components/ui/card";
import useUser from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CheckSquare, DollarSign, GitCommit, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import PortfolioChart from "../Investing/components/PortfolioChart";
import { usePortfolioMetrics } from "../Investing/hooks/usePortfolioMetrics";

const useSpendingMetrics = (userId?: string) => {
	return useQuery<
		{
			totalSpent: number;
			monthlyTrend: number;
			receiptCount: number;
			monthlyData: { month: string; amount: number }[];
			categories: { name: string; amount: number; color: string }[];
		},
		Error
	>({
		queryKey: ["spendingMetrics", userId],
		queryFn: async () => {
			if (!userId) throw new Error("User ID is required");
			const today = new Date();
			const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
			const sixMonthsAgo = new Date(
				today.getFullYear(),
				today.getMonth() - 5,
				1,
			);

			const { data: currentMonthData, error: currentError } = await supabase
				.schema("grocery")
				.from("receipts")
				.select("total_amount, purchase_date")
				.eq("user_id", userId)
				.gte("purchase_date", format(startOfMonth, "yyyy-MM-dd"))
				.lte("purchase_date", format(today, "yyyy-MM-dd"));

			if (currentError) throw new Error(currentError.message);

			const totalSpent = currentMonthData.reduce(
				(sum, receipt) => sum + (receipt.total_amount || 0),
				0,
			);
			const receiptCount = currentMonthData.length;

			const { data: monthlyDataRaw, error: monthlyError } = await supabase
				.schema("grocery")
				.from("receipts")
				.select("total_amount, purchase_date")
				.eq("user_id", userId)
				.gte("purchase_date", format(sixMonthsAgo, "yyyy-MM-dd"))
				.lte("purchase_date", format(today, "yyyy-MM-dd"));

			if (monthlyError) throw new Error(monthlyError.message);

			const monthlyData = Array.from({ length: 6 }, (_, i) => {
				const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
				const monthData = monthlyDataRaw.filter(
					(item) =>
						new Date(item.purchase_date).getMonth() === date.getMonth() &&
						new Date(item.purchase_date).getFullYear() === date.getFullYear(),
				);
				return {
					month: format(date, "MMM"),
					amount: monthData.reduce(
						(sum, item) => sum + (item.total_amount || 0),
						0,
					),
				};
			}).reverse();

			const currentMonthTotal = monthlyData[monthlyData.length - 1].amount;
			const previousMonthTotal =
				monthlyData[monthlyData.length - 2]?.amount || 0;
			const monthlyTrend =
				previousMonthTotal > 0
					? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) *
						100
					: 0;

			const { data: categoryData, error: categoryError } = await supabase
				.schema("grocery")
				.from("receipts_with_items")
				.select("category_name, total_amount")
				.eq("user_id", userId)
				.gte("purchase_date", format(startOfMonth, "yyyy-MM-dd"))
				.lte("purchase_date", format(today, "yyyy-MM-dd"));

			if (categoryError) throw new Error(categoryError.message);

			const categories = categoryData.reduce(
				(acc, item) => {
					const category = item.category_name || "Other";
					const existing = acc.find((c) => c.name === category);
					if (existing) {
						existing.amount += item.total_amount || 0;
					} else {
						acc.push({
							name: category,
							amount: item.total_amount || 0,
							color: getCategoryColor(category),
						});
					}
					return acc;
				},
				[] as { name: string; amount: number; color: string }[],
			);

			return {
				totalSpent,
				monthlyTrend,
				receiptCount,
				monthlyData,
				categories,
			};
		},
		enabled: !!userId,
	});
};

// Types
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
// Components
const SpendingPieChart: React.FC<{
	data: { name: string; amount: number; color: string }[];
}> = ({ data }) => {
	return (
		<ResponsiveContainer width="100%" height={200}>
			<PieChart>
				<Pie
					data={data}
					cx="50%"
					cy="50%"
					labelLine={false}
					outerRadius={80}
					dataKey="amount"
					label={({ name, percent }) =>
						`${name}: ${(percent * 100).toFixed(0)}%`
					}
				>
					{data.map((entry, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: This is irrelevant for the PieChart
						<Cell key={`cell-${index}`} fill={entry.color} />
					))}
				</Pie>
				<Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
			</PieChart>
		</ResponsiveContainer>
	);
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
	const { data: spendingMetrics, isLoading: spendingLoading } =
		useSpendingMetrics(userId);
	const { data: habitsData, isLoading: habitsLoading } = useHabitsData(userId);

	const isLoading = metricsLoading || spendingLoading || habitsLoading;

	if (isLoading) return <LoadingSpinner />;

	const today = new Date();
	const currentMonth = format(today, "MMMM yyyy");

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
							<Card>
								<CardHeader className="p-2">
									<CardDescription className="text-xs">
										{currentMonth}
									</CardDescription>
								</CardHeader>
								<CardContent className="p-2 pt-0">
									<SpendingPieChart data={spendingMetrics?.categories || []} />
								</CardContent>
							</Card>
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
function getCategoryColor(category: string): string {
	const colors: Record<string, string> = {
		Groceries: "#36A2EB",
		Dining: "#FF6384",
		Utilities: "#FFCE56",
		Entertainment: "#4BC0C0",
		Transportation: "#9966FF",
		Other: "#FF9F40",
	};
	return colors[category] || "#FF9F40";
}
