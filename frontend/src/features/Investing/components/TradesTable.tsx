import { useQuery } from '@tanstack/react-query';
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
import { useTrades } from '../hooks/useTrades';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface TradesTableProps {
  exchange?: string;
  symbol?: string;
  onEditTrade: (trade: TradeView) => void;
  short?: boolean;
}
export default function TradesTable({ exchange, symbol, onEditTrade, short }: TradesTableProps) {
  const { data: trades = [], isLoading, isError } = useQuery({
    queryKey: exchange ? tradesApiKeys.ticker(exchange, symbol!) : tradesApiKeys.all,
    queryFn: exchange ? () => tradesApi.getTickerTrades(exchange!, symbol!, short ? 5 : undefined) : () => tradesApi.getTrades(short ? 5 : undefined),
  });

  const { deleteTrade } = useTrades();

  const onDeleteTrade = (id: string) => {
    if (confirm("Are you sure you want to delete this trade?")) {
      deleteTrade(id);
    }
  };


  return (
    <div className="w-full">
      {isLoading ? (
        <div className="text-center py-4">Loading trades...</div>
      ) : isError ? (
        <div className="text-center py-4">Error Loading Trades. Please Refresh the page.</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Ticker</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(trades || []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  No trades found. Add your first trade.
                </TableCell>
              </TableRow>
            ) : (
              trades.map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell className={trade.transaction_type === 'buy' ? 'text-green-600 ' : 'text-red-600'}>
                    {trade.transaction_type?.toUpperCase()}
                  </TableCell>
                  <TableCell>
                    {format(parseISO(trade.transaction_date!), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>{trade.symbol}</TableCell>
                  <TableCell className="text-right">{trade.shares!.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${trade.price_per_share!.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-medium">
                    ${trade.total_cost_basis?.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditTrade(trade)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteTrade(trade.id!)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>

                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
