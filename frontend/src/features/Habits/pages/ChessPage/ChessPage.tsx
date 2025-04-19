import { MonthSwitcher } from "@/features/Spending/components/MonthSwitcher";
import { useMonthParam } from "@/hooks/useMonthParam";
import { ChessCalendar } from "./widgets/ChessCalendar";
import ChessKpiCards from "./widgets/ChessKpiCards";
import RatingProgressionCharts from "./widgets/RatingProgressionCharts";
import RecentGamesFeed from "./widgets/RecentGamesFeed";

export default function ChessPage() {
	const { selectedDate, setSelectedDate } = useMonthParam();

	return (
		<div className="h-[calc(100dvh)] flex flex-col overflow-hidden p-4 bg-gray-50">
			<div className="grid lg:grid-cols-12 mb-4">
				<h1 className="col-span-2 lg:col-span-9 text-xl md:text-3xl font-semibold tracking-tight">
					Chess Stats
				</h1>

				<div className="lg:col-span-3 flex flex-row justify-end">
					<MonthSwitcher
						selectedDate={selectedDate}
						onDateChange={setSelectedDate}
					/>
				</div>
			</div>
			<div className="grid gap-4 lg:grid-cols-12 flex-1 overflow-hidden">
				<div className="col-span-2 lg:col-span-9 flex flex-col gap-4 overflow-hidden">
					<ChessKpiCards />
					<div className="grid gap-4 md:grid-cols-2 flex-1 min-h-0">
						<ChessCalendar />
						<RecentGamesFeed />
					</div>
				</div>
				<div className="flex flex-col gap-4 lg:col-span-3 overflow-auto">
					<RatingProgressionCharts />
				</div>
			</div>
		</div>
	);
}
