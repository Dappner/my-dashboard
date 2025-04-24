import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import { useTimeframeParams } from "@/hooks/useTimeframeParams";
import { spendingCategoryDetailRoute } from "@/routes/spending-routes";
import { Link } from "@tanstack/react-router";
import { Receipt as ReceiptIcon, TrendingUp } from "lucide-react";
import {
	useCurrentTimeframeSpendingSummary,
	useSpendingCategoriesDetail,
} from "../hooks/useSpendingMetrics";
import { useMemo } from "react";

export const SpendingKpiCards: React.FC = () => {
	const { timeframe, date, dateRange } = useTimeframeParams();
	const { convertAmount } = useCurrencyConversion();

	const { data: categories, isLoading: categoriesLoading } =
		useSpendingCategoriesDetail(date, timeframe);

	const { data: spendingSummary } = useCurrentTimeframeSpendingSummary(
		date,
		timeframe,
	);

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

	const isLoading = categoriesLoading;

	if (isLoading) {
		return (
			<div className="grid gap-4 md:grid-cols-4">
				{[1, 2, 3, 4].map((i) => (
					<Skeleton key={i} className="h-32 w-full rounded-lg" />
				))}
			</div>
		);
	}
	const totalSpend = convertedCategories.reduce(
		(acc, val) => acc + val.total,
		0,
	);
	const endDate = dateRange.end > new Date() ? new Date() : dateRange.end;
	// +1 ensures at least one day
	const daysElapsed = Math.max(
		1,
		Math.ceil(
			(endDate.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24),
		),
	);

	const averageDailySpend = totalSpend / daysElapsed;

	const topCategory = convertedCategories[0] || {
		id: "noCats",
		name: "No Categories",
	};

	return (
		<div className="grid gap-2 md:gap-4 grid-cols-2 lg:grid-cols-4">
			<Card className="hover:shadow-md transition-shadow">
				<CardHeader>
					<CardTitle className="text-lg flex items-center">
						<TrendingUp className="h-4 w-4 mr-2" />
						Total Spent
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">
						<CurrencyDisplay amount={totalSpend} />
					</div>
				</CardContent>
			</Card>

			<Card className="hover:shadow-md transition-shadow">
				<CardHeader>
					<CardTitle className="text-lg flex items-center">
						<ReceiptIcon className="h-4 w-4 mr-2" />
						Receipts
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">
						{spendingSummary?.receiptCount || 0}
					</div>
				</CardContent>
			</Card>

			<Card className="hover:shadow-md transition-shadow h-full">
				<CardHeader>
					<CardTitle className="text-lg">Top Category</CardTitle>
				</CardHeader>
				<CardContent>
					{topCategory?.id ? (
						<>
							<Link
								className="text-xl font-bold hover:underline"
								to={spendingCategoryDetailRoute.to}
								params={{ categoryId: topCategory.id }}
								search={(prev) => ({
									...prev,
									timeframe,
									date: date.toISOString().split("T")[0],
								})}
							>
								{topCategory.name}
							</Link>
							<p className="text-sm text-muted-foreground">
								<CurrencyDisplay amount={topCategory.total} />
							</p>
						</>
					) : (
						<div className="text-xl font-bold text-muted-foreground">
							No categories
						</div>
					)}
				</CardContent>
			</Card>

			<Card className="hover:shadow-md transition-shadow">
				<CardHeader>
					<CardTitle className="text-lg">Daily Spend</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">
						<CurrencyDisplay amount={averageDailySpend} />
					</div>
					{/* TODO:  REIMPLEMENT */}
					{/* <SpendingTrendIndicator trend={spendingMetrics?.monthlyTrend || 0} /> */}
				</CardContent>
			</Card>
		</div>
	);
};
