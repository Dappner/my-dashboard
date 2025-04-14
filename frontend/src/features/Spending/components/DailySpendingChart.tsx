import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { addDays, format, isSameDay, subDays } from "date-fns";
import React, { useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { useDailySpending } from "./useDailySpending";

// Utility to create default date range (last 30 days)
const getDefaultDateRange = () => {
	const end = new Date();
	const start = subDays(end, 30);
	return { from: start, to: end };
};

export function DailySpendingChart() {
	const [dateRange, setDateRange] = useState(getDefaultDateRange());

	const { data, isLoading, error } = useDailySpending({
		startDate: dateRange.from || new Date(),
		endDate: dateRange.to || new Date(),
		enabled: Boolean(dateRange.from && dateRange.to),
	});

	// Format data for the chart
	const chartData = data?.map((day) => ({
		date: format(new Date(day.date), "MMM dd"),
		amount: day.total_amount,
		discount: day.total_discount || 0,
		receiptCount: day.receipt_count,
		rawDate: day.date,
	}));

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Daily Spending</CardTitle>
				<CardDescription>
					Track your grocery spending patterns by day
				</CardDescription>
				<div className="pt-2">
					<DatePickerWithRange date={dateRange} setDate={setDateRange} />
				</div>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<Skeleton className="h-80 w-full" />
				) : error ? (
					<div className="p-4 text-red-500">
						Error loading data: {error.message}
					</div>
				) : !data?.length ? (
					<div className="p-4 text-center text-muted-foreground">
						No spending data available for this period
					</div>
				) : (
					<ResponsiveContainer width="100%" height={400}>
						<BarChart
							data={chartData}
							margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
						>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="date" angle={-45} textAnchor="end" height={70} />
							<YAxis />
							<Tooltip
								formatter={(value, name) => {
									if (name === "amount" || name === "discount") {
										return [
											`$${value.toFixed(2)}`,
											name === "amount" ? "Total Spent" : "Saved",
										];
									}
									return [value, name === "receiptCount" ? "Receipts" : name];
								}}
								labelFormatter={(label, payload) => {
									if (payload && payload.length > 0) {
										const item = payload[0].payload;
										return `${format(new Date(item.rawDate), "EEEE, MMMM d, yyyy")}`;
									}
									return label;
								}}
							/>
							<Legend />
							<Bar dataKey="amount" fill="#8884d8" name="Total Spent" />
							<Bar dataKey="discount" fill="#82ca9d" name="Total Saved" />
						</BarChart>
					</ResponsiveContainer>
				)}
			</CardContent>
		</Card>
	);
}
