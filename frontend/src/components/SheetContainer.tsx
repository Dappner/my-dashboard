import { TickerSheet } from "@/features/Investing/sheets/TickerSheet";
import { TransactionSheet } from "@/features/Investing/sheets/TransactionSheet";
import type { Ticker } from "@/types/tickerTypes";
import type { TradeView } from "@/types/transactionsTypes";
import { useSheet } from "../contexts/SheetContext";

export const SheetContainer: React.FC = () => {
	const { activeSheet, sheetData, closeSheet } = useSheet();

	// TODO: Add more sheets
	return (
		<>
			{activeSheet === "transaction" && (
				<TransactionSheet
					isOpen={true}
					onClose={closeSheet}
					transaction={sheetData as TradeView | null}
				/>
			)}
			{activeSheet === "ticker" && (
				<TickerSheet
					isOpen={true}
					onClose={closeSheet}
					ticker={sheetData as Ticker | null}
				/>
			)}
		</>
	);
};
