import { format, parseISO } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { TradeView } from '@/types/transactionsTypes';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from 'lucide-react';
import TradesTableFilters, { TradesFilters } from './components/TradesTableFilters';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { getTradeTypeStyles, getCashflowStyles } from './utils';
import { transactionsApi, transactionsApiKeys } from '@/api/tradesApi';
import { useTransactions } from '../../hooks/useTransactions';

interface TradesTableProps {
  exchange?: string;
  symbol?: string;
  onEditTrade?: (trade: TradeView) => void;
  onAddTrade?: () => void;
  short?: boolean;
}

export default function TradesTable({
  exchange,
  symbol,
  onEditTrade,
  onAddTrade,
  short = false
}: TradesTableProps) {
  const [filters, setTradeFilters] = useState<TradesFilters>({
    transaction_type: 'all',
    ticker: 'all',
  });

  const { data: allTrades = [], isLoading, isError } = useQuery({
    queryKey: exchange ? transactionsApiKeys.ticker(exchange, symbol!) : transactionsApiKeys.all,
    queryFn: exchange
      ? () => transactionsApi.getTickerTrades(exchange!, symbol!)
      : () => transactionsApi.getTransactions(),
    staleTime: 60 * 1000,
  });

  const { deleteTrade } = useTransactions();

  const displayedTrades = useMemo(() => {
    let result = allTrades;

    result = result.filter((trade) => {
      const transactionTypeMatch = filters.transaction_type === 'all' || !filters.transaction_type
        ? true
        : filters.transaction_type === trade.transaction_type;

      const tickerMatch = filters.ticker === 'all' || !filters.ticker
        ? true
        : filters.ticker === trade.ticker_id;

      return transactionTypeMatch && tickerMatch;
    });

    if (short) {
      result = result.slice(0, 5);
    }

    return result;
  }, [allTrades, filters, short]);

  const netCashflow = useMemo(() => {
    return displayedTrades.reduce((sum, trade) => {
      const amount = parseFloat(trade.total_cost_basis?.toFixed(2) || '0');
      return trade.transaction_type === 'buy' || trade.transaction_type === 'withdraw'
        ? sum - amount
        : sum + amount;
    }, 0);
  }, [displayedTrades]);

  const handleDeleteTrade = (id: string) => {
    if (confirm("Are you sure you want to delete this trade?")) {
      deleteTrade(id);
    }
  };

  return (
    <div className={cn("w-full", short ? "space-y-2" : "space-y-4")}>
      {!short && (
        <TradesTableFilters
          filters={filters}
          setTradesFilters={setTradeFilters}
          onAddTrade={onAddTrade!}
        />
      )}
      {isLoading ? (
        <div className="text-center py-4 text-muted-foreground">Loading trades...</div>
      ) : isError ? (
        <div className="text-center py-4 text-destructive">Error loading trades. Please refresh the page.</div>
      ) : displayedTrades.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          {short ? "No recent trades found" : "No trades found matching the filters"}
        </div>
      ) : (
        <div className="bg-white border rounded-md shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold text-muted-foreground">Type</TableHead>
                <TableHead className="font-semibold text-muted-foreground">Date</TableHead>
                <TableHead className="font-semibold text-muted-foreground">Ticker</TableHead>
                <TableHead className="text-right font-semibold text-muted-foreground">Quantity</TableHead>
                <TableHead className="text-right font-semibold text-muted-foreground">Price</TableHead>
                <TableHead className="text-right font-semibold text-muted-foreground">Cashflow</TableHead>
                {!short && <TableHead className="text-right font-semibold text-muted-foreground">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedTrades.map((trade) => {
                const typeStyles = getTradeTypeStyles(trade.transaction_type!);
                const cashFlowStyles = getCashflowStyles(trade.transaction_type!);

                return (
                  <TableRow
                    key={trade.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <TableCell>
                      <Badge
                        variant={typeStyles.variant}
                        className={cn(
                          "font-medium",
                          typeStyles.className,
                          short && "text-xs px-2"
                        )}
                      >
                        {trade.transaction_type?.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className={cn(short && "text-sm")}>
                      {format(parseISO(trade.transaction_date!), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className={cn(short && "text-sm")}>
                      {trade.symbol}
                    </TableCell>
                    <TableCell className={cn("text-right", short && "text-sm")}>
                      {trade.shares!.toFixed(2)}
                    </TableCell>
                    <TableCell className={cn("text-right", short && "text-sm")}>
                      ${trade.price_per_share!.toFixed(2)}
                    </TableCell>
                    <TableCell className={cn("text-right font-medium", cashFlowStyles, short && "text-sm")}>
                      ${trade.total_cost_basis?.toFixed(2)}
                    </TableCell>
                    {!short && (
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditTrade!(trade)}
                            className="hover:bg-muted rounded-full"
                          >
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTrade(trade.id!)}
                            className="hover:bg-muted rounded-full"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
            {!short && (
              <TableFooter className="bg-muted/30">
                <TableRow>
                  <TableCell colSpan={5} className="font-semibold">
                    Net Cashflow
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-semibold",
                      netCashflow >= 0 ? "text-green-700" : "text-red-600"
                    )}
                  >
                    ${Math.abs(netCashflow).toFixed(2)}
                    {netCashflow >= 0 ? " In" : " Out"}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      )}
    </div>
  );
}

