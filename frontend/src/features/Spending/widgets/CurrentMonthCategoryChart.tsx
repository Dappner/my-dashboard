import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useMonthParam } from "@/hooks/useMonthParam";
import { spendingCategoriesRoute } from "@/routes/spending-routes";
import { Link } from "@tanstack/react-router";
import { PieChartIcon } from "lucide-react";
import { CategoryPieChart } from "../components/CategoryPieChart";
import { useSpendingMetrics } from "../hooks/useSpendingMetrics";

interface CurrentMonthCategoryChartProps {
	formattedMonth: string;
}
export default function CurrentMonthCategoryChart({
	formattedMonth,
}: CurrentMonthCategoryChartProps) {
	const { selectedDate } = useMonthParam();

	const { spendingMetrics } = useSpendingMetrics(selectedDate);
	return (
		<Card>
			<CardHeader className="flex flex-col">
				<CardTitle className="text-lg font-semibold flex items-center">
					<PieChartIcon className="size-4 mr-2" />
					<Link to={spendingCategoriesRoute.to} className="hover:underline">
						Spending by Category
					</Link>
				</CardTitle>
				<p className="text-sm text-muted-foreground">{formattedMonth}</p>
			</CardHeader>
			<div className="p-6 pt-0">
				{spendingMetrics?.categories?.length || -1 > 0 ? (
					<CategoryPieChart categories={spendingMetrics?.categories || []} />
				) : (
					<div className="h-[200px] flex items-center justify-center text-muted-foreground">
						No categories for this month
					</div>
				)}
			</div>
		</Card>
	);
}
