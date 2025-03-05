import { tickersApiKeys, tickersApi } from "@/api/tickersApi";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { TransactionType } from "@/types/transactionsTypes";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export type ExtendedTransactionType = TransactionType | 'all';

export interface TradesFilters {
  transaction_type?: ExtendedTransactionType;
  ticker?: string | 'all';
}

const filterSchema = z.object({
  transaction_type: z.enum(["buy", "sell", "dividend", "all", "withdraw", "deposit"]).optional(),
  ticker: z.string().optional(),
});

type FilterFormValues = z.infer<typeof filterSchema>;

interface TradesTableFiltersProps {
  filters: TradesFilters;
  setTradesFilters: (filters: TradesFilters) => void;
  onAddTrade: () => void
}

export default function TradesTableFilters({ filters, setTradesFilters, onAddTrade }: TradesTableFiltersProps) {
  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: filters,
  });

  const tickersQuery = useQuery({
    queryKey: tickersApiKeys.all,
    queryFn: tickersApi.getTickers,
    staleTime: 5 * 60 * 1000,
  });

  const onFilterChange = (data: FilterFormValues) => {
    setTradesFilters(data);
  };

  return (
    <Form {...form}>
      <form className="flex flex-row justify-between">
        <div className="flex flex-row space-x-4">

          <FormField
            control={form.control}
            name="transaction_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transaction Type</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    onFilterChange({ ...filters, transaction_type: value as ExtendedTransactionType });
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="buy">Buy</SelectItem>
                    <SelectItem value="sell">Sell</SelectItem>
                    <SelectItem value="dividend">Dividend</SelectItem>
                    <SelectItem value="withdraw">Withdraw</SelectItem>
                    <SelectItem value="deposit">Deposit</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ticker"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ticker</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    onFilterChange({ ...filters, ticker: value });
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Ticker" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="all">All Tickers</SelectItem>
                    {tickersQuery.isLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading tickers...
                      </SelectItem>
                    ) : tickersQuery.isError ? (
                      <SelectItem value="error" disabled>
                        Error loading tickers
                      </SelectItem>
                    ) : !tickersQuery.data?.length ? (
                      <SelectItem value="empty" disabled>
                        No tickers found
                      </SelectItem>
                    ) : (
                      tickersQuery.data.map((ticker) => (
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
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddTrade}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Trade
          </Button>
        </div>
      </form>
    </Form >
  );
}
