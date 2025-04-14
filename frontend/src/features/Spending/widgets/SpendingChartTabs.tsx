import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { useMemo } from "react";
import { MonthlySpendingChart } from "./MonthlySpendingChart";
import type { DailySpending } from "@/api/spendingApi";

interface SpendingChartTabsProps {
	dailySpending: DailySpending[];
	monthlyData: { month: string; amount: number }[];
	selectedDate: Date;
}

export const SpendingChartTabs: React.FC<SpendingChartTabsProps> = ({
	dailySpending,
	monthlyData,
	selectedDate,
}) => {
	const dailyChartData = useMemo(() => {
		const start = startOfMonth(selectedDate);
		const end = endOfMonth(selectedDate);
		const allDays = eachDayOfInterval({ start, end });

		return allDays.map((day) => {
			const formattedDate = format(day, "yyyy-MM-dd");
			const spending = dailySpending.find((d) => d.date === formattedDate);
			return {
				date: format(day, "MMM dd"),
				amount: spending ? spending.total_amount : 0,
			};
		});
	}, [dailySpending, selectedDate]);

	return (
		<Tabs defaultValue="dailySpending" className="w-full">
			<TabsList className="grid w-full grid-cols-2">
				<TabsTrigger value="dailySpending">Daily Spending</TabsTrigger>
				<TabsTrigger value="monthlyTrend">Monthly Trend</TabsTrigger>
			</TabsList>
			<TabsContent value="dailySpending">
				<Card>
					<CardHeader>
						<CardTitle>Daily Spending</CardTitle>
						<CardDescription>
							{format(selectedDate, "MMMM yyyy")}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={300}>
							<BarChart data={dailyChartData}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="date" />
								<YAxis />
								<Tooltip />
								<Bar dataKey="amount" fill="#8884d8" />
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</TabsContent>
			<TabsContent value="monthlyTrend">
				<MonthlySpendingChart data={monthlyData} />
			</TabsContent>
		</Tabs>
	);
};
