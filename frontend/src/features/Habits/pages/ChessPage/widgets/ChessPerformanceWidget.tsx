import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useTimeframeParams } from "@/hooks/useTimeframeParams";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, TrophyIcon } from "lucide-react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import useRatingProgression, {
	useTimeframeSummary,
} from "../hooks/useChessHooks";
import { Link } from "@tanstack/react-router";
import { chessRoute } from "@/routes/habits-routing";
import { useState } from "react";

// Define the rating class types
type RatingClass = "all" | "bullet" | "blitz" | "rapid" | "daily";

export const ChessPerformanceWidget: React.FC = () => {
	const { timeframe, date } = useTimeframeParams();
	const [ratingClass, setRatingClass] = useState<RatingClass>("all");

	// 1) rating progression (for the chart)
	const { data: ratingData, isLoading: ratingsLoading } = useRatingProgression(
		date,
		timeframe,
	);

	// 2) unified summary RPC (total_games, wins, losses, win_rate_pct, etc.)
	const { data: timeframeSummary, isLoading: summaryLoading } =
		useTimeframeSummary(date, timeframe, ratingClass);

	const isLoading = ratingsLoading || summaryLoading;

	// Build your KPI stats entirely from the summary RPC
	const calculateStats = () => {
		if (!timeframeSummary) {
			return {
				gamesPlayed: 0,
				won: 0,
				lost: 0,
				draw: 0,
				winRate: 0,
				currentRating: 0,
				highestRating: 0,
				ratingChange: 0,
			};
		}

		const gamesPlayed = timeframeSummary.total_games;
		const won = timeframeSummary.wins;
		const lost = timeframeSummary.losses;
		const draw = gamesPlayed - won - lost;
		const winRate = timeframeSummary.win_rate_pct;

		// 3) rating calculations (unchanged)
		let currentRating = 0;
		let highestRating = 0;
		let ratingChange = 0;
		if (ratingData && ratingData.length > 0) {
			const latest = ratingData[ratingData.length - 1];
			if (ratingClass === "all") {
				const vals = [
					latest.bullet_rating,
					latest.blitz_rating,
					latest.rapid_rating,
					latest.daily_rating,
				].filter((r): r is number => r !== null);
				currentRating = Math.max(...vals, 0);
				const allVals = ratingData.flatMap((e) =>
					[
						e.bullet_rating,
						e.blitz_rating,
						e.rapid_rating,
						e.daily_rating,
					].filter((r): r is number => r !== null),
				);
				highestRating = Math.max(...allVals, 0);
			} else {
				const key = `${ratingClass}_rating` as keyof typeof latest;
				currentRating = (latest[key] as number) || 0;
				highestRating = Math.max(
					...ratingData
						.map((e) => e[key])
						.filter((r): r is number => r !== null),
					0,
				);
			}

			if (ratingData.length >= 2) {
				const first = ratingData[0];
				let firstVal: number;
				if (ratingClass === "all") {
					firstVal = [
						first.bullet_rating,
						first.blitz_rating,
						first.rapid_rating,
						first.daily_rating,
					].filter((r): r is number => r !== null)[0] as number;
				} else {
					firstVal =
						(first[`${ratingClass}_rating` as keyof typeof first] as number) ||
						currentRating;
				}
				ratingChange = currentRating - firstVal;
			}
		}

		return {
			gamesPlayed,
			won,
			lost,
			draw,
			winRate,
			currentRating,
			highestRating,
			ratingChange,
		};
	};

	const stats = calculateStats();
	const ratingProgress =
		stats.highestRating > 1200
			? ((stats.currentRating - 1200) / (stats.highestRating - 1200)) * 100
			: 0;

	// Prepare the chart data
	const formatRatingData = () => {
		if (!ratingData || ratingData.length === 0) return [];

		if (ratingClass === "all") {
			const map = new Map<string, number>();
			// biome-ignore lint/complexity/noForEach: Fine for now
			ratingData.forEach((e) => {
				if (!e.day) return;
				const day = format(new Date(e.day), "MMM d");
				const vals = [
					e.bullet_rating,
					e.blitz_rating,
					e.rapid_rating,
					e.daily_rating,
				].filter((r): r is number => r !== null);
				if (vals.length) {
					const avg = vals.reduce((sum, r) => sum + r, 0) / vals.length;
					const cur = map.get(day) ?? 0;
					if (avg > cur) map.set(day, avg);
				}
			});
			return Array.from(map.entries())
				.map(([day, rating], i) => ({ day, rating, index: i }))
				.sort((a, b) => a.index - b.index);
		}

		const key = `${ratingClass}_rating` as keyof (typeof ratingData)[0];
		return ratingData
			.filter((e) => e[key] !== null)
			.map((e, i) => ({
				day: format(new Date(e.day || ""), "MMM d"),
				rating: e[key] as number,
				index: i,
			}));
	};

	const chartData = formatRatingData();

	if (isLoading) {
		return (
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-lg">Chess Performance</CardTitle>
					<CardDescription>Loading chess statistics...</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex space-x-4 justify-between">
						{[1, 2, 3].map((i) => (
							<div key={i} className="text-center">
								<Skeleton className="h-4 w-12 mb-2" />
								<Skeleton className="h-6 w-16" />
							</div>
						))}
					</div>
					<Skeleton className="h-2 w-full mb-6" />
					<Skeleton className="h-32 w-full" />
				</CardContent>
			</Card>
		);
	}

	if (stats.gamesPlayed === 0) {
		return (
			<Card>
				<CardHeader className="pb-2">
					<div className="flex justify-between items-center">
						<CardTitle className="text-lg hover:underline">
							<Link to={chessRoute.to}>Chess Performance</Link>
						</CardTitle>

						<Select
							value={ratingClass}
							onValueChange={(v) => setRatingClass(v as RatingClass)}
						>
							<SelectTrigger className="w-28 h-7 text-xs">
								<SelectValue placeholder="Rating Class" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Ratings</SelectItem>
								<SelectItem value="bullet">Bullet</SelectItem>
								<SelectItem value="blitz">Blitz</SelectItem>
								<SelectItem value="rapid">Rapid</SelectItem>
								<SelectItem value="daily">Daily</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<CardDescription>
						Your chess statistics and rating progress
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col items-center justify-center h-48">
					<TrophyIcon className="h-12 w-12 text-muted-foreground opacity-40 mb-2" />
					<p className="text-muted-foreground text-center">
						No {ratingClass === "all" ? "chess" : ratingClass} games played
						during this period
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader className="pb-2">
				<div className="flex justify-between items-center">
					<CardTitle className="text-lg hover:underline">
						<Link to={chessRoute.to}>Chess Performance</Link>
					</CardTitle>
					<Select
						value={ratingClass}
						onValueChange={(v) => setRatingClass(v as RatingClass)}
					>
						<SelectTrigger className="w-28 h-7 text-xs">
							<SelectValue placeholder="Rating Class" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Ratings</SelectItem>
							<SelectItem value="bullet">Bullet</SelectItem>
							<SelectItem value="blitz">Blitz</SelectItem>
							<SelectItem value="rapid">Rapid</SelectItem>
							<SelectItem value="daily">Daily</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<CardDescription>
					Your chess statistics and rating progress
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex space-x-4 justify-between">
					<div className="text-center">
						<div className="text-xs text-muted-foreground">Win Rate</div>
						<div className="text-xl font-bold">{stats.winRate.toFixed(1)}%</div>
					</div>
					<div className="text-center">
						<div className="text-xs text-muted-foreground">Games</div>
						<div className="text-xl font-bold">{stats.gamesPlayed}</div>
					</div>
					<div className="text-center">
						<div className="text-xs text-muted-foreground">Record</div>
						<div className="text-xl font-bold">
							{stats.won}-{stats.lost}-{stats.draw}
						</div>
					</div>
				</div>

				<div>
					<div className="flex items-center justify-between mb-1">
						<div className="flex items-center gap-2">
							<TrophyIcon className="h-4 w-4 text-yellow-500" />
							<span className="text-sm font-medium">
								{ratingClass !== "all"
									? `${ratingClass.charAt(0).toUpperCase() + ratingClass.slice(1)} Rating`
									: "Current Rating"}
							</span>
						</div>
						<div className="flex items-center text-sm">
							<span className="font-medium">{stats.currentRating}</span>
							{stats.ratingChange !== 0 && (
								<>
									{stats.ratingChange > 0 ? (
										<ChevronUp className="ml-1 h-3 w-3 text-green-500" />
									) : (
										<ChevronDown className="ml-1 h-3 w-3 text-red-500" />
									)}
									<span
										className={
											stats.ratingChange > 0
												? "text-xs text-green-500"
												: "text-xs text-red-500"
										}
									>
										{stats.ratingChange > 0 ? "+" : ""}
										{stats.ratingChange}
									</span>
								</>
							)}
						</div>
					</div>
					<Progress value={ratingProgress} className="h-2" />
					<div className="flex justify-between mt-1 text-xs text-muted-foreground">
						<span>1200</span>
						<span>Highest: {stats.highestRating}</span>
					</div>
				</div>

				{chartData.length > 0 ? (
					<div className="mt-4">
						<div className="text-sm mb-2">
							{ratingClass === "all"
								? "Aggregated Rating History"
								: `${ratingClass.charAt(0).toUpperCase() + ratingClass.slice(1)} Rating History`}
						</div>
						<div className="h-32">
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart
									data={chartData}
									margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
								>
									<CartesianGrid strokeDasharray="3 3" opacity={0.2} />
									<XAxis
										dataKey="day"
										tick={{ fontSize: 10 }}
										tickFormatter={(value, index) =>
											chartData.length <= 10 ||
											index % Math.ceil(chartData.length / 5) === 0
												? value
												: ""
										}
									/>
									<YAxis
										domain={["dataMin - 50", "dataMax + 50"]}
										tick={{ fontSize: 10 }}
									/>
									<Tooltip
										formatter={(value) => [
											`${Math.round(value as number)}`,
											ratingClass === "all" ? "Avg Rating" : "Rating",
										]}
										labelFormatter={(day) => `${day}`}
									/>
									<Area
										type="monotone"
										dataKey="rating"
										stroke="#8884d8"
										fill="#8884d8"
										fillOpacity={0.3}
										isAnimationActive={false}
									/>
								</AreaChart>
							</ResponsiveContainer>
						</div>
					</div>
				) : (
					<div className="mt-4 py-3 text-center text-sm text-muted-foreground">
						No {ratingClass !== "all" ? ratingClass : ""} rating data available
						for this period
					</div>
				)}
			</CardContent>
		</Card>
	);
};
