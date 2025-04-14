import type { ReceiptWithItems } from "@/api/receiptsApi";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingBagIcon } from "lucide-react";
import { CategoryDropdown } from "./CategoryDropdown";

interface ReceiptItemsListProps {
	receipt: ReceiptWithItems;
	onCategoryChange: (itemId: string, categoryId: string | null) => void;
}

export default function ReceiptItemsList({
	receipt,
	onCategoryChange,
}: ReceiptItemsListProps) {
	return (
		<Card className="h-full md:col-span-2">
			<CardHeader className="pb-3 px-4 border-b">
				<CardTitle className="text-sm">
					Items ({receipt.items.length})
				</CardTitle>
			</CardHeader>
			<ScrollArea className="flex-1 overflow-y-scroll">
				{receipt.items.length > 0 ? (
					<div className="divide-y">
						{receipt.items.map((item) => (
							<div
								key={item.item_id}
								className="py-2 px-4 hover:bg-muted/30 transition-colors"
							>
								<div className="flex items-start justify-between gap-3">
									<div className="flex-1">
										<p className="font-medium text-sm leading-tight">
											{item.readable_name || item.item_name}
										</p>
										<div className="flex flex-wrap gap-2 items-center mt-1">
											{item.quantity > 1 && (
												<span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
													{item.quantity} × {receipt.currency_code}
													{item.unit_price.toFixed(2)}
												</span>
											)}
											<CategoryDropdown
												currentCategoryId={item.category_id}
												itemId={item.item_id}
												onCategoryChange={onCategoryChange}
											/>
										</div>
									</div>
									<div className="text-right min-w-20">
										<p className="font-medium text-sm">
											{receipt.currency_code}
											{(item.total_price || item.unit_price).toFixed(2)}
										</p>
										{item.discount_amount > 0 && (
											<p className="text-xs text-green-600 mt-0.5">
												Saved {receipt.currency_code}
												{item.discount_amount.toFixed(2)}
											</p>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="p-6 text-center text-muted-foreground">
						<ShoppingBagIcon className="h-8 w-8 mx-auto mb-2 opacity-30" />
						<p>No items found</p>
					</div>
				)}
			</ScrollArea>
		</Card>
	);
}
