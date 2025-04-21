import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { investingTickerRoute } from "@/routes/investing-routes";
import type { Holding } from "@my-dashboard/shared";
import { useNavigate } from "@tanstack/react-router";
import { useHoldings } from "../hooks/useHoldings";
import { cn } from "@/lib/utils";

export default function HoldingsWidget() {
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

  return (
    <Card className="overflow-x-auto py-0">
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
            <TableRow className="bg-muted/50 border-b border-muted text-muted-foreground font-semibold">
              <TableHead>Ticker</TableHead>
              <TableHead>Shares</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Unr. P/L</TableHead>
              <TableHead>%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings.map((holding) => {
              const unrealizedGainLoss = holding.unrealized_gain_loss ?? 0;
              const unrealizedGainLossPercent =
                holding.unrealized_gain_loss_percent ?? 0;
              const isPositive = unrealizedGainLoss >= 0;

              return (
                <TableRow
                  key={holding.ticker_id}
                  className="cursor-pointer hover:bg-muted/20 transition-colors border-b border-border"
                  onClick={() => handleHoldingClick(holding)}
                >
                  <TableCell className="font-medium text-foreground">
                    {holding.symbol}
                  </TableCell>
                  <TableCell>{holding.shares?.toFixed(2) ?? "0.00"}</TableCell>
                  <TableCell>
                    ${holding.current_market_value?.toFixed(2) ?? "0.00"}
                  </TableCell>
                  <TableCell
                    className={cn(
                      isPositive
                        ? "text-success-foreground"
                        : "text-destructive-foreground",
                    )}
                  >
                    ${unrealizedGainLoss.toFixed(2)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      isPositive
                        ? "text-success-foreground"
                        : "text-destructive-foreground",
                    )}
                  >
                    {unrealizedGainLossPercent.toFixed(2)}%
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
