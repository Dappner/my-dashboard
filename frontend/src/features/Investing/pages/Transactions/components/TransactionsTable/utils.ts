import { TradeView } from "@/types/transactionsTypes";
import { TransactionsFilters } from "./components/TransactionsFilters";
import { parseISO } from "date-fns";

export function filterTrades(filters: TransactionsFilters, trades: TradeView[]) {
  return trades.filter((trade) => {
    const transactionTypeMatch = filters.transaction_type === 'all' || !filters.transaction_type
      ? true
      : filters.transaction_type === trade.transaction_type;

    const tickerMatch = filters.ticker === 'all' || !filters.ticker
      ? true
      : filters.ticker === trade.ticker_id;

    const dateMatch = !filters.dateRange
      ? true
      : (() => {
        const tradeDate = parseISO(trade.transaction_date!);
        const fromDate = filters.dateRange?.from;
        const toDate = filters.dateRange?.to;

        if (fromDate && toDate) {
          return tradeDate >= fromDate && tradeDate <= toDate;
        }
        if (fromDate) {
          return tradeDate >= fromDate;
        }
        if (toDate) {
          return tradeDate <= toDate;
        }
        return true;
      })();

    return transactionTypeMatch && tickerMatch && dateMatch;
  });

}
