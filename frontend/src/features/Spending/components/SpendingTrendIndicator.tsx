import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

export const SpendingTrendIndicator: React.FC<{ trend: number }> = ({
	trend,
}) => (
	<p className="text-xs text-muted-foreground flex items-center">
		{trend > 0 ? (
			<span className="flex items-center text-red-500">
				<ArrowUpIcon className="mr-1 h-3 w-3" />
				{trend.toFixed(1)}%
			</span>
		) : (
			<span className="flex items-center text-green-500">
				<ArrowDownIcon className="mr-1 h-3 w-3" />
				{Math.abs(trend).toFixed(1)}%
			</span>
		)}
	</p>
);
