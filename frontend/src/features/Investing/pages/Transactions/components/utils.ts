import type { TradeView } from "@/types/transactionsTypes";
import { parseISO } from "date-fns";
import type { TransactionsFilters } from "./TransactionsFilters";

export function filterTransactions(
  filters: TransactionsFilters,
  transactions?: TradeView[],
) {
  return transactions?.filter((trade) => {
    const transactionTypeMatch =
      filters.transaction_type === "all" || !filters.transaction_type
        ? true
        : filters.transaction_type === trade.transaction_type;

    const tickerMatch = filters.ticker === "all" || !filters.ticker
      ? true
      : filters.ticker === trade.ticker_id;

    const dateMatch = !filters.dateRange ? true : (() => {
      const tradeDate = parseISO(trade.transaction_date || "");
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
