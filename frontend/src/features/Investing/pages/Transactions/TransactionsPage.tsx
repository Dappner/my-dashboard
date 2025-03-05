import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TransactionForm } from "@/features/Investing/forms/TransactionForm";
import { useTransactionSheet } from "../../hooks/useTransactionSheet";
import TransactionKPIs from "./components/TransactionsKpis";
import { useMemo, useState } from "react";
import { useTransactions } from "../../hooks/useTransactions";
import TransactionsFilters, { TransactionsFilters as TFilters } from "./components/TransactionsFilters";
import { filterTrades } from "./components/utils";
import { cn } from "@/lib/utils";
import TransactionTable from "../../components/TransactionTable";
import PaginationControls from "./components/PaginationControls";
import { Button } from "@/components/ui/button";

export default function TransactionsPage() {
  const itemsPerPage = 10;
  const { isTransactionSheetOpen, selectedTransaction, openEditTransaction, openAddTransaction, closeSheet } = useTransactionSheet();
  const { transactions, isLoading, isError, refetch } = useTransactions();

  const [filters, setFilters] = useState<TFilters>({
    transaction_type: 'all',
    ticker: 'all',
  });
  const [currentPage, setCurrentPage] = useState(1);

  const { deleteTransaction } = useTransactions();

  if (!transactions) { return }

  const filteredTransactions = useMemo(() => {
    return filterTrades(filters, transactions);
  }, [transactions, filters]);

  const paginatedTrades = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTransactions?.slice(startIndex, endIndex);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredTransactions!.length! / itemsPerPage);

  const onDeleteTransaction = async (id: string) => {
    if (confirm("Are you sure you want to delete this trade?")) {
      try {
        deleteTransaction(id);
      } catch (error) {
        console.error('Failed to delete trade:', error);
      }
    }
  };

  const kpis = useMemo(() => {
    const netCashflow = filteredTransactions.reduce((sum, trade) => {
      const amount = parseFloat(trade.total_cost_basis?.toFixed(2) || '0');
      return trade.transaction_type === 'buy' || trade.transaction_type === 'withdraw'
        ? sum - amount
        : sum + amount;
    }, 0);

    const totalTrades = filteredTransactions.length;

    const netCash = filteredTransactions.reduce((sum, trade) => {
      const amount = parseFloat(trade.total_cost_basis?.toFixed(2) || '0');
      if (trade.transaction_type === 'deposit') return sum + amount;
      if (trade.transaction_type === 'withdraw') return sum - amount;
      return sum;
    }, 0);

    return { netCashflow, totalTrades, netCash };
  }, [filteredTransactions]);


  return (
    <div className='p-6'>
      <div className="px-2">
        <TransactionKPIs
          netCashflow={kpis.netCashflow}
          totalTrades={kpis.totalTrades}
          netCash={kpis.netCash}
        />
        <div className={cn("w-full space-y-4")}>
          <TransactionsFilters
            filters={filters}
            setTransactionsFilters={setFilters}
            onAddTransaction={openAddTransaction}
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
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No trades found matching the filters
            </div>
          ) : (
            <>
              <TransactionTable transactions={paginatedTrades} actions onEditTransaction={openEditTransaction} onDeleteTransaction={onDeleteTransaction} />
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={filteredTransactions.length}
                onPageChange={setCurrentPage}
                disabled={isLoading}
              />
            </>
          )}

        </div>
      </div>
      <Sheet open={isTransactionSheetOpen} onOpenChange={closeSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add New Transaction</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            {selectedTransaction ? (
              <TransactionForm tradeId={selectedTransaction.id!} onClose={closeSheet} defaultValues={
                {
                  ticker_id: selectedTransaction.ticker_id!,
                  transaction_type: selectedTransaction.transaction_type!,
                  shares: selectedTransaction.shares!,
                  price_per_share: selectedTransaction.price_per_share!,
                  transaction_fee: selectedTransaction.transaction_fee!,
                  transaction_date: new Date(selectedTransaction.transaction_date + "T00:00:00"),
                  note_text: selectedTransaction.note_text || "",
                  is_dividend_reinvestment: selectedTransaction.is_dividend_reinvestment!,
                }} />
            ) : (
              <TransactionForm onClose={closeSheet} />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
