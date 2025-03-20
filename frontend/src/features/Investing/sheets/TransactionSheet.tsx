import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TransactionForm } from "../forms/TransactionForm";
import { TradeView } from "@/types/transactionsTypes";
import { useState } from "react";

export const useTransactionSheet = () => {
  const [isTransactionSheetOpen, setIsTransactionSheetOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<
    TradeView | null
  >(null);

  const openEditTransaction = (trade: TradeView) => {
    setSelectedTransaction(trade);
    setIsTransactionSheetOpen(true);
  };

  const openAddTransaction = () => {
    setSelectedTransaction(null);
    setIsTransactionSheetOpen(true);
  };

  const closeSheet = () => {
    setSelectedTransaction(null);
    setIsTransactionSheetOpen(false);
  };

  return {
    isTransactionSheetOpen,
    selectedTransaction,
    openEditTransaction,
    openAddTransaction,
    closeSheet,
    setIsTransactionSheetOpen,
  };
};

interface TransactionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: TradeView | null;
}
export function TransactionSheet(
  { isOpen, onClose, transaction }: TransactionSheetProps,
) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex flex-col h-full">
        <SheetHeader>
          <SheetTitle>
            {transaction ? "Edit Transaction" : "Add New Transaction"}
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 pb-2 overflow-y-auto">
          <TransactionForm
            tradeId={transaction?.id}
            onClose={onClose}
            defaultValues={transaction
              ? {
                ticker_id: transaction.ticker_id || "",
                transaction_type: transaction.transaction_type!,
                shares: transaction.shares!,
                price_per_share: transaction.price_per_share || 0,
                transaction_fee: transaction.transaction_fee || 0,
                transaction_date: new Date(
                  transaction.transaction_date + "T00:00:00",
                ),
                note_text: transaction.note_text || "",
                is_dividend_reinvestment: transaction.is_dividend_reinvestment!,
              }
              : undefined}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
