import { PageContainer } from "@/components/layout/components/PageContainer";
import { useEffect, useState } from "react";
import { TimelineController } from "./components/TimelineController";
import { TravelGlobe } from "./components/TravelGlobe";
import { cities, generateMockFlights } from "./constants";
import type { City, FlightArc } from "./types";

const YEAR = 2025;
const START_DATE = new Date(YEAR, 0, 1);
const END_DATE = new Date(YEAR, 11, 31);

export default function SummaryPage() {
	const [currentDate, setCurrentDate] = useState<Date>(START_DATE);

	const [isPlaying, setIsPlaying] = useState(false);
	const [allFlights] = useState<FlightArc[]>(() => generateMockFlights(YEAR));
	const [activeFlights, setActiveFlights] = useState<FlightArc[]>([]);
	const [currentFlight, setCurrentFlight] = useState<FlightArc | null>(null);

	// Update flights based on date
	useEffect(() => {
		const past = allFlights.filter((f) => new Date(f.date) <= currentDate);
		setActiveFlights(past);
		setCurrentFlight(past[past.length - 1] || null);
	}, [currentDate, allFlights]);

	// Timeline animation
	useEffect(() => {
		if (!isPlaying) return;
		const iv = setInterval(() => {
			setCurrentDate((prev) => {
				const next = new Date(prev);
				next.setDate(next.getDate() + 1);
				if (next > END_DATE) {
					clearInterval(iv);
					setIsPlaying(false);
					return prev;
				}
				return next;
			});
		}, 100);
		return () => clearInterval(iv);
	}, [isPlaying]);

	const togglePlay = () => setIsPlaying((p) => !p);

	const goToStart = () => {
		setIsPlaying(false);
		setCurrentDate(START_DATE);
	};

	return (
		<PageContainer>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row justify-between items-center">
					<h1 className="text-3xl font-bold">Year {YEAR} Summary</h1>
					<TimelineController
						currentDate={currentDate}
						isPlaying={isPlaying}
						onTogglePlay={togglePlay}
						onGoToStart={goToStart}
						className="mt-4 sm:mt-0"
					/>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* KPIs Column */}
					<div className="space-y-4">
						{/* TODO: Add spending, portfolio, chess, books KPI cards here */}
					</div>

					{/* Globe Column */}
					<div className="relative w-full h-[600px] lg:h-[800px] bg-black rounded-lg">
						<TravelGlobe
							className="absolute inset-0 w-full h-full"
							activeFlights={activeFlights}
							cities={cities as City[]}
							currentFlight={currentFlight}
						/>
					</div>
				</div>
			</div>
		</PageContainer>
	);
}
