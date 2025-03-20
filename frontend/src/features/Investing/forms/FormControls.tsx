import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

export const TickerSelect = ({ field, isLoading, tickers }: any) => (
  <FormItem>
    <FormLabel>Ticker *</FormLabel>
    <Select onValueChange={field.onChange} defaultValue={field.value}>
      <FormControl>
        <SelectTrigger>
          <SelectValue placeholder="Select Ticker" />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        {isLoading
          ? <SelectItem value="loading" disabled>Loading tickers...</SelectItem>
          : tickers?.length === 0
          ? <SelectItem value="empty" disabled>No tickers found</SelectItem>
          : (
            tickers?.map((ticker: any) => (
              <SelectItem key={ticker.id} value={ticker.id}>
                {ticker.symbol} ({ticker.exchange})
              </SelectItem>
            ))
          )}
      </SelectContent>
    </Select>
    <FormMessage />
  </FormItem>
);

export const TransactionTypeSelect = ({ field }: any) => (
  <FormItem>
    <FormLabel>Transaction Type *</FormLabel>
    <Select onValueChange={field.onChange} defaultValue={field.value}>
      <FormControl>
        <SelectTrigger>
          <SelectValue placeholder="Select Type" />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        <SelectItem value="buy">Buy</SelectItem>
        <SelectItem value="sell">Sell</SelectItem>
        <SelectItem value="dividend">Dividend</SelectItem>
        <SelectItem value="deposit">Deposit</SelectItem>
        <SelectItem value="withdraw">Withdraw</SelectItem>
      </SelectContent>
    </Select>
    <FormMessage />
  </FormItem>
);

export const AmountField = ({ field, label }: any) => (
  <FormItem>
    <FormLabel>{label}</FormLabel>
    <FormControl>
      <Input type="number" step="0.0001" placeholder="10" {...field} />
    </FormControl>
    <FormMessage />
  </FormItem>
);

export const PriceField = ({ field }: any) => (
  <FormItem>
    <FormLabel>Price Per Share *</FormLabel>
    <FormControl>
      <Input type="number" step="0.01" placeholder="150.00" {...field} />
    </FormControl>
    <FormMessage />
  </FormItem>
);

export const FeeField = ({ field }: any) => (
  <FormItem>
    <FormLabel>Transaction Fee</FormLabel>
    <FormControl>
      <Input type="number" step="0.01" placeholder="0.00" {...field} />
    </FormControl>
    <FormMessage />
  </FormItem>
);

export const DateField = ({ field }: any) => (
  <FormItem className="flex flex-col">
    <FormLabel>Transaction Date *</FormLabel>
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            className={cn(
              "w-full pl-3 text-left font-normal",
              !field.value && "text-muted-foreground",
            )}
          >
            {field.value
              ? format(field.value, "PPP")
              : <span>Pick a date</span>}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white border shadow-lg rounded-md">
        {/* Added styling */}
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
);

export const NoteField = ({ field }: any) => (
  <FormItem>
    <FormLabel>Notes</FormLabel>
    <FormControl>
      <Textarea
        placeholder="Add any notes about this transaction"
        className="resize-none"
        {...field}
      />
    </FormControl>
    <FormDescription>
      Record your thoughts, strategy, or reasoning.
    </FormDescription>
    <FormMessage />
  </FormItem>
);
