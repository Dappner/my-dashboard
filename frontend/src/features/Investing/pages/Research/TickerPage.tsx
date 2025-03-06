import { useParams } from "react-router"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewTab from "./tabs/OverviewTab";
import { useTickerData } from "./hooks/useTickerData";
import HoldingsPanel from "./components/HoldingsPanel";
import FundTab from "./tabs/FundTab";
import TickerHeader from "./components/TickerHeader";

export default function TickerPage() {
  const { exchange, ticker: tickerSymbol } = useParams();
  if (!exchange || !tickerSymbol) return <>invalid</>

  const { ticker, holding, tickerTrades, isLoading, yhFinanceData } = useTickerData(exchange, tickerSymbol);

  const latestPrice = yhFinanceData?.regular_market_price;


  return (
    <div className="space-y-6 p-4 relative">
      <TickerHeader
        ticker={ticker}
        latestPrice={latestPrice}
        isLoading={isLoading}
      />
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview" className="cursor-pointer">
            Overview
          </TabsTrigger>
          <TabsTrigger value="financials" className="cursor-pointer">
            Financials
          </TabsTrigger>
          {!isLoading && ticker.quote_type != "EQUITY" &&
            <TabsTrigger value="fund" className="cursor-pointer">Fund Stats</TabsTrigger>
          }
        </TabsList>
        <TabsContent value="overview">
          <OverviewTab exchange={exchange} tickerSymbol={tickerSymbol} />
        </TabsContent>
        <TabsContent value="financials">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading ticker data...</div>
          ) : (
            <>
              <div className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 py-36 text-center focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden">
                <span className="mt-2 block text-base font-semibold text-gray-600">Under Development</span>
              </div>
            </>
          )}
        </TabsContent>
        <TabsContent value="fund">
          <FundTab tickerId={ticker?.id} exchange={exchange} tickerSymbol={tickerSymbol} />
        </TabsContent>
      </Tabs>

      {holding && (
        <HoldingsPanel
          holding={holding}
          tickerTrades={tickerTrades}
          exchange={exchange}
          tickerSymbol={tickerSymbol}
        />
      )}
    </div >
  )
}
