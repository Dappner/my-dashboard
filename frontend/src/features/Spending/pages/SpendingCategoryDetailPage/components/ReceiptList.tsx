import type { CategoryReceiptRow } from "@/api/spendingApi";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { parseDate } from "@/lib/utils";
import { spendingReceiptDetailRoute } from "@/routes/spending-routes";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";

interface ReceiptListProps {
	receipts: CategoryReceiptRow[];
	isLoading: boolean;
	categoryName: string;
	convertAmount: (amount: number, fromCurrency: string) => number;
}

export const ReceiptList = ({
	receipts,
	isLoading,
	categoryName,
	convertAmount,
}: ReceiptListProps) => (
	<Card>
		<CardHeader>
			<CardTitle>Receipts with {categoryName || "this category"}</CardTitle>
			<CardDescription>Showing {receipts.length || 0} receipts</CardDescription>
		</CardHeader>
		<CardContent className="max-h-[400px] overflow-auto">
			{isLoading ? (
				<div className="space-y-2">
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} className="h-20 w-full" />
					))}
				</div>
			) : receipts.length ? (
				<ScrollArea className="h-full pr-4">
					<div className="space-y-4">
						{receipts.map((receipt) => {
							const receiptCategoryTotal = receipt.receipt_items.reduce(
								(sum, item) =>
									sum +
									convertAmount(item.total_price || 0, receipt.currency_code),
								0,
							);

							return (
								<div
									key={receipt.id}
									className="border rounded-lg p-4 bg-background hover:bg-muted/50 transition-colors"
								>
									<div className="flex justify-between items-start">
										<div>
											<Link
												to={spendingReceiptDetailRoute.to}
												params={{ receiptId: receipt.id }}
												className="font-medium hover:underline"
											>
												{receipt.store_name || "Unknown Store"}
											</Link>
											<p className="text-sm text-muted-foreground">
												{format(
													parseDate(receipt.purchase_date),
													"MMM d, yyyy",
												)}
											</p>
										</div>
										<div className="text-right">
											<p className="font-medium">
												<CurrencyDisplay amount={receiptCategoryTotal} />
											</p>
											<p className="text-xs  text-muted-foreground">
												<span>of </span>
												<CurrencyDisplay
													amount={receipt.total_amount}
													fromCurrency={receipt.currency_code}
												/>
												<span> total</span>
											</p>
										</div>
									</div>
									<Separator className="my-2" />
									<div className="space-y-1">
										<p className="text-sm font-medium">Category Items:</p>
										{receipt.receipt_items.map((item) => (
											<div
												key={item.id}
												className="text-sm flex justify-between"
											>
												<span>
													{item.readable_name}
													{item.quantity ? ` (${item.quantity})` : ""}
												</span>
												<span>
													<CurrencyDisplay
														amount={item.total_price || 0}
														fromCurrency={receipt.currency_code}
													/>
												</span>
											</div>
										))}
									</div>
								</div>
							);
						})}
					</div>
				</ScrollArea>
			) : (
				<p className="text-muted-foreground text-center py-4">
					No receipts found
				</p>
			)}
		</CardContent>
	</Card>
);
