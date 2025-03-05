import { Plus } from "lucide-react";
import PortfolioChart from "./components/PortfolioChart";
import HoldingsTable from "./components/HoldingsTable";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import PortfolioKpis from "./components/PortfolioKpis";
import { Button } from "@/components/ui/button";
import { TransactionForm } from "./forms/TransactionForm";
import { Link } from "react-router";
import { useTransactionSheet } from "./hooks/useTransactionSheet";
import TransactionTable from "./components/TransactionTable";
import { useTransactions } from "./hooks/useTransactions";

export default function InvestingPage() {
  const { isTransactionSheetOpen, selectedTransaction, openAddTransaction, closeSheet } = useTransactionSheet();
  const { transactions, isLoading: transactionsLoading } = useTransactions()
  const recentTransactions = transactions?.slice(0, 5);

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-3 gap-4">
        <PortfolioKpis />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-2 h-8">
            <h2 className="text-lg font-semibold text-gray-900">Portfolio</h2>
          </div>
          <PortfolioChart />
        </div>
        <div className="col-span-1">
          <div className="flex items-center justify-between mb-2 h-8">
            <h2 className="text-lg font-semibold text-gray-900">Holdings</h2>
          </div>
          <HoldingsTable />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* <div className="col-span-1"> */}
        {/* </div> */}
        <div className="col-span-3">
          <div className="flex items-center justify-between mb-2 h-8">
            <Link
              className="text-lg font-semibold text-gray-900 hover:underline hover:text-blue-400 cursor-pointer"
              to="/investing/transactions">Recent Transactions</Link>
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={openAddTransaction}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Transaction
              </Button>
            </div>
          </div>
          {!transactionsLoading &&
            <TransactionTable transactions={recentTransactions!} actions={false} />
          }
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

    </div >
  );
}
