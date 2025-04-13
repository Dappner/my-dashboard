import TimeframeControls from "@/components/controls/TimeFrameControls";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useCurrencyPairs } from "@/hooks/useCurrencyPairs";
import { useHistoricalForexRates } from "@/hooks/useHistoricalForexRates";
import { useLatestForexRate } from "@/hooks/useLatestForexRate";
import type { CurrencyPair, ForexRate, Timeframe } from "@my-dashboard/shared";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

export default function ForexPage() {
	const [selectedPair, setSelectedPair] = useState<string>("USD/EUR");

	const {
		pairs,
		isLoading: isPairsLoading,
		isError: isPairsError,
		error: pairsError,
	} = useCurrencyPairs({ staleTime: 1000 * 60 * 60 }); // 1 hour

	// Fetch latest rate
	const {
		rate,
		isLoading: isLatestLoading,
		isError: isLatestError,
		error: latestError,
	} = useLatestForexRate(selectedPair, { staleTime: 1000 * 60 * 5 }); // 5 minutes

	const [timeframe, setTimeframe] = useState<Timeframe>("1M");
	// Fetch historical rates
	const {
		rates,
		isLoading: isHistoricalLoading,
		isError: isHistoricalError,
		error: historicalError,
	} = useHistoricalForexRates(selectedPair, {
		timeframe,
		staleTime: 1000 * 60 * 5, // 5 minutes
		retry: 2,
	});

	// Loading state
	if (isPairsLoading || isLatestLoading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	// Error state
	if (isPairsError || isLatestError || isHistoricalError) {
		return (
			<Alert variant="destructive" className="m-4">
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>
					{pairsError?.message ||
						latestError?.message ||
						historicalError?.message ||
						"Failed to load data"}
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="container mx-auto p-4 space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold">FOREX Dashboard</h1>
				<Select
					value={selectedPair}
					onValueChange={setSelectedPair}
					disabled={isPairsLoading}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Select pair" />
					</SelectTrigger>
					<SelectContent>
						{pairs.map((pair: CurrencyPair) => (
							<SelectItem
								key={`${pair.base_currency}/${pair.target_currency}`}
								value={`${pair.base_currency}/${pair.target_currency}`}
							>
								{pair.base_currency}/{pair.target_currency}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Latest Rate */}
			<Card>
				<CardHeader>
					<CardTitle>Latest Rate</CardTitle>
					<CardDescription>
						{selectedPair} as of {rate?.date || "N/A"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-2xl font-semibold">
						{isLatestLoading ? (
							<Loader2 className="h-6 w-6 animate-spin inline" />
						) : rate ? (
							rate.rate.toFixed(4)
						) : (
							"No data"
						)}
					</p>
				</CardContent>
			</Card>

			{/* Timeframe Selector */}
			<div className="flex justify-end">
				<TimeframeControls
					timeframe={timeframe}
					onTimeframeChange={setTimeframe}
				/>
			</div>

			{/* Historical Chart */}
			<Card>
				<CardHeader>
					<CardTitle>Historical Rates ({timeframe})</CardTitle>
					<CardDescription>
						Exchange rate trends for {selectedPair}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isHistoricalLoading ? (
						<div className="flex justify-center items-center h-[300px]">
							<Loader2 className="h-8 w-8 animate-spin" />
						</div>
					) : rates.length > 0 ? (
						<div className="h-[300px]">
							<ResponsiveContainer width="100%" height="100%">
								<LineChart
									data={rates}
									margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
								>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis
										dataKey="date"
										tickFormatter={(date) =>
											new Date(date).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
											})
										}
										style={{ fontSize: 12 }}
									/>
									<YAxis
										domain={["auto", "auto"]}
										tickFormatter={(value) => value.toFixed(4)}
										style={{ fontSize: 12 }}
									/>
									<Tooltip
										formatter={(value: number) => [value.toFixed(6), "Rate"]}
										labelFormatter={(label) =>
											new Date(label).toLocaleDateString("en-US", {
												year: "numeric",
												month: "long",
												day: "numeric",
											})
										}
									/>
									<Line
										type="monotone"
										dataKey="rate"
										stroke="#3b82f6"
										dot={false}
										strokeWidth={2}
									/>
								</LineChart>
							</ResponsiveContainer>
						</div>
					) : (
						<p className="text-center text-muted-foreground">
							No historical data available
						</p>
					)}
				</CardContent>
			</Card>

			{/* Recent Rates Table */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Rates</CardTitle>
					<CardDescription>Last 10 rates for {selectedPair}</CardDescription>
				</CardHeader>
				<CardContent>
					{isHistoricalLoading ? (
						<div className="flex justify-center items-center h-[200px]">
							<Loader2 className="h-8 w-8 animate-spin" />
						</div>
					) : rates.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Date</TableHead>
									<TableHead>Rate</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{rates.slice(0, 10).map((rate: ForexRate) => (
									<TableRow key={rate.id}>
										<TableCell>
											{new Date(rate.date).toLocaleDateString("en-US", {
												year: "numeric",
												month: "short",
												day: "numeric",
											})}
										</TableCell>
										<TableCell>{rate.rate.toFixed(6)}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<p className="text-center text-muted-foreground">
							No recent rates available
						</p>
					)}
				</CardContent>
			</Card>

			{/* Refresh Button */}
			<div className="flex justify-end">
				<Button
					onClick={() => {
						setSelectedPair(selectedPair); // Trigger refetch
					}}
					disabled={isHistoricalLoading || isLatestLoading}
				>
					{isHistoricalLoading || isLatestLoading ? (
						<Loader2 className="h-4 w-4 animate-spin mr-2" />
					) : null}
					Refresh
				</Button>
			</div>
		</div>
	);
}
