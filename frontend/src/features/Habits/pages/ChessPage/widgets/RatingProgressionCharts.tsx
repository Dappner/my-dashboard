import type { RatingProgession } from "@/api/chessApi";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMonthParam } from "@/hooks/useMonthParam";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	type TooltipProps,
	XAxis,
	YAxis,
} from "recharts";
import useRatingProgression from "../hooks/useRatingProgression";

// Configuration per time class
const seriesConfig: {
	key: keyof RatingProgession;
	label: string;
	color: string;
	gradientId: string;
}[] = [
	{
		key: "bullet_rating",
		label: "Bullet",
		color: "#8884d8",
		gradientId: "gradBullet",
	},
	{
		key: "blitz_rating",
		label: "Blitz",
		color: "#82ca9d",
		gradientId: "gradBlitz",
	},
	{
		key: "rapid_rating",
		label: "Rapid",
		color: "#ffc658",
		gradientId: "gradRapid",
	},
	{
		key: "daily_rating",
		label: "Daily",
		color: "#ff7300",
		gradientId: "gradDaily",
	},
];

// Custom tooltip: show date and rating
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
	if (active && payload && payload.length) {
		const { payload: data } = payload[0];
		return (
			<div className="bg-white border shadow px-3 py-2 rounded">
				<div className="text-sm font-semibold">
					{seriesConfig.find((s) => s.key === payload[0].dataKey)?.label}
				</div>
				<div className="text-xs text-gray-600">{data.day as string}</div>
				<div className="text-lg">{payload[0].value}</div>
			</div>
		);
	}
	return null;
};

export default function RatingProgressionCharts() {
	const { selectedDate } = useMonthParam();
	const { data, isLoading } = useRatingProgression(selectedDate);

	if (isLoading) {
		return (
			<div className="space-y-2">
				<Skeleton className="h-48 w-full" />
			</div>
		);
	}

	const allValues =
		data?.flatMap((d) =>
			seriesConfig.map((s) => d[s.key]).filter((v): v is number => v != null),
		) ?? [];

	const minRating = Math.min(...allValues);
	const maxRating = Math.max(...allValues);
	const pad = (maxRating - minRating) * 0.05;
	const domain: [number, number] = [minRating - pad, maxRating + pad];

	return (
		<div className="space-y-2">
			{seriesConfig.map(({ key, color, gradientId }) => (
				<Card key={key} className="p-0 h-48">
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart
							data={data}
							margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
							syncId="rating_charts"
						>
							<defs>
								<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor={color} stopOpacity={0.8} />
									<stop offset="95%" stopColor={color} stopOpacity={0.2} />
								</linearGradient>
							</defs>
							<CartesianGrid vertical={false} strokeDasharray="3 3" />
							<XAxis dataKey="day" hide />
							<YAxis hide domain={domain} />
							<Tooltip content={<CustomTooltip />} />
							<Area
								type="monotone"
								dataKey={key}
								stroke={color}
								fill={`url(#${gradientId})`}
								connectNulls={true}
								isAnimationActive={false}
							/>
						</AreaChart>
					</ResponsiveContainer>
				</Card>
			))}
		</div>
	);
}
