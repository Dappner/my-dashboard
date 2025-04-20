import { chessGameRoute } from "@/routes/habits-routing";
import { PageContainer } from "@/components/layout/components/PageContainer";
import { useGame } from "../ChessPage/hooks/useChessHooks";
import type { BoardOrientation } from "react-chessboard/dist/chessboard/types";
import { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import ChessBoardView from "./components/ChessBoardView";
import MoveControls from "./components/MoveControls";
import MoveHistory from "./components/MoveHistory";
import type { RefObject } from "react";
import GameInfoCard from "./components/GameInfoCard";

export default function ChessGamePage() {
	const { gameId } = chessGameRoute.useParams();
	const { data: chessGame, isLoading } = useGame(gameId);

	const [game, setGame] = useState<Chess>(new Chess());
	const [currentMove, setCurrentMove] = useState(0);
	const [moveHistory, setMoveHistory] = useState<string[]>([]);
	const [boardOrientation, setBoardOrientation] =
		useState<BoardOrientation>("white");
	const historyRef = useRef<HTMLDivElement>(null);

	// Load PGN and history
	useEffect(() => {
		if (!chessGame?.pgn) return;
		const chess = new Chess();
		chess.loadPgn(chessGame.pgn);
		setGame(chess);
		const history = chess.history();
		setMoveHistory(history);
		setCurrentMove(history.length);
		setBoardOrientation(chessGame.user_color === "black" ? "black" : "white");
	}, [chessGame]);

	// Navigate to specific move
	const goToMove = (index: number) => {
		console.log("attempting movement");
		if (!chessGame?.pgn) return;
		const chess = new Chess();
		chess.loadPgn(chessGame.pgn);
		if (index === 0) {
			chess.reset();
		} else {
			// Apply moves up to the desired index
			const history = chess.history({ verbose: true });
			chess.reset();

			for (let i = 0; i < index; i++) {
				if (history[i]) {
					chess.move(history[i]);
				}
			}
		}
		setGame(chess);
		setCurrentMove(index);
	};

	const goToStart = () => goToMove(0);
	const goToEnd = () => goToMove(moveHistory.length);
	const goToPrev = () => currentMove > 0 && goToMove(currentMove - 1);
	const goToNext = () =>
		currentMove < moveHistory.length && goToMove(currentMove + 1);

	// Keyboard navigation
	// biome-ignore lint/correctness/useExhaustiveDependencies: NOpe
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			switch (e.key) {
				case "ArrowLeft":
					goToPrev();
					break;
				case "ArrowRight":
					goToNext();
					break;
				case "Home":
					goToStart();
					break;
				case "End":
					goToEnd();
					break;
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [currentMove, moveHistory.length]);

	if (isLoading) return null;
	if (!chessGame) return <div>Error</div>;

	return (
		<PageContainer className="py-2 sm:py-4">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 h-[calc(100vh-110px)]">
				<ChessBoardView
					game={game}
					orientation={boardOrientation}
					onFlip={() =>
						setBoardOrientation((o) => (o === "white" ? "black" : "white"))
					}
				/>

				<div className="flex flex-col space-y-2 md:space-y-3 h-full overflow-hidden">
					<GameInfoCard
						chessGame={chessGame}
						onFlip={() =>
							setBoardOrientation((o) => (o === "white" ? "black" : "white"))
						}
					/>
					<MoveControls
						currentMove={currentMove}
						totalMoves={moveHistory.length}
						onStart={goToStart}
						onPrev={goToPrev}
						onNext={goToNext}
						onEnd={goToEnd}
					/>
					<MoveHistory
						history={moveHistory}
						currentMove={currentMove}
						onSelect={goToMove}
						containerRef={historyRef as RefObject<HTMLDivElement>}
					/>
				</div>
			</div>
		</PageContainer>
	);
}
