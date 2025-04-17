import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronUp, TrophyIcon } from "lucide-react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

export const ChessActivityCard: React.FC = () => {
	// Mock data for chess ratings over time
	const generateRatingData = () => {
		const baseRating = 1200;
		const days = 30;
		let currentRating = baseRating;

		return Array.from({ length: days }, (_, i) => {
			// Generate realistic rating changes
			const change = Math.floor(Math.random() * 40) - 20;
			currentRating += change;

			return {
				day: days - i,
				rating: currentRating,
			};
		}).reverse();
	};

	const chessStats = {
		gamesPlayed: 246,
		won: 127,
		lost: 98,
		draw: 21,
		currentRating: 1342,
		highestRating: 1398,
		winRate: (127 / 246) * 100,
	};

	const ratingData = generateRatingData();
	const ratingProgress =
		((chessStats.currentRating - 1200) / (chessStats.highestRating - 1200)) *
		100;

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-lg">Chess Performance</CardTitle>
				<CardDescription>
					Your chess statistics and rating progress
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex space-x-4 justify-between">
					<div className="text-center">
						<div className="text-xs text-muted-foreground">Win Rate</div>
						<div className="text-xl font-bold">
							{chessStats.winRate.toFixed(1)}%
						</div>
					</div>
					<div className="text-center">
						<div className="text-xs text-muted-foreground">Games</div>
						<div className="text-xl font-bold">{chessStats.gamesPlayed}</div>
					</div>
					<div className="text-center">
						<div className="text-xs text-muted-foreground">Record</div>
						<div className="text-xl font-bold">
							{chessStats.won}-{chessStats.lost}-{chessStats.draw}
						</div>
					</div>
				</div>

				<div>
					<div className="flex items-center justify-between mb-1">
						<div className="flex items-center gap-2">
							<TrophyIcon className="h-4 w-4 text-yellow-500" />
							<span className="text-sm font-medium">Current Rating</span>
						</div>
						<div className="flex items-center text-sm">
							<span className="font-medium">{chessStats.currentRating}</span>
							<ChevronUp className="ml-1 h-3 w-3 text-green-500" />
							<span className="text-xs text-green-500">+24</span>
						</div>
					</div>
					<Progress value={ratingProgress} className="h-2" />
					<div className="flex justify-between mt-1 text-xs text-muted-foreground">
						<span>1200</span>
						<span>Highest: {chessStats.highestRating}</span>
					</div>
				</div>

				<div className="mt-4">
					<div className="text-sm mb-2">Rating History (Last 30 Days)</div>
					<div className="h-32">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart
								data={ratingData}
								margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
							>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis
									dataKey="day"
									tick={{ fontSize: 10 }}
									tickFormatter={(value, index) =>
										index % 5 === 0 ? value : ""
									}
								/>
								<YAxis
									domain={["dataMin - 50", "dataMax + 50"]}
									tick={{ fontSize: 10 }}
								/>
								<Tooltip
									formatter={(value) => [`${value}`, "Rating"]}
									labelFormatter={(day) => `Day ${day}`}
								/>
								<Area
									type="monotone"
									dataKey="rating"
									stroke="#8884d8"
									fill="#8884d8"
									fillOpacity={0.3}
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
