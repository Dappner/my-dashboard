import { useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { format } from "date-fns";
import { usePortfolioDailyMetrics } from "../hooks/usePortfolioDailyMetrics";
import { Timeframe } from "@/types/portfolioDailyMetricTypes";
import { useQuery } from "@tanstack/react-query";
import useUser from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";

interface ChartDataPoint {
  date: Date;
  totalPortfolio?: number;
  portfolio: number;
  cash?: number;
  costBasis?: number;
  indexFund?: number;
}

type ChartConfig = typeof chartConfig;
type VisibleLines = Record<keyof ChartConfig, boolean>;

const chartConfig = {
  totalPortfolio: { label: "Total Portfolio Value", color: "#2563eb" },
  portfolio: { label: "Investment Value", color: "#16a34a" },
  cash: { label: "Cash Balance", color: "#9333ea" },
  costBasis: { label: "Cost Basis", color: "#6b7280" },
  indexFund: { label: "Index Fund (Benchmark)", color: "#f97316" },
} as const;

interface PortfolioChartProps {
  timeframe: Timeframe;
  type: "absolute" | "percentual";
}

const LoadingState = () => (
  <div className="flex items-center justify-center h-80 bg-white rounded-lg shadow-sm border border-gray-100">
    <span className="text-muted-foreground">Loading chart...</span>
  </div>
);

const ErrorState = () => (
  <div className="flex items-center justify-center h-80 bg-white rounded-lg shadow-sm border border-gray-100">
    <span className="text-destructive">Error loading chart</span>
  </div>
);

export default function PortfolioChart({ timeframe, type }: PortfolioChartProps) {
  const { user } = useUser();
  const { dailyMetrics, isLoading, isError } = usePortfolioDailyMetrics(timeframe);
  const [visibleLines, setVisibleLines] = useState<VisibleLines>({
    totalPortfolio: true,
    portfolio: true,
    cash: false,
    costBasis: true,
    indexFund: true,
  });

  const { data: historicalPrices, isLoading: historicalPricesLoading } = useQuery({
    queryKey: ["historicalPrices", user?.tracking_ticker_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("historical_prices")
        .select()
        .eq("ticker_id", user?.tracking_ticker_id!)
        .order("date", { ascending: true });
      return data;
    },
    enabled: !!user?.tracking_ticker_id,
  });

  if (isLoading || (type === "percentual" && historicalPricesLoading)) return <LoadingState />;
  if (isError || !dailyMetrics?.length || (type === "percentual" && !historicalPrices)) return <ErrorState />;

  const getChartData = (): ChartDataPoint[] => {
    const baselinePortfolio = dailyMetrics[0].portfolio_value || 1;
    const baselineIndex = historicalPrices?.[0]?.close_price || 1;

    return dailyMetrics.map((val, index) => {
      const totalValue = Number(val.total_portfolio_value || 0);
      const portfolioValue = Number(val.portfolio_value || 0);
      const cashValue = Number(val.cash_balance || 0);
      const costValue = Number(val.cost_basis || 0);
      const indexValue = historicalPrices?.[index]?.close_price || baselineIndex;

      const date = val.current_date ? new Date(val.current_date) : new Date();

      return type === "percentual"
        ? {
          date,
          portfolio: ((portfolioValue - baselinePortfolio) / baselinePortfolio) * 100,
          indexFund: ((indexValue - baselineIndex) / baselineIndex) * 100,
        }
        : {
          date,
          totalPortfolio: totalValue,
          portfolio: portfolioValue,
          cash: cashValue,
          costBasis: costValue,
        };
    });
  };

  const getYDomain = (data: ChartDataPoint[]) => {
    const yValues = type === "percentual"
      ? data.flatMap((d) => [d.portfolio, d.indexFund || 0])
      : data.flatMap((d) => [d.totalPortfolio || 0, d.portfolio, d.cash || 0, d.costBasis || 0]);

    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    const padding = (maxY - minY) * 0.1;
    return type === "absolute" ? [Math.max(0, minY - padding), maxY + padding] : ["auto", "auto"];
  };

  const formatTooltipValue = (value: number, name: string) => {
    const key = name as keyof ChartConfig;
    const formattedValue = type === "absolute"
      ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `${value.toFixed(2)}%`;
    return [formattedValue + " ", chartConfig[key]?.label || name];
  };

  const formatYAxis = (value: number) => type === "absolute"
    ? `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    : `${value.toFixed(1)}%`;

  const formatDateLabel = (payload?: any): string => {
    if (payload?.[0]?.payload?.date) {
      const date = payload[0].payload.date;
      return date instanceof Date && !isNaN(date.getTime())
        ? format(date, "MMM d, yyyy")
        : "Invalid Date";
    }
    return "Invalid Date";
  };
  const toggleLineVisibility = (dataKey: string) => {
    setVisibleLines((prev) => ({ ...prev, [dataKey]: !prev[dataKey as keyof VisibleLines] }));
  };

  const chartData = getChartData();
  const yDomain = getYDomain(chartData);

  return (
    <div className="bg-white rounded-lg shadow-sm px-4 border border-gray-100">
      <ChartContainer config={chartConfig} className="h-96 w-full">
        <LineChart
          accessibilityLayer
          data={chartData}
          margin={{ left: 0, right: 12, top: 24, bottom: 0 }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value: Date) => format(value, "MMM d")}
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={formatYAxis}
            stroke="#6b7280"
            fontSize={12}
            width={60}
            domain={yDomain}
          />
          <ChartTooltip
            cursor={{ stroke: "#d1d5db", strokeDasharray: "3 3" }}
            content={
              <ChartTooltipContent
                formatter={formatTooltipValue}
                labelFormatter={formatDateLabel}
                className="bg-white shadow-md rounded-md p-2 border border-gray-200"
              />
            }
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            onClick={(e) => toggleLineVisibility(e.dataKey)}
            formatter={(value) => (
              <span
                style={{
                  color: visibleLines[value as keyof VisibleLines] ? chartConfig[value as keyof ChartConfig]?.color : "#999",
                  cursor: "pointer",
                }}
              >
                {chartConfig[value as keyof ChartConfig]?.label || value}
              </span>
            )}
          />
          {type === "absolute" && visibleLines.totalPortfolio && (
            <Line dataKey="totalPortfolio" type="monotone" stroke={chartConfig.totalPortfolio.color} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 1 }} />
          )}
          {visibleLines.portfolio && (
            <Line dataKey="portfolio" type="monotone" stroke={chartConfig.portfolio.color} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 1 }} />
          )}
          {type === "absolute" && visibleLines.cash && (
            <Line dataKey="cash" type="monotone" stroke={chartConfig.cash.color} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 1 }} />
          )}
          {type === "absolute" && visibleLines.costBasis && (
            <Line dataKey="costBasis" type="monotone" stroke={chartConfig.costBasis.color} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 1 }} />
          )}
          {type === "percentual" && visibleLines.indexFund && (
            <Line dataKey="indexFund" type="monotone" stroke={chartConfig.indexFund.color} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 1 }} />
          )}
        </LineChart>
      </ChartContainer>
    </div>
  );
}
