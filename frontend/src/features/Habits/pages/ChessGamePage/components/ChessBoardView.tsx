import type { Chess } from "chess.js";
import { useLayoutEffect, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import type { BoardOrientation } from "react-chessboard/dist/chessboard/types";

interface ChessBoardProps {
	game: Chess;
	orientation: BoardOrientation;
	onFlip: () => void;
}

export default function ChessBoardView({ game, orientation }: ChessBoardProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [width, setWidth] = useState(0);

	useLayoutEffect(() => {
		const calc = () => {
			if (!ref.current) return;
			const { clientWidth, clientHeight } = ref.current;
			const size = Math.max(Math.min(clientWidth, clientHeight) - 24, 400);
			setWidth(size);
		};
		calc();
		const t = setTimeout(calc, 400);
		window.addEventListener("resize", calc);
		return () => {
			clearTimeout(t);
			window.removeEventListener("resize", calc);
		};
	}, []);

	return (
		<div ref={ref} className="md:col-span-2 flex items-center justify-center">
			{width > 0 && (
				<Chessboard
					id="chess-game-viewer"
					boardWidth={width}
					position={game.fen()}
					boardOrientation={orientation}
					areArrowsAllowed={false}
					arePiecesDraggable={false}
					customBoardStyle={{
						borderRadius: "0.5rem",
						boxShadow:
							"0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
					}}
				/>
			)}
		</div>
	);
}
