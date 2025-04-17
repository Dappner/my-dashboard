import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ZapIcon } from "lucide-react";

interface Habit {
	id: string;
	name: string;
	icon: React.ReactNode;
	streak: number;
	total: number;
	unit: string;
}

interface HabitStreakCardProps {
	habit: Habit;
}

export const HabitStreakCard: React.FC<HabitStreakCardProps> = ({ habit }) => {
	// Mock data for streak history
	const streakHistory = Array.from({ length: 30 }, (_, i) => {
		// Generate a pattern with some streaks and some gaps
		const isActive = Math.random() > 0.25;
		return {
			day: 30 - i,
			active: isActive,
		};
	});

	// Current streak visualization - mock the current streak
	const currentStreak = habit.streak;
	const bestStreak = 24; // Mock data for best streak
	const streakProgress = (currentStreak / bestStreak) * 100;

	// Consistency metric (percentage of days active in the last 30 days)
	const activeDays = streakHistory.filter((day) => day.active).length;
	const consistency = (activeDays / streakHistory.length) * 100;

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-lg">Current Streak</CardTitle>
				<CardDescription>
					Keep your {habit.name.toLowerCase()} streak going
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
							<ZapIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
						</div>
						<div>
							<div className="text-3xl font-bold">{currentStreak}</div>
							<div className="text-xs text-muted-foreground">days</div>
						</div>
					</div>

					<div className="text-right">
						<div className="text-xs text-muted-foreground">Best</div>
						<div className="text-lg font-semibold">{bestStreak} days</div>
					</div>
				</div>

				<div>
					<div className="flex justify-between mb-1 text-xs">
						<span>Current</span>
						<span>Record</span>
					</div>
					<Progress value={streakProgress} className="h-2" />
				</div>

				<div className="pt-2">
					<div className="text-sm mb-2 flex justify-between items-center">
						<span>Last 30 days</span>
						<span className="text-xs text-muted-foreground">
							{activeDays} active days ({consistency.toFixed(0)}% consistency)
						</span>
					</div>
					<div className="flex gap-1">
						{streakHistory.map((day) => (
							<div
								key={day.day.toString()}
								className={`flex-1 h-2 rounded-full ${
									day.active ? "bg-blue-500 dark:bg-blue-400" : "bg-muted"
								}`}
								title={`Day ${day.day}: ${day.active ? "Active" : "Inactive"}`}
							/>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
