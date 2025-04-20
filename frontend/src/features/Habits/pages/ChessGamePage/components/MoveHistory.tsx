import { useEffect } from "react";
import type { RefObject } from "react";

interface MoveHistoryProps {
	history: string[];
	currentMove: number;
	onSelect: (move: number) => void;
	containerRef: RefObject<HTMLDivElement>;
}

export default function MoveHistory({
	history,
	currentMove,
	onSelect,
	containerRef,
}: MoveHistoryProps) {
	// scroll active move into view
	// biome-ignore lint/correctness/useExhaustiveDependencies: False
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;
		const active = container.querySelector<HTMLElement>("[data-active='true']");
		if (active) active.scrollIntoView({ block: "nearest" });
	}, [currentMove]);

	return (
		<div ref={containerRef} className="flex-grow overflow-y-auto p-2 pr-4">
			<div className="grid grid-cols-2 gap-1 text-sm">
				{history.map((move, i) => {
					const moveNumber = Math.floor(i / 2) + 1;
					const isWhite = i % 2 === 0;
					const idx = i + 1;
					const active = idx === currentMove;
					return (
						// biome-ignore lint/a11y/useKeyWithClickEvents: Fine
						<div
							key={idx}
							data-active={active}
							onClick={() => onSelect(idx)}
							className={`px-2 py-1 cursor-pointer rounded ${active ? "bg-primary/10 font-medium" : "hover:bg-muted"}`}
						>
							{isWhite ? `${moveNumber}. ${move}` : move}
						</div>
					);
				})}
			</div>
		</div>
	);
}
