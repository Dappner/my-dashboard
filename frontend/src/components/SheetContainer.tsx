import { TransactionSheet } from "@/features/Investing/sheets/TransactionSheet";
import { useSheet } from "../contexts/SheetContext";
import { TickerSheet } from "@/features/Investing/sheets/TickerSheet";

export const SheetContainer: React.FC = () => {
  const { activeSheet, sheetData, closeSheet } = useSheet();

  // TODO: Add more sheets
  return (
    <>
      {activeSheet === "transaction" && (
        <TransactionSheet
          isOpen={true}
          onClose={closeSheet}
          transaction={sheetData}
        />
      )}
      {activeSheet === "ticker" && (
        <TickerSheet
          isOpen={true}
          onClose={closeSheet}
          ticker={sheetData}
        />
      )}
    </>
  );
};
