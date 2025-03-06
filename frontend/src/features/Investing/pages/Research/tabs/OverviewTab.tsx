import StockPriceChart from "../components/StockPriceChart";
import YhFinanceStats from "../components/YhFinanceStats";
import { useTickerData } from "../hooks/useTickerData";
import { Card, CardContent } from "@/components/ui/card";

interface OverviewTabProps {
  exchange: string;
  tickerSymbol: string;
  tickerId?: string;
}

export default function OverviewTab({ exchange, tickerSymbol }: OverviewTabProps) {
  const { historicalPrices, holding, tickerTrades, yhFinanceData, isLoading } = useTickerData(
    exchange,
    tickerSymbol
  );

  console.log(historicalPrices);


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
          {historicalPrices ? (
            <StockPriceChart
              data={historicalPrices}
              holding={holding || undefined}
              tickerTrades={tickerTrades || undefined}
            />
          ) : (
            <Card className="h-64 flex items-center justify-center">
              <p className="text-gray-500">Historical price data coming soon</p>
            </Card>
          )}
        </div>
        <div className="col-span-1">
          <YhFinanceStats yahooFinanceDaily={yhFinanceData} isLoading={isLoading} />
        </div>
        <div className="col-span-3 xl:col-span-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-500">Additional research content coming soon...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
