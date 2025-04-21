import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Timeframe } from "@my-dashboard/shared";
import { format, isValid, parseISO } from "date-fns";
import { Calendar, TrendingUp } from "lucide-react";
import { useCalendarEvents } from "../hooks/useCalendarEvents";
import { useHoldings } from "../hooks/useHoldings";
import { usePortfolioMetrics } from "../hooks/usePortfolioMetrics";

interface PortfolioInsightsWidgetProps {
	timeframe: Timeframe;
}

type Performer = {
	value: number;
	symbol: string;
} | null;

export default function PortfolioInsightsWidget({
	timeframe,
}: PortfolioInsightsWidgetProps) {
	const { holdings, isLoading: holdingsLoading } = useHoldings();

	const { events, isLoading: eventsLoading } = useCalendarEvents(5);

	const { metrics, isLoading: metricsLoading } = usePortfolioMetrics("ALL");
	const isLoading = holdingsLoading || metricsLoading || eventsLoading;

	let bestPerformer: Performer = null;
	let worstPerformer: Performer = null;

	if (holdings && holdings.length > 0) {
		let currentBest: Performer = null;
		let currentWorst: Performer = null;

		for (const h of holdings) {
			const percent = h.unrealized_gain_loss_percent;
			const symbol = h.symbol;

			if (typeof percent === "number" && symbol) {
				if (currentBest === null || percent > currentBest.value) {
					currentBest = { value: percent, symbol };
				}
				if (currentWorst === null || percent < currentWorst.value) {
					currentWorst = { value: percent, symbol };
				}
			}
		}
		bestPerformer = currentBest;
		worstPerformer = currentWorst;
	}

	const now = new Date();
	const nextDividendEvent = events?.find((e) => {
		if (e.event_type !== "dividend" || !e.date) {
			return false;
		}
		try {
			const eventDate = parseISO(e.date) || new Date(e.date);
			return isValid(eventDate) && eventDate > now;
		} catch (error) {
			console.error(`Error parsing date for event ${e.id}: ${e.date}`, error);
			return false;
		}
	});

	if (isLoading) {
		return <div className="p-4">Loading portfolio insights...</div>;
	}

	const currentTotalValue = metrics?.currentTotalValue ?? 0;
	const currentInvestmentValue = metrics?.currentInvestmentValue ?? 0;
	const stocksPercent =
		currentTotalValue > 0
			? (currentInvestmentValue / currentTotalValue) * 100
			: 0;
	const cashPercent = metrics?.currentCashPercentage ?? 0;
	const bondsPercent = 0; // Placeholder

	let formattedNextDividend = "N/A";
	if (nextDividendEvent?.date) {
		try {
			const eventDate =
				parseISO(nextDividendEvent.date) || new Date(nextDividendEvent.date);
			if (isValid(eventDate)) {
				formattedNextDividend = format(eventDate, "MMM dd");
			}
		} catch (error) {
			console.error(
				`Error formatting date for event ${nextDividendEvent.id}: ${nextDividendEvent.date}`,
				error,
			);
		}
	}

	const periodTotalReturnPercent = metrics?.periodTotalReturnPercent ?? 0;
	const currentYearDividends = metrics?.currentYearDividends ?? 0;
	const currentDividendYield = metrics?.currentDividendYield ?? 0;

	return (
		<Card>
			<CardContent className="pt-4">
				<Tabs defaultValue="performance">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="performance">Performance</TabsTrigger>
						<TabsTrigger value="allocation">Allocation</TabsTrigger>
						<TabsTrigger value="dividends">Dividends</TabsTrigger>
					</TabsList>

					{/* Performance Tab */}
					<TabsContent value="performance" className="pt-6">
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium text-muted-foreground">
									Best Performer ({bestPerformer?.symbol ?? "N/A"})
								</span>
								{bestPerformer !== null ? (
									<div
										className={cn(
											"flex items-center",
											bestPerformer.value > 0
												? "text-success-foreground"
												: "text-destructive-foreground",
										)}
									>
										<span className={cn("font-semibold")}>
											+{(bestPerformer.value ?? 0).toFixed(1)}%
										</span>
										<TrendingUp className="size-4 ml-1" />
									</div>
								) : (
									<span className="text-sm text-muted-foreground">N/A</span>
								)}
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium text-muted-foreground">
									Worst Performer ({worstPerformer?.symbol ?? "N/A"})
								</span>
								{worstPerformer !== null ? (
									<span className="text-destructive-foreground font-semibold">
										{(worstPerformer.value ?? 0).toFixed(1)}%
									</span>
								) : (
									<span className="text-sm text-muted-foreground">N/A</span>
								)}
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium text-muted-foreground">
									{timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
									Return
								</span>
								<span
									className={`font-semibold ${
										periodTotalReturnPercent >= 0
											? "text-success-foreground"
											: "text-destructive-foreground"
									}`}
								>
									{periodTotalReturnPercent >= 0 ? "+" : ""}
									{periodTotalReturnPercent.toFixed(1)}%
								</span>
							</div>
						</div>
					</TabsContent>

					{/* Allocation Tab */}
					<TabsContent value="allocation" className="pt-6">
						<div className="space-y-5">
							<div>
								<div className="flex justify-between items-center mb-1">
									<span className="text-sm font-medium text-muted-foreground">
										Stocks
									</span>
									<span className="font-semibold">
										{stocksPercent.toFixed(0)}%
									</span>
								</div>
								<div className="w-full bg-secondary rounded-full h-2">
									<div
										className="bg-blue-600 h-2 rounded-full"
										style={{ width: `${stocksPercent}%` }}
									/>
								</div>
							</div>
							<div>
								<div className="flex justify-between items-center mb-1">
									<span className="text-sm font-medium text-muted-foreground">
										Bonds
									</span>
									<span className="font-semibold">
										{bondsPercent.toFixed(0)}%
									</span>
								</div>
								<div className="w-full bg-secondary rounded-full h-2">
									<div
										className="bg-purple-600 h-2 rounded-full"
										style={{ width: `${bondsPercent}%` }}
									/>
								</div>
							</div>
							<div>
								<div className="flex justify-between items-center mb-1">
									<span className="text-sm font-medium text-muted-foreground">
										Cash
									</span>
									<span className="font-semibold">
										{cashPercent.toFixed(0)}%
									</span>
								</div>
								<div className="w-full bg-secondary rounded-full h-2">
									<div
										className="bg-green-600 h-2 rounded-full"
										style={{ width: `${cashPercent}%` }}
									/>
								</div>
							</div>
						</div>
					</TabsContent>

					{/* Dividends Tab */}
					<TabsContent value="dividends" className="pt-6">
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium text-muted-foreground">
									Current Year Dividends
								</span>
								<span className="font-semibold">
									{currentYearDividends.toFixed(2)}
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium text-muted-foreground">
									Dividend Yield
								</span>
								<span className="font-semibold">
									{currentDividendYield.toFixed(1)}%
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium text-muted-foreground">
									Next Payment
								</span>
								<div className="flex items-center text-muted-foreground">
									<Calendar className="h-4 w-4 mr-1" />
									<span className="font-semibold">{formattedNextDividend}</span>
								</div>
							</div>
						</div>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}
