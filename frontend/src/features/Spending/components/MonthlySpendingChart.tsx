import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface MonthlySpendingChartProps {
	data: { month: string; amount: number }[];
}

export const MonthlySpendingChart: React.FC<MonthlySpendingChartProps> = ({
	data,
}) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">Monthly Spending Trend</CardTitle>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={300}>
					<BarChart data={data}>
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
