import MonthPicker from "@/components/forms/MonthPicker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { InsertTicker } from "@/types/tickerTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useTicker } from "../hooks/useTickers";

export const tickerFormSchema = z.object({
	symbol: z.string().min(1, "Symbol is required").max(10),
	name: z.string().optional(),
	exchange: z.string().optional(),
	sector: z.string().optional(),
	industry: z.string().optional(),
	dividend_amount: z.coerce.number().optional(),
	dividend_months: z.array(z.number()).optional(),
	cik: z.string().optional(),
	backfill: z.boolean().optional(),
});

export type TickerFormValues = z.infer<typeof tickerFormSchema>;

interface TickerFormProps {
	defaultValues?: TickerFormValues;
	tickerId?: string | null;
	onClose: () => void;
}

export function TickerForm({
	defaultValues = {
		symbol: "",
		name: "",
		exchange: "",
		sector: "",
		industry: "",
		dividend_amount: 0,
		dividend_months: [],
		cik: "",
		backfill: true,
	},
	tickerId,
	onClose,
}: TickerFormProps) {
	const mode = tickerId ? "update" : "create";

	const { updateTicker, isUpdating, isAdding, addTicker } = useTicker({
		onAddSuccess: () => {
			onClose();
		},
		onUpdateSuccess: () => {
			onClose();
		},
		onError: (err) => {
			console.error("Ticker error:", err);
			onClose();
		},
	});

	const form = useForm<TickerFormValues>({
		resolver: zodResolver(tickerFormSchema),
		defaultValues,
	});

	const onSubmit = (values: TickerFormValues) => {
		if (mode == "update") {
			updateTicker({ id: tickerId!, ...values });
		} else {
			addTicker(values as InsertTicker);
		}
	};

	return (
		<Form {...form}>
			<div className="h-full flex flex-col">
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex-1 flex flex-col"
				>
					<div className="px-4 space-y-6 pb-4 overflow-y-auto flex-1">
						<FormField
							control={form.control}
							name="symbol"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Symbol *</FormLabel>
									<FormControl>
										<Input placeholder="AAPL" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="Apple Inc." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="exchange"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Exchange</FormLabel>
									<FormControl>
										<Input placeholder="NASDAQ" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="sector"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Sector</FormLabel>
									<FormControl>
										<Input placeholder="Technology" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="industry"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Industry</FormLabel>
									<FormControl>
										<Input placeholder="Consumer Electronics" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="dividend_amount"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Dividend Amount</FormLabel>
									<FormControl>
										<Input type="number" step="0.01" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="dividend_months"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Dividend Months</FormLabel>
									<FormControl>
										<MonthPicker
											onChange={field.onChange}
											selectedMonths={field.value}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="cik"
							render={({ field }) => (
								<FormItem>
									<FormLabel>CIK</FormLabel>
									<FormControl>
										<Input placeholder="e.g. 320193" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="backfill"
							render={({ field }) => (
								<FormItem className="flex flex-row gap-4">
									<FormLabel>Backfill</FormLabel>
									<FormControl>
										<Checkbox
											onCheckedChange={field.onChange}
											checked={field.value!}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className="sticky bottom-0 bg-white p-4 border-t">
						<div className="flex justify-end gap-2">
							<Button type="button" variant="outline" onClick={onClose}>
								Cancel
							</Button>
							<Button type="submit" disabled={isAdding || isUpdating}>
								{isAdding || isUpdating ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Processing...
									</>
								) : mode === "update" ? (
									"Update Ticker"
								) : (
									"Add Ticker"
								)}
							</Button>
						</div>
					</div>
				</form>
			</div>
		</Form>
	);
}
