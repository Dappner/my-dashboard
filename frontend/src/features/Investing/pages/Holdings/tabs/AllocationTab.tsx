import CustomPieChart from "@/components/charts/CustomPieChart";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { chartColors } from "@/constants";
import { useHoldings } from "@/features/Investing/hooks/useHoldings";
import { prepareSectorData, prepareIndustryData, calculateGeographicExposure } from "@/features/Investing/utils";
import { useMemo } from "react";
import { useHoldingsAllocation } from "../hooks/useHoldingsAllocation";

export default function AllocationTab() {
  const { holdings } = useHoldings();
  const { holdingsAllocation } = useHoldingsAllocation();
  const geographicExposure = useMemo(() => calculateGeographicExposure(holdings), [holdings]);
  if (!holdings || !holdingsAllocation) { return }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-cols-max gap-4">
      <div className="col-span-1">
        <CustomPieChart
          title="Sector"
          prefix="$"
          data={prepareSectorData(holdingsAllocation!)}
          inputType="Absolute"
          outputType="Percentage"
          colors={chartColors}
        />
      </div>
      <div className="col-span-1">
        <CustomPieChart
          title="Industry"
          prefix="$"
          data={prepareIndustryData(holdings)}
          inputType="Absolute"
          outputType="Percentage"
          colors={chartColors}
        />
      </div>
      <div className="col-span-1">
        <div className="flex flex-row items-center justify-between mb-2 h-8">
          <h2 className="text-lg font-semibold text-gray-900">Geographic Exposure</h2>
        </div>
        <Card>
          <CardContent className="space-y-3">
            {geographicExposure!.map((exposure, index) => (
              <div key={exposure.region} className="flex justify-between items-center">
                <span className="text-sm">{exposure.region}</span>
                <Progress
                  value={parseFloat(exposure.percentage)}
                  className="w-24 h-2"
                  color={chartColors[index % chartColors.length]}
                />
                <span className="text-sm">{exposure.percentage}%</span>
              </div>
            ))}
          </CardContent>
        </Card>      </div>
      <div className="col-span-3">
        {/* <GeographicExposureMap /> */}
      </div>
    </div>
  )
}
