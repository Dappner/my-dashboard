import type { ChessGame } from "@/api/chessApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { formatDuration } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar, Clock, RotateCcw, Trophy } from "lucide-react";

interface GameInfoCardProps {
	chessGame: ChessGame;
	onFlip: () => void;
}

export default function GameInfoCard({ chessGame, onFlip }: GameInfoCardProps) {
	return (
		<Card className="flex-shrink-0">
			<CardHeader className="pb-2">
				<CardTitle className="flex justify-between items-center">
					<span>Game Details</span>
					{chessGame.is_win ? (
						<Badge className="bg-green-600 flex items-center">
							<Trophy size={16} className="mr-1" /> Win
						</Badge>
					) : (
						<Badge className="bg-red-600">Loss</Badge>
					)}
				</CardTitle>
				<CardDescription>
					{format(new Date(chessGame.start_time), "MMMM d, yyyy")}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-2 gap-2 text-sm">
					<div className="flex items-center">
						<Clock size={16} className="mr-2 text-muted-foreground" />
						<span className="text-muted-foreground">Time Control:</span>
					</div>
					<div>{chessGame.time_control}</div>

					<div className="flex items-center">
						<Calendar size={16} className="mr-2 text-muted-foreground" />
						<span className="text-muted-foreground">Duration:</span>
					</div>
					<div>{formatDuration(chessGame.duration)}</div>

					<div className="flex items-center">
						<span className="text-muted-foreground">Your Color:</span>
					</div>
					<div className="capitalize">{chessGame.user_color}</div>

					<div className="flex items-center">
						<span className="text-muted-foreground">Your Rating:</span>
					</div>
					<div>{chessGame.user_rating}</div>

					<div className="flex items-center">
						<span className="text-muted-foreground">Opponent:</span>
					</div>
					<div>{chessGame.opponent_username}</div>

					<div className="flex items-center">
						<span className="text-muted-foreground">Opponent Rating:</span>
					</div>
					<div>{chessGame.opponent_rating}</div>

					{chessGame.user_accuracy != null && (
						<>
							<div className="flex items-center">
								<span className="text-muted-foreground">Your Accuracy:</span>
							</div>
							<div>{chessGame.user_accuracy}%</div>
						</>
					)}

					{chessGame.opponent_accuracy != null && (
						<>
							<div className="flex items-center">
								<span className="text-muted-foreground">
									Opponent Accuracy:
								</span>
							</div>
							<div>{chessGame.opponent_accuracy}%</div>
						</>
					)}
				</div>
				<Button variant="outline" size="sm" className="w-full" onClick={onFlip}>
					<RotateCcw size={16} className="mr-2" /> Flip Board
				</Button>
			</CardContent>
		</Card>
	);
}
