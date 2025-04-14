import type { CategoryData } from "@/api/spendingApi";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { AppRoutes } from "@/navigation";
import { CalendarIcon, Receipt as ReceiptIcon, TrendingUp } from "lucide-react";
import { Link } from "react-router";
import { SpendingTrendIndicator } from "./SpendingTrendIndicator";

interface SpendingKpiCardsProps {
	totalSpent: number;
	receiptCount: number;
	trend: number;
	averageDailySpend: number;
	categories: CategoryData[];
	month: string;
}

export const SpendingKpiCards: React.FC<SpendingKpiCardsProps> = ({
	totalSpent,
	receiptCount,
	categories,
	month,
	trend,
	averageDailySpend,
}) => {
	const topCategory = categories.reduce(
		(max, category) => (category.amount > max.amount ? category : max),
		categories[0] || { name: "None", amount: 0 },
	);

	return (
		<div className="grid gap-4 md:grid-cols-4">
			<Card className="hover:shadow-md transition-shadow">
				<CardHeader>
					<CardTitle className="text-lg flex items-center">
						<TrendingUp className="h-4 w-4 mr-2" />
						Total Spent
					</CardTitle>
					<CardDescription className="text-xs">{month}</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
					<SpendingTrendIndicator trend={trend} />
				</CardContent>
			</Card>

			<Card className="hover:shadow-md transition-shadow">
				<CardHeader>
					<CardTitle className="text-lg flex items-center">
						<ReceiptIcon className="h-4 w-4 mr-2" />
						Receipts
					</CardTitle>
					<CardDescription className="text-xs">{month}</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{receiptCount}</div>
					<p className="text-xs text-muted-foreground flex items-center">
						<CalendarIcon className="mr-1 h-3 w-3" /> {month}
					</p>
				</CardContent>
			</Card>

			<Card className="hover:shadow-md transition-shadow h-full">
				<CardHeader>
					<CardTitle className="text-lg">Top Category</CardTitle>
					<CardDescription className="text-xs">{month}</CardDescription>
				</CardHeader>
				<CardContent>
					{/* TODO: Should link to this month of Alcohol */}
					<Link
						className="text-xl font-bold"
						to={AppRoutes.spending.categories.detail(topCategory.id)}
					>
						{topCategory.name}
					</Link>
					<p className="text-sm text-muted-foreground">
						${topCategory.amount.toFixed(2)}
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Average Daily Spend</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">
						${averageDailySpend.toFixed(2)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
