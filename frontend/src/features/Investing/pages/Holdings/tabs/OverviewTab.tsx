import CustomPieChart from "@/components/charts/CustomPieChart";
import { chartColors } from "@/constants";
import HoldingsTable from "@/features/Investing/components/HoldingsTable";
import { useHoldings } from "@/features/Investing/hooks/useHoldings";
import { prepareAllocationData } from "@/features/Investing/utils";
import useUser from "@/hooks/useUser";

export default function OverviewTab() {
  const { holdings } = useHoldings();
  const { user } = useUser();
  if (!holdings) { return }

  return (
    <>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <div className="flex flex-row items-center justify-between mb-2 h-8">
            <h2 className="text-lg font-semibold text-gray-900">Holdings</h2>
          </div>
          <HoldingsTable />
        </div>
        <div className="col-span-1">
          <CustomPieChart
            title="Allocation"
            prefix="$"
            data={prepareAllocationData(holdings, user!.cash_balance)}
            inputType="Absolute"
            outputType="Percentage"
            colors={chartColors}
          />
        </div>
      </div>
    </>
  )
}
