import TimeframeControls from "@/components/controls/CustomTimeframeControl";
import { PageContainer } from "@/components/layout/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import { useTimeframeParams } from "@/hooks/useTimeframeParams";
import { RefreshCwIcon } from "lucide-react";
import { useCallback, useMemo } from "react";
import { CATEGORY_COLORS } from "../../constants";
import { CategoryCard } from "./components/CategoryCard";
import { useSpendingCategoriesDetail } from "../../hooks/useSpendingMetrics";
import { CategoryPieChartWidget } from "../../widgets/CategoryPieChartWidget";

export function SpendingCategoriesPage() {
	const { date, timeframe, setTimeframe, setDate } = useTimeframeParams();
	const { convertAmount } = useCurrencyConversion();

	const {
		data: categories,
		isLoading,
		error: hasError,
		refetch: refetchCategories,
		isRefetching,
	} = useSpendingCategoriesDetail(date, timeframe);

	const convertedCategories = useMemo(() => {
		if (!categories) return [];

		return categories
			.map(({ id, name, amounts }) => {
				const total = amounts.reduce((sum, { amount, currency }) => {
					return sum + convertAmount(amount, currency);
				}, 0);

				return { id, name, total };
			})
			.sort((a, b) => b.total - a.total);
	}, [categories, convertAmount]);

	const totalSpent = convertedCategories.reduce(
		(acc, val) => acc + val.total,
		0,
	);

	const handleRefresh = useCallback(() => {
		refetchCategories();
	}, [refetchCategories]);

	return (
		<PageContainer>
			<header className="flex flex-col sm:flex-row sm:justify-between items-center gap-4">
				<div className="flex items-center gap-3">
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
								// biome-ignore lint/suspicious/noArrayIndexKey: Fine For skeleton
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
				) : convertedCategories.length > 0 ? (
					<>
						<div className="flex justify-between">
							<h1 className="">Category Breakdown</h1>
							<TimeframeControls
								date={date}
								onDateChange={setDate}
								timeframe={timeframe}
								onTimeframeChange={setTimeframe}
							/>
						</div>
						<div>
							<CategoryPieChartWidget variant="lg" />
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
							{convertedCategories.map((category, index) => {
								const percentage =
									totalSpent > 0 ? (category.total / totalSpent) * 100 : 0;

								return (
									<CategoryCard
										key={category.id}
										category={category}
										percentage={percentage}
										color={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
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

						<Button className="py-4">Set to Current (TO IMPLEMENT)</Button>
					</div>
				)}
			</div>
		</PageContainer>
	);
}
