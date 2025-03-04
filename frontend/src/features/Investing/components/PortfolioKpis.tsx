import { Card } from "@/components/ui/card";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Portfolio } from "@/types/portfolioTypes";
import { Database } from "@/types/supabase";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface PortfolioKpisProps {
  portfolio?: Portfolio;
}

export default function PortfolioKpis({ portfolio }: PortfolioKpisProps) {
  const { data: dailyMetrics, isLoading, isError } = useQuery({
    queryFn: async () => {
      const { data } = await supabase.from("portfolio_daily_metrics").select();
      return data as Database["public"]["Views"]["portfolio_daily_metrics"]["Row"][];
    },
    queryKey: ["30Day"],
  });

  if (isLoading || isError || !dailyMetrics || dailyMetrics.length === 0) {
    return (
      <div className="col-span-3 grid grid-cols-3 gap-4">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i} className="h-24 animate-pulse bg-gray-200" />
        ))}
      </div>
    );
  }

  // Get current and previous day metrics
  const currentMetrics = dailyMetrics[dailyMetrics.length - 1];
  const previousMetrics = dailyMetrics.length > 1 ? dailyMetrics[dailyMetrics.length - 2] : currentMetrics;

  // Calculate key metrics
  const portfolioValue = currentMetrics.portfolio_value || 0;
  const portfolioCostBasis = currentMetrics.cost_basis || 0;
  const cashBalance = portfolio?.cash || 0;

  const dailyChange = portfolioValue - (previousMetrics.portfolio_value || portfolioValue);
  const dailyChangePercent = previousMetrics.portfolio_value ? (dailyChange / previousMetrics.portfolio_value) * 100 : 0;

  const totalReturn = portfolioValue - portfolioCostBasis;
  const totalReturnPercent = portfolioCostBasis > 0 ? (totalReturn / portfolioCostBasis) * 100 : 0;

  return (
    <>
      <Card className="p-4">
        <div className="text-xs text-muted-foreground">Portfolio Value</div>
        <div className="text-xl font-bold">${portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
        <div className="flex items-center text-xs mt-1">
          {dailyChangePercent >= 0 ? (
            <span className="text-green-600 flex items-center">
              <ArrowUp className="h-3 w-3 mr-1" />
              {dailyChangePercent.toFixed(2)}%
            </span>
          ) : (
            <span className="text-red-600 flex items-center">
              <ArrowDown className="h-3 w-3 mr-1" />
              {Math.abs(dailyChangePercent).toFixed(2)}%
            </span>
          )}
          <span className="ml-1 text-muted-foreground">Today</span>
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-xs text-muted-foreground">Total Return</div>
        <div className={`text-xl font-bold ${totalReturn >= 0 ? "text-green-600" : "text-red-600"}`}>
          {totalReturn >= 0 ? "+" : "-"}${Math.abs(totalReturn).toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </div>
        <div className="text-xs mt-1">
          {totalReturnPercent >= 0 ? "+" : ""}{totalReturnPercent.toFixed(2)}%
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-xs text-muted-foreground">Cash Balance</div>
        <div className="text-xl font-bold">${cashBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
        <div className="text-xs mt-1 text-muted-foreground">
          {(portfolioValue > 0 ? (cashBalance / portfolioValue) * 100 : 0).toFixed(1)}% of portfolio
        </div>
      </Card>
    </>
  );
}
