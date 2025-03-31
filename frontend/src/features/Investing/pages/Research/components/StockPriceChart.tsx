import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { HistoricalPrice } from "@/types/historicalPricesTypes";
import type { Holding } from "@/types/holdingsTypes";
import type { TradeView, TransactionType } from "@/types/transactionsTypes";
import { format, parseISO } from "date-fns";
import {
	CartesianGrid,
	Line,
	LineChart,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface StockData {
	date: string;
	close_price: number;
	transactions?: {
		type: TransactionType;
		shares: number;
		price_per_share: number;
		transaction_date: string;
	}[];
}

interface StockPriceChartProps {
	data: HistoricalPrice[];
	holding?: Holding;
	tickerTrades?: TradeView[];
	isLoading?: boolean;
}

export default function StockPriceChart({
	data,
	holding,
	tickerTrades = [],
	isLoading = false,
}: StockPriceChartProps) {
	if (isLoading) {
		return (
			<Card>
				<div className="w-full h-80 p-4">
					<div className="flex items-center justify-between mb-4">
						<Skeleton className="h-4 w-1/4" />
						<Skeleton className="h-4 w-1/6" />
					</div>
					<div className="space-y-2">
						<Skeleton className="h-64 w-full rounded-md" />
						<div className="flex justify-between pt-2">
							<Skeleton className="h-4 w-12" />
							<Skeleton className="h-4 w-12" />
							<Skeleton className="h-4 w-12" />
							<Skeleton className="h-4 w-12" />
							<Skeleton className="h-4 w-12" />
						</div>
					</div>
				</div>
			</Card>
		);
	}

	// Early return if we have no data
	if (!data || data.length === 0) {
		return (
			<Card>
				<div className="w-full h-80 flex items-center justify-center">
					<p className="text-gray-500">No price data available</p>
				</div>
			</Card>
		);
	}

	const chartData: StockData[] = data.map((item) => {
		// Find purchases on this date
		const transactions = tickerTrades
			.filter(
				(trade) =>
					(trade.transaction_type! === "buy" ||
						trade.transaction_type! === "dividend") &&
					trade.transaction_date! === item.date,
			)
			.map((trade) => ({
				type: trade.transaction_type!,
				shares: trade.shares!,
				price_per_share: trade.price_per_share!,
				transaction_date: trade.transaction_date!,
			}));

		return {
			date: item.date!,
			close_price: item.close_price!,
			transactions: transactions.length > 0 ? transactions : undefined,
		};
	});

	const openingPrice = chartData[0].close_price;
	const minPrice = openingPrice * 0.8; // 20% below opening price
	const maxPrice = openingPrice * 1.2; // 20% above opening price

	const formatYAxisTick = (value: number) => {
		return "$" + value.toFixed(2); // Format to 2 decimal places
	};

	// Custom tooltip to show purchase details
	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			const dataPoint = chartData.find((item) => item.date === label);

			return (
				<div className="bg-white p-4 border rounded shadow-lg">
					<p className="font-bold">{format(parseISO(label), "MMM d, yyyy")}</p>
					<p>Price: ${payload[0].value.toFixed(2)}</p>

					{dataPoint?.transactions &&
						dataPoint.transactions.map((transaction, index) => (
							<div
								key={index}
								className={`mt-2 ${
									transaction.type === "buy"
										? "text-green-600"
										: "text-blue-600"
								}`}
							>
								<p>
									{transaction.type === "buy" ? "Purchase" : "Dividend"}:{" "}
									{transaction.shares} shares
								</p>
								<p>
									Price per Share: ${transaction.price_per_share.toFixed(2)}
								</p>
							</div>
						))}
				</div>
			);
		}
		return null;
	};
	return (
		<Card>
			<div className="w-full h-80">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart
						data={chartData}
						margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
					>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis
							dataKey="date"
							tickFormatter={(value: string) =>
								format(parseISO(value), "MMM d")
							}
						/>
						<YAxis
							domain={[minPrice, maxPrice]}
							tickFormatter={formatYAxisTick}
						/>
						<Tooltip content={<CustomTooltip />} />
						<Line
							type="monotone"
							dataKey="close_price"
							stroke="#8884d8"
							fill="#8884d8"
							name="Price"
						/>

						{/* Vertical lines for purchase dates */}
						{tickerTrades
							.filter(
								(trade) =>
									trade.transaction_type === "buy" ||
									trade.transaction_type === "dividend",
							)
							.map((trade, index) => (
								<ReferenceLine
									strokeWidth={2}
									key={index}
									x={trade.transaction_date || undefined}
									stroke={
										trade.transaction_type === "buy" ? "#16a34a" : "#2563eb"
									}
									strokeDasharray="6 6"
									label={{
										// value: `${trade.transaction_type === 'buy' ? 'Buy' : 'Dividend'}: ${trade.shares} shares`,
										// position: 'insideTopRight',
										fill:
											trade.transaction_type === "buy" ? "#16a34a" : "#2563eb",
										// fontSize: 10
									}}
								/>
							))}
						{/* Cost basis reference line */}
						{holding && holding.average_cost_basis && (
							<ReferenceLine
								y={holding.average_cost_basis}
								strokeWidth={2}
								stroke="#000000"
								strokeDasharray="6 6"
								label={{
									value: `Cost Basis: $${holding.average_cost_basis?.toFixed(2)}`,
									position: "insideBottomRight",
									fill: "#16a34a",
									fontSize: 12,
								}}
							/>
						)}
					</LineChart>
				</ResponsiveContainer>
			</div>
		</Card>
	);
}
