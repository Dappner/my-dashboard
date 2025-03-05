import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TransactionForm } from "@/features/Investing/forms/TransactionForm";
import { useTransactionSheet } from "../../hooks/useTransactionSheet";
import TransactionKPIs from "./components/TransactionsKpis";
import { useState } from "react";
import TransactionsTable from "./components/TransactionsTable";

export default function TransactionsPage() {
  const { isTransactionSheetOpen, selectedTransaction, openEditTransaction, openAddTransaction, closeSheet } = useTransactionSheet();

  const [kpis, setKPIs] = useState({
    netCashflow: 0,
    totalTrades: 0,
    netCash: 0,
  });

  return (
    <div className='p-6'>
      <div className="px-2">
        <TransactionKPIs
          netCashflow={kpis.netCashflow}
          totalTrades={kpis.totalTrades}
          netCash={kpis.netCash}
        />
        <TransactionsTable
          onEditTransaction={openEditTransaction}
          onAddTransaction={openAddTransaction}
          onKPIUpdate={setKPIs}
        />
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
