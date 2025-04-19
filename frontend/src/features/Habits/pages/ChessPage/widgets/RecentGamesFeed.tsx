import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTimeframeParams } from "@/hooks/useTimeframeParams";
import { format } from "date-fns";
import {
	ArrowDown,
	ArrowUp,
	Award,
	CheckCircle2,
	Clock,
	User2,
	XCircle,
} from "lucide-react";
import { useRecentGames } from "../hooks/useChessHooks";
import { capitalizeFirstLetter } from "@/lib/utils";

const getRatingChange = (
	userRating: number,
	opponentRating: number,
	isWin: boolean,
) => {
	const diff = userRating - opponentRating;
	const expectedWin = diff > 15;
	const expectedLoss = diff < -15;

	if (isWin && expectedLoss)
		return {
			icon: <ArrowUp className="h-3 w-3" />,
			color: "text-green-600 font-bold",
		};
	if (isWin && !expectedWin)
		return { icon: <ArrowUp className="h-3 w-3" />, color: "text-green-600" };
	if (!isWin && expectedWin)
		return {
			icon: <ArrowDown className="h-3 w-3" />,
			color: "text-red-600 font-bold",
		};
	if (!isWin && !expectedLoss)
		return { icon: <ArrowDown className="h-3 w-3" />, color: "text-red-600" };

	return { icon: null, color: "text-muted-foreground" };
};

export default function RecentGamesFeed() {
	const { timeframe, date } = useTimeframeParams();
	const { data, isLoading } = useRecentGames(date, timeframe);

	if (isLoading) {
		return (
			<Card className="flex flex-col h-full">
				<CardHeader className="pb-2 shrink-0">
					<CardTitle>Recent Games</CardTitle>
				</CardHeader>
				<div className="overflow-auto flex-1 px-3 pb-3 pt-0">
					<div className="space-y-3">
						{[...Array(5)].map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
							<Skeleton key={i} className="h-20 w-full rounded" />
						))}
					</div>
				</div>
			</Card>
		);
	}

	return (
		<Card className="flex flex-col h-full overflow-hidden">
			<CardHeader className="pb-2 shrink-0">
				<CardTitle>Recent Games</CardTitle>
			</CardHeader>
			<div className="overflow-auto flex-1 px-3 pb-3 pt-0">
				<div className="space-y-3">
					{data?.map((game) => {
						const ratingChange = getRatingChange(
							game.user_rating,
							game.opponent_rating,
							game.is_win,
						);

						return (
							<div
								key={game.id}
								className={
									"rounded-lg border p-3 transition-all hover:shadow-md"
								}
							>
								{/* Header with game time and result */}
								<div className="flex items-center justify-between mb-2">
									<div className="flex items-center gap-2">
										<Clock className="h-4 w-4 text-muted-foreground" />
										<a
											href={game.game_url}
											rel="noreferrer"
											target="_blank"
											className="text-sm"
										>
											{format(new Date(game.end_time), "MMM d, HH:mm")}
										</a>
									</div>
									<div className="flex items-center gap-1">
										{game.is_win ? (
											<>
												<span className="text-green-600 text-sm font-medium">
													Win
												</span>
												<CheckCircle2 className="h-4 w-4 text-green-600" />
											</>
										) : (
											<>
												<span className="text-red-600 text-sm font-medium">
													Loss
												</span>
												<XCircle className="h-4 w-4 text-red-600" />
											</>
										)}
									</div>
								</div>

								{/* Game details */}
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Badge className="text-xs ">
											{capitalizeFirstLetter(game.time_class)}
										</Badge>
										<div className="flex items-center gap-1">
											<User2 className="h-3 w-3 text-muted-foreground" />
											<span className="text-xs text-muted-foreground">
												{game.opponent_username}
											</span>
										</div>
									</div>

									{/* Rating display */}
									<div className="flex items-center gap-1">
										<div className="flex flex-col items-end">
											<div className="flex items-center gap-1">
												<Award className="h-3 w-3 text-amber-500" />
												<span className={`text-xs ${ratingChange.color}`}>
													{game.user_rating}
												</span>
												{ratingChange.icon}
											</div>
											<span className="text-xs text-muted-foreground">
												vs {game.opponent_rating}
											</span>
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</Card>
	);
}
