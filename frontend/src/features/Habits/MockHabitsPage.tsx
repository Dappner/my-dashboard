import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { PageContainer } from "@/components/layout/components/PageContainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, subDays } from "date-fns";
import {
	CalendarIcon,
	Crown,
	ChevronLeft,
	ChevronRight,
	CodeIcon,
	GitBranchIcon,
	TrophyIcon,
	ZapIcon,
} from "lucide-react";
import { useState } from "react";
import { HabitCalendar } from "./components/HabitCalendar";
import { HabitHeader } from "./components/HabitHeader";
import { HabitMetrics } from "./components/HabitMetrics";
import { HabitStreakCard } from "./components/HabitStreakCard";
import { TimeTrackingChart } from "./components/TimeTrackingChart";
import { ChessActivityCard } from "./components/ChessActivityCard";
import { ContributionHeatmap } from "./components/ContributionHeatMap";

// Static data for UI mockup
const mockHabits = [
	{
		id: "github",
		name: "GitHub",
		icon: <GitBranchIcon className="size-5" />,
		streak: 12,
		total: 847,
		unit: "commits",
	},
	{
		id: "coding",
		name: "Coding",
		icon: <CodeIcon className="size-5" />,
		streak: 8,
		total: 342,
		unit: "hours",
	},
	{
		id: "chess",
		name: "Chess",
		icon: <Crown className="size-5" />,
		streak: 5,
		total: 246,
		unit: "games",
	},
];

export default function MockHabitsPage() {
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [activeHabitId, setActiveHabitId] = useState("github");

	const activeHabit =
		mockHabits.find((h) => h.id === activeHabitId) || mockHabits[0];

	const navigateMonth = (direction: "forward" | "backward") => {
		const newDate = new Date(selectedDate);
		if (direction === "forward") {
			newDate.setMonth(newDate.getMonth() + 1);
		} else {
			newDate.setMonth(newDate.getMonth() - 1);
		}
		setSelectedDate(newDate);
	};

	return (
		<PageContainer>
			<HabitHeader
				habits={mockHabits}
				activeHabitId={activeHabitId}
				onHabitChange={setActiveHabitId}
			/>

			<div className="mb-6 flex justify-between items-center">
				<h2 className="text-xl font-semibold flex items-center gap-2">
					{activeHabit.icon}
					{activeHabit.name} Activity
				</h2>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="icon"
						onClick={() => navigateMonth("backward")}
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<span className="mx-2 text-sm font-medium">
						{format(selectedDate, "MMMM yyyy")}
					</span>
					<Button
						variant="outline"
						size="icon"
						onClick={() => navigateMonth("forward")}
						disabled={
							format(new Date(), "yyyyMM") === format(selectedDate, "yyyyMM")
						}
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
				<HabitMetrics
					count={93}
					previousCount={87}
					label="Monthly Activity"
					sublabel={`${activeHabit.unit} this month`}
					trend={6.9}
					icon={activeHabit.icon}
				/>

				<HabitMetrics
					count={activeHabit.streak}
					previousCount={0}
					label="Current Streak"
					sublabel="consecutive days"
					trend={0}
					icon={<ZapIcon className="size-5" />}
					hidePercentage
				/>

				<HabitMetrics
					count={28}
					previousCount={23}
					label="Active Days"
					sublabel="this month"
					trend={21.7}
					icon={<CalendarIcon className="size-5" />}
				/>

				<HabitMetrics
					count={activeHabit.total}
					previousCount={0}
					label="Total Activity"
					sublabel={`lifetime ${activeHabit.unit}`}
					trend={0}
					icon={<TrophyIcon className="size-5" />}
					hidePercentage
				/>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle>Activity Calendar</CardTitle>
						<CardDescription>
							Your daily {activeHabit.name.toLowerCase()} activity over time
						</CardDescription>
					</CardHeader>
					<CardContent>
						{activeHabitId === "github" && (
							<ContributionHeatmap selectedDate={selectedDate} />
						)}
						{activeHabitId === "coding" && (
							<TimeTrackingChart selectedDate={selectedDate} />
						)}
						{activeHabitId === "chess" && (
							<HabitCalendar
								selectedDate={selectedDate}
								habitId={activeHabitId}
							/>
						)}
					</CardContent>
				</Card>

				<div className="space-y-6">
					<HabitStreakCard habit={activeHabit} />

					{activeHabitId === "chess" && <ChessActivityCard />}

					<Card>
						<CardHeader>
							<CardTitle>Detailed Insights</CardTitle>
							<CardDescription>
								Additional metrics for {activeHabit.name.toLowerCase()}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Tabs defaultValue="stats">
								<TabsList className="grid w-full grid-cols-2">
									<TabsTrigger value="stats">Stats</TabsTrigger>
									<TabsTrigger value="history">History</TabsTrigger>
								</TabsList>
								<TabsContent value="stats" className="pt-4 space-y-4">
									<div className="grid grid-cols-2 gap-4">
										<div className="bg-muted rounded-lg p-3">
											<div className="text-sm text-muted-foreground">
												Avg. per day
											</div>
											<div className="text-2xl font-bold">3.1</div>
										</div>
										<div className="bg-muted rounded-lg p-3">
											<div className="text-sm text-muted-foreground">
												Best day
											</div>
											<div className="text-2xl font-bold">17</div>
										</div>
										<div className="bg-muted rounded-lg p-3">
											<div className="text-sm text-muted-foreground">
												Consistency
											</div>
											<div className="text-2xl font-bold">87%</div>
										</div>
										<div className="bg-muted rounded-lg p-3">
											<div className="text-sm text-muted-foreground">
												Best streak
											</div>
											<div className="text-2xl font-bold">24d</div>
										</div>
									</div>
								</TabsContent>
								<TabsContent value="history" className="pt-4">
									<div className="space-y-3">
										{[...Array(5)].map((_, i) => {
											const date = subDays(new Date(), i);
											return (
												<div
													key={date.toString()}
													className="flex justify-between items-center py-2 border-b"
												>
													<span className="text-sm">
														{format(date, "MMM dd, yyyy")}
													</span>
													<span className="font-medium">
														{Math.floor(Math.random() * 10) + 1}{" "}
														{activeHabit.unit}
													</span>
												</div>
											);
										})}
									</div>
								</TabsContent>
							</Tabs>
						</CardContent>
					</Card>
				</div>
			</div>
		</PageContainer>
	);
}
