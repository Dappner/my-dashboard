import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface KpiCardProps {
	title: string;
	value: string;
	changePercent?: number;
	percent?: number;
	icon: React.ElementType;
	positiveChange?: boolean;
	additionalInfo?: string;
	percentOnly?: boolean;
	tooltip?: string;
}

export default function KpiCard({
	title,
	value,
	changePercent,
	percent,
	icon: Icon,
	positiveChange = true,
	additionalInfo = "",
	percentOnly = false,
	tooltip = "",
}: KpiCardProps) {
	const formatPercent = (val?: number): string =>
		val !== undefined ? `${val >= 0 ? "+" : ""}${val.toFixed(2)}%` : "";

	const content = (
		<Card className="hover:shadow-md transition-shadow duration-300 border h-full">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-xs font-medium text-muted-foreground truncate max-w-[80%]">
					{title}
				</CardTitle>
				<Icon className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent className="pt-0">
				<div className="text-lg font-bold truncate">{value}</div>
				<div className="flex items-center gap-1 text-[10px] mt-1">
					{!percentOnly && changePercent !== undefined && (
						<span
							className={`${
								positiveChange ? "text-green-600" : "text-red-600"
							} flex items-center`}
						>
							{positiveChange ? (
								<ArrowUp className="h-2.5 w-2.5 mr-0.5" />
							) : (
								<ArrowDown className="h-2.5 w-2.5 mr-0.5" />
							)}
							{formatPercent(changePercent)}
						</span>
					)}
					{percent !== undefined && (
						<span className="text-muted-foreground">
							{percent.toFixed(1)}% {additionalInfo}
						</span>
					)}
					{!percentOnly &&
						changePercent === undefined &&
						percent === undefined && (
							<span className="text-muted-foreground">{additionalInfo}</span>
						)}
				</div>
			</CardContent>
		</Card>
	);

	return tooltip ? (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>{content}</TooltipTrigger>
				<TooltipContent>
					<p>{tooltip}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	) : (
		content
	);
}
