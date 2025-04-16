import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORY_COLORS } from "@/features/Spending/constants";
import {
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	type TooltipProps,
} from "recharts";

const CustomChartTooltip = ({
	active,
	payload,
}: TooltipProps<number, string>) => {
	if (active && payload && payload.length) {
		const data = payload[0].payload;
		return (
			<div className="bg-background border rounded p-2 shadow-md z-50">
				<p className="font-semibold">{data.name}</p>
				<CurrencyDisplay amount={data.value} />
			</div>
		);
	}
	return null;
};

interface DistributionChartProps {
	isLoading: boolean;
	chartData: {
		name: string;
		value: number;
		id: string;
		currency: string;
	}[];
}

export const DistributionChart = ({
	isLoading,
	chartData,
}: DistributionChartProps) => (
	<Card>
		<CardHeader>
			<CardTitle className="text-xl font-semibold">
				Spending Distribution
			</CardTitle>
			<CardDescription>Breakdown by receipt</CardDescription>
		</CardHeader>
		<CardContent className="h-96">
			{isLoading ? (
				<div className="h-full flex items-center justify-center">
					<Skeleton className="h-80 w-80 rounded-full" />
				</div>
			) : chartData.length > 0 ? (
				<ResponsiveContainer width="100%" height="100%">
					<PieChart>
						<Pie
							data={chartData}
							cx="50%"
							cy="50%"
							labelLine={false}
							outerRadius={100}
							fill="#8884d8"
							dataKey="value"
						>
							{chartData.map((entry, index) => (
								<Cell
									key={`cell-${entry.id}`}
									fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
								/>
							))}
						</Pie>
						<Tooltip content={<CustomChartTooltip />} />
						<Legend
							layout="vertical"
							align="right"
							verticalAlign="middle"
							wrapperStyle={{ paddingLeft: "20px" }}
						/>
					</PieChart>
				</ResponsiveContainer>
			) : (
				<div className="h-full flex items-center justify-center">
					<p className="text-muted-foreground">No data available</p>
				</div>
			)}
		</CardContent>
	</Card>
);
