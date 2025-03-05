import { TradeView } from "@/types/transactionsTypes";
import { useState } from "react";

export const useTransactionSheet = () => {
  const [isTransactionSheetOpen, setIsTransactionSheetOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TradeView | null>(null);

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
