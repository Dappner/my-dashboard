import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useHoldings } from "@/features/Investing/hooks/useHoldings";
import { investingTickerRoute } from "@/routes/investing-routes";
import type { Holding } from "@my-dashboard/shared";
import { useNavigate } from "@tanstack/react-router";

export default function DetailedHoldingsTable() {
  const navigate = useNavigate();
  const { holdings, isLoading, isError } = useHoldings();

  const handleHoldingClick = (holding: Holding) => {
    navigate({
      to: investingTickerRoute.to,
      params: {
        ticker: holding.symbol || "",
        exchange: holding.exchange || "",
      },
    });
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
    <div className="border rounded-md shadow-sm overflow-x-auto">
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
            <TableRow className="bg-muted/50 text-muted-foreground">
              <TableHead>Ticker</TableHead>
              <TableHead className="text-right">Shares</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Unr. P/L(%)</TableHead>
              <TableHead>Dividends</TableHead>
              <TableHead>YOC</TableHead>
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
                  className="cursor-pointer hover:bg-muted transition-colors border-b border-accent"
                  onClick={() => handleHoldingClick(holding)}
                >
                  <TableCell className="font-medium ">
                    {holding.symbol}
                  </TableCell>
                  <TableCell className="text-right">
                    {holding.shares?.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    ${holding.current_market_value?.toFixed(2) ?? "0.00"}
                  </TableCell>
                  <TableCell>{getWeight(holding)}%</TableCell>
                  <TableCell
                    className={
                      unrealizedPositive
                        ? "text-success-foreground"
                        : "text-destructive-foreground"
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
