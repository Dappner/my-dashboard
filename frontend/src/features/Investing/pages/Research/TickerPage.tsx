import { tickersApi, tickersApiKeys } from "@/api/tickersApi";
import { useQuery } from "@tanstack/react-query";
import { BriefcaseIcon, MapPinIcon } from "lucide-react";
import { useParams } from "react-router"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewTab from "./tabs/OverviewTab";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function TickerPage() {
  const { exchange, ticker: tickerSymbol } = useParams();
  if (!exchange || !tickerSymbol) return <>invalid</>

  const { data: ticker, isLoading: tickerLoading } = useQuery({
    queryKey: tickersApiKeys.ticker(exchange, tickerSymbol),
    queryFn: () => tickersApi.getTicker(exchange, tickerSymbol),
    enabled: !!exchange && !!tickerSymbol
  });

  const { data: historicalPrices, isLoading: historicalPricesLoading } =
    useQuery({
      queryKey: ["historicalPrices", ticker?.id], // Add ticker?.id to the query key
      queryFn: async () => {
        const { data } = await supabase
          .from("historical_prices")
          .select()
          .eq("ticker_id", ticker!.id);
        return data;
      },
      enabled: !!ticker?.id,
    });

  const onClickEdgar = () => {
    window.open(`https://www.sec.gov/edgar/browse/?CIK=${ticker?.cik}&owner=exclude`, "_blank")
  }

  return (
    <div className="space-y-6 p-4">
      <div className="lg:flex lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          {tickerLoading ?
            (
              <>Loading</>
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
          {/* Action Buttons */}
          {ticker?.cik && (
            <Button onClick={onClickEdgar}>Edgar</Button>
          )}
        </div>
      </div>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview" className="cursor-pointer">Overview</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <OverviewTab exchange={exchange} tickerSymbol={tickerSymbol} historicalPrices={historicalPrices} />
        </TabsContent>
      </Tabs>

    </div >
  )
}
