import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTimeframeParams } from "@/hooks/useTimeframeParams";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
	type TooltipProps,
} from "recharts";
import { useSpendingTimeSeries } from "../hooks/useSpendingMetrics";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import {
	eachDayOfInterval,
	endOfMonth,
	format,
	parse,
	parseISO,
	startOfMonth,
} from "date-fns";
import type { CurrencyBreakdown } from "@/api/spending/types";
import { getTimeframeRange } from "@/lib/utils";

type ChartPoint = {
	period: string; // raw key, e.g. "2025-04-14" or "2025-04"
	label: string; // fmt for XAxis, e.g. "Apr 14" or "Apr 2025"
	fullDate: string; // fmt for tooltip, e.g. "April 14, 2025"
	breakdown: CurrencyBreakdown[]; // converted per-currency amounts
	total: number; // sum(breakdown)
};

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
	if (active && payload && payload.length) {
		const data = payload[0].payload;
		return (
			<div className="bg-background border rounded p-2 shadow-md z-50 flex flex-col overflow-hidden">
				<span className="text-base font-semibold">{data.period}</span>
				<CurrencyDisplay amount={data.total} fromCurrency={data.currency} />
			</div>
		);
	}
	return null;
};

export const TimeframeSpendingChart: React.FC = () => {
	const { date, timeframe } = useTimeframeParams();
	const { convertAmount } = useCurrencyConversion();
	const { data: timeSeries, isLoading } = useSpendingTimeSeries(
		date,
		timeframe,
	);

	const chartData: ChartPoint[] = useMemo(() => {
		// 1) completely list out all your “period” keys
		const { start, end } = getTimeframeRange(date, timeframe);
		const startDate = new Date(start);
		const endDate = new Date(end);
		const monthly = ["q", "y", "all"].includes(timeframe);

		const allPeriods: string[] = monthly
			? (() => {
					const periods: string[] = [];
					let cursor = startOfMonth(startDate);
					const last = endOfMonth(endDate);
					while (cursor <= last) {
						periods.push(format(cursor, "yyyy-MM"));
						cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
					}
					return periods;
				})()
			: eachDayOfInterval({ start: startDate, end: endDate }).map((d) =>
					format(d, "yyyy-MM-dd"),
				);

		// 2) make a lookup of your real data
		const seriesMap = new Map(timeSeries?.map((pt) => [pt.period, pt]));

		// 3) build your chart points, one per “period”
		return allPeriods.map((period) => {
			// pick out either the real amounts or [] if missing
			const bucket = seriesMap.get(period)?.amounts ?? [];

			// convert each chunk
			const breakdown = bucket.map(({ currency, amount }) => ({
				currency,
				amount: convertAmount(amount, currency),
			}));

			const total = breakdown.reduce((s, b) => s + b.amount, 0);

			// parse into a Date for formatting
			const dt = monthly
				? parse(period, "yyyy-MM", startDate)
				: parseISO(period);

			const label = monthly ? format(dt, "MMM yyyy") : format(dt, "MMM dd");
			const fullDate = monthly
				? format(dt, "MMMM yyyy")
				: format(dt, "MMMM d, yyyy");

			return { period, label, fullDate, breakdown, total };
		});
	}, [timeSeries, timeframe, date, convertAmount]);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">Monthly Spending Trend</CardTitle>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<Skeleton className="h-[300px] w-full" />
				) : (
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={chartData}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="period" />
							<YAxis />
							<Tooltip content={<CustomTooltip />} />
							<Bar dataKey="total" fill="#8884d8" radius={[4, 4, 0, 0]} />
						</BarChart>
					</ResponsiveContainer>
				)}
			</CardContent>
		</Card>
	);
};
