import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { investingTickerRoute } from "@/routes/investing-routes";
import type { TickerDaily } from "@my-dashboard/shared";
import { useNavigate } from "@tanstack/react-router";
import { TableLoading } from "./TableLoading";

interface TickerTableProps {
	filteredTickers?: TickerDaily[] | null;
	isLoading: boolean;
}

export default function TickerTable({
	filteredTickers,
	isLoading,
}: TickerTableProps) {
	const navigate = useNavigate();
	const onSymbolClick = (ticker: TickerDaily) => {
		navigate({
			to: investingTickerRoute.to,
			params: { ticker: ticker.symbol || "", exchange: ticker.exchange || "" },
		});
	};

	return (
		<TableLoading isLoaded={!isLoading} className="h-64">
			<div className="w-full border rounded-md bg-white">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Symbol</TableHead>
							<TableHead>Name</TableHead>
							<TableHead>Price</TableHead>
							<TableHead>Trailing PE</TableHead>
							<TableHead>Sector</TableHead>
							<TableHead>Industry</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredTickers?.map((ticker) => (
							<TableRow key={ticker.ticker_id}>
								<TableCell
									className="font-bold cursor-pointer hover:underline"
									onClick={() => onSymbolClick(ticker)}
								>
									{ticker.symbol}
								</TableCell>
								<TableCell>{ticker.name || "-"}</TableCell>
								<TableCell>${ticker.regular_market_price || "-"}</TableCell>
								<TableCell>${ticker.trailing_pe || "-"}</TableCell>
								<TableCell>{ticker.sector}</TableCell>
								<TableCell>{ticker.industry}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</TableLoading>
	);
}
