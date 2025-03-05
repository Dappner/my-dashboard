import { useForm } from "react-hook-form"; import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tickersApiKeys, tickersApi } from "@/api/tickersApi";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { useAuthContext } from "@/contexts/AuthContext";
import { InsertTransaction, UpdateTransaction } from "@/types/transactionsTypes";
import { useTransactions } from "../hooks/useTransactions";
import { transactionsApiKeys } from "@/api/tradesApi";

export const tradeFormSchema = z.object({
  ticker_id: z.string({
    required_error: "Ticker is required",
  }),
  transaction_type: z.enum(["buy", "sell", "dividend"], {
    required_error: "Transaction type is required",
  }),
  shares: z.coerce.number().positive("Shares must be a positive number"),
  price_per_share: z.coerce
    .number()
    .positive("Price must be a positive number"),
  transaction_fee: z.coerce.number().min(0, "Fee cannot be negative").default(0),
  transaction_date: z.date({
    required_error: "Transaction date is required",
  }),
  note_text: z.string().optional(),
});

export type TradeFormValues = z.infer<typeof tradeFormSchema>;

interface TradeFormProps {
  defaultValues?: TradeFormValues;
  tradeId?: string;
  onClose: () => void
}

export function TradeForm({
  defaultValues = {
    ticker_id: "",
    transaction_type: "buy",
    shares: 0,
    price_per_share: 0,
    transaction_fee: 0,
    transaction_date: new Date(),
    note_text: ""
  },
  tradeId,
  onClose
}: TradeFormProps) {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const mode = tradeId ? "update" : "create";
  // Fetch tickers from the API
  const tickersQuery = useQuery({
    queryKey: tickersApiKeys.all,
    queryFn: tickersApi.getTickers,
  });

  const {
    updateTrade,
    isUpdating,
    isAdding,
    addTrade
  } = useTransactions(
    {
      onAddSuccess: () => {
        queryClient.invalidateQueries({ queryKey: transactionsApiKeys.all });
        onClose();
      },
      onUpdateSuccess: () => {
        queryClient.invalidateQueries({ queryKey: transactionsApiKeys.all });
        onClose();
      },
      onError: () => {
        queryClient.invalidateQueries({ queryKey: transactionsApiKeys.all });
        onClose()
      }
    }
  );

  const form = useForm<TradeFormValues>({
    resolver: zodResolver(tradeFormSchema),
    defaultValues,
  });

  const onSubmit = (values: TradeFormValues) => {
    if (mode == "create") {
      const insertData: InsertTransaction = {
        ...values,
        transaction_date: format(values["transaction_date"], "yyyy-MM-dd"),
        user_id: user!.id
      }
      addTrade(insertData);
    } else {
      const updateData: UpdateTransaction = {
        ...values,
        id: tradeId,
        transaction_date: format(values["transaction_date"], "yyyy-MM-dd")
      }
      updateTrade(updateData);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="ticker_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ticker *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Ticker" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tickersQuery.isLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading tickers...
                      </SelectItem>
                    ) : tickersQuery.isError ? (
                      <SelectItem value="error" disabled>
                        Error loading tickers
                      </SelectItem>
                    ) : tickersQuery.data?.length === 0 ? (
                      <SelectItem value="empty" disabled>
                        No tickers found
                      </SelectItem>
                    ) : (
                      tickersQuery.data?.map((ticker) => (
                        <SelectItem key={ticker.id} value={ticker.id}>
                          {ticker.symbol} ({ticker.exchange})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="transaction_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transaction Type *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="buy">Buy</SelectItem>
                    <SelectItem value="sell">Sell</SelectItem>
                    <SelectItem value="dividend">Dividend</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="shares"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shares </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="10"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price_per_share"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price Per Share *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="150.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="transaction_fee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transaction Fee</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="transaction_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Transaction Date *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="note_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any notes about this trade"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Record your thoughts, strategy, or reasoning.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isAdding || isUpdating}>
            {isAdding || isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode == "update" ? "Update Trade" : "Add Trade"}
          </Button>
        </div>

      </form>
    </Form>
  );
}
