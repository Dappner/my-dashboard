import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import {
	Cell,
	Legend,
	type LegendProps,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	type TooltipProps,
} from "recharts";
import { prepareDividendPieData } from "../utils";
import { useHoldings } from "@/features/Investing/hooks/useHoldings";

export type PieData = {
	name: string;
	value: number;
	color: string;
};

export default function DividendPieChart() {
	const { holdings, isLoading } = useHoldings();

	const data = React.useMemo(
		() => prepareDividendPieData(holdings),
		[holdings],
	);

	const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
		active,
		payload,
	}) => {
		if (!active || !payload || payload.length === 0) {
			return null;
		}

		const entry = payload[0];
		const total = data.reduce((sum, item) => sum + item.value, 0);
		const percentage = total > 0 ? (entry.value || 0 / total) * 100 : 0;

		return (
			<div className="bg-white p-2 border rounded shadow">
				<p className="font-medium">{entry.name}</p>
				<p className="text-sm">${entry.value?.toFixed(2)}</p>
				<p className="text-xs text-muted-foreground">
					{percentage.toFixed(1)}% of total
				</p>
			</div>
		);
	};
	const CustomLegend: React.FC<LegendProps> = ({ payload }) => {
		if (!payload) {
			return null;
		}
		return (
			<ul className="text-xs space-y-1 mt-2">
				{payload.map((entry, index) => {
					const value = data.find((d) => d.name === entry.value)?.value ?? 0;
					return (
						// biome-ignore lint/suspicious/noArrayIndexKey: Fine for this use case -- no sorting
						<li key={`legend-${index}`} className="flex items-center">
							<div
								className="w-3 h-3 mr-2"
								style={{ backgroundColor: entry.color }}
							/>
							<span>
								{entry.value}: ${value.toFixed(2)}
							</span>
						</li>
					);
				})}
			</ul>
		);
	};

	if (isLoading) {
		return (
			<>
				<div className="flex flex-row items-center justify-between mb-2 h-8">
					<h2 className="text-lg font-semibold text-gray-900">
						Dividend Sources
					</h2>
				</div>
				<Card>
					<CardContent className="h-72 flex items-center justify-center">
						<div>Loading dividend data...</div>
					</CardContent>
				</Card>
			</>
		);
	}

	return (
		<>
			<div className="flex flex-row items-center justify-between mb-2 h-8">
				<h2 className="text-lg font-semibold text-gray-900">
					Dividend Sources
				</h2>
			</div>
			<Card>
				<CardContent>
					<div className="h-72">
						{data.length === 0 ? (
							<div className="h-full flex items-center justify-center text-muted-foreground">
								No dividend data available
							</div>
						) : (
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={data}
										cx="50%"
										cy="50%"
										innerRadius={60}
										outerRadius={80}
										paddingAngle={2}
										dataKey="value"
										label={({ name, percent }) =>
											`${name} (${(percent * 100).toFixed(0)}%)`
										}
										labelLine={false}
									>
										{data.map((entry, index) => (
											<Cell
												key={`cell-${index}-${entry.name}`}
												fill={entry.color}
											/>
										))}
									</Pie>
									<Tooltip content={<CustomTooltip />} />
									<Legend content={<CustomLegend />} />
								</PieChart>
							</ResponsiveContainer>
						)}
					</div>
				</CardContent>
			</Card>
		</>
	);
}
