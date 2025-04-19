import { PageContainer } from "@/components/layout/components/PageContainer";
import { ChessPerformanceWidget } from "./pages/ChessPage/widgets/ChessPerformanceWidget";

export default function HabitsPage() {
	return (
		<PageContainer>
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2" />

				<ChessPerformanceWidget />
			</div>
		</PageContainer>
	);
}
