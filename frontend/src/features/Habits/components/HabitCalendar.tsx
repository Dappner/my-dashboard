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

interface HabitCalendarProps {
	selectedDate: Date;
	habitId: string;
}

export const HabitCalendar: React.FC<HabitCalendarProps> = ({
	selectedDate,
	habitId,
}) => {
	// Generate mock data
	const generateMockHabitData = () => {
		const daysInMonth = eachDayOfInterval({
			start: startOfMonth(selectedDate),
			end: endOfMonth(selectedDate),
		});

		return daysInMonth.map((day) => {
			// For chess, generate different types of activities
			if (habitId === "chess") {
				const hasActivity = Math.random() > 0.35;
				const gamesPlayed = hasActivity ? Math.floor(Math.random() * 5) + 1 : 0;
				const won =
					gamesPlayed > 0 ? Math.floor(Math.random() * gamesPlayed) : 0;
				const lost = gamesPlayed - won;
				const ratingChange = hasActivity
					? Math.floor(Math.random() * 40) - 20
					: 0;

				return {
					date: day,
					hasActivity,
					details: {
						gamesPlayed,
						won,
						lost,
						ratingChange,
					},
				};
			}

			// Default activity tracking
			return {
				date: day,
				hasActivity: Math.random() > 0.3,
				details: {
					count: Math.floor(Math.random() * 10) + 1,
				},
			};
		});
	};

	const habitData = generateMockHabitData();

	// Get all dates in the current month organized by weeks
	const createCalendarDays = () => {
		const firstDay = startOfMonth(selectedDate);
		const lastDay = endOfMonth(selectedDate);
		const startOffset = getDay(firstDay); // 0 for Sunday, 1 for Monday, etc.

		// Create array for all days in the month
		const totalDays = [];

		// Add empty cells for days before the 1st of the month
		for (let i = 0; i < startOffset; i++) {
			totalDays.push(null);
		}

		// Add actual days of the month
		eachDayOfInterval({ start: firstDay, end: lastDay }).forEach((day) => {
			const dayData = habitData.find(
				(d) => format(d.date, "yyyy-MM-dd") === format(day, "yyyy-MM-dd"),
			);
			totalDays.push({
				date: day,
				...dayData,
			});
		});

		// Create weeks array (array of arrays, each representing a week)
		const weeks = [];
		let week = [];

		totalDays.forEach((day, index) => {
			week.push(day);

			// Start a new week after Saturday (index % 7 === 6) or at the end
			if (index % 7 === 6 || index === totalDays.length - 1) {
				// If this is the last week and it's not complete, add empty cells
				while (week.length < 7) {
					week.push(null);
				}

				weeks.push(week);
				week = [];
			}
		});

		return weeks;
	};

	const weeks = createCalendarDays();
	const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

	// Get activity class based on the habit and activity data
	const getActivityClass = (day: any) => {
		if (!day || !day.hasActivity) return "bg-muted";

		if (habitId === "chess") {
			// For chess, color based on win/loss ratio
			const { won, lost } = day.details;
			if (won > lost) return "bg-green-500 dark:bg-green-400";
			if (won < lost) return "bg-red-500 dark:bg-red-400";
			return "bg-blue-500 dark:bg-blue-400"; // Equal wins/losses
		}

		// Default coloring for other habits
		return "bg-blue-500 dark:bg-blue-400";
	};

	return (
		<div className="calendar-view">
			<div className="grid grid-cols-7 gap-2 text-center mb-2">
				{weekdays.map((day) => (
					<div key={day} className="text-sm text-muted-foreground">
						{day}
					</div>
				))}
			</div>

			<div className="grid grid-cols-7 gap-2">
				{weeks.flat().map((day, index) => (
					<TooltipProvider key={index}>
						<Tooltip>
							<TooltipTrigger asChild>
								<div
									className={`
                    aspect-square rounded-md flex items-center justify-center relative
                    ${day ? "border" : ""}
                    ${day ? getActivityClass(day) : "bg-transparent"}
                  `}
								>
									{day && (
										<span
											className={`text-sm font-medium ${day.hasActivity ? "text-white" : ""}`}
										>
											{format(day.date, "d")}
										</span>
									)}
								</div>
							</TooltipTrigger>
							{day && (
								<TooltipContent>
									<div className="text-xs">
										<p className="font-medium">
											{format(day.date, "EEEE, MMMM d, yyyy")}
										</p>
										{day.hasActivity ? (
											habitId === "chess" ? (
												<>
													<p>Games: {day.details.gamesPlayed}</p>
													<p>
														Record: {day.details.won}W - {day.details.lost}L
													</p>
													<p
														className={`${day.details.ratingChange > 0 ? "text-green-500" : day.details.ratingChange < 0 ? "text-red-500" : ""}`}
													>
														Rating: {day.details.ratingChange > 0 ? "+" : ""}
														{day.details.ratingChange}
													</p>
												</>
											) : (
												<p>{day.details.count} activities</p>
											)
										) : (
											<p>No activity</p>
										)}
									</div>
								</TooltipContent>
							)}
						</Tooltip>
					</TooltipProvider>
				))}
			</div>
		</div>
	);
};
