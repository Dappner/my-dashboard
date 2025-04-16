import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMonthParam } from "@/hooks/useMonthParam";
import { spendingReceiptDetailRoute } from "@/routes/spending-routes";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ReceiptIcon } from "lucide-react";
import { useRecentReceipts } from "../hooks/useSpendingMetrics";

export const ActivityFeed: React.FC = () => {
	const { selectedDate } = useMonthParam();
	const { data: receipts, isLoading } = useRecentReceipts(selectedDate);

	return (
		<Card className="hover:shadow-md transition-shadow h-full">
			<CardHeader className="pb-2">
				<CardTitle className="text-lg flex flex-row justify-between">
					<span>Recent Activity</span>
					<Link className="text-sm" to={"/spending/receipts"}>
						See Details
					</Link>
				</CardTitle>
				<CardDescription>Last 5 Receipts</CardDescription>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					// Loading state
					<div className="space-y-3">
						{Array.from({ length: 3 }).map((_, index) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: Fine for skeleton
							<Skeleton key={index} className="h-14 w-full rounded-md" />
						))}
					</div>
				) : receipts?.length === 0 ? (
					// Empty state
					<div className="text-sm text-muted-foreground text-center py-4">
						<ReceiptIcon className="h-8 w-8 mx-auto mb-2 opacity-30" />
						<p>No receipts this month</p>
					</div>
				) : (
					// Receipts list
					<ul className="space-y-3">
						{receipts?.map((receipt) => {
							const purchaseDate = new Date(receipt.purchase_date);

							return (
								<li key={receipt.id}>
									<Link
										to={spendingReceiptDetailRoute.to}
										params={{ receiptId: receipt.id }}
										className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
									>
										<div className="flex items-center">
											<ReceiptIcon className="h-5 w-5 text-muted-foreground mr-2" />
											<div>
												<p className="text-sm font-medium">
													{receipt.store_name || "Unknown Store"}
												</p>
												<p className="text-xs text-muted-foreground">
													{format(purchaseDate, "PP")}
												</p>
											</div>
										</div>
										<p className="text-sm font-semibold">
											<CurrencyDisplay
												amount={receipt.total_amount}
												fromCurrency={receipt.currency_code}
											/>
										</p>
									</Link>
								</li>
							);
						})}
					</ul>
				)}
			</CardContent>
		</Card>
	);
};
