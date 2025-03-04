import { holdingsApiKeys, holdingsApi } from "@/api/holdingsApi";
import LoadingSpinner from "@/components/layout/components/LoadingSpinner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import TradesTable from "@/features/Investing/components/TradesTable";
import { useQuery } from "@tanstack/react-query";
import StockPriceChart from "../components/StockPriceChart";
import { HistoricalPrice } from "@/types/historicalPricesTypes";

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
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-3">
          {historicalPrices && holding ? (
            <StockPriceChart data={historicalPrices} holding={holding} />
          ) : (
            <>
            </>
          )}
        </Card>
        <Card className="col-span-1">
          <CardHeader className="flex flex-row justify-between">
            <CardTitle>Holding Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {holdingsLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Shares Owned</span>
                  <span className="font-medium">{holding?.shares}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Cost Basis</span>
                  <span className="font-medium">${holding?.average_cost_basis?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Div Yield</span>
                  <span className="font-medium">{holding?.cost_basis_dividend_yield_percent?.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Market Value</span>
                  <span className="font-medium">${holding?.current_market_value?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">P/L</span>
                  <span className="font-medium">${holding?.unrealized_gain_loss?.toFixed(2)}</span>
                </div>
              </div>
            )}
          </CardContent >
        </Card >

        <div className="col-span-2">
          <div className="flex items-center justify-between mb-2 h-8">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          </div>
          <TradesTable exchange={exchange} symbol={tickerSymbol} onEditTrade={() => { }} short />
        </div>
      </div >
    </>
  )
}
