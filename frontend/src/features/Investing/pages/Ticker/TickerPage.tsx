import LoadingState from "@/components/layout/components/LoadingState";
import { PageContainer } from "@/components/layout/components/PageContainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { useParams } from "@tanstack/react-router";
import { useTickerData } from "../Research/hooks/useTickerData";
import HoldingsPanel from "./components/HoldingsPanel";
import TickerHeader from "./components/TickerHeader";
import FundTab from "./tabs/FundTab";
import OverviewTab from "./tabs/OverviewTab";

export default function TickerPage() {
  const { exchange, ticker: tickerSymbol } = useParams({ strict: false });
  const isMobile = useIsMobile();
  if (!exchange || !tickerSymbol) return <>invalid</>;

  const { ticker, holding, tickerTrades, isLoading } = useTickerData(
    exchange,
    tickerSymbol,
  );
  if (isLoading) return <LoadingState />;

  return (
    <PageContainer className="pb-[16rem]">
      <TickerHeader ticker={ticker} />
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview" className="cursor-pointer">
            Overview
          </TabsTrigger>
          <TabsTrigger value="financials" className="cursor-pointer">
            Financials
          </TabsTrigger>
          {!isLoading && ticker.quote_type !== "EQUITY" && (
            <TabsTrigger value="fund" className="cursor-pointer">
              Fund Stats
            </TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="overview">
          <OverviewTab exchange={exchange} tickerSymbol={tickerSymbol} />
        </TabsContent>
        <TabsContent value="financials">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading ticker data...
            </div>
          ) : (
            <>
              <div className="relative block w-full rounded-lg border-2 border-dashed border-accent p-12 py-36 text-center focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden">
                <span className="mt-2 block text-base font-semibold text-muted-foreground">
                  Under Development
                </span>
              </div>
            </>
          )}
        </TabsContent>
        <TabsContent value="fund">
          <FundTab
            tickerId={ticker?.id}
            exchange={exchange}
            tickerSymbol={tickerSymbol}
          />
        </TabsContent>
      </Tabs>

      {holding && !isMobile && (
        <HoldingsPanel
          holding={holding}
          tickerTrades={tickerTrades}
          exchange={exchange}
          tickerSymbol={tickerSymbol}
        />
      )}
    </PageContainer>
  );
}
