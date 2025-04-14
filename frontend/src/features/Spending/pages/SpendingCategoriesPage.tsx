import { PageContainer } from "@/components/layout/components/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import {
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
} from "recharts";
import { CategoryCard } from "../components/CategoryCard";
import {
	useCurrentMonthSpending,
	useSpendingCategories,
} from "../hooks/spendingMetricsHooks";

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
];

export function SpendingCategoriesPage() {
	const [selectedDate, setSelectedDate] = useState(new Date());

	const { data: categories, isLoading: categoriesLoading } =
		useSpendingCategories(selectedDate);
	const { data: currentMonthData, isLoading: currentMonthLoading } =
		useCurrentMonthSpending(selectedDate);

	const isLoading = categoriesLoading || currentMonthLoading;

	// Calculate total spent across all categories
	const totalSpent = currentMonthData?.totalSpent || 0;

	return (
		<PageContainer>
			<div>
				{isLoading ? (
					<div className="space-y-4">
						<Skeleton className="h-60 w-full" />
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							{Array.from({ length: 6 }).map((_, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
								<Skeleton key={i} className="h-28 w-full" />
							))}
						</div>
					</div>
				) : categories && categories.length > 0 ? (
					<>
						<div className="mb-6 h-64">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={categories}
										cx="50%"
										cy="50%"
										innerRadius={60}
										outerRadius={80}
										fill="#8884d8"
										paddingAngle={2}
										dataKey="amount"
										nameKey="name"
										label={({ name, percent }) =>
											`${name} (${(percent * 100).toFixed(0)}%)`
										}
									>
										{categories.map((entry, index) => (
											<Cell
												key={`cell-${entry.id}`}
												fill={COLORS[index % COLORS.length]}
											/>
										))}
									</Pie>
									<Tooltip
										formatter={(value) => [
											`$${Number(value).toFixed(2)}`,
											"Amount",
										]}
									/>
									<Legend />
								</PieChart>
							</ResponsiveContainer>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
							{categories.map((category, index) => {
								const percentage =
									totalSpent > 0 ? (category.amount / totalSpent) * 100 : 0;

								return (
									<CategoryCard
										key={category.id}
										id={category.id}
										name={category.name}
										amount={category.amount}
										percentage={percentage}
										color={COLORS[index % COLORS.length]}
									/>
								);
							})}
						</div>
					</>
				) : (
					<div className="py-12 text-center">
						<p className="text-muted-foreground">
							No spending categories found for this period.
						</p>
					</div>
				)}
			</div>
		</PageContainer>
	);
}
