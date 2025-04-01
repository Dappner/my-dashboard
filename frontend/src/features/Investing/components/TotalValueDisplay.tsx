import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatPercent } from "@/lib/formatting";
import { cn } from "@/lib/utils";
import type { Timeframe } from "@/types/portfolioDailyMetricTypes";
import { usePortfolioMetrics } from "../hooks/usePortfolioMetrics";

interface TotalValueDisplayProps {
	timeframe: Timeframe;
	className?: string;
}

const timeframeToText = (tf: Timeframe): string => {
	switch (tf) {
		case "1W":
			return "past week";
		case "1M":
			return "past month";
		case "3M":
			return "past 3 months";
		case "YTD":
			return "this year";
		case "1Y":
			return "past year";
		case "ALL":
			return "all time";
		default:
			return "";
	}
};

export default function TotalValueDisplay({
	timeframe,
	className,
}: TotalValueDisplayProps) {
	const { metrics, isLoading, error } = usePortfolioMetrics(timeframe);

	if (isLoading) {
		return (
			<div className={`${className} py-4`}>
				<div className="flex justify-between items-center mb-1">
					<Skeleton className="h-5 w-16" />
					<Skeleton className="h-5 w-5 rounded-full" />
				</div>
				<Skeleton className="h-10 w-40 mb-1" />
				<Skeleton className="h-5 w-48" />
			</div>
		);
	}

	if (error) {
		return (
			<div className={`text-red-600 ${className} py-4`}>
				Error loading portfolio value.
			</div>
		);
	}

	const isPositiveChange = metrics?.periodTotalChangePercent
		? metrics.periodTotalChangePercent > 0
		: true;

	const changeText = timeframeToText(timeframe);

	return (
		<div className={cn(className)}>
			<div className="hidden sm:block sm:text-xl font-normal text-gray-700">
				Value
			</div>
			<div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-0.5">
				{formatCurrency(metrics?.currentTotalValue)}
			</div>

			<div
				className={`flex items-center text-sm space-x-1.5 ${
					isPositiveChange ? "text-green-600" : "text-red-600"
				}`}
			>
				<span className="font-medium">
					{isPositiveChange ? "+" : ""}
					{formatCurrency(metrics?.periodTotalChange)}
				</span>
				<span className="font-medium">
					({formatPercent(metrics?.periodTotalChangePercent)})
				</span>
				<span className="text-gray-500">{changeText}</span>
			</div>
		</div>
	);
}
