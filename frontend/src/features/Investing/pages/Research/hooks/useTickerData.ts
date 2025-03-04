import { useQuery } from "@tanstack/react-query";
import { tickersApi, tickersApiKeys } from "@/api/tickersApi";
import { holdingsApi, holdingsApiKeys } from "@/api/holdingsApi";
import { tradesApi, tradesApiKeys } from "@/api/tradesApi";
import { supabase } from "@/lib/supabase";
import { HistoricalPrice } from "@/types/historicalPricesTypes";
import { YahooFinanceDaily } from "@/types/yahooFinanceDaily";

interface TickerData {
  ticker: any; // Replace with proper ticker type
  historicalPrices: HistoricalPrice[] | null;
  holding: any; // Replace with proper holding type
  tickerTrades: any[]; // Replace with proper trade type
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

  // Historical Prices
  const { data: historicalPrices, isLoading: historicalPricesLoading } = useQuery({
    queryKey: ["historicalPrices", ticker?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("historical_prices")
        .select()
        .eq("ticker_id", ticker!.id);
      return data;
    },
    enabled: !!ticker?.id,
  });

  // Holdings Data
  const { data: holding, isLoading: holdingsLoading } = useQuery({
    queryKey: holdingsApiKeys.ticker(exchange, tickerSymbol),
    queryFn: () => holdingsApi.getTickerHolding(exchange, tickerSymbol),
    enabled: !!exchange && !!tickerSymbol,
  });

  // Trades Data
  const { data: tickerTrades = [], isLoading: tradesLoading } = useQuery({
    queryKey: tradesApiKeys.ticker(exchange, tickerSymbol),
    queryFn: () => tradesApi.getTickerTrades(exchange, tickerSymbol),
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
    tickerLoading ||
    historicalPricesLoading ||
    holdingsLoading ||
    tradesLoading ||
    yhFinanceLoading;

  const isError = !isLoading && (!ticker || !historicalPrices || !holding || !tickerTrades || !yhFinanceData);

  return {
    ticker,
    historicalPrices,
    holding,
    tickerTrades,
    yhFinanceData,
    isLoading,
    isError,
  } as TickerData;
}
