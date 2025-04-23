import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useTimeframeParams } from "@/hooks/useTimeframeParams";
import { spendingCategoriesRoute } from "@/routes/spending-routes";
import { Link } from "@tanstack/react-router";
import { PieChartIcon } from "lucide-react";
import { CategoryPieChart } from "../components/CategoryPieChart";
import { useSpendingMetrics } from "../hooks/useSpendingMetrics";
import { formatPeriodName } from "@/lib/utils";

export default function CurrentMonthCategoryChart() {
	const { timeframe, date } = useTimeframeParams();

	const formattedPeriodTitle = formatPeriodName(date, timeframe);
	const { spendingMetrics } = useSpendingMetrics(date, timeframe);

	return (
		<Card>
			<CardHeader className="flex flex-col">
				<CardTitle className="text-lg font-semibold flex items-center">
					<PieChartIcon className="size-4 mr-2" />
					<Link to={spendingCategoriesRoute.to} className="hover:underline">
						Spending by Category
					</Link>
				</CardTitle>
				<p className="text-sm text-muted-foreground">{formattedPeriodTitle}</p>
			</CardHeader>
			<div className="p-6 pt-0">
				{spendingMetrics?.categories?.length || -1 > 0 ? (
					<CategoryPieChart categories={spendingMetrics?.categories || []} />
				) : (
					<div className="h-[200px] flex items-center justify-center text-muted-foreground">
						No categories for this period
					</div>
				)}
			</div>
		</Card>
	);
}
