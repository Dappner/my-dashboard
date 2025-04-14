import type { Receipt } from "@/api/receiptsApi";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { AppRoutes } from "@/navigation";
import { ReceiptIcon } from "lucide-react";
import { Link } from "react-router-dom";

export const ActivityFeed: React.FC<{ receipts: Receipt[] }> = ({
	receipts,
}) => {
	return (
		<Card className="hover:shadow-md transition-shadow h-full">
			<CardHeader className="pb-2">
				<CardTitle className="text-lg">Recent Activity</CardTitle>
				<CardDescription>Last 5 Receipts</CardDescription>
			</CardHeader>
			<CardContent>
				{receipts.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						No receipts this month.
					</p>
				) : (
					<ul className="space-y-3">
						{receipts.map((receipt) => (
							<li key={receipt.id}>
								<Link
									to={AppRoutes.spending.receipts.detail(receipt.id)}
									className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
								>
									<div className="flex items-center">
										<ReceiptIcon className="h-5 w-5 text-muted-foreground mr-2" />
										<div>
											<p className="text-sm font-medium">
												{receipt.store_name || "Unknown Store"}
											</p>
											<p className="text-xs text-muted-foreground">
												{receipt.purchase_date}
											</p>
										</div>
									</div>
									<p className="text-sm font-semibold">
										${receipt.total_amount.toFixed(2)}
									</p>
								</Link>
							</li>
						))}
					</ul>
				)}
			</CardContent>
		</Card>
	);
};
