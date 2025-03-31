import { holdingsApi, holdingsApiKeys } from "@/api/holdingsApi";
import { tickersApi, tickersApiKeys } from "@/api/tickersApi";
import { transactionsApi, transactionsApiKeys } from "@/api/tradesApi";
import { supabase } from "@/lib/supabase";
import type { HistoricalPrice } from "@/types/historicalPricesTypes";
import type { Holding } from "@/types/holdingsTypes";
import type { Ticker } from "@/types/tickerTypes";
import type { TradeView } from "@/types/transactionsTypes";
import type { YahooFinanceDaily } from "@/types/yahooFinanceDaily";
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
	// Ticker Data
	const { data: ticker, isLoading: tickerLoading } = useQuery({
		queryKey: tickersApiKeys.ticker(exchange, tickerSymbol),
		queryFn: () => tickersApi.getTicker(exchange, tickerSymbol),
		enabled: !!exchange && !!tickerSymbol,
	});

	// Holdings Data
	const { data: holding, isLoading: holdingsLoading } = useQuery({
		queryKey: holdingsApiKeys.ticker(exchange, tickerSymbol),
		queryFn: () => holdingsApi.getTickerHolding(exchange, tickerSymbol),
		enabled: !!exchange && !!tickerSymbol,
	});

	// Trades Data
	const { data: tickerTrades = [], isLoading: tradesLoading } = useQuery({
		queryKey: transactionsApiKeys.ticker(exchange, tickerSymbol),
		queryFn: () => transactionsApi.getTickerTrades(exchange, tickerSymbol),
		staleTime: 60 * 1000,
		enabled: !!exchange && !!tickerSymbol,
	});

	// Yahoo Finance Data
	const { data: yhFinanceData, isLoading: yhFinanceLoading } = useQuery({
		queryKey: ["yahooFinance", ticker?.id],
		queryFn: async () => {
			const { data } = await supabase
				.from("yh_finance_daily")
				.select()
				.eq("ticker_id", ticker!.id)
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
