import { Button } from "@/components/ui/button";
import { Pause, Play, SkipBack } from "lucide-react";

interface TimelineControllerProps {
	currentDate: Date;
	isPlaying: boolean;
	onTogglePlay: () => void;
	onGoToStart: () => void;
	className?: string;
}

export const TimelineController: React.FC<TimelineControllerProps> = ({
	currentDate,
	isPlaying,
	onTogglePlay,
	onGoToStart,
	className = "",
}) => {
	const formatDate = (date: Date) =>
		date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});

	return (
		<div className={`flex items-center gap-4 ${className}`}>
			<span className="text-xl font-medium">{formatDate(currentDate)}</span>
			<div className="flex gap-2">
				<Button
					size="icon"
					variant="outline"
					onClick={onGoToStart}
					title="Go to start"
				>
					<SkipBack className="w-4 h-4" />
				</Button>
				<Button
					size="icon"
					variant="outline"
					onClick={onTogglePlay}
					title={isPlaying ? "Pause" : "Play"}
				>
					{isPlaying ? (
						<Pause className="w-4 h-4" />
					) : (
						<Play className="w-4 h-4" />
					)}
				</Button>
			</div>
		</div>
	);
};
