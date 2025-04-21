import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TransactionKPIsProps {
  netCashflow: number;
  totalTrades: number;
  netCash: number;
}

export default function TransactionKPIs({
  netCashflow,
  totalTrades,
  netCash,
}: TransactionKPIsProps) {
  return (
    <div className="grid grid-cols-3 sm:gap-2 w-full">
      <Card className="sm:rounded-lg px-3 py-2 sm:border border-accent shadow-sm">
        <div className="text-sm text-muted-foreground mb-1">Net Cashflow</div>
        <div
          className={cn(
            "text-lg font-semibold",
            netCashflow >= 0
              ? "text-success-foreground"
              : "text-destructive-foreground",
          )}
        >
          ${Math.abs(netCashflow).toFixed(2)}
        </div>
      </Card>
      <Card className="sm:rounded-lg px-3 py-2 sm:border border-gray-200 shadow-sm">
        <div className="text-sm text-muted-foreground mb-1">Total Trades</div>
        <div className="text-lg font-semibold text-primary">{totalTrades}</div>
      </Card>
      <Card className=" sm:rounded-lg px-3 py-2 sm:border border-gray-200 shadow-sm">
        <div className="text-sm text-muted-foreground mb-1">Net Deposits</div>
        <div
          className={cn(
            "text-lg font-semibold",
            netCash >= 0
              ? "text-success-foreground"
              : "text-destructive-foreground",
          )}
        >
          ${Math.abs(netCash).toFixed(2)}
        </div>
      </Card>
    </div>
  );
}
