import { holdingsApiKeys, holdingsApi } from "@/api/holdingsApi";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import StockPriceChart from "../components/StockPriceChart";
import { HistoricalPrice } from "@/types/historicalPricesTypes";
import TradesTable from "@/features/Investing/components/TradesTable/TradesTable";
import HoldingsSummary from "../components/HoldingsSummary";

interface OverviewTabProps {
  exchange: string;
  tickerSymbol: string;
  historicalPrices?: HistoricalPrice[] | null;
}
export default function OverviewTab({ exchange, tickerSymbol, historicalPrices }: OverviewTabProps) {

  const { data: holding, isLoading: holdingsLoading } = useQuery({
    queryKey: holdingsApiKeys.ticker(exchange, tickerSymbol),
    queryFn: () => holdingsApi.getTickerHolding(exchange, tickerSymbol),
    enabled: !!exchange && !!tickerSymbol
  })

  return (
    <>
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="col-span-2 lg:col-span-5">
          {historicalPrices && !holdingsLoading ? (
            <StockPriceChart data={historicalPrices} holding={holding || undefined} />
          ) : (
            <>
            </>
          )}
        </Card>
        <div className="col-span-1 ">
          <HoldingsSummary holding={holding} isLoading={holdingsLoading} />
        </div>

        <div className="col-span-2 lg:col-span-4">
          <div className="flex items-center justify-between mb-2 h-8">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          </div>
          <TradesTable exchange={exchange} symbol={tickerSymbol} short />
        </div>
      </div >
    </>
  )
}
