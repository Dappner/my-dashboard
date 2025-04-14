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
import { MonthSwitcher } from "../../components/MonthSwitcher";
import {
	useCurrentMonthSpending,
	useSpendingCategories,
} from "../../hooks/spendingMetricsHooks";
import { CategoryCard } from "./components/CategoryCard";

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

	// Process categories for pie chart: group small categories into "Other" if > 8
	const processedCategories = categories
		? categories.length > 8
			? [
					...categories.slice(0, 7),
					{
						id: "other",
						name: "Other",
						amount: categories
							.slice(7)
							.reduce((sum, cat) => sum + cat.amount, 0),
					},
				]
			: categories
		: [];

	return (
		<PageContainer>
			<header className="mb-6 flex flex-col sm:flex-row sm:justify-between items-center gap-4">
				<h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
					Spending Categories
				</h1>
				<MonthSwitcher
					selectedDate={selectedDate}
					onDateChange={setSelectedDate}
					className="w-full sm:w-auto"
				/>
			</header>
			<div>
				{isLoading ? (
					<div className="space-y-4">
						<Skeleton className="h-60 w-full" />
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
							{Array.from({ length: 6 }).map((_, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: Fine for skeleton
								<Skeleton key={i} className="h-24 w-full" />
							))}
						</div>
					</div>
				) : categories && categories.length > 0 ? (
					<>
						<div className="mb-6 h-64 sm:h-72">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={processedCategories}
										cx="50%"
										cy="50%"
										innerRadius={70}
										outerRadius={90}
										fill="#8884d8"
										paddingAngle={3}
										dataKey="amount"
										nameKey="name"
										label={({ name, percent }) =>
											window.innerWidth > 640
												? `${name} (${(percent * 100).toFixed(0)}%)`
												: false
										}
									>
										{processedCategories.map((entry, index) => (
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
									<Legend
										wrapperStyle={{
											maxHeight: "100px",
											overflowY: "auto",
											fontSize: "0.875rem",
										}}
									/>
								</PieChart>
							</ResponsiveContainer>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
							{categories.map((category, index) => {
								const percentage =
									totalSpent > 0 ? (category.amount / totalSpent) * 100 : 0;

								return (
									<CategoryCard
										key={category.id}
										category={category}
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
