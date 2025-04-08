import { SupabaseClient } from "@supabase/supabase-js";
import {
  calendarEventsApiKeys,
  createCalendarEventsApi,
} from "./modules/calendarEvents";
import { createFundApi, fundApiKeys } from "./modules/fund";
import { createHoldingsApi, holdingsApiKeys } from "./modules/holdings";
import {
  createDailyMetricsApi,
  dailyMetricsApiKeys,
} from "./modules/portfolioDailyMetrics";
import {
  createTickerPricesApi,
  tickerPricesApiKeys,
} from "./modules/tickerPrices";
import { Database } from "@/supabase";
import { createTickersApi, tickersApiKeys } from "./modules/tickers";
import {
  createTransactionsApi,
  transactionsApiKeys,
} from "./modules/transactions";

export const queryKeys = {
  calendarEvents: calendarEventsApiKeys,
  fund: fundApiKeys,
  holdings: holdingsApiKeys,
  dailyMetrics: dailyMetricsApiKeys,
  tickerPrices: tickerPricesApiKeys,
  tickers: tickersApiKeys,
  transactions: transactionsApiKeys,
};

export function createApi(supabase: SupabaseClient<Database>) {
  return {
    calendarEvents: createCalendarEventsApi(supabase),
    fund: createFundApi(supabase),
    holdings: createHoldingsApi(supabase),
    dailyMetrics: createDailyMetricsApi(supabase),
    tickerPrices: createTickerPricesApi(supabase),
    tickers: createTickersApi(supabase),
    transactions: createTransactionsApi(supabase),
  };
}

export type Api = ReturnType<typeof createApi>;

// Re-export individual module types
export * from "./modules/calendarEvents";
export * from "./modules/fund";
export * from "./modules/holdings";
export * from "./modules/portfolioDailyMetrics";
export * from "./modules/tickerPrices";
export * from "./modules/tickers";
export * from "./modules/transactions";
