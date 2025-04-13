import { TickerSheet } from "@/features/Investing/sheets/TickerSheet";
import { TransactionSheet } from "@/features/Investing/sheets/TransactionSheet";
import type { Ticker, TradeView } from "@my-dashboard/shared";
import { useSheet } from "../contexts/SheetContext";

export const SheetContainer: React.FC = () => {
	const { activeSheet, sheetData, closeSheet } = useSheet();

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
