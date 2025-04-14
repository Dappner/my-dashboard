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
import { format } from "date-fns";
import { useParams } from "react-router";
import {
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
} from "recharts";
import {
	useCategoryDetails,
	useCategoryReceipts,
} from "../hooks/useCategoryDetails";

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
	const { categoryId } = useParams<{ categoryId: string }>();

	// Fetch category details and receipts
	const { data: categoryDetails, isLoading: isLoadingDetails } =
		useCategoryDetails(categoryId || "");
	const { data: categoryData, isLoading: isLoadingReceipts } =
		useCategoryReceipts(categoryId || "");

	const isLoading = isLoadingDetails || isLoadingReceipts;

	// Prepare data for pie chart - receipt spending breakdown
	const pieChartData =
		categoryData?.receipts.map((receipt) => ({
			name:
				receipt.store_name ||
				format(new Date(receipt.purchase_date), "MMM d, yyyy"),
			value: categoryData.items
				.filter((item) => item.receipt_id === receipt.id)
				.reduce((sum, item) => sum + (item.total_price || 0), 0),
			id: receipt.id,
		})) || [];

	return (
		<div className="container mx-auto py-6 space-y-6">
			{/* Category Header */}
			<Card>
				<CardHeader className="pb-4">
					{isLoadingDetails ? (
						<>
							<Skeleton className="h-8 w-3/4" />
							<Skeleton className="h-4 w-1/2 mt-2" />
						</>
					) : (
						<>
							<div className="flex items-center gap-3">
								<span className="text-2xl">🧾</span>
								{/* Replace with a category-specific icon */}
								<CardTitle className="text-3xl font-bold tracking-tight">
									{categoryDetails?.name || "Unknown Category"}
								</CardTitle>
							</div>
							<CardDescription className="text-base text-muted-foreground mt-1">
								{categoryDetails?.description || "No description available"}
							</CardDescription>
						</>
					)}
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<Skeleton className="h-6 w-1/3" />
					) : (
						<p className="text-xl font-semibold text-primary">
							Total Spent: ${categoryData?.totalSpent.toFixed(2) || "0.00"}
							across {categoryData?.receipts.length || 0} receipts
						</p>
					)}
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Pie Chart */}
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
							Showing {categoryData?.receipts.length || 0} receipts
						</CardDescription>
					</CardHeader>
					<CardContent className="max-h-[400px] overflow-hidden">
						{isLoading ? (
							<div className="space-y-2">
								{[1, 2, 3].map((i) => (
									<Skeleton key={i} className="h-20 w-full" />
								))}
							</div>
						) : categoryData?.receipts.length ? (
							<ScrollArea className="h-full pr-4">
								<div className="space-y-4">
									{categoryData.receipts.map((receipt) => {
										const receiptItems = categoryData.items.filter(
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
														<h4 className="font-medium">
															{receipt.store_name || "Unknown Store"}
														</h4>
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
																{item.item_name}
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
		</div>
	);
}
