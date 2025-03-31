import SectionHeader from "@/components/customs/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { chartColors } from "@/constants";
import { useFundsData } from "@/features/Investing/hooks/useFundsData";
import {
	formatLargeNumber,
	formatPercent,
	formatSectorName,
} from "@/lib/formatting";
import {
	Bar,
	BarChart,
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { useTickerData } from "../hooks/useTickerData";

interface FundTabProps {
	exchange: string;
	tickerSymbol: string;
	tickerId?: string;
}

export default function FundTab({
	exchange,
	tickerSymbol,
	tickerId,
}: FundTabProps) {
	const { yhFinanceData } = useTickerData(exchange, tickerSymbol);

	const { isLoading, topHoldings, sectorWeightings, assetClasses } =
		useFundsData(tickerId);

	const formatDate = (dateString: string): string => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		}).format(date);
	};

	if (isLoading) {
		return (
			<div className="space-y-6 p-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Card>
						<CardHeader className="pb-2">
							<CardTitle>Fund Overview</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{Array(9)
									.fill(0)
									.map((_, i) => (
										// biome-ignore lint/suspicious/noArrayIndexKey: Skeletons
										<div key={i} className="flex justify-between items-center">
											<Skeleton className="h-4 w-32" />
											<Skeleton className="h-4 w-24" />
										</div>
									))}
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle>Asset Allocation</CardTitle>
						</CardHeader>
						<CardContent>
							<Skeleton className="h-64 w-full" />
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	// Handle no data returned from queries
	if (!yhFinanceData || !topHoldings || !sectorWeightings || !assetClasses) {
		return (
			<div className="p-8 text-center">
				<h3 className="text-lg font-medium mb-2">No fund data available</h3>
				<p className="text-gray-500">
					Fund information could not be retrieved for {tickerSymbol}.
				</p>
			</div>
		);
	}

	return (
		<div className="p-4">
			<div className="grid grid-cols-1 md:grid-cols-2 space-y-6 gap-6">
				{/* Fund Overview */}
				<div>
					<SectionHeader title="Fund Overview" />
					<Card className="h-full">
						<CardContent>
							<div className="space-y-3">
								<DataRow
									label="Fund Family"
									value={yhFinanceData.fund_family}
								/>
								<DataRow
									label="Inception Date"
									value={formatDate(yhFinanceData.fund_inception_date || "")}
								/>
								<DataRow label="Legal Type" value={yhFinanceData.legal_type} />
								<DataRow
									label="Net Asset Value"
									value={`$${yhFinanceData.nav_price?.toFixed(2)}`}
								/>
								<DataRow
									label="Market Price"
									value={`$${yhFinanceData.regular_market_price?.toFixed(2)}`}
								/>
								<DataRow
									label="YTD Return"
									value={formatPercent(yhFinanceData.ytd_return)}
								/>
								<DataRow
									label="Expense Ratio"
									value={formatPercent(yhFinanceData.net_expense_ratio)}
								/>
								<DataRow
									label="Market Cap"
									value={formatLargeNumber(yhFinanceData.market_cap)}
								/>
								<DataRow
									label="Dividend Yield"
									value={formatPercent(yhFinanceData.dividend_yield)}
								/>
							</div>
						</CardContent>
					</Card>
				</div>
				{/* Asset Allocation */}
				<div>
					<SectionHeader title="Asset Allocation" />
					<Card className="h-full">
						<CardContent>
							<div className="h-64">
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={assetClasses}
											cx="50%"
											cy="50%"
											labelLine={true}
											label={({ name, percent }) =>
												`${name} (${(percent * 100).toFixed(1)}%)`
											}
											outerRadius={80}
											fill="#8884d8"
											dataKey="weight"
											nameKey="asset_class"
										>
											{assetClasses.map((entry, index) => (
												<Cell
													key={`${entry.id}`}
													fill={chartColors[index % chartColors.length]}
												/>
											))}
										</Pie>
										<Tooltip
											formatter={(value: number) => [
												`${value.toFixed(2)}%`,
												"Weight",
											]}
											labelFormatter={(name) => name}
										/>
									</PieChart>
								</ResponsiveContainer>
							</div>
							<div className="mt-4 grid grid-cols-1 gap-1">
								{assetClasses.map((item, i) => (
									<div
										key={item.id}
										className="flex justify-between items-center text-sm"
									>
										<span className="flex items-center">
											<span
												className="w-3 h-3 mr-2 inline-block rounded-sm"
												style={{
													backgroundColor: chartColors[i % chartColors.length],
												}}
											/>
											{item.asset_class}
										</span>
										<span className="font-medium">
											{item.weight.toFixed(2)}%
										</span>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
				{/* Top Holdings */}
				<div>
					<SectionHeader title="Top Holdings" />
					<Card>
						<CardContent>
							<div className="overflow-x-auto">
								<table className="w-full text-sm">
									<thead>
										<tr className="border-b">
											<th className="text-left py-3 font-medium">Symbol</th>
											<th className="text-left py-3 font-medium">Company</th>
											<th className="text-right py-3 font-medium">Weight</th>
										</tr>
									</thead>
									<tbody>
										{topHoldings.map((holding) => (
											<tr
												key={holding.id}
												className="border-b hover:bg-gray-50"
											>
												<td className="py-3 font-medium">
													{holding.holding_symbol}
												</td>
												<td className="py-3">{holding.holding_name}</td>
												<td className="py-3 text-right">
													{holding.weight.toFixed(2)}%
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							<div className="mt-8 h-64">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart
										data={topHoldings}
										layout="vertical"
										margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
									>
										<XAxis
											type="number"
											domain={[0, "dataMax"]}
											tickFormatter={(value) => `${value}%`}
										/>
										<YAxis
											type="category"
											dataKey="holding_symbol"
											width={60}
											tick={{ fontSize: 12 }}
										/>
										<Tooltip
											formatter={(value: number) => [
												`${value.toFixed(2)}%`,
												"Weight",
											]}
										/>
										<Bar dataKey="weight" fill="#8884d8">
											{topHoldings.map((entry, index) => (
												<Cell
													key={`${entry.id}`}
													fill={chartColors[index % chartColors.length]}
												/>
											))}
										</Bar>
									</BarChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>
				</div>
				{/* Sector Weightings  */}
				<div>
					<SectionHeader title="Sector Weightings" />
					<Card>
						<CardContent>
							<div className="h-64 mb-8">
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={sectorWeightings}
											cx="50%"
											cy="50%"
											outerRadius={80}
											fill="#8884d8"
											dataKey="weight"
											nameKey="sector_name"
											labelLine={false}
											label={({ sector_name, percent }) =>
												percent > 0.05
													? `${formatSectorName(sector_name)} (${(
															percent * 100
														).toFixed(1)}%)`
													: ""
											}
										>
											{sectorWeightings.map((entry, index) => (
												<Cell
													key={`${entry.id}`}
													fill={chartColors[index % chartColors.length]}
												/>
											))}
										</Pie>
										<Tooltip
											formatter={(value: number) => [
												`${value.toFixed(2)}%`,
												"Weight",
											]}
											labelFormatter={(name) => formatSectorName(name)}
										/>
									</PieChart>
								</ResponsiveContainer>
							</div>

							<div className="overflow-x-auto">
								<table className="w-full text-sm">
									<thead>
										<tr className="border-b">
											<th className="text-left py-3 font-medium">Sector</th>
											<th className="text-right py-3 font-medium">Weight</th>
										</tr>
									</thead>
									<tbody>
										{sectorWeightings.map((sector, index) => (
											<tr key={sector.id} className="border-b hover:bg-gray-50">
												<td className="py-3 flex items-center">
													<span
														className="w-3 h-3 mr-2 inline-block rounded-sm"
														style={{
															backgroundColor:
																chartColors[index % chartColors.length],
														}}
													/>
													{formatSectorName(sector.sector_name)}
												</td>
												<td className="py-3 text-right font-medium">
													{sector.weight.toFixed(2)}%
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="text-xs text-gray-500 mt-6 italic">
					Data as of: {new Date().toLocaleDateString()}. Past performance is not
					indicative of future results.
				</div>
			</div>
		</div>
	);
}

// Helper component for consistent data display
function DataRow({
	label,
	value,
}: { label: string; value: string | number | null }) {
	return (
		<div className="flex justify-between items-center border-b border-gray-100 pb-2">
			<span className="text-sm text-gray-500">{label}:</span>
			<span className="font-medium">{value}</span>
		</div>
	);
}
