import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Calendar } from "lucide-react";
import { format } from "date-fns";
import { calculatePortfolioMetrics } from "@/services/portfolioMetrics";
import { useCalendarEvents } from "../hooks/useCalendarEvents";
import { useHoldings } from "../hooks/useHoldings";
import { usePortfolioDailyMetrics } from "../hooks/usePortfolioDailyMetrics";
import { useTransactions } from "../hooks/useTransactions";
import { Timeframe } from "@/types/portfolioDailyMetricTypes";

interface PortfolioInsightsWidgetProps {
  timeframe: Timeframe;
}
export default function PortfolioInsightsWidget({ timeframe }: PortfolioInsightsWidgetProps) {
  // Fetch data
  const { holdings, isLoading: holdingsLoading } = useHoldings();
  const { dailyMetrics: ytdMetrics, isLoading: ytdLoading } = usePortfolioDailyMetrics(timeframe);
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { events, isLoading: eventsLoading } = useCalendarEvents(5);

  // Calculate portfolio metrics for YTD
  const metrics = calculatePortfolioMetrics(ytdMetrics || [], timeframe, transactions, holdings);

  // Best and Worst Performers from holdings
  const bestPerformer = holdings?.reduce(
    (max, h) => (h.unrealized_gain_loss_percent > max.value ? { value: h.unrealized_gain_loss_percent, symbol: h.symbol } : max),
    { value: -Infinity, symbol: "" }
  );
  const worstPerformer = holdings?.reduce(
    (min, h) => (h.unrealized_gain_loss_percent < min.value ? { value: h.unrealized_gain_loss_percent, symbol: h.symbol } : min),
    { value: Infinity, symbol: "" }
  );

  // Next Dividend Event
  const nextDividendEvent = events?.find((e) => e.event_type === "dividend" && new Date(e.date) > new Date());

  const isLoading = holdingsLoading || ytdLoading || transactionsLoading || eventsLoading;

  if (isLoading) {
    return <div>Loading portfolio insights...</div>;
  }

  // Allocation (Stocks, Cash, and placeholder for Bonds)
  const stocksPercent = metrics.totalPortfolioValue > 0
    ? (metrics.investmentValue / metrics.totalPortfolioValue) * 100
    : 0;
  const cashPercent = metrics.cashPercentage;
  const bondsPercent = 0; // Placeholder; integrate fund_asset_classes if bonds are tracked

  return (
    <Card>
      <CardContent>
        <Tabs defaultValue="performance">
          <TabsList>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="allocation">Allocation</TabsTrigger>
            <TabsTrigger value="dividends">Dividends</TabsTrigger>
          </TabsList>

          {/* Performance Tab */}
          <TabsContent value="performance" className="pt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Best Performer ({bestPerformer?.symbol})</span>
                <div className="flex items-center text-emerald-600">
                  <span className="font-semibold">+{bestPerformer?.value.toFixed(1)}%</span>
                  <TrendingUp className="h-4 w-4 ml-1" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Worst Performer ({worstPerformer?.symbol})</span>
                <span className="text-red-600 font-semibold">{worstPerformer?.value.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">YTD Return</span>
                <span className={`font-semibold ${metrics.timeframeReturnPercent >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {metrics.timeframeReturnPercent >= 0 ? "+" : ""}{metrics.timeframeReturnPercent.toFixed(1)}%
                </span>
              </div>
            </div>
          </TabsContent>

          {/* Allocation Tab */}
          <TabsContent value="allocation" className="pt-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Stocks</span>
                <span className="font-semibold">{stocksPercent.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${stocksPercent}%` }}></div>
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="text-sm font-medium">Bonds</span>
                <span className="font-semibold">{bondsPercent.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${bondsPercent}%` }}></div>
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="text-sm font-medium">Cash</span>
                <span className="font-semibold">{cashPercent.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${cashPercent}%` }}></div>
              </div>
            </div>
          </TabsContent>

          {/* Dividends Tab */}
          <TabsContent value="dividends" className="pt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">YTD Dividends</span>
                <span className="font-semibold">${metrics.ytdDividends?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Dividend Yield</span>
                <span className="font-semibold">{metrics.dividendYield?.toFixed(1) || "0.0"}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Next Payment</span>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="font-semibold">
                    {nextDividendEvent ? format(new Date(nextDividendEvent.date), "MMM dd") : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
