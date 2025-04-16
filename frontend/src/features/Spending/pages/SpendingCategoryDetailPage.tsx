import LoadingState from "@/components/layout/components/LoadingState";
import { PageContainer } from "@/components/layout/components/PageContainer";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useMonthParam } from "@/hooks/useMonthParam";
import {
	spendingCategoryDetailRoute,
	spendingReceiptDetailRoute,
} from "@/routes/spending-routes";
import { format } from "date-fns";
import { WheatIcon } from "lucide-react";
import {
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
} from "recharts";
import { MonthSwitcher } from "../components/MonthSwitcher";
import { useCategoryData } from "../hooks/useCategoryData";
import { Link } from "@tanstack/react-router";

// Define colors for the pie chart
const COLORS = [
	"#0088FE",
	"#00C49F",
	"#FFBB28",
	"#FF8042",
	"#8884D8",
	"#82CA9D",
	"#FFC0CB",
	"#A52A2A",
	"#808080",
	"#000000",
];

export default function SpendingCategoryDetailPage() {
	const { categoryId } = spendingCategoryDetailRoute.useParams();
	const { selectedDate, setSelectedDate } = useMonthParam();

	const {
		details: categoryDetails,
		totalSpent,
		receipts,
		items,
		isLoading,
	} = useCategoryData(categoryId || "", selectedDate);

	// Prepare data for pie chart - receipt spending breakdown
	const pieChartData =
		receipts.map((receipt) => ({
			name:
				receipt.store_name ||
				format(new Date(receipt.purchase_date), "MMM d, yyyy"),
			value: items
				.filter((item) => item.receipt_id === receipt.id)
				.reduce((sum, item) => sum + (item.total_price || 0), 0),
			id: receipt.id,
		})) || [];

	if (isLoading) return <LoadingState />;

	return (
		<PageContainer>
			<header className="flex flex-row justify-between">
				<div>
					<div className="flex items-center gap-3">
						{/* TODO: Add Icons to categories */}
						<WheatIcon />
						<h1 className="text-3xl font-bold tracking-tight">
							{categoryDetails?.name || "Unknown Category"}
						</h1>
					</div>
					<span className="text-base text-muted-foreground mt-1">
						{categoryDetails?.description || "No description available"}
					</span>
					<div className="flex flex-col">
						<p className="text-xl font-semibold text-primary">
							Total Spent: ${totalSpent.toFixed(2) || "0.00"}
						</p>
						<p className="text-base font-base text-muted-foreground">
							{receipts.length || 0} receipts
						</p>
					</div>
				</div>
				<MonthSwitcher
					selectedDate={selectedDate}
					onDateChange={setSelectedDate}
				/>
			</header>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle className="text-xl font-semibold">
							Spending Distribution
						</CardTitle>
						<CardDescription>Breakdown by receipt</CardDescription>
					</CardHeader>
					<CardContent className="h-96">
						{isLoading ? (
							<div className="h-full flex items-center justify-center">
								<Skeleton className="h-80 w-80 rounded-full" />
							</div>
						) : pieChartData.length > 0 ? (
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={pieChartData}
										cx="50%"
										cy="50%"
										labelLine={false}
										outerRadius={100}
										fill="#8884d8"
										dataKey="value"
									>
										{pieChartData.map((entry, index) => (
											<Cell
												key={`cell-${entry.id}`}
												fill={COLORS[index % COLORS.length]}
											/>
										))}
									</Pie>
									<Tooltip
										formatter={(value, name) => [
											`$${Number.parseFloat(value.toString()).toFixed(2)}`,
											name,
										]}
										contentStyle={{
											backgroundColor: "hsl(var(--background))",
											border: "1px solid hsl(var(--border))",
											borderRadius: "4px",
										}}
									/>
									<Legend
										layout="vertical"
										align="right"
										verticalAlign="middle"
										wrapperStyle={{ paddingLeft: "20px" }}
									/>
								</PieChart>
							</ResponsiveContainer>
						) : (
							<div className="h-full flex items-center justify-center">
								<p className="text-muted-foreground">No data available</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Receipts List */}
				<Card>
					<CardHeader>
						<CardTitle>
							Receipts with {categoryDetails?.name || "this category"}
						</CardTitle>
						<CardDescription>
							Showing {receipts.length || 0} receipts
						</CardDescription>
					</CardHeader>
					<CardContent className="max-h-[400px] overflow-hidden">
						{isLoading ? (
							<div className="space-y-2">
								{[1, 2, 3].map((i) => (
									<Skeleton key={i} className="h-20 w-full" />
								))}
							</div>
						) : receipts.length ? (
							<ScrollArea className="h-full pr-4">
								<div className="space-y-4">
									{receipts.map((receipt) => {
										const receiptItems = items.filter(
											(item) => item.receipt_id === receipt.id,
										);
										const receiptCategoryTotal = receiptItems.reduce(
											(sum, item) => sum + (item.total_price || 0),
											0,
										);

										return (
											<div
												key={receipt.id}
												className="border rounded-lg p-4 bg-background hover:bg-muted/50 transition-colors"
											>
												<div className="flex justify-between items-start">
													<div>
														<Link
															to={spendingReceiptDetailRoute.to}
															params={{ receiptId: receipt.id }}
															className="font-medium hover:underline"
														>
															{receipt.store_name || "Unknown Store"}
														</Link>
														<p className="text-sm text-muted-foreground">
															{format(
																new Date(receipt.purchase_date),
																"MMM d, yyyy",
															)}
														</p>
													</div>
													<div className="text-right">
														<p className="font-medium">
															${receiptCategoryTotal.toFixed(2)}
														</p>
														<p className="text-xs text-muted-foreground">
															of ${receipt.total_amount.toFixed(2)} total
														</p>
													</div>
												</div>
												<Separator className="my-2" />
												<div className="space-y-1">
													<p className="text-sm font-medium">Category Items:</p>
													{receiptItems.map((item, _) => (
														<div
															key={item.id}
															className="text-sm flex justify-between"
														>
															<span>
																{item.readable_name}
																{item.quantity ? ` (${item.quantity})` : ""}
															</span>
															<span>
																${item.total_price?.toFixed(2) || "0.00"}
															</span>
														</div>
													))}
												</div>
											</div>
										);
									})}
								</div>
							</ScrollArea>
						) : (
							<p className="text-muted-foreground text-center py-4">
								No receipts found
							</p>
						)}
					</CardContent>
				</Card>
			</div>
		</PageContainer>
	);
}
