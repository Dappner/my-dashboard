import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { CheckSquare, GitCommit } from "lucide-react";

type ChessDay = { date: string; played: boolean };
type CommitDay = { date: string; count: number };
type HabitsData = { chess: ChessDay[]; commits: CommitDay[] };
// Query hooks
export const useHabitsData = (userId?: string) => {
	return useQuery<HabitsData, Error>({
		queryKey: ["habitsData", userId],
		queryFn: async () => {
			if (!userId) throw new Error("User ID is required");
			return {
				chess: [
					{ date: "2025-03-25", played: true },
					{ date: "2025-03-26", played: false },
					{ date: "2025-03-27", played: true },
					{ date: "2025-03-28", played: true },
					{ date: "2025-03-29", played: false },
					{ date: "2025-03-30", played: true },
					{ date: "2025-03-31", played: false },
				],
				commits: [
					{ date: "2025-03-25", count: 3 },
					{ date: "2025-03-26", count: 5 },
					{ date: "2025-03-27", count: 0 },
					{ date: "2025-03-28", count: 7 },
					{ date: "2025-03-29", count: 2 },
					{ date: "2025-03-30", count: 0 },
					{ date: "2025-03-31", count: 4 },
				],
			};
		},
		enabled: !!userId, // Only run query if userId exists
	});
};

export const CompactHabitsTracker: React.FC<{ habitsData: HabitsData }> = ({
	habitsData,
}) => {
	const chessStreak = habitsData.chess.reduce(
		(streak, day) => (day.played ? streak + 1 : 0),
		0,
	);
	const commitsThisWeek = habitsData.commits.reduce(
		(total, day) => total + day.count,
		0,
	);

	return (
		<div className="grid grid-cols-2 gap-2">
			<Card className="p-2">
				<div className="flex items-center space-x-1">
					<CheckSquare className="h-3 w-3" />
					<span className="text-xs">Chess: {chessStreak}d</span>
				</div>
				<div className="flex mt-1">
					{habitsData.chess.map((day) => (
						<div
							key={day.date}
							className={`w-2 h-2 mx-0.5 rounded-sm ${
								day.played ? "bg-green-500" : "bg-gray-200"
							}`}
							title={day.date}
						/>
					))}
				</div>
			</Card>
			<Card className="p-2">
				<div className="flex items-center space-x-1">
					<GitCommit className="h-3 w-3" />
					<span className="text-xs">Commits: {commitsThisWeek}</span>
				</div>
				<div className="flex mt-1">
					{habitsData.commits.map((day) => (
						<div
							key={day.date}
							className="flex flex-col items-center mx-0.5"
							title={day.date}
						>
							<div
								className={`w-2 h-2 rounded-sm ${
									day.count === 0
										? "bg-gray-200"
										: day.count < 3
											? "bg-green-200"
											: day.count < 5
												? "bg-green-400"
												: "bg-green-600"
								}`}
							/>
							<span className="text-[9px]">{day.count}</span>
						</div>
					))}
				</div>
			</Card>
		</div>
	);
};
