import { holdingsApiKeys, holdingsApi } from "@/api/holdingsApi";
import { useQuery } from "@tanstack/react-query";
import StockPriceChart from "../components/StockPriceChart";
import { HistoricalPrice } from "@/types/historicalPricesTypes";
import TradesTable from "@/features/Investing/components/TradesTable/TradesTable";
import HoldingsSummary from "../components/HoldingsSummary";
import { supabase } from "@/lib/supabase";
import YhFinanceStats from "../components/YhFinanceStats";
import { YahooFinanceDaily } from "@/types/yahooFinanceDaily";
import { tradesApi, tradesApiKeys } from "@/api/tradesApi";

interface OverviewTabProps {
  exchange: string;
  tickerSymbol: string;
  tickerId?: string;
  historicalPrices?: HistoricalPrice[] | null;
}
export default function OverviewTab({ exchange, tickerSymbol, historicalPrices, tickerId }: OverviewTabProps) {

  const { data: holding, isLoading: holdingsLoading } = useQuery({
    queryKey: holdingsApiKeys.ticker(exchange, tickerSymbol),
    queryFn: () => holdingsApi.getTickerHolding(exchange, tickerSymbol),
    enabled: !!exchange && !!tickerSymbol
  });

  const { data: tickerTrades = [], isLoading, isError } = useQuery({
    queryKey: exchange ? tradesApiKeys.ticker(exchange, tickerSymbol!) : tradesApiKeys.all,
    queryFn: exchange
      ? () => tradesApi.getTickerTrades(exchange!, tickerSymbol!)
      : () => tradesApi.getTrades(),
    staleTime: 60 * 1000,
  });

  const { data: yhFinanceData, isLoading: yhFinanceIsLoading } = useQuery({
    queryKey: ["yahooFinance"],
    queryFn: async () => {
      const { data } = await supabase.from("yh_finance_daily").select().eq("ticker_id", tickerId!).limit(1);
      return data ? data[0] as YahooFinanceDaily : null;
    },
    enabled: !!tickerId
  })


  return (
    <>
      <div className="grid grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="col-span-2 xl:col-span-5">
          {historicalPrices && !holdingsLoading ? (
            <StockPriceChart data={historicalPrices} holding={holding || undefined} tickerTrades={tickerTrades || undefined} />
          ) : (
            <>
            </>
          )}
        </div>
        <div className="col-span-1">
          <YhFinanceStats yahooFinanceDaily={yhFinanceData} isLoading={yhFinanceIsLoading} />
        </div>
        <div className="col-span-1 xl:col-span-2 ">
          <HoldingsSummary holding={holding} isLoading={holdingsLoading} />
        </div>

        <div className="col-span-2 xl:col-span-4">
          <div className="flex items-center justify-between mb-2 h-8">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          </div>
          <TradesTable exchange={exchange} symbol={tickerSymbol} short />
        </div>
      </div >
    </>
  )
}
