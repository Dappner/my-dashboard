import CustomPieChart from "@/components/charts/CustomPieChart";
import { Card } from "@/components/ui/card";
import { chartColors } from "@/constants";
import { useHoldings } from "@/features/Investing/hooks/useHoldings";
import { usePortfolioMetrics } from "@/features/Investing/hooks/usePortfolioMetrics";
import useUser from "@/hooks/useUser";
import DetailedHoldingsTable from "../components/DetailedHoldingsTable";
import { prepareAllocationData, prepareHoldingData } from "../utils";

export default function OverviewTab() {
	const { holdings } = useHoldings();
	const { user } = useUser();
	const { metrics } = usePortfolioMetrics("ALL");

	if (!holdings || !user) {
		return;
	}

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div>Top Line KPIS? What's really important?</div>
				<div className="col-span-1">
					<CustomPieChart
						title=""
						prefix="$"
						data={prepareHoldingData(holdings)}
						inputType="Absolute"
						outputType="Percentage"
						colors={chartColors}
					/>
				</div>

				<div className="col-span-1">
					<CustomPieChart
						title="Asset Class"
						prefix="$"
						data={prepareAllocationData(
							holdings,
							metrics?.currentCashBalance || 0,
						)}
						inputType="Absolute"
						outputType="Percentage"
						colors={chartColors}
					/>
				</div>
			</div>

			<div className="grid grid-cols-3 gap-4">
				<div className="col-span-3">
					<div className="flex flex-row items-center justify-between mb-2 h-8">
						<h2 className="text-lg font-semibold text-muted-foreground">
							Holdings
						</h2>
					</div>
					<Card className="overflow-x-auto py-0">
						<DetailedHoldingsTable />
					</Card>
				</div>
			</div>
		</div>
	);
}
