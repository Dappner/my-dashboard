import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TransactionForm } from "../forms/TransactionForm";

interface TransactionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: any; // Replace with proper transaction type
}

export function TransactionSheet({ isOpen, onClose, transaction }: TransactionSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {transaction ? "Edit Transaction" : "Add New Transaction"}
          </SheetTitle>
        </SheetHeader>
        <div className="py-4">
          <TransactionForm
            tradeId={transaction?.id}
            onClose={onClose}
            defaultValues={transaction ? {
              ticker_id: transaction.ticker_id || "",
              transaction_type: transaction.transaction_type!,
              shares: transaction.shares!,
              price_per_share: transaction.price_per_share || "",
              transaction_fee: transaction.transaction_fee || "",
              transaction_date: new Date(transaction.transaction_date + "T00:00:00"),
              note_text: transaction.note_text || "",
              is_dividend_reinvestment: transaction.is_dividend_reinvestment!,
            } : undefined}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
