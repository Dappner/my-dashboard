import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_COLORS } from "@/features/Spending/constants";
import { useSpendingCategoriesDetail } from "@/features/Spending/hooks/useSpendingMetrics";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import { useTimeframeParams } from "@/hooks/useTimeframeParams";
import { useMemo } from "react";
import {
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	type TooltipProps,
} from "recharts";

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
	if (active && payload && payload.length) {
		const data = payload[0].payload;
		return (
			<div className="bg-background border rounded p-2 shadow-md z-50 flex flex-col overflow-hidden">
				<span className="text-base font-semibold">{data.name}</span>
				<CurrencyDisplay amount={data.total} />
			</div>
		);
	}
	return null;
};

type ComponentProps = {
	variant: "sm" | "lg";
};

export const CategoryPieChartWidget = ({ variant }: ComponentProps) => {
	const { date, timeframe } = useTimeframeParams();
	const { convertAmount } = useCurrencyConversion();
	const { data: categories } = useSpendingCategoriesDetail(date, timeframe);

	const maxCategories = variant === "sm" ? 5 : 8;

	const convertedCategories = useMemo(() => {
		if (!categories) return [];

		return categories
			.map(({ id, name, amounts }) => {
				const total = amounts.reduce((sum, { amount, currency }) => {
					return sum + convertAmount(amount, currency);
				}, 0);

				return { id, name, total };
			})
			.sort((a, b) => b.total - a.total);
	}, [categories, convertAmount]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: Dumb
	const processedCategories = useMemo(() => {
		if (convertedCategories.length === 0) return [];

		if (convertedCategories.length > maxCategories) {
			const topCategories = convertedCategories.slice(0, maxCategories - 1);
			const otherCategories = convertedCategories.slice(maxCategories - 1);

			const otherTotal = otherCategories.reduce(
				(sum, cat) => sum + cat.total,
				0,
			);

			return [
				...topCategories,
				{
					id: "other",
					name: "Other",
					total: otherTotal,
				},
			];
		}

		return convertedCategories;
	}, [convertedCategories]);

	return (
		<div className="h-full flex flex-col px-2">
			<div className={variant === "sm" ? "h-48" : "h-64"}>
				<ResponsiveContainer width="100%">
					<PieChart>
						<Pie
							data={processedCategories}
							cx="50%"
							cy="50%"
							innerRadius={70}
							outerRadius={90}
							fill="#8884d8"
							paddingAngle={3}
							dataKey="total"
							nameKey="name"
						>
							{processedCategories?.map((entry, index) => (
								<Cell
									key={`cell-${entry.id || index}`}
									fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
								/>
							))}
						</Pie>
						<Tooltip content={<CustomTooltip />} />
					</PieChart>
				</ResponsiveContainer>
			</div>
			<div className="flex mt-2 justify-center mb-2">
				<div className="flex gap-1 gap-y-2 flex-wrap max-w-3xl">
					{processedCategories
						.slice(0, maxCategories)
						.map((category, index) => (
							<Badge
								key={category.name}
								variant="outline"
								className="flex items-center gap-1 text-xs"
								style={{
									borderColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
									color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
								}}
							>
								<span
									className="w-2 h-2 rounded-full"
									style={{
										backgroundColor:
											CATEGORY_COLORS[index % CATEGORY_COLORS.length],
									}}
								/>
								{category.name}: <CurrencyDisplay amount={category.total} />
							</Badge>
						))}
				</div>
			</div>
		</div>
	);
};
