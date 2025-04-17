import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { format, subDays } from "date-fns";
import { ZapIcon } from "lucide-react";

interface HabitStreakCardProps {
	habit: {
		id: string;
		name: string;
		icon: React.ReactNode;
		streak: number;
		total: number;
		unit: string;
	};
}

export const HabitStreakCard: React.FC<HabitStreakCardProps> = ({ habit }) => {
	const streakGoal = 30; // Example goal
	const streakProgress = (habit.streak / streakGoal) * 100;

	// Generate mock streak days
	const generateStreakDays = () => {
		const days = [];
		for (let i = 0; i < habit.streak; i++) {
			const date = subDays(new Date(), i);
			days.push({
				date,
				label:
					i === 0
						? "Today"
						: i === 1
							? "Yesterday"
							: format(date, "EEE, MMM d"),
				count: Math.floor(Math.random() * 10) + 1,
			});
		}
		return days.reverse();
	};

	const streakDays = generateStreakDays();

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2 text-lg">
					<ZapIcon className="h-4 w-4 text-yellow-500" />
					Current Streak
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex items-center justify-between mb-2">
					<h3 className="text-2xl font-bold">{habit.streak} days</h3>
					<span className="text-sm text-muted-foreground">
						{streakProgress.toFixed(0)}% to {streakGoal} days
					</span>
				</div>

				<Progress value={streakProgress} className="h-2 mb-4" />

				<div className="space-y-2 mt-4">
					{streakDays.slice(-5).map((day, _) => (
						<div
							key={day.date.getDate()}
							className="flex items-center justify-between py-2 border-b last:border-0"
						>
							<span className="text-sm font-medium">{day.label}</span>
							<span className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 text-xs px-2 py-1 rounded">
								{day.count}{" "}
								{day.count === 1 ? habit.unit.replace(/s$/, "") : habit.unit}
							</span>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
};
