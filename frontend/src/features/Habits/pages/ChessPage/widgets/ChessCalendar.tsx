import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	eachDayOfInterval,
	endOfMonth,
	format,
	getDay,
	startOfMonth,
} from "date-fns";
import useMonthlyActivity from "../hooks/useMonthlyActivity";
import { useMonthParam } from "@/hooks/useMonthParam";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const ChessCalendar: React.FC = () => {
	const { selectedDate } = useMonthParam();
	const { data: activityData, isLoading } = useMonthlyActivity(selectedDate);

	// build activity map using reduce instead of forEach
	const activityMap = (activityData ?? []).reduce<Record<string, number>>(
		(map, row) => {
			if (row.day) {
				map[row.day] = row.games_played || 0;
			}
			return map;
		},
		{},
	);
	const firstDay = startOfMonth(selectedDate);
	const lastDay = endOfMonth(selectedDate);
	const allDays = eachDayOfInterval({ start: firstDay, end: lastDay });

	// prefix nulls for days before first of month
	const startOffset = getDay(firstDay);
	const gridDays: Array<{ date: Date; games: number } | null> = [];
	for (let i = 0; i < startOffset; i++) {
		gridDays.push(null);
	}
	// biome-ignore lint/complexity/noForEach: Can't be fucked rn
	allDays.forEach((day) => {
		const key = format(day, "yyyy-MM-dd");
		const games = activityMap[key] ?? 0;
		gridDays.push({ date: day, games });
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
			<div className="space-y-2">
				{[...Array(5)].map((_, i) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: Loading
						key={i}
						className="h-10 w-full bg-gray-200 animate-pulse rounded"
					/>
				))}
			</div>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Monthly Activity</CardTitle>
			</CardHeader>
			<CardContent>
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
							const games = cell?.games ?? 0;
							return (
								<TooltipProvider key={key}>
									<Tooltip>
										<TooltipTrigger asChild>
											<div
												className={`aspect-square rounded-md flex items-center justify-center
                          ${cell ? "border" : ""}
                          ${games > 0 ? "bg-blue-600 text-white" : "bg-transparent"}`}
											>
												{cell && (
													<span className="text-sm">
														{format(cell.date, "d")}
													</span>
												)}
											</div>
										</TooltipTrigger>
										{cell && (
											<TooltipContent>
												<div className="text-xs">
													<p className="font-medium">
														{format(cell.date, "EEEE, MMM d, yyyy")}
													</p>
													{games > 0 ? (
														<p>Games played: {games}</p>
													) : (
														<p>No games</p>
													)}
												</div>
											</TooltipContent>
										)}
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
