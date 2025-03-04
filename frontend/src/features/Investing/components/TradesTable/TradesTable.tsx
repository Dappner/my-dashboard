import { format, parseISO } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { tradesApi, tradesApiKeys } from '@/api/tradesApi';
import { TradeView } from '@/types/tradeTypes';
import { useTrades } from '@/features/Investing/hooks/useTrades';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from 'lucide-react';
import TradesTableFilters, { TradesFilters } from './components/TradesTableFilters';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { getTradeTypeStyles } from './utils';

interface TradesTableProps {
  exchange?: string;
  symbol?: string;
  onEditTrade?: (trade: TradeView) => void;
  onAddTrade?: () => void;
  short?: boolean;
}

export default function TradesTable({ exchange, symbol,
  onEditTrade, onAddTrade,
  short = false
}: TradesTableProps) {
  const [filters, setTradeFilters] = useState<TradesFilters>({
    transaction_type: 'all',
    ticker: 'all',
  });

  const { data: allTrades = [], isLoading, isError } = useQuery({
    queryKey: exchange ? tradesApiKeys.ticker(exchange, symbol!) : tradesApiKeys.all,
    queryFn: exchange
      ? () => tradesApi.getTickerTrades(exchange!, symbol!)
      : () => tradesApi.getTrades(),
    staleTime: 60 * 1000,
  });

  const { deleteTrade } = useTrades();

  // Handle short view and filtering in one go
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

  const handleDeleteTrade = (id: string) => {
    if (confirm("Are you sure you want to delete this trade?")) {
      deleteTrade(id);
    }
  };


  return (
    <div className={cn("w-full ", short ? "space-y-2" : "space-y-4")}>
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
        <div className="bg-white border rounded-md">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Ticker</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
                {!short && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedTrades.map((trade) => {
                const typeStyles = getTradeTypeStyles(trade.transaction_type as string);

                return (
                  <TableRow key={trade.id}>
                    <TableCell>
                      <Badge
                        variant={typeStyles.variant}
                        className={cn(
                          "font-medium",
                          typeStyles.className,
                          short && "text-xs"
                        )}
                      >
                        {trade.transaction_type?.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className={short ? "text-sm" : ""}>
                      {format(parseISO(trade.transaction_date!), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className={short ? "text-sm" : ""}>
                      {trade.symbol}
                    </TableCell>
                    <TableCell className={cn("text-right", short && "text-sm")}>
                      {trade.shares!.toFixed(2)}
                    </TableCell>
                    <TableCell className={cn("text-right", short && "text-sm")}>
                      ${trade.price_per_share!.toFixed(2)}
                    </TableCell>
                    <TableCell className={cn("text-right font-medium", short && "text-sm")}>
                      ${trade.total_cost_basis?.toFixed(2)}
                    </TableCell>
                    {!short && (
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditTrade!(trade)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTrade(trade.id!)}
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
          </Table>
        </div>
      )}
    </div>
  );
}
