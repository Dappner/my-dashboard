import { holdingsApi, holdingsApiKeys } from "@/api/holdingsApi";
import CustomPieChart from "@/components/charts/CustomPieChart";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { chartColors } from "@/constants";
import { prepareSectorData, prepareIndustryData, calculateGeographicExposure } from "@/features/Investing/utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export default function AllocationTab() {
  const { data: holdings = [] } = useQuery({
    queryKey: holdingsApiKeys.all,
    queryFn: holdingsApi.getHoldings
  });


  const geographicExposure = useMemo(() => calculateGeographicExposure(holdings), [holdings]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-cols-max gap-4">
      <div className="col-span-1">
        <CustomPieChart
          title="Sector"
          prefix="$"
          data={prepareSectorData(holdings)}
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
            {geographicExposure.map((exposure, index) => (
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
