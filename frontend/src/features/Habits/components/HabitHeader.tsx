import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlusIcon } from "lucide-react";
import type React from "react";

interface Habit {
	id: string;
	name: string;
	icon: React.ReactNode;
	streak: number;
	total: number;
	unit: string;
}

interface HabitHeaderProps {
	habits: Habit[];
	activeHabitId: string;
	onHabitChange: (id: string) => void;
}

export const HabitHeader: React.FC<HabitHeaderProps> = ({
	habits,
	activeHabitId,
	onHabitChange,
}) => {
	return (
		<header className="mb-8">
			<h1 className="text-3xl font-bold tracking-tight mb-4">Habit Tracking</h1>

			<div className="flex flex-wrap items-center gap-2">
				<div className="bg-background border rounded-full flex p-1">
					{habits.map((habit) => (
						<Button
							key={habit.id}
							variant={activeHabitId === habit.id ? "default" : "ghost"}
							className={`rounded-full px-3 py-2 flex items-center gap-2 ${
								activeHabitId === habit.id ? "" : "hover:bg-muted"
							}`}
							onClick={() => onHabitChange(habit.id)}
						>
							{habit.icon}
							<span>{habit.name}</span>
							{habit.streak > 0 && (
								<span className="ml-1 bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 text-xs flex items-center">
									{habit.streak}d
								</span>
							)}
						</Button>
					))}
				</div>

				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="outline"
								size="icon"
								className="rounded-full ml-auto"
							>
								<PlusIcon className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Add new habit (coming soon)</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>
		</header>
	);
};
