import { BriefcaseIcon, MapPinIcon } from "lucide-react";
import { useParams } from "react-router"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewTab from "./tabs/OverviewTab";
import { Button } from "@/components/ui/button";
import { useTickerData } from "./hooks/useTickerData";
import HoldingsPanel from "./components/HoldingsPanel";

export default function TickerPage() {
  const { exchange, ticker: tickerSymbol } = useParams();
  if (!exchange || !tickerSymbol) return <>invalid</>

  const { ticker, holding, tickerTrades, isLoading } = useTickerData(exchange, tickerSymbol);

  const onClickEdgar = () => {
    window.open(`https://www.sec.gov/edgar/browse/?CIK=${ticker?.cik}&owner=exclude`, "_blank")
  }

  return (
    <div className="space-y-6 p-4 relative">
      <div className="lg:flex lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-8 w-1/3 bg-gray-200 rounded" />
              <div className="flex space-x-6">
                <div className="h-5 w-1/4 bg-gray-200 rounded" />
                <div className="h-5 w-1/4 bg-gray-200 rounded" />
              </div>
            </div>
          ) :
            (
              <>
                <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">{ticker?.name}</h2>
                <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <BriefcaseIcon aria-hidden="true" className="mr-1.5 size-5 shrink-0 text-gray-400" />
                    {ticker?.sector}
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <MapPinIcon aria-hidden="true" className="mr-1.5 size-5 shrink-0 text-gray-400" />
                    {ticker?.industry}
                  </div>
                </div>
              </>
            )
          }
        </div>
        <div className="flex gap-4">
          {isLoading ? (
            <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
          ) : (
            ticker?.cik && <Button onClick={onClickEdgar}>Edgar</Button>
          )}
        </div>
      </div>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview" className="cursor-pointer">
            Overview
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading ticker data...</div>
          ) : (
            <OverviewTab tickerId={ticker?.id} exchange={exchange} tickerSymbol={tickerSymbol} />
          )}
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
