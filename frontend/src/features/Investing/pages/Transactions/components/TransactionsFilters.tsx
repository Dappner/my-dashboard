import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
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
import { useTickers } from "@/features/Investing/hooks/useTickers";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import type { TransactionType } from "@my-dashboard/shared";
import { format, startOfMonth, subYears } from "date-fns";
import { Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

export type ExtendedTransactionType = TransactionType | "all";

export interface TransactionsFilters {
	transaction_type?: ExtendedTransactionType;
	ticker?: string | "all";
	dateRange?: {
		from?: Date;
		to?: Date;
	} | null;
}

const filterSchema = z.object({
	transaction_type: z
		.enum(["buy", "sell", "dividend", "all", "withdraw", "deposit"])
		.optional(),
	ticker: z.string().optional(),
	dateRange: z
		.object({
			from: z.date().optional(),
			to: z.date().optional(),
		})
		.nullable()
		.optional(),
});

type FilterFormValues = z.infer<typeof filterSchema>;

interface TransactionsFiltersProps {
	filters: TransactionsFilters;
	setTransactionsFilters: (filters: TransactionsFilters) => void;
	onAddTransaction: () => void;
}

export default function TransactionsFilters({
	filters,
	setTransactionsFilters,
	onAddTransaction,
}: TransactionsFiltersProps) {
	const form = useForm<FilterFormValues>({
		resolver: zodResolver(filterSchema),
		defaultValues: filters,
	});

	const { tickers, isLoading: tickersLoading, isError } = useTickers();

	const onFilterChange = (data: FilterFormValues) => {
		setTransactionsFilters(data);
	};

	const generateMonthOptions = () => {
		const options = [];
		const now = new Date();
		const start = subYears(now, 3);
		const end = now;

		for (let year = start.getFullYear(); year <= end.getFullYear(); year++) {
			for (let month = 0; month < 12; month++) {
				const date = startOfMonth(new Date(year, month, 1));
				if (date <= end) {
					options.push({
						value: date,
						label: format(date, "MMM yyyy"),
					});
				}
			}
		}
		return options;
	};

	const monthOptions = generateMonthOptions();

	return (
		<Form {...form}>
			<form className="flex flex-row justify-between gap-4 flex-wrap">
				<div className="flex flex-row space-x-4 flex-wrap gap-4">
					<FormField
						control={form.control}
						name="transaction_type"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Transaction Type</FormLabel>
								<Select
									onValueChange={(value) => {
										field.onChange(value);
										onFilterChange({
											...filters,
											transaction_type: value as ExtendedTransactionType,
										});
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
										{tickersLoading ? (
											<SelectItem value="loading" disabled>
												Loading tickers...
											</SelectItem>
										) : isError ? (
											<SelectItem value="error" disabled>
												Error loading tickers
											</SelectItem>
										) : !tickers?.length ? (
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
						)}
					/>
					<FormField
						control={form.control}
						name="dateRange"
						render={({ field }) => (
							<FormItem className="flex flex-col">
								<FormLabel>Date Range</FormLabel>
								<div className="flex items-center gap-2">
									<Select
										value={
											field.value?.from
												? format(field.value.from, "MMM yyyy")
												: undefined
										}
										onValueChange={(value) => {
											const newFrom = monthOptions.find(
												(opt) => opt.label === value,
											)?.value;
											const newRange = {
												from: newFrom,
												to: field.value?.to,
											};
											field.onChange(
												newRange.from || newRange.to ? newRange : null,
											);
											onFilterChange({
												...filters,
												dateRange:
													newRange.from || newRange.to ? newRange : null,
											});
										}}
									>
										<FormControl>
											<SelectTrigger
												className={cn(
													"w-[140px]",
													!field.value?.from && "text-muted-foreground",
												)}
											>
												<SelectValue placeholder="From" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{monthOptions.map((option) => (
												<SelectItem
													key={option.label}
													value={option.label}
													disabled={
														field.value?.to && option.value > field.value.to
													}
												>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<span>-</span>
									<Select
										value={
											field.value?.to
												? format(field.value.to, "MMM yyyy")
												: undefined
										}
										onValueChange={(value) => {
											const newTo = monthOptions.find(
												(opt) => opt.label === value,
											)?.value;
											const newRange = {
												from: field.value?.from,
												to: newTo,
											};
											field.onChange(
												newRange.from || newRange.to ? newRange : null,
											);
											onFilterChange({
												...filters,
												dateRange:
													newRange.from || newRange.to ? newRange : null,
											});
										}}
									>
										<FormControl>
											<SelectTrigger
												className={cn(
													"w-[140px]",
													!field.value?.to && "text-muted-foreground",
												)}
											>
												<SelectValue placeholder="To" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{monthOptions.map((option) => (
												<SelectItem
													key={option.label}
													value={option.label}
													disabled={
														field.value?.from && option.value < field.value.from
													}
												>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{(field.value?.from || field.value?.to) && (
										<Button
											variant="ghost"
											size="icon"
											onClick={() => {
												field.onChange(null);
												onFilterChange({ ...filters, dateRange: null });
											}}
										>
											<X className="h-4 w-4" />
										</Button>
									)}
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>{" "}
				</div>
				<div className="flex items-end">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={onAddTransaction}
						className="flex items-center gap-2"
					>
						<Plus className="h-4 w-4" />
						Add Trade
					</Button>
				</div>
			</form>
		</Form>
	);
}
