import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMonthParam } from "@/hooks/useMonthParam";
import {
	eachDayOfInterval,
	endOfMonth,
	format,
	getDay,
	startOfMonth,
} from "date-fns";
import useMonthlyActivity from "../hooks/useMonthlyActivity";

export const ChessCalendar: React.FC = () => {
	const { selectedDate } = useMonthParam();
	const { data: activityData, isLoading } = useMonthlyActivity(selectedDate);

	// build activity map using reduce instead of forEach
	const activityMap = (activityData ?? []).reduce<
		Record<
			string,
			{
				games_played: number;
				wins: number;
				losses: number;
			}
		>
	>((map, row) => {
		if (row.day) {
			map[row.day] = {
				games_played: row.games_played || 0,
				wins: row.wins || 0,
				losses: row.losses || 0,
			};
		}
		return map;
	}, {});

	const firstDay = startOfMonth(selectedDate);
	const lastDay = endOfMonth(selectedDate);
	const allDays = eachDayOfInterval({ start: firstDay, end: lastDay });

	// prefix nulls for days before first of month
	const startOffset = getDay(firstDay);
	const gridDays: Array<{
		date: Date;
		games: number;
		wins: number;
		losses: number;
	} | null> = [];

	for (let i = 0; i < startOffset; i++) {
		gridDays.push(null);
	}

	// biome-ignore lint/complexity/noForEach: Can't be fucked rn
	allDays.forEach((day) => {
		const key = format(day, "yyyy-MM-dd");
		const dayData = activityMap[key] ?? { games_played: 0, wins: 0, losses: 0 };
		gridDays.push({
			date: day,
			games: dayData.games_played,
			wins: dayData.wins,
			losses: dayData.losses,
		});
	});

	// split into weeks
	const weeks: Array<Array<(typeof gridDays)[0]>> = [];
	for (let i = 0; i < gridDays.length; i += 7) {
		const week = gridDays.slice(i, i + 7);
		while (week.length < 7) {
			week.push(null);
		}
		weeks.push(week);
	}

	const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

	if (isLoading) {
		return (
			<Card className="flex flex-col h-full">
				<CardHeader className="pb-2">
					<CardTitle>Monthly Activity</CardTitle>
				</CardHeader>
				<CardContent className="flex-1 flex items-center justify-center">
					<Skeleton className="h-48 w-full rounded" />
				</CardContent>
			</Card>
		);
	}

	// Function to determine day color based on win/loss ratio
	const getDayColor = (wins: number, losses: number, games: number) => {
		if (games === 0) return "bg-transparent";

		if (wins > losses) {
			// const intensity = Math.min(1, wins / games);
			return `bg-green-600 text-white ${games > 3 ? "font-bold" : ""}`;
		}
		if (losses > wins) {
			// const intensity = Math.min(1, losses / games);
			return `bg-red-600 text-white ${games > 3 ? "font-bold" : ""}`;
		}
		// Equal wins and losses - blue shade
		return `bg-blue-600 text-white ${games > 3 ? "font-bold" : ""}`;
	};

	return (
		<Card className="flex flex-col h-full overflow-hidden">
			<CardHeader className="pb-2 shrink-0">
				<CardTitle>Monthly Activity</CardTitle>
			</CardHeader>
			<CardContent className="flex-1 overflow-auto">
				<div className="grid grid-cols-7 gap-1 text-center mb-2 text-xs text-muted-foreground">
					{weekdays.map((day) => (
						<div key={day}>{day}</div>
					))}
				</div>
				<div className="grid grid-cols-7 gap-1">
					{weeks.map((week, wIdx) =>
						week.map((cell, dIdx) => {
							const key = cell
								? format(cell.date, "yyyy-MM-dd")
								: `empty-${wIdx}-${dIdx}`;

							if (!cell) {
								return <div key={key} className="aspect-square" />;
							}

							const { games, wins, losses } = cell;
							const colorClass = getDayColor(wins, losses, games);

							return (
								<TooltipProvider key={key}>
									<Tooltip>
										<TooltipTrigger asChild>
											<div
												className={`aspect-square rounded-md flex items-center justify-center border
                          ${colorClass}`}
											>
												<span className="text-sm">
													{format(cell.date, "d")}
												</span>
											</div>
										</TooltipTrigger>
										<TooltipContent>
											<div className="text-xs">
												<p className="font-medium">
													{format(cell.date, "EEEE, MMM d, yyyy")}
												</p>
												{games > 0 ? (
													<>
														<p>Games played: {games}</p>
														<p className="text-green-600">Wins: {wins}</p>
														<p className="text-red-600">Losses: {losses}</p>
														<p>Draw/Other: {games - wins - losses}</p>
													</>
												) : (
													<p>No games</p>
												)}
											</div>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							);
						}),
					)}
				</div>
			</CardContent>
		</Card>
	);
};
