import type { Receipt } from "@/api/receiptsApi";
import { spendingMetricsApi } from "@/api/spendingApi";
import { PageContainer } from "@/components/layout/components/PageContainer";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { addMonths, format, isAfter, startOfMonth, subMonths } from "date-fns";
import {
	ArrowDownIcon,
	ArrowUpIcon,
	CalendarIcon,
	ChevronLeft,
	ChevronRight,
	Receipt as ReceiptIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { useSpendingMetrics } from "./hooks/useSpendingMetrics";

const LoadingState: React.FC = () => (
	<div className="flex items-center justify-center min-h-screen">
		<p>Loading spending data...</p>
	</div>
);

interface ErrorStateProps {
	error: Error;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error }) => (
	<div className="flex items-center justify-center min-h-screen text-red-500">
		Error loading spending data: {error.message}
	</div>
);

const NoDataState: React.FC = () => (
	<div className="flex items-center justify-center min-h-screen">
		No spending data available
	</div>
);

const TrendIndicator: React.FC<{ trend: number }> = ({ trend }) => (
	<p className="text-xs text-muted-foreground flex items-center">
		{trend > 0 ? (
			<span className="flex items-center text-red-500">
				<ArrowUpIcon className="mr-1 h-3 w-3" />
				{trend.toFixed(1)}%
			</span>
		) : (
			<span className="flex items-center text-green-500">
				<ArrowDownIcon className="mr-1 h-3 w-3" />
				{Math.abs(trend).toFixed(1)}%
			</span>
		)}
	</p>
);

const ChartContainer: React.FC<{
	title: string;
	children: React.ReactNode;
	height: number;
}> = ({ title, children, height }) => (
	<Card className="hover:shadow-md transition-shadow">
		<CardHeader className="pb-2">
			<CardTitle className="text-lg">{title}</CardTitle>
		</CardHeader>
		<CardContent>
			<ResponsiveContainer width="100%" height={height}>
				{children}
			</ResponsiveContainer>
		</CardContent>
	</Card>
);

const ActivityFeed: React.FC<{ receipts: Receipt[] }> = ({ receipts }) => (
	<Card className="hover:shadow-md transition-shadow">
		<CardHeader className="pb-2">
			<CardTitle className="text-lg">Recent Activity</CardTitle>
			<CardDescription>Last 5 Receipts</CardDescription>
		</CardHeader>
		<CardContent>
			{receipts.length === 0 ? (
				<p className="text-sm text-muted-foreground">No receipts this month.</p>
			) : (
				<ul className="space-y-3">
					{receipts.map((receipt) => (
						<li key={receipt.id} className="flex items-center justify-between">
							<div className="flex items-center">
								<ReceiptIcon className="h-5 w-5 text-muted-foreground mr-2" />
								<div>
									<p className="text-sm font-medium">
										{receipt.store_name || "Unknown Store"}
									</p>
									<p className="text-xs text-muted-foreground">
										{format(new Date(receipt.purchase_date), "MMM d, yyyy")}
									</p>
								</div>
							</div>
							<p className="text-sm font-semibold">
								${receipt.total_amount.toFixed(2)}
							</p>
						</li>
					))}
				</ul>
			)}
		</CardContent>
	</Card>
);

const TopCategory: React.FC<{
	categories: { name: string; amount: number }[];
}> = ({ categories }) => {
	const topCategory = categories.reduce(
		(max, category) => (category.amount > max.amount ? category : max),
		categories[0] || { name: "None", amount: 0 },
	);

	return (
		<Card className="hover:shadow-md transition-shadow">
			<CardHeader className="pb-2">
				<CardTitle className="text-lg">Top Category</CardTitle>
				<CardDescription>This Month</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="text-xl font-bold">{topCategory.name}</div>
				<p className="text-sm text-muted-foreground">
					${topCategory.amount.toFixed(2)}
				</p>
			</CardContent>
		</Card>
	);
};

export default function SpendingOverview() {
	const [selectedDate, setSelectedDate] = useState(() => new Date());

	// Memoize the date to ensure stable query keys
	const queryDate = useMemo(() => {
		const date = new Date(selectedDate);
		date.setDate(1); // Use local day setter
		date.setHours(0, 0, 0, 0); // Use local time setter
		return date;
	}, [selectedDate]);
	const { spendingMetrics, isLoading, error } = useSpendingMetrics(queryDate);

	const { data: recentReceipts, isLoading: receiptsLoading } = useQuery({
		queryKey: ["recentReceipts", selectedDate],
		queryFn: () => spendingMetricsApi.getRecentReceipts(selectedDate),
	});

	const currentMonthStart = startOfMonth(new Date());

	const isNextDisabled = !isAfter(currentMonthStart, queryDate);
	const handlePrevMonth = () => setSelectedDate((prev) => subMonths(prev, 1));

	const handleNextMonth = () =>
		setSelectedDate((prev) => {
			const nextMonthDate = addMonths(prev, 1);
			const nextMonthStart = startOfMonth(nextMonthDate);

			if (isAfter(nextMonthStart, currentMonthStart)) {
				return prev;
			}
			return nextMonthDate; // Okay to update
		});

	const currentMonth = format(queryDate, "MMMM yyyy");
	console.log(currentMonth);

	if (isLoading) return <LoadingState />;
	if (error) return <ErrorState error={error} />;
	if (!spendingMetrics) return <NoDataState />;

	return (
		<PageContainer className="min-h-screen bg-gray-50">
			<div className="container mx-auto px-4 py-6">
				<header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div>
						<h1 className="text-2xl md:text-3xl font-bold tracking-tight">
							Spending Overview
						</h1>
						<p className="text-sm text-muted-foreground">
							Track and analyze your spending habits
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={handlePrevMonth}
							className="p-2 hover:bg-gray-100 rounded-full"
							aria-label="Previous month"
						>
							<ChevronLeft className="h-5 w-5" />
						</Button>
						<span className="text-sm font-medium min-w-[120px] text-center">
							{currentMonth}
						</span>
						<Button
							type="button"
							variant="outline"
							onClick={handleNextMonth}
							className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
							aria-label="Next month"
							disabled={isNextDisabled}
						>
							<ChevronRight className="h-5 w-5" />
						</Button>
					</div>
				</header>

				<div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
					{/* KPI Cards - Compact */}
					<Card className="hover:shadow-md transition-shadow">
						<CardHeader className="pb-2">
							<CardTitle className="text-lg">Total Spent</CardTitle>
							<CardDescription className="text-xs">
								{currentMonth}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-xl font-bold">
								${spendingMetrics.totalSpent.toFixed(2)}
							</div>
							<TrendIndicator trend={spendingMetrics.monthlyTrend} />
						</CardContent>
					</Card>

					<Card className="hover:shadow-md transition-shadow">
						<CardHeader className="pb-2">
							<CardTitle className="text-lg">Receipts</CardTitle>
							<CardDescription className="text-xs">This Month</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-xl font-bold">
								{spendingMetrics.receiptCount}
							</div>
							<p className="text-xs text-muted-foreground flex items-center">
								<CalendarIcon className="mr-1 h-3 w-3" /> {currentMonth}
							</p>
						</CardContent>
					</Card>

					<TopCategory categories={spendingMetrics.categories} />

					{/* Charts */}
					<div className="md:col-span-2 lg:col-span-4">
						<Tabs defaultValue="daily" className="w-full">
							<TabsList className="grid grid-cols-3 mb-4">
								<TabsTrigger value="daily">Daily Average</TabsTrigger>
								<TabsTrigger value="monthly">Monthly Trend</TabsTrigger>
								<TabsTrigger value="categories">Categories</TabsTrigger>
							</TabsList>

							<TabsContent value="daily">
								<ChartContainer title="Daily Average" height={250}>
									<LineChart data={spendingMetrics.monthlyData}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="month" />
										<YAxis />
										<Tooltip
											formatter={(value: number) => [`$${value}`, "Amount"]}
										/>
										<Line
											type="monotone"
											dataKey="amount"
											stroke="#8884d8"
											strokeWidth={2}
										/>
									</LineChart>
								</ChartContainer>
							</TabsContent>

							<TabsContent value="monthly">
								<ChartContainer title="Monthly Trend" height={250}>
									<BarChart data={spendingMetrics.monthlyData}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="month" />
										<YAxis />
										<Tooltip
											formatter={(value: number) => [`$${value}`, "Amount"]}
										/>
										<Bar
											dataKey="amount"
											fill="#8884d8"
											radius={[4, 4, 0, 0]}
										/>
									</BarChart>
								</ChartContainer>
							</TabsContent>

							<TabsContent value="categories">
								<ChartContainer title="Categories" height={250}>
									<BarChart layout="vertical" data={spendingMetrics.categories}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis type="number" />
										<YAxis dataKey="name" type="category" width={100} />
										<Tooltip
											formatter={(value: number) => [`$${value}`, "Amount"]}
										/>
										<Bar
											dataKey="amount"
											fill="#82ca9d"
											radius={[0, 4, 4, 0]}
										/>
									</BarChart>
								</ChartContainer>
							</TabsContent>
						</Tabs>
					</div>

					{/* Activity Feed */}
					<div className="md:col-span-2 lg:col-span-2">
						<ActivityFeed receipts={recentReceipts || []} />
					</div>
				</div>
			</div>
		</PageContainer>
	);
}
