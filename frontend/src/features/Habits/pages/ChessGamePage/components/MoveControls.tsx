import { Button } from "@/components/ui/button";
import { SkipBack, ChevronLeft, ChevronRight, SkipForward } from "lucide-react";

interface MoveControlsProps {
	currentMove: number;
	totalMoves: number;
	onStart: () => void;
	onPrev: () => void;
	onNext: () => void;
	onEnd: () => void;
}

export default function MoveControls({
	currentMove,
	totalMoves,
	onStart,
	onPrev,
	onNext,
	onEnd,
}: MoveControlsProps) {
	return (
		<div className="flex items-center justify-between px-2">
			<div className="flex space-x-1">
				<Button
					size="sm"
					variant="outline"
					onClick={onStart}
					disabled={currentMove === 0}
				>
					<SkipBack size={14} />
				</Button>
				<Button
					size="sm"
					variant="outline"
					onClick={onPrev}
					disabled={currentMove === 0}
				>
					<ChevronLeft size={14} />
				</Button>
			</div>
			<span className="text-xs">
				Move {currentMove}/{totalMoves}
			</span>
			<div className="flex space-x-1">
				<Button
					size="sm"
					variant="outline"
					onClick={onNext}
					disabled={currentMove === totalMoves}
				>
					<ChevronRight size={14} />
				</Button>
				<Button
					size="sm"
					variant="outline"
					onClick={onEnd}
					disabled={currentMove === totalMoves}
				>
					<SkipForward size={14} />
				</Button>
			</div>
		</div>
	);
}
