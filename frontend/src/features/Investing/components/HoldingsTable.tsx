import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Holding } from "@/types/holdingsTypes";
import { useNavigate } from "react-router";
import { useHoldings } from "../hooks/useHoldings";

export default function HoldingsTable() {
  const navigate = useNavigate();
  const { holdings, isLoading, isError } = useHoldings();

  const handleHoldingClick = (holding: Holding) => {
    navigate(`/investing/stock/${holding.exchange}/${holding.symbol}`);
  };

  return (
    <div className="bg-white border rounded-md shadow-sm overflow-x-auto">
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
              <TableHead className="text-gray-600 font-semibold">Value</TableHead>
              <TableHead className="text-gray-600 font-semibold">Unr. P/L</TableHead>
              <TableHead className="text-gray-600 font-semibold">%</TableHead>
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
                <TableCell>${holding.current_market_value?.toFixed(2)}</TableCell>
                <TableCell
                  className={holding.unrealized_gain_loss! >= 0 ? "text-green-600" : "text-red-600"}
                >
                  ${holding.unrealized_gain_loss?.toFixed(2)}
                </TableCell>
                <TableCell
                  className={holding.unrealized_gain_loss_percent! >= 0 ? "text-green-600" : "text-red-600"}
                >
                  {holding.unrealized_gain_loss_percent?.toFixed(2)}%
                </TableCell>


              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
