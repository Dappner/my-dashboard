import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMonthParam } from "@/hooks/useMonthParam";
import { eachDayOfInterval, endOfMonth, format, startOfMonth } from "date-fns";
import { useMemo } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { useDailySpending } from "../hooks/useDailySpending";
import { MonthlySpendingChart } from "./MonthlySpendingChart";

export const SpendingChartTabs: React.FC = () => {
	const { selectedDate } = useMonthParam();

	const { data: dailySpending, isLoading } = useDailySpending({
		selectedDate,
	});

	const dailyChartData = useMemo(() => {
		const start = startOfMonth(selectedDate);
		const end = endOfMonth(selectedDate);
		const allDays = eachDayOfInterval({ start, end });

		return allDays.map((day) => {
			const formattedDate = format(day, "yyyy-MM-dd");
			const spending = dailySpending?.find((d) => d.date === formattedDate);
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
						{isLoading ? (
							<Skeleton className="h-[300px] w-full" />
						) : (
							<ResponsiveContainer width="100%" height={300}>
								<BarChart data={dailyChartData}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="date" />
									<YAxis />
									<Tooltip />
									<Bar dataKey="amount" fill="#8884d8" />
								</BarChart>
							</ResponsiveContainer>
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
