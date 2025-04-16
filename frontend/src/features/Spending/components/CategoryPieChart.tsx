import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { Badge } from "@/components/ui/badge";
import {
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	type TooltipProps,
} from "recharts";

export const CategoryPieChart: React.FC<{
	categories: { name: string; amount: number }[];
}> = ({ categories }) => {
	const COLORS = [
		"#0088FE",
		"#00C49F",
		"#FFBB28",
		"#FF8042",
		"#8884D8",
		"#82ca9d",
	];

	const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;
			return (
				<div className="bg-background border rounded p-2 shadow-md z-50 flex flex-col overflow-hidden">
					<span className="text-base font-semibold">{data.name}</span>
					<CurrencyDisplay amount={data.amount} />
				</div>
			);
		}
		return null;
	};

	// Process categories for pie chart: group small categories into "Other" if > 8
	const processedCategories = categories
		? categories.length > 8
			? [
					...categories.slice(0, 7),
					{
						id: "other",
						name: "Other",
						amount: categories
							.slice(7)
							.reduce((sum, cat) => sum + cat.amount, 0),
					},
				]
			: categories
		: [];

	return (
		<>
			<div className="h-[200px]">
				<ResponsiveContainer width="100%" height="100%">
					<PieChart>
						<Pie
							data={processedCategories}
							cx="50%"
							cy="50%"
							outerRadius={80}
							fill="#8884d8"
							dataKey="amount"
							label={({ name, percent }) => {
								if (percent <= 0.05) return "";

								return `${name}: ${(percent * 100).toFixed(0)}%`;
							}}
							labelLine={false}
						>
							{processedCategories.map((entry, index) => (
								<Cell
									key={`cell-${entry.name}`}
									fill={COLORS[index % COLORS.length]}
								/>
							))}
						</Pie>
						<Tooltip content={<CustomTooltip />} />
					</PieChart>
				</ResponsiveContainer>
			</div>
			<div className="flex flex-wrap gap-1 mt-2 justify-center">
				{categories
					.sort((a, b) => b.amount - a.amount)
					.slice(0, 5)
					.map((category, index) => (
						<Badge
							key={category.name}
							variant="outline"
							className="flex items-center gap-1 text-xs"
							style={{
								borderColor: COLORS[index % COLORS.length],
								color: COLORS[index % COLORS.length],
							}}
						>
							<span
								className="w-2 h-2 rounded-full"
								style={{ backgroundColor: COLORS[index % COLORS.length] }}
							/>
							{category.name}: <CurrencyDisplay amount={category.amount} />
						</Badge>
					))}
			</div>
		</>
	);
};
