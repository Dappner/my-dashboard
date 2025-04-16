import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { MonthSwitcher } from "@/features/Spending/components/MonthSwitcher";
import { WheatIcon } from "lucide-react";

interface CategoryHeaderProps {
	name: string;
	description?: string;
	totalSpent: number;
	receiptCount: number;
	selectedDate: Date;
	onDateChange: (date: Date) => void;
}

export const CategoryHeader = ({
	name,
	description,
	totalSpent,
	receiptCount,
	selectedDate,
	onDateChange,
}: CategoryHeaderProps) => (
	<header className="flex flex-col md:flex-row justify-between gap-4 mb-6">
		<div>
			<div className="flex items-center gap-3">
				{/* TODO: CATEGORIES SHOULD HAVE ICONS */}
				<WheatIcon className="text-primary" />
				<h1 className="text-3xl font-bold tracking-tight">
					{name || "Unknown Category"}
				</h1>
			</div>
			{description && (
				<span className="text-base text-muted-foreground mt-1 block">
					{description}
				</span>
			)}
			<div className="mt-4">
				<p className="text-xl font-semibold text-primary flex items-center gap-2">
					<span>Total Spent:</span>
					<CurrencyDisplay amount={totalSpent} />
				</p>
				<p className="text-base text-muted-foreground">
					{receiptCount} receipts
				</p>
			</div>
		</div>
		<MonthSwitcher selectedDate={selectedDate} onDateChange={onDateChange} />
	</header>
);
