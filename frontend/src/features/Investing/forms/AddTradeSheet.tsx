import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { tradesApi, tradesApiKeys } from "@/api/tradesApi";
import { InsertTrade, TradeView } from "@/types/tradeTypes";
import { useAuthContext } from "@/contexts/AuthContext";
import { tickersApiKeys, tickersApi } from "@/api/tickersApi";
import { useEffect } from "react";

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

interface AddTradeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "update";
  defaultValues?: TradeFormValues;
  tradeId?: string;
}

export default function AddTradeSheet({
  open,
  onOpenChange,
  mode,
  defaultValues,
  tradeId
}: AddTradeSheetProps) {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  // Fetch tickers from the API
  const tickersQuery = useQuery({
    queryKey: tickersApiKeys.all,
    queryFn: tickersApi.getTickers,
  });

  // Mutation for adding a new trade
  const addTradeMutation = useMutation({
    mutationFn: (data: InsertTrade & { id?: string }) => {
      if (mode === "create") {
        return tradesApi.addTrade(data as InsertTrade);
      } else {
        return tradesApi.updateTrade({ ...data, id: tradeId! }); // Use tradeId here
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tradesApiKeys.all });
      onOpenChange(false);
    },
    onError: (error) => {
      // Handle errors here (e.g., display an error message)
      console.error("Error submitting trade:", error);
      // Optionally, set an error state to display to the user
    },
  });
  // Form setup with react-hook-form and zod validation
  const form = useForm<TradeFormValues>({
    resolver: zodResolver(tradeFormSchema),
    mode: "onChange", // or "onBlur"
    defaultValues: defaultValues,
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  // Form submission handler
  async function onSubmit(values: TradeFormValues) {
    // Format the transaction date to YYYY-MM-DD
    const formattedDate = format(values.transaction_date, "yyyy-MM-dd");

    const tradeValues: InsertTrade = {
      ...values,
      transaction_date: formattedDate, // Use the formatted date
      user_id: user!.id,
    };

    try {
      if (mode === "create") {
        await addTradeMutation.mutateAsync(tradeValues);
      } else {
        await addTradeMutation.mutateAsync({
          ...tradeValues,
          id: tradeId, // Pass tradeId to mutation
        });
      }
    } catch (error) {
      // Handle errors here (e.g., display an error message)
      console.error("Error submitting trade:", error);
    }
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg w-full px-4">
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Add New Trade" : "Update Trade"}
          </SheetTitle>
          <SheetDescription>
            Enter the details of your trade. All fields marked with * are
            required.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

              <SheetFooter>
                <SheetClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </SheetClose>
                <Button type="submit" disabled={addTradeMutation.isPending}>
                  {addTradeMutation.isPending ? "Saving..." : "Save Trade"}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}

