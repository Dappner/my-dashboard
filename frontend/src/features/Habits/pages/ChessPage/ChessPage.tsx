import TimeframeControls from "@/components/controls/CustomTimeframeControl";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTimeframeParams } from "@/hooks/useTimeframeParams";
import { ChessCalendar } from "./widgets/ChessCalendar";
import ChessKpiCards from "./widgets/ChessKpiCards";
import RatingProgressionCharts from "./widgets/RatingProgressionCharts";
import RecentGamesFeed from "./widgets/RecentGamesFeed";

export default function ChessPage() {
	const isMobile = useIsMobile();

	const { timeframe, date, setTimeframe, setDate } = useTimeframeParams();

	return (
		<div className="lg:h-[calc(100dvh)] flex flex-col overflow-hidden p-2 sm:p-4 ">
			{/* Header area */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 sm:mb-4">
				<h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight">
					Chess Stats
				</h1>
				<div className="flex justify-end">
					<TimeframeControls
						timeframe={timeframe}
						date={date}
						onTimeframeChange={setTimeframe}
						onDateChange={setDate}
					/>
				</div>
			</div>

			{/* Content area */}
			<div className="grid gap-3 sm:gap-4 lg:grid-cols-12 flex-1 overflow-hidden">
				{/* Main content column */}
				<div className="lg:col-span-9 flex flex-col gap-3 sm:gap-4 overflow-hidden">
					{/* KPI cards always visible at top */}
					<ChessKpiCards />

					<div className="grid gap-3 sm:gap-4 md:grid-cols-2 min-h-0 overflow-hidden">
						<div className="overflow-hidden h-full">
							<ChessCalendar />
						</div>
						<div className="overflow-hidden h-full">
							<RecentGamesFeed />
						</div>
					</div>
				</div>

				<div
					className={`
          flex flex-col gap-3 sm:gap-4 lg:col-span-3 overflow-auto
          ${isMobile ? "min-h-[180px]" : ""}
        `}
				>
					<RatingProgressionCharts />
				</div>
			</div>
		</div>
	);
}
