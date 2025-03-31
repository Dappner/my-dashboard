import CustomPieChart from "@/components/charts/CustomPieChart";
import { chartColors } from "@/constants";
import { useHoldings } from "@/features/Investing/hooks/useHoldings";
import {
	prepareAllocationData,
	prepareHoldingData,
} from "@/features/Investing/utils";
import useUser from "@/hooks/useUser";
import DetailedHoldingsTable from "../components/DetailedHoldingsTable";

export default function OverviewTab() {
	const { holdings } = useHoldings();
	const { user } = useUser();
	if (!holdings) {
		return;
	}

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-3 gap-4">
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
			</div>

			<div className="grid grid-cols-3 gap-4">
				<div className="col-span-2">
					<div className="flex flex-row items-center justify-between mb-2 h-8">
						<h2 className="text-lg font-semibold text-gray-900">Holdings</h2>
					</div>
					<DetailedHoldingsTable />
				</div>
				<div className="col-span-1">
					<CustomPieChart
						title="Asset Class"
						prefix="$"
						data={prepareAllocationData(holdings, user!.cash_balance)}
						inputType="Absolute"
						outputType="Percentage"
						colors={chartColors}
					/>
				</div>
			</div>
		</div>
	);
}
