import { SupabaseClient } from "@supabase/supabase-js";
import {
  calendarEventsApiKeys,
  createCalendarEventsApi,
} from "./modules/calendarEvents";
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
import { createFundsApi, fundsApiKeys } from "./modules/funds";
import { createIndustriesApi, industriesApiKeys } from "./modules/industries";
import { createSectorsApi, sectorsApiKeys } from "./modules/sectors";
import {
  createMarketStructureApi,
  marketStructureApiKeys,
} from "./modules/market-structure";
import {
  createMarketIndicesApi,
  marketIndicesApiKeys,
} from "./modules/marketIndices";

export const queryKeys = {
  calendarEvents: calendarEventsApiKeys,
  funds: fundsApiKeys,
  holdings: holdingsApiKeys,
  dailyMetrics: dailyMetricsApiKeys,
  tickerPrices: tickerPricesApiKeys,
  tickers: tickersApiKeys,
  transactions: transactionsApiKeys,
  industries: industriesApiKeys,
  sectors: sectorsApiKeys,
  marketStructure: marketStructureApiKeys,
  marketIndices: marketIndicesApiKeys,
};

export function createApi(supabase: SupabaseClient<Database>) {
  return {
    calendarEvents: createCalendarEventsApi(supabase),
    funds: createFundsApi(supabase),
    holdings: createHoldingsApi(supabase),
    dailyMetrics: createDailyMetricsApi(supabase),
    tickerPrices: createTickerPricesApi(supabase),
    tickers: createTickersApi(supabase),
    transactions: createTransactionsApi(supabase),
    industries: createIndustriesApi(supabase),
    sectors: createSectorsApi(supabase),
    marketStructure: createMarketStructureApi(supabase),
    marketIndices: createMarketIndicesApi(supabase),
  };
}

export type Api = ReturnType<typeof createApi>;
