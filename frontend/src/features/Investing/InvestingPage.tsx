import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PortfolioChart from "./components/PortfolioChart";
import { ArrowUpRight, Plus } from "lucide-react";
import HoldingsTable from "./components/HoldingsTable";
import TradesTable from "./components/TradesTable";
import { useState } from "react";
import AddTradeSheet from "./forms/AddTradeSheet";
import { TradeView } from "@/types/tradeTypes";

export default function InvestingPage() {
  const [isTradeSheetOpen, setIsTradeSheetOpen] = useState(false);
  const [tradeSheetMode, setTradeSheetMode] = useState<"create" | "update">("create");
  const [selectedTrade, setSelectedTrade] = useState<TradeView | null>(null);

  const onEditClick = (trade: TradeView) => {
    setTradeSheetMode("update");
    setSelectedTrade(trade);
    setIsTradeSheetOpen(true);
  };

  const onAddClick = () => {
    setTradeSheetMode("create");
    setSelectedTrade(null);
    setIsTradeSheetOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
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
            <CardTitle>Transactions</CardTitle>
            <Plus
              className="text-blue-500 cursor-pointer hover:underline size-5"
              onClick={onAddClick} />
          </CardHeader>
          <CardContent>
            <TradesTable onEditClick={onEditClick} />
          </CardContent>
        </Card>
      </div>

      <AddTradeSheet
        open={isTradeSheetOpen}
        onOpenChange={setIsTradeSheetOpen}
        mode={tradeSheetMode}
        defaultValues={
          selectedTrade
            ? {
              ticker_id: selectedTrade.ticker_id!,
              transaction_type: selectedTrade.transaction_type!,
              shares: selectedTrade.shares!,
              price_per_share: selectedTrade.price_per_share!,
              transaction_fee: selectedTrade.transaction_fee!,
              transaction_date: new Date(selectedTrade.transaction_date + "T00:00:00"),
              note_text: selectedTrade.note_text || "",
            }
            : undefined
        }
        tradeId={selectedTrade?.id || undefined}
      />
    </>
  );
}
