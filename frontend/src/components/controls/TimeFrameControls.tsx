import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { timeframes } from "@/constants";
import { cn } from "@/lib/utils";
import type { Timeframe } from "@my-dashboard/shared";

export interface TimeframeControlsProps {
	className?: string;
	timeframe: Timeframe;
	onTimeframeChange: (period: Timeframe) => void;
}
export default function TimeframeControls({
	className,
	timeframe,
	onTimeframeChange,
}: TimeframeControlsProps) {
	const handleValueChange = (value: string) => {
		if (
			value &&
			value !== timeframe &&
			timeframes.includes(value as Timeframe)
		) {
			onTimeframeChange(value as Timeframe);
		}
	};

	return (
		<ToggleGroup
			type="single"
			size="sm"
			value={timeframe}
			onValueChange={handleValueChange}
			className={cn(
				className,
				"flex flex-wrap justify-center bg-white shadow-xs",
			)}
			aria-label="Select time frame"
		>
			{timeframes.map((period) => (
				<ToggleGroupItem
					key={period}
					value={period}
					aria-label={`Select ${period} timeframe`}
					className="data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700 px-4 sm:px-3 cursor-pointer"
				>
					{period}
				</ToggleGroupItem>
			))}
		</ToggleGroup>
	);
}
