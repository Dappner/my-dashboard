import type { ChessGame } from "@/api/chessApi";
import { BulletBillIcon } from "@/components/icons/BulletBillIcon";
import { LightningIcon } from "@/components/icons/LightningIcon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/contexts/UserContext";
import { useTimeframeParams } from "@/hooks/useTimeframeParams";
import { cn } from "@/lib/utils";
import { chessGameRoute } from "@/routes/habits-routing";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import {
	CalendarIcon,
	CheckCircle2,
	Clock,
	TimerIcon,
	XCircle,
} from "lucide-react";
import { useRecentGames } from "../hooks/useChessHooks";

const ICON_SIZE = "size-6";

const GRID_CLASSES =
	"grid grid-cols-[100px_1fr_90px_90px] gap-x-4 items-center";

const timeClassIcons: Record<string, React.ReactElement> = {
	bullet: <BulletBillIcon className={`${ICON_SIZE}`} color="#ff7300" />,
	blitz: <LightningIcon className={`${ICON_SIZE}`} color="#ffc658" />,
	rapid: <TimerIcon className={`${ICON_SIZE}`} style={{ color: "#82ca9d" }} />,
	daily: (
		<CalendarIcon className={`${ICON_SIZE}`} style={{ color: "#8884d8" }} />
	),
};

const RecentGamesFeed: React.FC = () => {
	const { currentUser } = useUser();
	const { timeframe, date } = useTimeframeParams();
	const { data, isLoading } = useRecentGames(date, timeframe);

	console.log(data);
	return (
		<Card className="flex flex-col h-full">
			<CardHeader className="pb-2">
				<CardTitle>Recent Games</CardTitle>
			</CardHeader>

			<CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
				{isLoading ? (
					<div className="flex-1 p-4 space-y-3">
						{Array.from({ length: 5 }).map((_, idx) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: Skeleton
							<Skeleton key={idx} className="h-16 rounded-lg" />
						))}
					</div>
				) : (
					<div className="flex-1 flex flex-col overflow-hidden">
						<div
							className={cn(
								GRID_CLASSES,
								"px-6 py-3 text-sm font-semibold text-muted-foreground border-b sticky top-0 z-10",
							)}
						>
							<div>Time</div>
							<div>Players</div>
							<div className="text-center">Result</div>
							<div className="text-center">Moves</div>
						</div>

						{/* Scrollable content */}
						<div className="flex-1 overflow-y-auto">
							<div className="divide-y divide-border">
								{data?.map((game: ChessGame) => {
									const isUserWin = game.is_win;
									const isUserWhite = game.user_color === "white";
									const userScore = isUserWin ? 1 : 0;
									const oppScore = isUserWin ? 0 : 1;
									const timeIcon = timeClassIcons[game.time_class] || (
										<Clock className={`${ICON_SIZE} text-gray-500`} />
									);

									return (
										<Link
											key={game.id}
											to={chessGameRoute.to}
											params={{ gameId: game.id }}
											className={cn(
												GRID_CLASSES,
												"px-6 py-3 hover:bg-accent/30 transition-colors",
											)}
										>
											{/* Time column */}
											<div className="flex items-center gap-2">
												{timeIcon}
												<span className="text-sm whitespace-nowrap">
													{format(new Date(game.end_time), "MMM d")}
												</span>
											</div>

											{/* Players column */}
											<div className="flex flex-col space-y-1 min-w-0">
												<div className="flex items-center gap-2 text-sm">
													<span className="inline-block w-4 text-right">
														{isUserWhite ? userScore : oppScore}
													</span>
													<span className="font-medium truncate">
														{isUserWhite
															? currentUser?.chess_username
															: game.opponent_username}
													</span>
													<span className="text-muted-foreground whitespace-nowrap">
														(
														{isUserWhite
															? game.user_rating
															: game.opponent_rating}
														)
													</span>
												</div>
												<div className="flex items-center gap-2 text-sm">
													<span className="inline-block w-4 text-right">
														{isUserWhite ? oppScore : userScore}
													</span>
													<span className="font-medium truncate">
														{isUserWhite
															? game.opponent_username
															: currentUser?.chess_username}
													</span>
													<span className="text-muted-foreground whitespace-nowrap">
														(
														{isUserWhite
															? game.opponent_rating
															: game.user_rating}
														)
													</span>
												</div>
											</div>

											{/* Result column */}
											<div className="flex justify-center">
												{isUserWin ? (
													<CheckCircle2
														className={`${ICON_SIZE} text-green-500`}
													/>
												) : (
													<XCircle className={`${ICON_SIZE} text-red-500`} />
												)}
											</div>

											{/* Moves column */}
											<div className="text-center text-sm">
												{game.move_count ?? "?"}
											</div>
										</Link>
									);
								})}
							</div>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default RecentGamesFeed;
