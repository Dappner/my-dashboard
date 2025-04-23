import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTimeframeParams } from "@/hooks/useTimeframeParams";
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
import { useSpendingMetrics } from "../hooks/useSpendingMetrics";

export const MonthlySpendingChart: React.FC = () => {
	const { date, timeframe } = useTimeframeParams();

	const { spendingMetrics, isLoading } = useSpendingMetrics(date, timeframe);

	const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;
			return (
				<div className="bg-background border rounded p-2 shadow-md z-50 flex flex-col overflow-hidden">
					<span className="text-base font-semibold">{data.month}</span>
					<CurrencyDisplay amount={data.amount} fromCurrency={data.currency} />
				</div>
			);
		}
		return null;
	};

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
						<BarChart data={spendingMetrics?.monthlyData || []}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="month" />
							<YAxis />
							<Tooltip content={<CustomTooltip />} />
							<Bar dataKey="amount" fill="#8884d8" radius={[4, 4, 0, 0]} />
						</BarChart>
					</ResponsiveContainer>
				)}
			</CardContent>
		</Card>
	);
};
