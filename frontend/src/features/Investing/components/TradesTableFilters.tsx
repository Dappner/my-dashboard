import { tickersApiKeys, tickersApi } from "@/api/tickersApi";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { TransactionType } from "@/types/tradeTypes";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

export type ExtendedTransactionType = TransactionType | 'all';

export interface TradesFilters {
  transaction_type?: ExtendedTransactionType;
  ticker?: string | 'all';
}

const filterSchema = z.object({
  transaction_type: z.enum(["buy", "sell", "dividend", "all"]).optional(),
  ticker: z.string().optional(),
});

type FilterFormValues = z.infer<typeof filterSchema>;

interface TradesTableFiltersProps {
  filters: TradesFilters;
  setTradesFilters: (filters: TradesFilters) => void;
}

export default function TradesTableFilters({ filters, setTradesFilters }: TradesTableFiltersProps) {
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
      <form className="grid grid-cols-4 space-x-4">
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
      </form>
    </Form>
  );
}
