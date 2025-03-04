import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowUp, TrendingUp, DollarSign } from "lucide-react";
import { Portfolio } from "@/types/portfolioTypes";
import { Database } from "@/types/supabase";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface PortfolioKpisProps {
  portfolio?: Portfolio;
}

const KpiCard = ({
  title,
  value,
  changePercent,
  percent,
  icon: Icon,
  positiveChange = true,
  additionalInfo = '',
  percentOnly = false
}: {
  title: string;
  value: string;
  changePercent?: number;
  percent?: number;
  icon: React.ElementType;
  positiveChange?: boolean;
  additionalInfo?: string;
  percentOnly?: boolean;
}) => (
  <Card className="hover:shadow-md transition-shadow duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <div className="flex items-center text-xs mt-1">
        {!percentOnly && changePercent !== undefined ? (
          positiveChange ? (
            <span className="text-green-600 flex items-center">
              <ArrowUp className="h-3 w-3 mr-1" />
              +{changePercent.toFixed(2)}%
            </span>
          ) : (
            <span className="text-red-600 flex items-center">
              <ArrowDown className="h-3 w-3 mr-1" />
              {changePercent.toFixed(2)}%
            </span>
          )
        ) : (
          percent !== undefined && (
            <span className="text-muted-foreground">
              {percent.toFixed(1)}% {additionalInfo}
            </span>
          )
        )}
      </div>
    </CardContent>
  </Card>
);

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
      <div className="grid grid-cols-3 gap-4">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i} className="h-32 animate-pulse bg-gray-200" />
        ))}
      </div>
    );
  }

  // Safely handle metrics
  const currentMetrics = dailyMetrics[dailyMetrics.length - 1] || {};
  const previousMetrics = dailyMetrics![0];

  // Calculate key metrics with robust error handling
  const portfolioValue = currentMetrics.portfolio_value || 0;
  const portfolioCostBasis = currentMetrics.cost_basis || 0;
  const cashBalance = portfolio?.cash || 0;

  // Calculate month change
  const previousPortfolioValue = previousMetrics.portfolio_value || portfolioValue;
  const monthChange = portfolioValue - previousPortfolioValue;
  const monthChangePercent = previousPortfolioValue > 0
    ? (monthChange / previousPortfolioValue) * 100
    : 0;

  // Calculate total return
  const totalReturn = portfolioValue - portfolioCostBasis;
  const totalReturnPercent = portfolioCostBasis > 0
    ? (totalReturn / portfolioCostBasis) * 100
    : 0;

  // Cash percentage
  const cashPercentage = portfolioValue > 0
    ? (cashBalance / portfolioValue) * 100
    : 0;

  return (
    <>
      <KpiCard
        title="Portfolio Value"
        value={`$${portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
        changePercent={monthChangePercent}
        icon={TrendingUp}
        positiveChange={monthChange >= 0}
        additionalInfo="This month"
      />

      <KpiCard
        title="Total Return"
        value={`${totalReturn >= 0 ? '+' : '-'}$${Math.abs(totalReturn).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
        changePercent={totalReturnPercent}
        icon={totalReturn >= 0 ? ArrowUp : ArrowDown}
        positiveChange={totalReturn >= 0}
      />

      <KpiCard
        title="Cash Balance"
        value={`$${cashBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
        percent={cashPercentage}
        icon={DollarSign}
        percentOnly
      />
    </>
  );
}
