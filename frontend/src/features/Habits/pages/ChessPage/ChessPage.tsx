import { PageContainer } from "@/components/layout/components/PageContainer";
import RatingProgressionCharts from "./widgets/RatingProgressionCharts";
import { MonthSwitcher } from "@/features/Spending/components/MonthSwitcher";
import { useMonthParam } from "@/hooks/useMonthParam";
import ChessKpiCards from "./widgets/ChessKpiCards";
import RecentGamesFeed from "./widgets/RecentGamesFeed";
import { ChessCalendar } from "./widgets/ChessCalendar";

export default function ChessPage() {
	const { selectedDate, setSelectedDate } = useMonthParam();

	return (
		<PageContainer>
			<div className="grid lg:grid-cols-12">
				<h1 className="col-span-2 lg:col-span-9 text-xl md:text-3xl font-semibold tracking-tight">
					Chess Stats
				</h1>

				<div className="lg:col-span-3 flex flex-row justify-center">
					<MonthSwitcher
						selectedDate={selectedDate}
						onDateChange={setSelectedDate}
					/>
				</div>
			</div>
			<div className="grid gap-4 lg:grid-cols-12">
				<div className="col-span-2 lg:col-span-9">
					<div className="flex flex-col gap-4">
						<ChessKpiCards />
						<div className="grid gap-4 md:grid-cols-2">
							<ChessCalendar />
							<RecentGamesFeed />
						</div>
					</div>
				</div>
				<div className="flex flex-col gap-4 lg:col-span-3">
					<RatingProgressionCharts />
				</div>
			</div>
		</PageContainer>
	);
}
