import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  InsertTransaction,
  UpdateTransaction,
} from "@/types/transactionsTypes";
import { useTransactions } from "../hooks/useTransactions";
import { tickersApi, tickersApiKeys } from "@/api/tickersApi";
import {
  AmountField,
  DateField,
  FeeField,
  NoteField,
  PriceField,
  TickerSelect,
  TransactionTypeSelect,
} from "./FormControls";

const cleanEmptyStrings = (obj: any) => {
  const cleaned = { ...obj };
  for (let key in cleaned) {
    if (cleaned[key] === "" || cleaned[key] === undefined) {
      delete cleaned[key];
    }
  }
  return cleaned;
};

export const transactionFormSchema = z.object({
  ticker_id: z.string().optional(),
  transaction_type: z.enum(["buy", "sell", "dividend", "deposit", "withdraw"], {
    required_error: "Transaction type is required",
  }),
  shares: z.coerce.number().positive("Amount must be positive").optional(),
  price_per_share: z.coerce.number().optional(), // Made optional, no positivity requirement by default
  transaction_fee: z.coerce.number().min(0, "Fee cannot be negative").default(
    0,
  ),
  transaction_date: z.date({
    required_error: "Transaction date is required",
  }),
  note_text: z.string().optional(),
  is_dividend_reinvestment: z.boolean().default(false),
}).refine(
  (data) => {
    if (["buy", "sell", "dividend"].includes(data.transaction_type)) {
      return !!data.ticker_id && !!data.shares && data.price_per_share! > 0; // Require positive price for trades
    }
    if (["deposit", "withdraw"].includes(data.transaction_type)) {
      return !!data.shares; // Only require amount for cash transactions
    }
    return true;
  },
  {
    message: "Required fields are missing based on transaction type",
    path: ["transaction_type"],
  },
);

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;

interface TransactionFormProps {
  defaultValues?: TransactionFormValues;
  tradeId?: string;
  onClose: () => void;
}
export function TransactionForm({
  defaultValues = {
    ticker_id: "",
    transaction_type: "buy",
    shares: 0,
    price_per_share: 0,
    transaction_fee: 0,
    transaction_date: new Date(),
    note_text: "",
    is_dividend_reinvestment: false,
  },
  tradeId,
  onClose,
}: TransactionFormProps) {
  const { user } = useAuthContext();
  const mode = tradeId ? "update" : "create";

  const tickersQuery = useQuery({
    queryKey: tickersApiKeys.all,
    queryFn: tickersApi.getTickers,
  });

  const { updateTransaction, isUpdating, isAdding, addTransaction } =
    useTransactions({
      onAddSuccess: () => {
        onClose();
      },
      onUpdateSuccess: () => {
        onClose();
      },
      onError: (err) => {
        console.error("Transaction error:", err); // Log error for debugging
        onClose();
      },
    });

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues,
  });

  const transactionType = form.watch("transaction_type");
  const isCashTransaction = ["deposit", "withdraw"].includes(transactionType);

  const onSubmit = (values: TransactionFormValues) => {
    const formattedData = {
      ...values,
      transaction_date: format(values.transaction_date, "yyyy-MM-dd"),
      user_id: user!.id,
      price_per_share: isCashTransaction ? 1 : values.price_per_share, // Default to 1 for cash transactions
    };
    const cleanedData = cleanEmptyStrings(formattedData);

    if (mode === "create") {
      addTransaction(cleanedData as InsertTransaction);
    } else {
      updateTransaction({ ...cleanedData, id: tradeId } as UpdateTransaction);
    }
  };

  return (
    <Form {...form}>
      <div className="h-full flex flex-col">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="px-4 space-y-6 pb-4 overflow-y-auto flex-1"
        >
          {/* Transaction Type - Full Width at the Top */}
          <FormField
            control={form.control}
            name="transaction_type"
            render={({ field }) => <TransactionTypeSelect field={field} />}
          />

          {/* Fields for Trade Transactions */}
          {!isCashTransaction && (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ticker_id"
                render={({ field }) => (
                  <TickerSelect
                    field={field}
                    isLoading={tickersQuery.isLoading}
                    tickers={tickersQuery.data}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="shares"
                render={({ field }) => (
                  <AmountField field={field} label="Shares *" />
                )}
              />
              <FormField
                control={form.control}
                name="price_per_share"
                render={({ field }) => <PriceField field={field} />}
              />
              <FormField
                control={form.control}
                name="transaction_fee"
                render={({ field }) => <FeeField field={field} />}
              />
            </div>
          )}

          {/* Fields for Cash Transactions */}
          {isCashTransaction && (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="shares"
                render={({ field }) => (
                  <AmountField field={field} label="Amount *" />
                )}
              />
              <FormField
                control={form.control}
                name="transaction_fee"
                render={({ field }) => <FeeField field={field} />}
              />
            </div>
          )}

          {/* Common Fields for All Transactions */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="transaction_date"
              render={({ field }) => <DateField field={field} />}
            />
          </div>

          <FormField
            control={form.control}
            name="note_text"
            render={({ field }) => <NoteField field={field} />}
          />
          {transactionType === "buy" && (
            <FormField
              control={form.control}
              name="is_dividend_reinvestment"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormLabel>Dividend Reinvestment</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}
        </form>

        <div className="sticky bottom-0 bg-white p-4 border-t">
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isAdding || isUpdating}>
              {isAdding || isUpdating
                ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                )
                : mode === "update"
                ? "Update Transaction"
                : "Add Transaction"}
            </Button>
          </div>
        </div>
      </div>
    </Form>
  );
}
