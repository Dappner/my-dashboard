import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { alignToPeriodStart, cn, stepPeriod } from "@/lib/utils"; // ← pull in alignToPeriodStart
import { type Timeframe, timeframeLabels } from "@my-dashboard/shared";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"; // ← import refresh icon

export const calendarTimeframes: Timeframe[] = ["w", "m", "q", "y", "all"];
export const rollingTimeframes: Timeframe[] = ["r1w", "r1m", "r3m", "r1y"];

export interface TimeframeControlsProps {
	className?: string;
	timeframe: Timeframe;
	date: Date;
	onTimeframeChange: (period: Timeframe) => void;
	onDateChange: (date: Date) => void;
}

export default function TimeframeControls({
	className,
	timeframe,
	date,
	onTimeframeChange,
	onDateChange,
}: TimeframeControlsProps) {
	const handleValueChange = (value: string) => {
		if (
			value &&
			value !== timeframe &&
			calendarTimeframes.includes(value as Timeframe)
		) {
			onTimeframeChange(value as Timeframe);
		}
	};

	const getDateLabel = () => {
		switch (timeframe) {
			case "w": {
				// start of this week vs selected
				const thisWeekStart = alignToPeriodStart("w", new Date());
				const selectedWeekStart = alignToPeriodStart("w", date);

				// current week?
				if (selectedWeekStart.getTime() === thisWeekStart.getTime()) {
					return "This week";
				}

				// previous week?
				const lastWeekStart = stepPeriod("w", thisWeekStart, -1);
				if (selectedWeekStart.getTime() === lastWeekStart.getTime()) {
					return "Last week";
				}

				// otherwise, full label
				return `Week of ${format(date, "MMM d")}`;
			}
			case "m":
				return format(date, "MMMM yyyy");
			case "q": {
				const quarter = Math.floor(date.getMonth() / 3) + 1;
				return `Q${quarter} ${date.getFullYear()}`;
			}
			case "y":
				return date.getFullYear().toString();
			case "all":
				return "All Time";
			default:
				return format(date, "MMM d, yyyy");
		}
	};

	const handlePrevious = () => {
		onDateChange(stepPeriod(timeframe, date, -1));
	};

	const handleNext = () => {
		const candidate = stepPeriod(timeframe, date, 1);
		if (candidate <= new Date()) {
			onDateChange(candidate);
		}
	};

	const handleSnapToCurrent = () => {
		onDateChange(alignToPeriodStart(timeframe, new Date()));
	};

	const isCurrentPeriod = () => {
		const now = new Date();
		switch (timeframe) {
			case "w": {
				const selectedWeekStart = alignToPeriodStart("w", date);
				const thisWeekStart = alignToPeriodStart("w", now);
				return selectedWeekStart.getTime() === thisWeekStart.getTime();
			}
			case "m":
				return (
					date.getMonth() === now.getMonth() &&
					date.getFullYear() === now.getFullYear()
				);
			case "q": {
				const currentQuarter = Math.floor(now.getMonth() / 3);
				const selectedQuarter = Math.floor(date.getMonth() / 3);
				return (
					selectedQuarter === currentQuarter &&
					date.getFullYear() === now.getFullYear()
				);
			}
			case "y":
				return date.getFullYear() === now.getFullYear();
			case "all":
				return true;
			default:
				return false;
		}
	};

	const isNextDisabled = isCurrentPeriod() || timeframe === "all";

	return (
		<div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-2">
			{timeframe !== "all" && (
				<div className="flex items-center rounded-md border">
					<Button
						variant="ghost"
						size="icon"
						onClick={handlePrevious}
						className="h-8 w-8 rounded-r-none"
					>
						<ChevronLeft className="h-4 w-4" />
						<span className="sr-only">Previous period</span>
					</Button>

					<div className="px-2 py-1 border-x text-sm">{getDateLabel()}</div>

					<Button
						variant="ghost"
						size="icon"
						onClick={handleNext}
						disabled={isNextDisabled}
						className={cn(
							"h-8 w-8 rounded-l-none",
							isNextDisabled && "opacity-50 cursor-not-allowed",
						)}
					>
						<ChevronRight className="h-4 w-4" />
						<span className="sr-only">Next period</span>
					</Button>

					{/* ————— NEW “Snap to Current” BUTTON ————— */}
					<Button
						variant="ghost"
						size="icon"
						onClick={handleSnapToCurrent}
						disabled={isCurrentPeriod()}
						className={cn(
							"h-8 w-8 rounded-l-none",
							isCurrentPeriod() && "opacity-50 cursor-not-allowed",
						)}
						aria-label="Snap to current period"
					>
						<RefreshCw className="h-4 w-4" />
						<span className="sr-only">Snap to current period</span>
					</Button>
				</div>
			)}
			<ToggleGroup
				type="single"
				size="sm"
				value={timeframe}
				onValueChange={handleValueChange}
				className={cn(className, "bg-card rounded-md border")}
				aria-label="Select time frame"
			>
				{calendarTimeframes.map((period) => (
					<ToggleGroupItem
						key={period}
						value={period}
						aria-label={`Select ${timeframeLabels[period]} timeframe`}
						className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground px-4 sm:px-3 cursor-pointer"
					>
						{timeframeLabels[period]}
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</div>
	);
}
