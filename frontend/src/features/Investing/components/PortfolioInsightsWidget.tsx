import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculatePortfolioMetrics } from "@/services/portfolioMetrics";
import type { Timeframe } from "@/types/portfolioDailyMetricTypes";
import { format, isValid, parseISO } from "date-fns";
import { Calendar, TrendingUp } from "lucide-react";
import { useCalendarEvents } from "../hooks/useCalendarEvents";
import { useHoldings } from "../hooks/useHoldings";
import { usePortfolioDailyMetrics } from "../hooks/usePortfolioDailyMetrics";
import { useTransactions } from "../hooks/useTransactions";

interface PortfolioInsightsWidgetProps {
	timeframe: Timeframe;
}

// Helper type for performer results
type Performer = {
	value: number;
	symbol: string;
} | null; // Allow null if no valid performer is found

export default function PortfolioInsightsWidget({
	timeframe,
}: PortfolioInsightsWidgetProps) {
	const { holdings, isLoading: holdingsLoading } = useHoldings(); // holdings type should be Holding[] | undefined
	const { dailyMetrics: periodMetrics, isLoading: metricsLoading } =
		usePortfolioDailyMetrics(timeframe);
	const { transactions, isLoading: transactionsLoading } = useTransactions();
	const { events, isLoading: eventsLoading } = useCalendarEvents(5); // events type should be CalendarEvent[] | undefined

	const isLoading =
		holdingsLoading || metricsLoading || transactionsLoading || eventsLoading;

	// Ensure calculatePortfolioMetrics handles potentially undefined inputs gracefully
	const metrics = calculatePortfolioMetrics(
		periodMetrics ?? [], // Pass empty array if undefined
		timeframe,
		transactions ?? [], // Pass empty array if undefined
		holdings ?? [], // Pass empty array if undefined
	);

	// --- Safer Performer Calculation ---
	let bestPerformer: Performer = null;
	let worstPerformer: Performer = null;

	if (holdings && holdings.length > 0) {
		let currentBest: Performer = null;
		let currentWorst: Performer = null;

		for (const h of holdings) {
			// Check if the necessary properties are valid numbers/strings
			const percent = h.unrealized_gain_loss_percent;
			const symbol = h.symbol;

			// Only consider holdings with a valid percentage and symbol
			if (typeof percent === "number" && symbol) {
				// Update Best Performer
				if (currentBest === null || percent > currentBest.value) {
					currentBest = { value: percent, symbol: symbol };
				}
				// Update Worst Performer
				if (currentWorst === null || percent < currentWorst.value) {
					currentWorst = { value: percent, symbol: symbol };
				}
			}
		}
		bestPerformer = currentBest;
		worstPerformer = currentWorst;
	}
	// --- End Safer Performer Calculation ---

	// --- Safer Next Dividend Event Calculation ---
	const now = new Date();
	const nextDividendEvent = events?.find((e) => {
		if (e.event_type !== "dividend" || !e.date) {
			return false; // Skip if not dividend or no date string
		}
		try {
			// Use parseISO for better ISO 8601 handling, fallback to new Date
			const eventDate = parseISO(e.date) || new Date(e.date);
			// Check if the date is valid AND in the future
			return isValid(eventDate) && eventDate > now;
		} catch (error) {
			// Handle potential errors during date parsing if needed
			console.error(`Error parsing date for event ${e.id}: ${e.date}`, error);
			return false;
		}
	});
	// --- End Safer Next Dividend Event Calculation ---

	if (isLoading) {
		return <div className="p-4">Loading portfolio insights...</div>; // Added padding
	}

	// Allocation calculations (already seem safe)
	const stocksPercent =
		metrics.currentTotalValue > 0
			? (metrics.currentInvestmentValue / metrics.currentTotalValue) * 100
			: 0;
	const cashPercent = metrics.currentCashPercentage;
	const bondsPercent = 0; // Placeholder

	// Safely format the next dividend date
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
			// Keep formattedNextDividend as "N/A"
		}
	}

	return (
		<Card>
			<CardContent className="pt-4">
				{/* Add padding top for content */}
				<Tabs defaultValue="performance">
					<TabsList className="grid w-full grid-cols-3">
						{/* Make tabs fill width */}
						<TabsTrigger value="performance">Performance</TabsTrigger>
						<TabsTrigger value="allocation">Allocation</TabsTrigger>
						<TabsTrigger value="dividends">Dividends</TabsTrigger>
					</TabsList>

					{/* Performance Tab */}
					<TabsContent value="performance" className="pt-6">
						{/* Increased padding top */}
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium text-muted-foreground">
									{/* Use theme color */}
									Best Performer ({bestPerformer?.symbol ?? "N/A"})
								</span>
								{bestPerformer !== null ? (
									<div className="flex items-center text-emerald-600">
										<span className="font-semibold">
											{/* Use ?? 0 before toFixed */}+
											{(bestPerformer.value ?? 0).toFixed(1)}%
										</span>
										<TrendingUp className="h-4 w-4 ml-1" />
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
									<span className="text-red-600 font-semibold">
										{/* Use ?? 0 before toFixed */}
										{(worstPerformer.value ?? 0).toFixed(1)}%
									</span>
								) : (
									<span className="text-sm text-muted-foreground">N/A</span>
								)}
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium text-muted-foreground">
									{/* Capitalize Timeframe */}
									{timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}{" "}
									Return
								</span>
								<span
									className={`font-semibold ${
										// Use ?? 0 for comparison
										(metrics.periodTotalReturnPercent ?? 0) >= 0
											? "text-emerald-600"
											: "text-red-600"
									}`}
								>
									{/* Use ?? 0 for sign and toFixed */}
									{(metrics.periodTotalReturnPercent ?? 0) >= 0 ? "+" : ""}
									{(metrics.periodTotalReturnPercent ?? 0).toFixed(1)}%
								</span>
							</div>
						</div>
					</TabsContent>

					{/* Allocation Tab */}
					<TabsContent value="allocation" className="pt-6">
						<div className="space-y-5">
							{/* Increased spacing */}
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

					<TabsContent value="dividends" className="pt-6">
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium text-muted-foreground">
									Current Year Dividends
								</span>
								<span className="font-semibold">
									{(metrics.currentYearDividends ?? 0).toFixed(2)}
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium text-muted-foreground">
									Dividend Yield
								</span>
								<span className="font-semibold">
									{(metrics.currentDividendYield ?? 0).toFixed(1)}%
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
