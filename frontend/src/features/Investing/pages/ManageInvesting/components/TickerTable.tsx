import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useTickerSheet } from "@/contexts/SheetContext";
import { monthsShort } from "@/features/Investing/constants";
import { useTicker } from "@/features/Investing/hooks/useTickers";
import { formatIndustryName, formatSectorName } from "@/lib/formatting";
import type { Ticker } from "@/types/tickerTypes";
import { Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";

interface TickerTableProps {
	filteredTickers: Ticker[];
}

export default function TickerTable({ filteredTickers }: TickerTableProps) {
	const navigate = useNavigate();
	const { openEditTicker } = useTickerSheet();
	const { deleteTicker } = useTicker();

	const onSymbolClick = (ticker: Ticker) => {
		navigate(`/investing/stock/${ticker.exchange}/${ticker.symbol}`);
	};

	const onDeleteTicker = (ticker: Ticker) => {
		if (
			window.confirm(
				"Are you sure you want to delete ticker: " + ticker.name + "?",
			)
		) {
			deleteTicker(ticker.id!);
		}
	};

	return (
		<div className="w-full border rounded-md bg-white">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Symbol</TableHead>
						<TableHead>Name</TableHead>
						<TableHead>Exchange</TableHead>
						<TableHead>Sector</TableHead>
						<TableHead>Industry</TableHead>
						<TableHead>Div Amount</TableHead>
						<TableHead>Div Months</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{filteredTickers.map((ticker) => (
						<TableRow key={ticker.id}>
							<TableCell
								className="font-bold cursor-pointer hover:underline"
								onClick={() => onSymbolClick(ticker)}
							>
								{ticker.symbol}
							</TableCell>
							<TableCell>{ticker.name || "-"}</TableCell>
							<TableCell>{ticker.exchange || "-"}</TableCell>
							<TableCell>{formatSectorName(ticker.sector)}</TableCell>
							<TableCell>{formatIndustryName(ticker.industry)}</TableCell>
							<TableCell>
								${ticker.dividend_amount?.toFixed(2) || "-"}
							</TableCell>
							<TableCell>
								{ticker.dividend_months?.length == 12
									? "Monthly"
									: ticker.dividend_months
											?.map((val) => monthsShort[val])
											.join(",")}
							</TableCell>
							<TableCell className="text-right">
								<div className="flex justify-end space-x-2">
									<Button
										variant="ghost"
										size="icon"
										onClick={() => openEditTicker(ticker)}
									>
										<Pencil className="h-4 w-4" />
									</Button>

									<Button
										variant="ghost"
										size="icon"
										onClick={() => onDeleteTicker(ticker)}
									>
										<Trash2 className="h-4 w-4 text-destructive" />
									</Button>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
