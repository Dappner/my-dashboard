import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useHoldings } from "@/features/Investing/hooks/useHoldings";
import {
	calculateAverageYield,
	calculateMonthlyAverage,
	calculateTotalAnnualDividend,
	findNextDividendPayment,
	sortHoldingsByProperty,
} from "@/features/Investing/utils";
import { TrendingUpIcon } from "lucide-react";
import DividendPieChart from "../components/DividendPieChart";
import DividendScheduleChart from "../components/DividendScheduleChart";

export default function DividendTab() {
	const { holdings, isLoading, isError } = useHoldings();
	const annualIncome = holdings ? calculateTotalAnnualDividend(holdings) : 0;
	const averageYield = holdings ? calculateAverageYield(holdings) : 0;
	const monthlyAverage = holdings ? calculateMonthlyAverage(holdings) : 0;
	const nextDividend = holdings ? findNextDividendPayment(holdings) : null;

	// Sort holdings for the tables
	const topContributionHoldings = holdings
		? sortHoldingsByProperty(holdings, "annual_dividend_amount").slice(0, 5)
		: [];

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 space-y-4 sm:space-y-0">
			{/* Schedule Chart - Full width on all screens */}
			<div className="col-span-1 md:col-span-2 lg:col-span-3">
				<DividendScheduleChart />
			</div>

			{/* Dividend Analysis Card */}
			<div className="col-span-1">
				<div className="flex flex-row items-center justify-between pb-2 h-8">
					<h2 className="text-lg font-semibold flex align-bottom text-gray-900">
						<TrendingUpIcon className="mr-2 h-5 w-5" />
						Dividend Analysis
					</h2>
				</div>
				<Card className="h-full">
					<CardContent>
						{isLoading ? (
							<>Loading...</>
						) : isError ? (
							<>Error State...</>
						) : (
							<div className="space-y-3">
								<div className="flex justify-between">
									<span className="text-sm">Annual Income</span>
									<span className="font-medium">
										${annualIncome.toFixed(2)}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm">Portfolio Yield</span>
									<span className="font-medium">
										{averageYield.toFixed(2)}%
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm">Monthly Avg</span>
									<span className="font-medium">
										${monthlyAverage.toFixed(2)}
									</span>
								</div>
								<Separator className="my-2" />
								<div className="text-xs text-muted-foreground">
									Next dividend:
									{nextDividend
										? `${nextDividend.symbol} on ${nextDividend.displayDate}`
										: "None scheduled"}
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Top Dividend Holdings Card */}
			<div className="col-span-1">
				<div className="flex flex-row items-center justify-between pb-2 h-8">
					<h2 className="text-lg font-semibold text-gray-900">
						Top Dividend Holdings
					</h2>
				</div>
				<Card className="h-full">
					<CardContent className="p-0 sm:p-6">
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Ticker</TableHead>
										<TableHead>Shares</TableHead>
										<TableHead>Annual Div</TableHead>
										<TableHead>Yield</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{isLoading ? (
										<TableRow>
											<TableCell colSpan={4} className="text-center">
												Loading...
											</TableCell>
										</TableRow>
									) : isError ? (
										<TableRow>
											<TableCell colSpan={4} className="text-center">
												Error loading data
											</TableCell>
										</TableRow>
									) : topContributionHoldings.length === 0 ? (
										<TableRow>
											<TableCell colSpan={4} className="text-center">
												No dividend holdings
											</TableCell>
										</TableRow>
									) : (
										topContributionHoldings.map((holding) => (
											<TableRow key={holding.ticker_id}>
												<TableCell className="whitespace-nowrap">
													{holding.symbol}
												</TableCell>
												<TableCell>{holding.shares}</TableCell>
												<TableCell>
													${holding.annual_dividend_amount?.toFixed(2)}
												</TableCell>
												<TableCell>
													{holding.cost_basis_dividend_yield_percent?.toFixed(
														2,
													)}
													%
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Dividend Pie Chart */}
			<div className="col-span-1">
				<DividendPieChart />
			</div>
		</div>
	);
}
