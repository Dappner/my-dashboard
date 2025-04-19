import { Card } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import type React from "react";

interface HabitMetricsProps {
	count: number | string;
	label: string;
	sublabel: string;
	trend: number;
	icon: React.ReactNode;
	hidePercentage?: boolean;
}

export const HabitMetrics: React.FC<HabitMetricsProps> = ({
	count,
	label,
	sublabel,
	trend,
	icon,
	hidePercentage = false,
}) => {
	const showTrend = trend !== 0 && !hidePercentage;
	const isPositive = trend > 0;

	return (
		<Card className="p-4">
			<div className="flex items-start justify-between">
				<div>
					<p className="text-sm font-medium text-muted-foreground">{label}</p>
					<h3 className="text-2xl font-bold mt-1">{count}</h3>
					<p className="text-xs text-muted-foreground mt-1">{sublabel}</p>
				</div>
				<div
					className={`
            p-2 rounded-full 
            ${isPositive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}
            ${!showTrend ? "bg-gray-100 text-gray-600" : ""}
          `}
				>
					{icon}
				</div>
			</div>

			{showTrend && (
				<div className="mt-3 flex items-center text-xs">
					{isPositive ? (
						<span className="flex items-center text-green-600">
							<ArrowUpIcon className="mr-1 h-3 w-3" />
							{trend.toFixed(1)}%
						</span>
					) : (
						<span className="flex items-center text-red-600">
							<ArrowDownIcon className="mr-1 h-3 w-3" />
							{Math.abs(trend).toFixed(1)}%
						</span>
					)}
					<span className="ml-1 text-muted-foreground">
						vs. previous period
					</span>
				</div>
			)}
		</Card>
	);
};
