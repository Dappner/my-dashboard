import type { Ticker, TradeView } from "@my-dashboard/shared";
import type React from "react";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";

type SheetType = "transaction" | "ticker";

interface SheetDataTypes {
	transaction: TradeView;
	ticker: Ticker;
}

interface SheetContextProps {
	activeSheet: SheetType | null;
	sheetData: SheetDataTypes[keyof SheetDataTypes] | null;
	isSheetOpen: boolean;
	openSheet: <T extends SheetType>(type: T, data?: SheetDataTypes[T]) => void;
	closeSheet: () => void;
}

const SheetContext = createContext<SheetContextProps | undefined>(undefined);

export const SheetProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [activeSheet, setActiveSheet] = useState<SheetType | null>(null);
	const [sheetData, setSheetData] = useState<
		SheetDataTypes[keyof SheetDataTypes] | null
	>(null);

	const openSheet = useCallback(
		<T extends SheetType>(type: T, data?: SheetDataTypes[T]) => {
			setActiveSheet(type);
			setSheetData(data || null);
		},
		[],
	);
	const closeSheet = useCallback(() => {
		setActiveSheet(null);
		setSheetData(null);
	}, []);

	const value = useMemo(
		() => ({
			activeSheet,
			sheetData,
			isSheetOpen: activeSheet !== null,
			openSheet,
			closeSheet,
		}),
		[activeSheet, sheetData, openSheet, closeSheet],
	);

	return (
		<SheetContext.Provider value={value}>{children}</SheetContext.Provider>
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
		openSheet("transaction");
	}, [openSheet]);

	const openEditTransaction = useCallback(
		(transaction: TradeView) => {
			openSheet("transaction", transaction);
		},
		[openSheet],
	);

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
		openSheet("ticker");
	}, [openSheet]);

	const openEditTicker = useCallback(
		(ticker: Ticker) => {
			openSheet("ticker", ticker);
		},
		[openSheet],
	);

	return {
		isTickerSheetOpen: activeSheet === "ticker",
		selectedTicker: activeSheet === "ticker" ? sheetData : null,
		openAddTicker,
		openEditTicker,
		closeSheet,
	};
};
