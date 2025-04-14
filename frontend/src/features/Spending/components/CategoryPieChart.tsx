import { Badge } from "@/components/ui/badge";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

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
	return (
		<>
			<div className="h-[200px]">
				<ResponsiveContainer width="100%" height="100%">
					<PieChart>
						<Pie
							data={categories}
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
							{categories.map((entry, index) => (
								<Cell
									key={`cell-${entry.name}`}
									fill={COLORS[index % COLORS.length]}
								/>
							))}
						</Pie>
						<Tooltip
							// biome-ignore lint/suspicious/noExplicitAny: Fine
							formatter={(value: number, _name: string, props: any) => [
								`$${value.toFixed(2)}`,
								props.payload.name, // Shows the category name
							]}
						/>
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
							{category.name}: ${category.amount.toFixed(2)}
						</Badge>
					))}
			</div>
		</>
	);
};
