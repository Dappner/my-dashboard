import { useHolding } from "@/features/Investing/hooks/useHolding";
import { useTicker } from "@/features/Investing/hooks/useTicker";
import { useTransactions } from "@/features/Investing/hooks/useTransactions";
import { supabase } from "@/lib/supabase";
import type { YahooFinanceDaily } from "@/types/yahooFinanceDaily";
import type {
	HistoricalPrice,
	Holding,
	Ticker,
	TradeView,
} from "@my-dashboard/shared";
import { useQuery } from "@tanstack/react-query";

interface TickerData {
	ticker: Ticker;
	historicalPrices: HistoricalPrice[] | null;
	holding: Holding;
	tickerTrades: TradeView[];
	yhFinanceData: YahooFinanceDaily | null;
	isLoading: boolean;
	isError: boolean;
}

export function useTickerData(exchange: string, tickerSymbol: string) {
	const { ticker, isLoading: tickerLoading } = useTicker({
		queryOptions: {
			exchange: exchange,
			tickerSymbol: tickerSymbol,
			enabled: !!exchange && !!tickerSymbol,
		},
	});

	const { holding, isLoading: holdingsLoading } = useHolding({
		queryOptions: {
			exchange,
			tickerSymbol,
			enabled: !!exchange && !!tickerSymbol,
		},
	});

	// Transaction Data
	const { transactions: tickerTrades = [], isLoading: tradesLoading } =
		useTransactions({
			queryOptions: {
				ticker: { exchange, tickerSymbol },
			},
		});

	// Yahoo Finance Data
	const { data: yhFinanceData, isLoading: yhFinanceLoading } = useQuery({
		queryKey: ["yahooFinance", ticker?.id],
		queryFn: async () => {
			if (!ticker?.id) return;
			const { data } = await supabase
				.from("yh_finance_daily")
				.select()
				.eq("ticker_id", ticker?.id)
				.single();
			return data as YahooFinanceDaily;
		},
		enabled: !!ticker?.id,
	});

	// Consolidated loading and error states
	const isLoading =
		tickerLoading || holdingsLoading || tradesLoading || yhFinanceLoading;

	const isError =
		!isLoading && (!ticker || !holding || !tickerTrades || !yhFinanceData);

	return {
		ticker,
		holding,
		tickerTrades,
		yhFinanceData,
		isLoading,
		isError,
	} as TickerData;
}
