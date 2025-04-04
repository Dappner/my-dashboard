import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useHoldings } from "@/features/Investing/hooks/useHoldings";
import type { Holding } from "@/types/holdingsTypes";
import { useNavigate } from "react-router";

export default function DetailedHoldingsTable() {
  const navigate = useNavigate();
  const { holdings, isLoading, isError } = useHoldings();

  const handleHoldingClick = (holding: Holding) => {
    navigate(`/investing/stock/${holding.exchange}/${holding.symbol}`);
  };
  const portfolioValue = holdings
    ?.map((holding) => holding.current_market_value || 0)
    .reduce((a, b) => a + b);
  if (!portfolioValue) return;

  const getWeight = (holding: Holding) => {
    if (portfolioValue === 0) {
      return "N/A";
    }
    return (
      ((holding.current_market_value || 0) / portfolioValue) *
      100
    ).toFixed(2);
  };

  return (
    <div className="bg-white border rounded-md shadow-sm overflow-x-auto">
      {isLoading ? (
        <div className="text-center py-4 text-muted-foreground">
          Loading holdings...
        </div>
      ) : isError ? (
        <div className="text-center py-4 text-destructive">
          Error loading holdings. Please refresh.
        </div>
      ) : !holdings?.length ? (
        <div className="text-center py-4 text-muted-foreground">
          No holdings found.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 border-b border-gray-200">
              <TableHead className="text-gray-600 font-semibold">
                Ticker
              </TableHead>
              <TableHead className="text-right text-gray-600 font-semibold">
                Shares
              </TableHead>
              <TableHead className="text-gray-600 font-semibold">
                Value
              </TableHead>
              <TableHead className="text-gray-600 font-semibold">
                Weight
              </TableHead>
              <TableHead className="text-gray-600 font-semibold">
                Unr. P/L(%)
              </TableHead>
              <TableHead className="text-gray-600 font-semibold">
                Dividends
              </TableHead>
              <TableHead className="text-gray-600 font-semibold">YOC</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings.map((holding) => {
              const unrealizedGainLoss = holding.unrealized_gain_loss ?? 0;
              const unrealizedGainLossPercent =
                holding.unrealized_gain_loss_percent ?? 0;
              const unrealizedPositive = unrealizedGainLoss >= 0;
              return (
                <TableRow
                  key={holding.ticker_id}
                  className="cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
                  onClick={() => handleHoldingClick(holding)}
                >
                  <TableCell className="font-medium text-gray-900">
                    {holding.symbol}
                  </TableCell>
                  <TableCell className="text-right">
                    {holding.shares?.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    ${holding.current_market_value?.toFixed(2) ?? "0.00"}
                  </TableCell>{" "}
                  <TableCell>{getWeight(holding)}%</TableCell>
                  <TableCell
                    className={
                      unrealizedPositive ? "text-green-600" : "text-red-600"
                    }
                  >
                    ${unrealizedGainLoss.toFixed(2)}
                    <span className="pl-1 ">
                      ({unrealizedGainLossPercent.toFixed(2)}%)
                    </span>
                  </TableCell>
                  <TableCell>
                    ${holding.total_dividends_received?.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {holding.cost_basis_dividend_yield_percent?.toFixed(2)}%
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
