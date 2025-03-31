import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ArrowDownIcon, ArrowUpIcon, CalendarIcon } from "lucide-react";
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

export default function SpendingOverview() {
	const today = new Date();
	const currentMonth = format(today, "MMMM yyyy");

	const { spendingMetrics, isLoading, error } = useSpendingMetrics();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen p-4">
				<p className="text-base">Loading spending data...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen p-4 text-red-500">
				Error loading spending data: {error.message}
			</div>
		);
	}

	if (!spendingMetrics) {
		return (
			<div className="flex items-center justify-center min-h-screen p-4">
				No spending data available
			</div>
		);
	}

	return (
		<div className="">
			<div className="container mx-auto px-4 py-6 space-y-6">
				<header className="space-y-2">
					<h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
						Spending Overview
					</h1>
					<p className="text-xs text-muted-foreground sm:text-sm">
						Track and analyze your spending habits
					</p>
				</header>

				<Tabs defaultValue="overview" className="w-full">
					<TabsList className="flex flex-wrap gap-2 mb-4">
						<TabsTrigger
							value="overview"
							className="flex-1 min-w-[80px] text-xs sm:text-sm"
						>
							Overview
						</TabsTrigger>
						<TabsTrigger
							value="monthly"
							className="flex-1 min-w-[80px] text-xs sm:text-sm"
						>
							Monthly
						</TabsTrigger>
						<TabsTrigger
							value="categories"
							className="flex-1 min-w-[80px] text-xs sm:text-sm"
						>
							Categories
						</TabsTrigger>
					</TabsList>

					<TabsContent value="overview" className="space-y-4">
						<div className="grid gap-4">
							<div className="grid grid-cols-2 gap-4">
								<Card>
									<CardHeader className="pb-2">
										<CardTitle className="text-xs sm:text-sm">
											Total Spent
										</CardTitle>
										<CardDescription className="text-xs">
											{currentMonth}
										</CardDescription>
									</CardHeader>
									<CardContent className="pt-0">
										<div className="text-lg font-bold sm:text-xl">
											${spendingMetrics.totalSpent.toFixed(2)}
										</div>
										<p className="text-[10px] sm:text-xs text-muted-foreground flex items-center mt-1">
											{spendingMetrics.monthlyTrend > 0 ? (
												<span className="flex items-center text-red-500">
													<ArrowUpIcon className="mr-1 h-3 w-3" />
													{spendingMetrics.monthlyTrend.toFixed(1)}%
												</span>
											) : (
												<span className="flex items-center text-green-500">
													<ArrowDownIcon className="mr-1 h-3 w-3" />
													{Math.abs(spendingMetrics.monthlyTrend).toFixed(1)}%
												</span>
											)}
										</p>
									</CardContent>
								</Card>

								<Card>
									<CardHeader className="pb-2">
										<CardTitle className="text-xs sm:text-sm">
											Receipts
										</CardTitle>
										<CardDescription className="text-xs">
											This Month
										</CardDescription>
									</CardHeader>
									<CardContent className="pt-0">
										<div className="text-lg font-bold sm:text-xl">
											{spendingMetrics.receiptCount}
										</div>
										<p className="text-[10px] sm:text-xs text-muted-foreground flex items-center mt-1">
											<CalendarIcon className="mr-1 h-3 w-3" />
											{currentMonth}
										</p>
									</CardContent>
								</Card>
							</div>

							<Card>
								<CardHeader className="pb-2">
									<CardTitle className="text-xs sm:text-sm">
										Daily Average
									</CardTitle>
									<CardDescription className="text-[10px] sm:text-xs">
										$
										{(
											spendingMetrics.totalSpent /
											new Date(
												today.getFullYear(),
												today.getMonth() + 1,
												0,
											).getDate()
										).toFixed(2)}
										/day
									</CardDescription>
								</CardHeader>
								<CardContent className="pt-0 h-64">
									<ResponsiveContainer width="100%" height="100%">
										<LineChart data={spendingMetrics.monthlyData}>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis
												dataKey="month"
												tick={{ fontSize: 10 }}
												interval="preserveStartEnd"
											/>
											<YAxis tick={{ fontSize: 10 }} />
											<Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
											<Line
												type="monotone"
												dataKey="amount"
												stroke="#8884d8"
												strokeWidth={2}
												dot={false}
											/>
										</LineChart>
									</ResponsiveContainer>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					<TabsContent value="monthly" className="space-y-4">
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-xs sm:text-sm">
									Monthly Trend
								</CardTitle>
								<CardDescription className="text-[10px] sm:text-xs">
									Past 6 months
								</CardDescription>
							</CardHeader>
							<CardContent className="pt-0 h-72">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={spendingMetrics.monthlyData}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis
											dataKey="month"
											tick={{ fontSize: 10 }}
											interval="preserveStartEnd"
										/>
										<YAxis tick={{ fontSize: 10 }} />
										<Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
										<Bar
											dataKey="amount"
											fill="#8884d8"
											radius={[4, 4, 0, 0]}
										/>
									</BarChart>
								</ResponsiveContainer>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="categories" className="space-y-4">
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-xs sm:text-sm">Categories</CardTitle>
								<CardDescription className="text-[10px] sm:text-xs">
									This month
								</CardDescription>
							</CardHeader>
							<CardContent className="pt-0 h-72">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart layout="vertical" data={spendingMetrics.categories}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis
											type="number"
											tick={{ fontSize: 10 }}
											domain={[0, "dataMax"]}
										/>
										<YAxis
											dataKey="name"
											type="category"
											tick={{ fontSize: 10 }}
											width={60}
										/>
										<Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
										<Bar
											dataKey="amount"
											fill="#82ca9d"
											radius={[0, 4, 4, 0]}
										/>
									</BarChart>
								</ResponsiveContainer>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
