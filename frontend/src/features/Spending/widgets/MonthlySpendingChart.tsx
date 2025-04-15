import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMonthParam } from "@/hooks/useMonthParam";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { useSpendingMetrics } from "../hooks/useSpendingMetrics";

export const MonthlySpendingChart: React.FC = () => {
	const { selectedDate } = useMonthParam();
	const { spendingMetrics, isLoading } = useSpendingMetrics(selectedDate);

	if (isLoading) return;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">Monthly Spending Trend</CardTitle>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={300}>
					<BarChart data={spendingMetrics?.monthlyData || []}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="month" />
						<YAxis />
						<Tooltip
							formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]}
						/>
						<Bar dataKey="amount" fill="#8884d8" radius={[4, 4, 0, 0]} />
					</BarChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
};
