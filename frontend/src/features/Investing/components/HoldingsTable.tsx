import { holdingsApi, holdingsApiKeys } from "@/api/holdingsApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Holding } from "@/types/holdingsTypes";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";

export default function HoldingsTable() {
  const navigate = useNavigate();
  const { data: holdings, isLoading, isError } = useQuery({
    queryFn: holdingsApi.getHoldings,
    queryKey: holdingsApiKeys.all,
  });

  const handleHoldingClick = (holding: Holding) => {
    navigate(`/investing/stock/${holding.exchange}/${holding.symbol}`);
  };

  return (
    <div className="w-full border rounded-md">
      {isLoading ? (
        <div className="text-center py-4 text-muted-foreground">Loading holdings...</div>
      ) : isError ? (
        <div className="text-center py-4 text-destructive">Error loading holdings. Please refresh.</div>
      ) : !holdings?.length ? (
        <div className="text-center py-4 text-muted-foreground">No holdings found.</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 border-b border-gray-200">
              <TableHead className="text-gray-600 font-semibold">Ticker</TableHead>
              <TableHead className="text-gray-600 font-semibold">Shares</TableHead>
              <TableHead className="text-right text-gray-600 font-semibold">Cost</TableHead>
              <TableHead className="text-gray-600 font-semibold">Value</TableHead>
              <TableHead className="text-gray-600 font-semibold">P/L</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings.map((holding) => (
              <TableRow
                key={holding.ticker_id}
                className="cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
                onClick={() => handleHoldingClick(holding)}
              >
                <TableCell className="font-medium text-gray-900">{holding.symbol}</TableCell>
                <TableCell>{holding.shares?.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  ${(holding.average_cost_basis! * holding.shares!).toFixed(2)}
                </TableCell>
                <TableCell>${holding.current_market_value?.toFixed(2)}</TableCell>
                <TableCell
                  className={holding.unrealized_gain_loss! >= 0 ? "text-green-600" : "text-red-600"}
                >
                  {holding.unrealized_gain_loss?.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
