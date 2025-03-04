import CustomPieChart from "@/components/charts/CustomPieChart";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { chartColors } from "@/constants";
import GeographicExposureMap from "@/features/Investing/components/GeographicExposureMap";
import { prepareSectorData, prepareIndustryData } from "@/features/Investing/utils";
import { supabase } from "@/lib/supabase";
import { Holding } from "@/types/holdingsTypes";
import { useQuery } from "@tanstack/react-query";

export default function AllocationTab() {
  const { data: holdings = [] } = useQuery({
    queryFn: async () => {
      const { data } = await supabase.from("current_holdings").select();
      return data as Holding[];
    },
    queryKey: ["holdings"],
  });

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
            <div className="flex justify-between items-center">
              <span className="text-sm">United States</span>
              <Progress value={65} className="w-24 h-2" />
              <span className="text-sm">65%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Europe</span>
              <Progress value={20} className="w-24 h-2" />
              <span className="text-sm">20%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Asia</span>
              <Progress value={10} className="w-24 h-2" />
              <span className="text-sm">10%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Other</span>
              <Progress value={5} className="w-24 h-2" />
              <span className="text-sm">5%</span>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="col-span-3">
        <GeographicExposureMap />
      </div>
    </div>
  )
}
