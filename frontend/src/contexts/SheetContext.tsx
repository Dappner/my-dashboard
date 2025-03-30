import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { TradeView } from "@/types/transactionsTypes";
import { Ticker } from "@/types/tickerTypes";

type SheetType = "transaction" | "ticker" | null;

interface SheetDataTypes {
  transaction: TradeView | null;
  ticker: Ticker | null;
}

interface SheetContextProps {
  activeSheet: SheetType;
  sheetData: any;
  openSheet: <T extends SheetType>(
    type: T,
    data?: T extends keyof SheetDataTypes ? SheetDataTypes[T] : never,
  ) => void;
  closeSheet: () => void;
}

const SheetContext = createContext<SheetContextProps | undefined>(undefined);

export const SheetProvider: React.FC<{ children: ReactNode }> = (
  { children },
) => {
  const [activeSheet, setActiveSheet] = useState<SheetType>(null);
  const [sheetData, setSheetData] = useState<any>(null);

  const openSheet = useCallback(<T extends SheetType>(
    type: T,
    data?: T extends keyof SheetDataTypes ? SheetDataTypes[T] : never,
  ) => {
    setActiveSheet(type);
    setSheetData(data || null);
  }, []);

  const closeSheet = useCallback(() => {
    setActiveSheet(null);
    setSheetData(null);
  }, []);

  const value = {
    activeSheet,
    sheetData,
    openSheet,
    closeSheet,
  };

  return (
    <SheetContext.Provider value={value}>
      {children}
    </SheetContext.Provider>
  );
};

export const useSheet = () => {
  const context = useContext(SheetContext);
  if (context === undefined) {
    throw new Error("useSheet must be used within a SheetProvider");
  }
  return context;
};

export const useTransactionSheet = () => {
  const { openSheet, closeSheet, activeSheet, sheetData } = useSheet();

  const openAddTransaction = useCallback(() => {
    openSheet("transaction", null);
  }, [openSheet]);

  const openEditTransaction = useCallback((transaction: TradeView) => {
    openSheet("transaction", transaction);
  }, [openSheet]);

  return {
    isTransactionSheetOpen: activeSheet === "transaction",
    selectedTransaction: activeSheet === "transaction" ? sheetData : null,
    openAddTransaction,
    openEditTransaction,
    closeSheet,
  };
};

export const useTickerSheet = () => {
  const { openSheet, closeSheet, activeSheet, sheetData } = useSheet();

  const openAddTicker = useCallback(() => {
    openSheet("ticker", null);
  }, [openSheet]);

  const openEditTicker = useCallback((ticker: Ticker) => {
    openSheet("ticker", ticker);
  }, [openSheet]);

  return {
    isTickerSheetOpen: activeSheet === "ticker",
    selectedTicker: activeSheet === "ticker" ? sheetData : null,
    openAddTicker,
    openEditTicker,
    closeSheet,
  };
};
