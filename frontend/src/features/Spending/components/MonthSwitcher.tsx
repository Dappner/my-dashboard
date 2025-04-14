import { Button } from "@/components/ui/button";
import { addMonths, format, isAfter, startOfMonth, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MonthSwitcherProps {
	selectedDate: Date;
	onDateChange: (date: Date) => void;
}

export const MonthSwitcher: React.FC<MonthSwitcherProps> = ({
	selectedDate,
	onDateChange,
}) => {
	const currentMonthStart = startOfMonth(new Date());
	const queryDate = startOfMonth(selectedDate);
	const isNextDisabled = !isAfter(currentMonthStart, queryDate);
	const currentMonth = format(queryDate, "MMMM yyyy");

	const handlePrevMonth = () => {
		onDateChange(subMonths(selectedDate, 1));
	};

	const handleNextMonth = () => {
		const nextMonthDate = addMonths(selectedDate, 1);
		const nextMonthStart = startOfMonth(nextMonthDate);
		if (!isAfter(nextMonthStart, currentMonthStart)) {
			onDateChange(nextMonthDate);
		}
	};

	return (
		<div className="flex items-center gap-2">
			<Button
				type="button"
				variant="outline"
				onClick={handlePrevMonth}
				className="p-2 hover:bg-gray-100 rounded-full shadow-xl"
				aria-label="Previous month"
			>
				<ChevronLeft className="h-5 w-5" />
			</Button>
			<span className="text-sm font-medium min-w-[120px] text-center">
				{currentMonth}
			</span>
			<Button
				type="button"
				variant="outline"
				onClick={handleNextMonth}
				className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50 shadow-xl"
				aria-label="Next month"
				disabled={isNextDisabled}
			>
				<ChevronRight className="h-5 w-5" />
			</Button>
		</div>
	);
};
