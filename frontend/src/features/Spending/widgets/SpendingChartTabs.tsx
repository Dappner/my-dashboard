import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import { useTimeframeParams } from "@/hooks/useTimeframeParams";
import { formatPeriodName, getTimeframeRange } from "@/lib/utils";
import { eachDayOfInterval, format } from "date-fns";
import { useMemo } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	type TooltipProps,
	XAxis,
	YAxis,
} from "recharts";
import { useDailySpending } from "../hooks/useDailySpending";
import { MonthlySpendingChart } from "./MonthlySpendingChart";

export const SpendingChartTabs: React.FC = () => {
	const { timeframe, date } = useTimeframeParams();
	const { convertAmount } = useCurrencyConversion();
	const { data: dailySpending, isLoading } = useDailySpending({
		selectedDate: date,
		timeframe,
	});

	// Get the formatted period title based on timeframe
	const formattedPeriodTitle = formatPeriodName(date, timeframe);

	// Generate chart data based on the timeframe's date range
	const timeframeChartData = useMemo(() => {
		// Get date range for the selected timeframe
		const { start, end } = getTimeframeRange(date, timeframe);
		const startDate = new Date(start);
		const endDate = new Date(end);

		// Generate all days within the range
		const allDays = eachDayOfInterval({ start: startDate, end: endDate });

		// Map days to chart data points
		return allDays.map((day) => {
			const formattedDate = format(day, "yyyy-MM-dd");
			const spending = dailySpending?.find((d) => d.date === formattedDate);

			// Convert currency if needed
			const convertedAmount = spending
				? convertAmount(
						spending.total_amount || 0,
						spending.currency_code || "USD",
					)
				: 0;

			return {
				date: format(day, "MMM dd"),
				fullDate: format(day, "MMM d, yyyy"),
				amount: convertedAmount,
			};
		});
	}, [dailySpending, date, timeframe, convertAmount]);

	// Custom tooltip for bar chart
	const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;
			return (
				<div className="bg-background border rounded p-2 shadow-md z-50 flex flex-col overflow-hidden">
					<span className="text-base font-semibold">{data.fullDate}</span>
					<CurrencyDisplay amount={data.amount} />
				</div>
			);
		}
		return null;
	};

	return (
		<Tabs defaultValue="dailySpending" className="w-full">
			<TabsList className="grid w-full grid-cols-2">
				<TabsTrigger value="dailySpending">Daily Spending</TabsTrigger>
				<TabsTrigger value="monthlyTrend">Trend Analysis</TabsTrigger>
			</TabsList>
			<TabsContent value="dailySpending">
				<Card>
					<CardHeader>
						<CardTitle>Daily Spending</CardTitle>
						<CardDescription>{formattedPeriodTitle}</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-[300px] w-full" />
						) : timeframeChartData.length > 0 ? (
							<ResponsiveContainer width="100%" height={300}>
								<BarChart data={timeframeChartData}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis
										dataKey="date"
										tick={{ fontSize: 12 }}
										tickFormatter={(value, index) => {
											// For longer timeframes, show fewer labels to avoid crowding
											if (timeframeChartData.length > 31) {
												return index % 7 === 0 ? value : "";
											}
											return index % 2 === 0 ? value : "";
										}}
									/>
									<YAxis />
									<Tooltip content={<CustomTooltip />} />
									<Bar dataKey="amount" fill="#8884d8" />
								</BarChart>
							</ResponsiveContainer>
						) : (
							<div className="h-[300px] flex items-center justify-center text-muted-foreground">
								No spending data available for this period
							</div>
						)}
					</CardContent>
				</Card>
			</TabsContent>
			<TabsContent value="monthlyTrend">
				<MonthlySpendingChart />
			</TabsContent>
		</Tabs>
	);
};
