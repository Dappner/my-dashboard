import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { CalendarIcon, Receipt as ReceiptIcon, TrendingUp } from "lucide-react";
import { SpendingTrendIndicator } from "./SpendingTrendIndicator";

interface SpendingKpiCardsProps {
	totalSpent: number;
	receiptCount: number;
	categories: { name: string; amount: number }[];
	month: string;
}

export const SpendingKpiCards: React.FC<SpendingKpiCardsProps> = ({
	totalSpent,
	receiptCount,
	categories,
	month,
}) => {
	const topCategory = categories.reduce(
		(max, category) => (category.amount > max.amount ? category : max),
		categories[0] || { name: "None", amount: 0 },
	);

	return (
		<div className="grid gap-4 md:grid-cols-3">
			<Card className="hover:shadow-md transition-shadow">
				<CardHeader className="pb-2">
					<CardTitle className="text-lg flex items-center">
						<TrendingUp className="h-4 w-4 mr-2" />
						Total Spent
					</CardTitle>
					<CardDescription className="text-xs">{month}</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
					<SpendingTrendIndicator trend={0} />{" "}
					{/* Assuming trend is not passed; adjust if needed */}
				</CardContent>
			</Card>

			<Card className="hover:shadow-md transition-shadow">
				<CardHeader className="pb-2">
					<CardTitle className="text-lg flex items-center">
						<ReceiptIcon className="h-4 w-4 mr-2" />
						Receipts
					</CardTitle>
					<CardDescription className="text-xs">This Month</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{receiptCount}</div>
					<p className="text-xs text-muted-foreground flex items-center">
						<CalendarIcon className="mr-1 h-3 w-3" /> {month}
					</p>
				</CardContent>
			</Card>

			<Card className="hover:shadow-md transition-shadow h-full">
				<CardHeader className="pb-2">
					<CardTitle className="text-lg">Top Category</CardTitle>
					<CardDescription>This Month</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-xl font-bold">{topCategory.name}</div>
					<p className="text-sm text-muted-foreground">
						${topCategory.amount.toFixed(2)}
					</p>
				</CardContent>
			</Card>
		</div>
	);
};
