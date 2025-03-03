import CustomPieChart from "@/components/charts/CustomPieChart";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { chartColors } from "@/constants";
import GeographicExposureMap from "@/features/Investing/components/GeographicExposureMap";
import { prepareSectorData, prepareIndustryData } from "@/features/Investing/utils";
import { supabase } from "@/lib/supabase";
import { Holding } from "@/types/holdingsTypes";
import { Progress } from "@radix-ui/react-progress";
import { useQuery } from "@tanstack/react-query";
import { PieChartIcon } from "lucide-react";

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
          data={prepareSectorData(holdings)}
          inputType="Absolute"
          outputType="Percentage"
          colors={chartColors}
        />
      </div>
      <div className="col-span-2">
        <CustomPieChart
          title="Industry"
          data={prepareIndustryData(holdings)}
          inputType="Absolute"
          outputType="Percentage"
          colors={chartColors}
        />
      </div>
      <div className="col-span-2">
        <GeographicExposureMap />
      </div>
      <div className="col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChartIcon className="mr-2 h-5 w-5" />
              Geographic Exposure
            </CardTitle>
            <CardDescription>Regional allocation</CardDescription>
          </CardHeader>
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
    </div>
  )
}
