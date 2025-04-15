import { PageContainer } from "@/components/layout/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCwIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
} from "recharts";
import { MonthSwitcher } from "../../components/MonthSwitcher";
import { CATEGORY_COLORS } from "../../constants";
import {
	useCurrentMonthSpending,
	useSpendingCategories,
} from "../../hooks/spendingMetricsHooks";
import { CategoryCard } from "./components/CategoryCard";

export function SpendingCategoriesPage() {
	//TODO: Can't useMonthParam -> It leads to infinite fetchs (80 + network requests in 10 seconds.)
	const [selectedDate, setSelectedDate] = useState(new Date());
	const queryClient = useQueryClient();

	const {
		data: categories,
		isLoading: categoriesLoading,
		error: categoriesError,
		refetch: refetchCategories,
		isRefetching: isRefetchingCategories,
	} = useSpendingCategories(selectedDate);

	const {
		data: currentMonthData,
		isLoading: currentMonthLoading,
		error: currentMonthError,
		refetch: refetchCurrentMonth,
		isRefetching: isRefetchingCurrentMonth,
	} = useCurrentMonthSpending(selectedDate);

	const isLoading = categoriesLoading || currentMonthLoading;
	const isRefetching = isRefetchingCategories || isRefetchingCurrentMonth;
	const hasError = categoriesError || currentMonthError;

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

	// Avoid race conditions by clearing queries when month changes
	// biome-ignore lint/correctness/useExhaustiveDependencies: ON Slelected Date change this should run.
	useEffect(() => {
		return () => {
			// Cleanup function that runs when component unmounts or selectedDate changes
			queryClient.cancelQueries({ queryKey: ["spending", "metrics"] });
		};
	}, [selectedDate, queryClient]);

	// Handle manual refresh
	const handleRefresh = useCallback(() => {
		refetchCategories();
		refetchCurrentMonth();
	}, [refetchCategories, refetchCurrentMonth]);

	return (
		<PageContainer>
			<header className="mb-6 flex flex-col sm:flex-row sm:justify-between items-center gap-4">
				<h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
					Spending Categories
				</h1>
				<div className="flex items-center gap-3">
					<MonthSwitcher
						selectedDate={selectedDate}
						onDateChange={setSelectedDate}
						className="w-full sm:w-auto"
					/>
					{(isRefetching || hasError) && (
						<Button
							size="icon"
							variant="outline"
							onClick={handleRefresh}
							disabled={isRefetching}
						>
							<RefreshCwIcon
								className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
							/>
							<span className="sr-only">Refresh</span>
						</Button>
					)}
				</div>
			</header>
			<div>
				{isLoading ? (
					<div className="space-y-4">
						<Skeleton className="h-60 w-full" />
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
							{Array.from({ length: 6 }).map((_, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: Fine for Skeleton
								<Skeleton key={i} className="h-24 w-full" />
							))}
						</div>
					</div>
				) : hasError ? (
					<div className="py-8 text-center">
						<p className="text-destructive mb-4">
							Error loading category data. Please try again.
						</p>
						<Button onClick={handleRefresh} disabled={isRefetching}>
							{isRefetching ? "Refreshing..." : "Retry"}
						</Button>
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
												key={`cell-${entry.id || index}`}
												fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
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
										color={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
										currentMonth={selectedDate}
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
