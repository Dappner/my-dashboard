import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { transactionsApi, transactionsApiKeys } from '@/api/tradesApi';
import TransactionsFilters, { type TransactionsFilters as TFilters } from './components/TransactionsFilters';
import PaginationControls from './components/PaginationControls';
import { TradeView } from '@/types/transactionsTypes';
import { Button } from '@/components/ui/button';
import { filterTrades } from './utils';
import TransactionTable from '@/features/Investing/components/TransactionTable';
import { useTransactions } from '@/features/Investing/hooks/useTransactions';

interface TransactionsTableProps {
  exchange?: string;
  symbol?: string;
  onEditTransaction?: (trade: TradeView) => void;
  onAddTransaction?: () => void;
  itemsPerPage?: number;
  onKPIUpdate?: (kpis: {
    netCashflow: number;
    totalTrades: number;
    netCash: number;
  }) => void;
}

export default function TransactionsTable({
  exchange,
  symbol,
  onEditTransaction,
  onAddTransaction,
  itemsPerPage = 10,
  onKPIUpdate,
}: TransactionsTableProps) {
  const [filters, setFilters] = useState<TFilters>({
    transaction_type: 'all',
    ticker: 'all',
  });
  const [currentPage, setCurrentPage] = useState(1);

  const { data: allTrades = [], isLoading, isError, refetch } = useQuery({
    queryKey: exchange ? transactionsApiKeys.ticker(exchange, symbol!) : transactionsApiKeys.all,
    queryFn: exchange
      ? () => transactionsApi.getTickerTrades(exchange!, symbol!)
      : () => transactionsApi.getTransactions(),
    staleTime: 60 * 1000,
    retry: 2,
  });

  const { deleteTrade } = useTransactions();

  const filteredTrades = useMemo(() => {
    return filterTrades(filters, allTrades);
  }, [allTrades, filters]);

  const paginatedTrades = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTrades.slice(startIndex, endIndex);
  }, [filteredTrades, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredTrades.length / itemsPerPage);

  const onDeleteTransaction = async (id: string) => {
    if (confirm("Are you sure you want to delete this trade?")) {
      try {
        deleteTrade(id);
        refetch();
      } catch (error) {
        console.error('Failed to delete trade:', error);
      }
    }
  };

  const kpis = useMemo(() => {
    const netCashflow = filteredTrades.reduce((sum, trade) => {
      const amount = parseFloat(trade.total_cost_basis?.toFixed(2) || '0');
      return trade.transaction_type === 'buy' || trade.transaction_type === 'withdraw'
        ? sum - amount
        : sum + amount;
    }, 0);

    const totalTrades = filteredTrades.length;

    const netCash = filteredTrades.reduce((sum, trade) => {
      const amount = parseFloat(trade.total_cost_basis?.toFixed(2) || '0');
      if (trade.transaction_type === 'deposit') return sum + amount;
      if (trade.transaction_type === 'withdraw') return sum - amount;
      return sum;
    }, 0);

    return { netCashflow, totalTrades, netCash };
  }, [filteredTrades]);

  // Update KPIs whenever they change
  useMemo(() => {
    if (onKPIUpdate) {
      onKPIUpdate(kpis);
    }
  }, [kpis, onKPIUpdate]);

  return (
    <div className={cn("w-full space-y-4")}>
      <TransactionsFilters
        filters={filters}
        setTransactionsFilters={setFilters}
        onAddTransaction={onAddTransaction!}
      />

      {isLoading ? (
        <div className="text-center py-4 text-muted-foreground">
          <div className="animate-pulse">Loading trades...</div>
        </div>
      ) : isError ? (
        <div className="text-center py-4 space-y-2">
          <p className="text-destructive">Error loading trades</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : filteredTrades.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          No trades found matching the filters
        </div>
      ) : (
        <>
          <div className="bg-white border rounded-md shadow-sm overflow-x-auto">
            <TransactionTable transactions={paginatedTrades} actions onEditTransaction={onEditTransaction} onDeleteTransaction={onDeleteTransaction} />
          </div>
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filteredTrades.length}
            onPageChange={setCurrentPage}
            disabled={isLoading}
          />
        </>
      )}
    </div>
  );
}
