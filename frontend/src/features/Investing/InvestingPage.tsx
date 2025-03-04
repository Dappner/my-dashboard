import { Plus } from "lucide-react";
import PortfolioChart from "./components/PortfolioChart";
import HoldingsTable from "./components/HoldingsTable";
import TradesTable from "./components/TradesTable";
import { useState } from "react";
import { TradeView } from "@/types/tradeTypes";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TradeForm } from "./forms/TradeForm";
import { useQuery } from "@tanstack/react-query";
import { portfoliosApi, portfoliosApiKey } from "@/api/portfoliosApi";
import { useAuthContext } from "@/contexts/AuthContext";
import PortfolioKpis from "./components/PortfolioKpis";
import { Button } from "@/components/ui/button";

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
  };

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-3 gap-4">
        <PortfolioKpis portfolio={portfolio} />
      </div>

      <PortfolioChart />

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1">
          <div className="flex items-center justify-between mb-2 h-8">
            <h2 className="text-lg font-semibold text-gray-900">Holdings</h2>
          </div>
          <HoldingsTable />
        </div>

        <div className="col-span-2">
          <div className="flex items-center justify-between mb-2 h-8">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={onAddTrade}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Trade
            </Button>
          </div>
          <TradesTable onEditTrade={onEditTrade} short={true} />
        </div>
      </div>

      <Sheet open={isTradeSheetOpen} onOpenChange={setIsTradeSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selectedTrade ? "Edit Transaction" : "Add New Transaction"}</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            {selectedTrade ? (
              <TradeForm
                tradeId={selectedTrade.id!}
                onClose={onClose}
                defaultValues={{
                  ticker_id: selectedTrade.ticker_id!,
                  transaction_type: selectedTrade.transaction_type!,
                  shares: selectedTrade.shares!,
                  price_per_share: selectedTrade.price_per_share!,
                  transaction_fee: selectedTrade.transaction_fee!,
                  transaction_date: new Date(selectedTrade.transaction_date + "T00:00:00"),
                  note_text: selectedTrade.note_text || "",
                }}
              />
            ) : (
              <TradeForm onClose={onClose} />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
