import type { ReceiptItem } from "@/api/receiptsApi";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import type { CurrencyType } from "@my-dashboard/shared";

interface ReceiptItemProps {
	item: ReceiptItem;
	receiptCurrency: CurrencyType;
}

export const ReceiptItemComponent = ({
	item,
	receiptCurrency,
}: ReceiptItemProps) => (
	<div className="text-sm flex justify-between">
		<span>
			{item.readable_name}
			{item.quantity ? ` (${item.quantity})` : ""}
		</span>
		<span>
			<CurrencyDisplay
				amount={item.total_price || 0}
				fromCurrency={receiptCurrency}
			/>
		</span>
	</div>
);
