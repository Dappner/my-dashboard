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
import type { Ticker } from "@/types/tickerTypes";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { ControllerRenderProps } from "react-hook-form";
import type { TransactionFormValues } from "./TransactionForm";

interface TickerSelectProps {
	field: {
		value: string | undefined;
		onChange: (value: string) => void;
	};
	isLoading: boolean;
	tickers: Ticker[] | undefined;
	onValueChange?: (value: string) => void;
}
export const TickerSelect = ({
	field,
	isLoading,
	tickers,
	onValueChange,
}: TickerSelectProps) => (
	<FormItem>
		<FormLabel>Ticker *</FormLabel>
		<Select
			onValueChange={(value) => {
				field.onChange(value);
				onValueChange?.(value); // Call optional onValueChange if provided
			}}
			value={field.value ?? ""}
		>
			<FormControl>
				<SelectTrigger>
					<SelectValue placeholder="Select Ticker" />
				</SelectTrigger>
			</FormControl>
			<SelectContent>
				{isLoading ? (
					<SelectItem value="loading" disabled>
						Loading tickers...
					</SelectItem>
				) : !tickers || tickers.length === 0 ? (
					<SelectItem value="empty" disabled>
						No tickers found
					</SelectItem>
				) : (
					tickers.map((ticker) => (
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
interface TransactionTypeSelectProps {
	field: ControllerRenderProps<TransactionFormValues, "transaction_type">;
}

export const TransactionTypeSelect = ({
	field,
}: TransactionTypeSelectProps) => (
	<FormItem>
		<FormLabel>Transaction Type *</FormLabel>
		<Select onValueChange={field.onChange} value={field.value}>
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

interface AmountFieldProps {
	field: ControllerRenderProps<TransactionFormValues, "shares">;
	label: string;
}

export const AmountField = ({ field, label }: AmountFieldProps) => (
	<FormItem>
		<FormLabel>{label}</FormLabel>
		<FormControl>
			<Input
				type="number"
				step="0.0001"
				placeholder="10"
				value={field.value ?? ""}
				onChange={(e) =>
					field.onChange(e.target.value ? Number(e.target.value) : undefined)
				}
			/>
		</FormControl>
		<FormMessage />
	</FormItem>
);

interface NormalFieldProps<T extends keyof TransactionFormValues> {
	field: ControllerRenderProps<TransactionFormValues, T>;
}

export const PriceField = ({ field }: NormalFieldProps<"price_per_share">) => (
	<FormItem>
		<FormLabel>Price Per Share *</FormLabel>
		<FormControl>
			<Input
				type="number"
				step="0.01"
				placeholder="150.00"
				value={field.value ?? ""}
				onChange={(e) =>
					field.onChange(e.target.value ? Number(e.target.value) : undefined)
				}
			/>
		</FormControl>
		<FormMessage />
	</FormItem>
);

export const FeeField = ({ field }: NormalFieldProps<"transaction_fee">) => (
	<FormItem>
		<FormLabel>Transaction Fee</FormLabel>
		<FormControl>
			<Input
				type="number"
				step="0.01"
				placeholder="0.00"
				value={field.value ?? ""}
				onChange={(e) =>
					field.onChange(e.target.value ? Number(e.target.value) : undefined)
				}
			/>
		</FormControl>
		<FormMessage />
	</FormItem>
);

export const DateField = ({ field }: NormalFieldProps<"transaction_date">) => (
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
						{field.value ? (
							format(field.value, "PPP")
						) : (
							<span>Pick a date</span>
						)}
						<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
					</Button>
				</FormControl>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0 bg-white border shadow-lg rounded-md">
				<Calendar
					mode="single"
					selected={field.value}
					onSelect={(date) => field.onChange(date ?? undefined)}
					initialFocus
				/>
			</PopoverContent>
		</Popover>
		<FormMessage />
	</FormItem>
);

export const NoteField = ({ field }: NormalFieldProps<"note_text">) => (
	<FormItem>
		<FormLabel>Notes</FormLabel>
		<FormControl>
			<Textarea
				placeholder="Add any notes about this transaction"
				className="resize-none"
				value={field.value ?? ""}
				onChange={(e) => field.onChange(e.target.value || undefined)}
			/>
		</FormControl>
		<FormDescription>
			Record your thoughts, strategy, or reasoning.
		</FormDescription>
		<FormMessage />
	</FormItem>
);
