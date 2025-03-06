import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Calendar } from "lucide-react";

export default function PortfolioInsightsWidget() {
  return (
    <>
      <Card>
        <CardContent>
          <Tabs defaultValue="performance">
            <TabsList>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="allocation">Allocation</TabsTrigger>
              <TabsTrigger value="dividends">Dividends</TabsTrigger>
            </TabsList>
            <TabsContent value="performance" className="pt-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Best Performer</span>
                  <div className="flex items-center text-emerald-600">
                    <span className="font-semibold">+12.4%</span>
                    <TrendingUp className="h-4 w-4 ml-1" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Worst Performer</span>
                  <span className="text-red-600 font-semibold">-5.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">YTD Return</span>
                  <span className="text-emerald-600 font-semibold">+8.7%</span>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="allocation" className="pt-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Stocks</span>
                  <span className="font-semibold">65%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "65%" }}></div>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm font-medium">Bonds</span>
                  <span className="font-semibold">20%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: "20%" }}></div>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm font-medium">Cash</span>
                  <span className="font-semibold">15%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: "15%" }}></div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="dividends" className="pt-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">YTD Dividends</span>
                  <span className="font-semibold">$542.18</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Dividend Yield</span>
                  <span className="font-semibold">2.4%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Next Payment</span>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span className="font-semibold">Mar 15</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>


    </>
  )
}
