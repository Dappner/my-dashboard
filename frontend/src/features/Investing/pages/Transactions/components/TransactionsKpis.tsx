import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TransactionKPIsProps {
  netCashflow: number;
  totalTrades: number;
  netCash: number;
}

export default function TransactionKPIs({ netCashflow, totalTrades, netCash }: TransactionKPIsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">Net Cashflow</div>
          <div className={cn(
            "text-2xl font-bold",
            netCashflow >= 0 ? "text-green-700" : "text-red-600"
          )}>
            ${Math.abs(netCashflow).toFixed(2)}
            {netCashflow >= 0 ? " In" : " Out"}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">Total Trades</div>
          <div className="text-2xl font-bold">{totalTrades}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">Net Cash (Deposits/Withdrawals)</div>
          <div className={cn(
            "text-2xl font-bold",
            netCash >= 0 ? "text-green-700" : "text-red-600"
          )}>
            ${Math.abs(netCash).toFixed(2)}
            {netCash >= 0 ? " In" : " Out"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
