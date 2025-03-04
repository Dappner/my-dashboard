import { TradeView } from "@/types/tradeTypes";
import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TradeForm } from "@/features/Investing/forms/TradeForm";
import TradesTable from "../../components/TradesTable/TradesTable";

export default function TransactionsPage() {
  const [isTradeSheetOpen, setIsTradeSheetOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<TradeView | null>(null);



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
      <div className="px-2">
        <TradesTable onEditTrade={onEditTrade} onAddTrade={onAddTrade} />
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
  )
}
