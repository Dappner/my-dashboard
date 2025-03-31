import TimeframeControls from "@/components/controls/TimeFrameControls";
import { Card, CardContent } from "@/components/ui/card";
import TickerEvents from "@/features/Investing/components/TickerEvents";
import { useCalendarEvents } from "@/features/Investing/hooks/useCalendarEvents";
import type { Timeframe } from "@/types/portfolioDailyMetricTypes";
import { useState } from "react";
import StockPriceChart from "../components/StockPriceChart";
import YhFinanceStats from "../components/YhFinanceStats";
import { useTickerData } from "../hooks/useTickerData";
import { useTickerHistoricalPrices } from "../hooks/useTickerHistoricalPrices";

interface OverviewTabProps {
  exchange: string;
  tickerSymbol: string;
}

export default function OverviewTab({
  exchange,
  tickerSymbol,
}: OverviewTabProps) {
  const { ticker, holding, tickerTrades, yhFinanceData, isLoading } =
    useTickerData(exchange, tickerSymbol);
  const [timeframe, setTimeframe] = useState<Timeframe>("1M");
  const { historicalPrices } = useTickerHistoricalPrices(
    ticker?.id,
    timeframe,
    !!ticker,
  );
  const {
    events,
    isLoading: eventsLoading,
    isError: eventsError,
    error: eventsErrorMsg,
  } = useCalendarEvents(3, ticker?.id);

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 xl:grid-cols-6 gap-4 animate-pulse">
        <div className="col-span-2 xl:col-span-5 h-64 bg-gray-200 rounded" />
        <div className="col-span-1 h-64 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Research Section */}
      <div className="grid grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="col-span-2 xl:col-span-5">
          {historicalPrices
            ? (
              <div className="space-y-2">
                <div className="flex justify-end">
                  <TimeframeControls
                    timeframe={timeframe}
                    onTimeframeChange={setTimeframe}
                  />
                </div>
                <StockPriceChart
                  data={historicalPrices}
                  holding={holding || undefined}
                  tickerTrades={tickerTrades || undefined}
                />
              </div>
            )
            : (
              <Card className="h-64 flex items-center justify-center">
                <p className="text-gray-500">
                  Historical price data coming soon
                </p>
              </Card>
            )}
        </div>
        <div className="col-span-1">
          <YhFinanceStats
            yahooFinanceDaily={yhFinanceData}
            isLoading={isLoading}
          />
        </div>
        {/* Additional Research Content */}
        <div className="col-span-2 xl:col-span-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-500">
                Additional research content coming soon...
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="col-span-1 xl:col-span-2">
          <TickerEvents
            events={events}
            tickerSymbol={tickerSymbol}
            isLoading={eventsLoading}
            isError={eventsError}
            error={eventsErrorMsg}
          />
        </div>
      </div>
    </div>
  );
}
