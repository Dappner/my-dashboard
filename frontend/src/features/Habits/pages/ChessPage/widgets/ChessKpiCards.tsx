import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HabitMetrics } from "@/features/Habits/components/HabitMetrics";
import { useMonthParam } from "@/hooks/useMonthParam";
import { addMonths } from "date-fns";
import { CalendarIcon, ClockIcon, StarIcon, TrophyIcon } from "lucide-react";
import useMonthlySummary from "../hooks/useMonthlySummary";

export default function ChessKpiCards() {
	const { selectedDate } = useMonthParam();
	const prevDate = addMonths(selectedDate, -1);

	const { data: current, isLoading } = useMonthlySummary(selectedDate);
	const { data: previous } = useMonthlySummary(prevDate);

	if (isLoading || !current) {
		return (
			<div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{[...Array(4)].map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: Fine for skeleton
					<Card key={i} className="p-4 animate-pulse">
						<div className="flex items-center justify-between mb-4">
							<Skeleton className="h-4 w-20 bg-gray-200" />
							<Skeleton className="h-6 w-6 rounded-full bg-gray-200" />
						</div>
						<Skeleton className="h-8 w-1/2 mb-2 bg-gray-200" />
						<Skeleton className="h-3 w-1/3 bg-gray-200" />
					</Card>
				))}
			</div>
		);
	}

	// coalesce and previous values
	const totalGames = current.total_games ?? 0;
	const prevGames = previous?.total_games ?? 0;
	const gamesTrend =
		prevGames > 0 ? ((totalGames - prevGames) / prevGames) * 100 : 0;

	const wins = current.wins ?? 0;
	const prevWins = previous?.wins ?? 0;
	const winsTrend = prevWins > 0 ? ((wins - prevWins) / prevWins) * 100 : 0;

	const winRate = current.win_rate_pct ?? 0;

	const accuracy = current.avg_accuracy ?? 0;
	const prevAccuracy = previous?.avg_accuracy ?? 0;
	const accuracyTrend = accuracy - prevAccuracy;

	const totalSeconds = current.total_time_spent_seconds ?? 0;
	const prevSeconds = previous?.total_time_spent_seconds ?? 0;
	const timeTrend =
		prevSeconds > 0 ? ((totalSeconds - prevSeconds) / prevSeconds) * 100 : 0;
	const minutes = Math.floor(totalSeconds / 60);

	const metrics = [
		{
			count: totalGames,
			previousCount: prevGames,
			label: "Games",
			sublabel: "this month",
			trend: gamesTrend,
			icon: <CalendarIcon className="h-5 w-5" />,
		},
		{
			count: wins,
			previousCount: prevWins,
			label: "Wins",
			sublabel: `${winRate.toFixed(2)}% win rate`,
			trend: winsTrend,
			icon: <TrophyIcon className="h-5 w-5" />,
		},
		{
			count: accuracy,
			previousCount: prevAccuracy,
			label: "Avg Accuracy",
			sublabel: "%",
			trend: accuracyTrend,
			icon: <StarIcon className="h-5 w-5" />,
		},
		{
			count: minutes,
			previousCount: Math.floor(prevSeconds / 3600),
			label: "Time Played",
			sublabel: "minutes",
			trend: timeTrend,
			icon: <ClockIcon className="h-5 w-5" />,
		},
	];

	return (
		<div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
			{metrics.map((metric) => (
				<HabitMetrics
					key={metric.label}
					count={metric.count}
					previousCount={metric.previousCount}
					label={metric.label}
					sublabel={metric.sublabel}
					trend={Number(metric.trend.toFixed(2))}
					icon={metric.icon}
				/>
			))}
		</div>
	);
}
