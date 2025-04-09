import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useTransactionSheet } from "@/contexts/SheetContext";
import { cn } from "@/lib/utils";
import type { TradeView, TransactionType } from "@my-dashboard/shared";
import { format, parseISO } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";

export const getTradeTypeStyles = (type: TransactionType | null) => {
	switch (type) {
		case "buy":
			return {
				variant: "default" as const,
				className: "bg-green-100 text-green-800 border-green-200",
			};
		case "sell":
			return {
				variant: "destructive" as const,
				className: "bg-red-100 text-red-800 border-red-200",
			};
		case "dividend":
			return {
				variant: "secondary" as const,
				className: "bg-blue-100 text-blue-800 border-blue-200",
			};
		default:
			return {
				variant: "outline" as const,
				className: "bg-gray-100 text-gray-800",
			};
	}
};

export const getCashflowStyles = (type: TransactionType | null) => {
	if (type === "buy" || type === "withdraw") {
		return "text-red-600";
	}
	return "";
};

interface TransactionTableProps {
	transactions: TradeView[];
	isLoading: boolean;
	onDeleteTransaction?: (id: string) => void;
	actions?: boolean;
	isGlobal?: boolean;
}

export default function TransactionTable({
	transactions,
	isLoading,
	onDeleteTransaction,
	actions = false,
	isGlobal = true,
}: TransactionTableProps) {
	const { openEditTransaction } = useTransactionSheet();
	if (isLoading) {
		return (
			<div className="bg-white flex justify-center align-middle h-64 border rounded-md shadow-sm overflow-x-auto">
				<h3>Loading Transactions</h3>
			</div>
		);
	}

	return (
		<div className="bg-white border sm:rounded-md shadow-sm overflow-x-auto">
			<Table>
				<TableHeader>
					<TableRow className="bg-muted/50 hover:bg-muted/50">
						<TableHead className="font-semibold text-muted-foreground">
							Type
						</TableHead>
						<TableHead className="font-semibold text-muted-foreground">
							Date
						</TableHead>
						{isGlobal && (
							<TableHead className="font-semibold text-muted-foreground">
								Ticker
							</TableHead>
						)}
						<TableHead className="text-right font-semibold text-muted-foreground">
							Quantity
						</TableHead>
						<TableHead className="text-right font-semibold text-muted-foreground">
							Price
						</TableHead>
						<TableHead className="text-right font-semibold text-muted-foreground">
							Cashflow
						</TableHead>
						{actions && (
							<TableHead className="text-right font-semibold text-muted-foreground">
								Actions
							</TableHead>
						)}
					</TableRow>
				</TableHeader>
				<TableBody>
					{transactions.map((trade) => {
						const transactionType = trade.transaction_type ?? null;
						const typeStyles = getTradeTypeStyles(transactionType);
						const cashFlowStyles = getCashflowStyles(transactionType);

						return (
							<TableRow
								key={trade.id ?? "unknown-id"} // Fallback for missing id
								className="hover:bg-muted/20 transition-colors"
							>
								<TableCell>
									<Badge
										variant={typeStyles.variant}
										className={cn(
											"font-medium",
											typeStyles.className,
											!actions && "text-xs px-2",
										)}
									>
										{transactionType?.toUpperCase() ?? "UNKNOWN"}
									</Badge>
								</TableCell>
								<TableCell className={cn(!actions && "text-sm")}>
									{trade.transaction_date
										? format(parseISO(trade.transaction_date), "MMM dd, yyyy")
										: "N/A"}
								</TableCell>
								{isGlobal && (
									<TableCell className={cn(!actions && "text-sm")}>
										{trade.symbol ?? "N/A"}
									</TableCell>
								)}
								<TableCell className={cn("text-right", !actions && "text-sm")}>
									{(trade.shares ?? 0).toFixed(2)}
								</TableCell>
								<TableCell className={cn("text-right", !actions && "text-sm")}>
									${(trade.price_per_share ?? 0).toFixed(2)}
								</TableCell>
								<TableCell
									className={cn(
										"text-right font-medium",
										cashFlowStyles,
										!actions && "text-sm",
									)}
								>
									${(trade.total_cost_basis ?? 0).toFixed(2)}
								</TableCell>
								{actions && (
									<TableCell className="text-right">
										<div className="flex justify-end space-x-2">
											<Button
												variant="ghost"
												size="icon"
												onClick={() => openEditTransaction(trade)}
												className="hover:bg-muted rounded-full"
											>
												<Pencil className="h-4 w-4 text-muted-foreground" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={() =>
													trade.id && onDeleteTransaction?.(trade.id)
												}
												className="hover:bg-muted rounded-full"
												disabled={!trade.id || !onDeleteTransaction}
											>
												<Trash2 className="h-4 w-4 text-destructive" />
											</Button>
										</div>
									</TableCell>
								)}
							</TableRow>
						);
					})}
				</TableBody>
			</Table>{" "}
		</div>
	);
}
