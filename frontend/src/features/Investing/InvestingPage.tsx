import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PortfolioChart from "./components/PortfolioChart";
import { ArrowUpRight, Plus } from "lucide-react";
import HoldingsTable from "./components/HoldingsTable";
import TradesTable from "./components/TradesTable";
import { useState } from "react";
import { TradeView } from "@/types/tradeTypes";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TradeForm } from "./forms/TradeForm";
import { useQuery } from "@tanstack/react-query";
import { portfoliosApi, portfoliosApiKey } from "@/api/portfoliosApi";
import { useAuthContext } from "@/contexts/AuthContext";
import PortfolioKpis from "./components/PortfolioKpis";


export default function InvestingPage() {
  const { user } = useAuthContext();
  const [isTradeSheetOpen, setIsTradeSheetOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<TradeView | null>(null);

  const { data: portfolio } = useQuery({
    queryFn: () => portfoliosApi.fetchUserPortfolio(user!.id),
    queryKey: portfoliosApiKey.all,
    enabled: !!user
  });

  const onEditTrade = (trade: TradeView) => {
    setSelectedTrade(trade);
    setIsTradeSheetOpen(true);
  };

  const onAddTrade = () => {
    setSelectedTrade(null);
    setIsTradeSheetOpen(true);
  };

  const onClose = () => {
    setSelectedTrade(null);
    setIsTradeSheetOpen(false);
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <PortfolioKpis portfolio={portfolio} />
        <div className="col-span-3">
          <PortfolioChart />
        </div>
        <Card className="col-span-1">
          <CardHeader className="flex flex-row justify-between">
            <CardTitle>Holdings</CardTitle>
            <ArrowUpRight className="text-blue-500 cursor-pointer hover:underline size-5" />
          </CardHeader>
          <CardContent>
            <HoldingsTable />
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardHeader className="flex flex-row justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Plus
              className="text-blue-500 cursor-pointer hover:underline size-5"
              onClick={onAddTrade} />
          </CardHeader>
          <CardContent>
            <TradesTable onEditTrade={onEditTrade} />
          </CardContent>
        </Card>
      </div>
      <Sheet open={isTradeSheetOpen} onOpenChange={setIsTradeSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add New Transaction</SheetTitle>
            <SheetDescription></SheetDescription>
          </SheetHeader>
          <div className="py-4">
            {selectedTrade ? (
              <TradeForm tradeId={selectedTrade.id!} onClose={onClose} defaultValues={
                {
                  ticker_id: selectedTrade.ticker_id!,
                  transaction_type: selectedTrade.transaction_type!,
                  shares: selectedTrade.shares!,
                  price_per_share: selectedTrade.price_per_share!,
                  transaction_fee: selectedTrade.transaction_fee!,
                  transaction_date: new Date(selectedTrade.transaction_date + "T00:00:00"),
                  note_text: selectedTrade.note_text || "",
                }} />
            ) : (
              <TradeForm onClose={onClose} />
            )}
          </div>
        </SheetContent>
      </Sheet>

    </>
  );
}
