import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import type { Ticker } from "@/types/tickerTypes";
import { TickerForm } from "../forms/TickerForm";

interface TickerSheetProps {
	isOpen: boolean;
	onClose: () => void;
	ticker?: Ticker | null;
}

export function TickerSheet({ isOpen, onClose, ticker }: TickerSheetProps) {
	return (
		<Sheet open={isOpen} onOpenChange={onClose}>
			<SheetContent className="flex flex-col h-full">
				<SheetHeader>
					<SheetTitle>{ticker ? "Edit Ticker" : "Add New Ticker"}</SheetTitle>
					{ticker && (
						<SheetDescription>
							Enter the details of the stock or investment vehicle you want to
							track.
						</SheetDescription>
					)}
				</SheetHeader>
				<div className="flex-1 pb-2 overflow-y-auto">
					<TickerForm
						tickerId={ticker?.id}
						onClose={onClose}
						defaultValues={
							ticker
								? {
										symbol: ticker.symbol!,
										exchange: ticker.exchange!,
										dividend_amount: ticker.dividend_amount || 0,
										dividend_months: ticker.dividend_months || [],
										sector: ticker.sector || "",
										industry: ticker.industry || "",
										backfill: ticker.backfill!,
									}
								: undefined
						}
					/>
				</div>
			</SheetContent>
		</Sheet>
	);
}
