import { useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Area, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { format } from "date-fns";
import { usePortfolioDailyMetrics } from "../hooks/usePortfolioDailyMetrics";
import { Timeframe } from "@/types/portfolioDailyMetricTypes";

interface ChartDataPoint {
  date: Date;
  totalPortfolio: number;
  portfolio: number;
  cash: number;
  costBasis: number;
}

const chartConfig = {
  totalPortfolio: { label: "Total Portfolio Value", color: "#2563eb" },
  portfolio: { label: "Investment Value", color: "#16a34a" },
  cash: { label: "Cash Balance", color: "#9333ea" },
  costBasis: { label: "Cost Basis", color: "#6b7280" },
} as const;

type PortfolioChartConfig = typeof chartConfig;

interface PortfolioChartProps {
  timeframe: Timeframe;
  type: "absolute" | "percentual";
}

export default function PortfolioChart({ timeframe, type }: PortfolioChartProps) {
  const { dailyMetrics, isLoading, isError } = usePortfolioDailyMetrics(timeframe);

  // State to manage visibility of each line/area
  const [visibleLines, setVisibleLines] = useState({
    totalPortfolio: true,
    portfolio: true,
    cash: true,
    costBasis: true,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-80 bg-white rounded-lg shadow-sm border border-gray-100">
        <span className="text-muted-foreground">Loading chart...</span>
      </div>
    );
  }

  if (isError || !dailyMetrics || dailyMetrics.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 bg-white rounded-lg shadow-sm border border-gray-100">
        <span className="text-destructive">Error loading chart</span>
      </div>
    );
  }

  const baseline = dailyMetrics[0].cost_basis || dailyMetrics[0].total_portfolio_value || 1;

  const chartData: ChartDataPoint[] = dailyMetrics.map((val) => {
    const totalValue = Number(val.total_portfolio_value || 0);
    const portfolioValue = Number(val.portfolio_value || 0);
    const cashValue = Number(val.cash_balance || 0);
    const costValue = Number(val.cost_basis || 0);

    return {
      date: new Date(val.current_date || ""),
      totalPortfolio: type === "absolute" ? totalValue : ((totalValue - baseline) / baseline) * 100,
      portfolio: type === "absolute" ? portfolioValue : ((portfolioValue - baseline) / baseline) * 100,
      cash: type === "absolute" ? cashValue : ((cashValue - baseline) / baseline) * 100,
      costBasis: type === "absolute" ? costValue : ((costValue - baseline) / baseline) * 100,
    };
  });

  // Calculate min and max for Y-axis domain, ensuring min is at least 0 in absolute mode
  const yValues = chartData.flatMap((d) => [
    d.totalPortfolio,
    d.portfolio,
    d.cash,
    d.costBasis,
  ]);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const padding = (maxY - minY) * 0.1; // 10% padding
  const yDomain =
    type === "absolute"
      ? [Math.max(0, minY - padding), maxY + padding] // Ensure min is at least 0
      : ["auto", "auto"];

  const tooltipFormatter = (value: number, name: string) => {
    const key = name as keyof PortfolioChartConfig;
    const formattedValue =
      type === "absolute"
        ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : `${value.toFixed(2)}%`;
    return [formattedValue + " ", chartConfig[key]?.label || name];
  };

  const labelFormatter = (label: string | number | Date) => {
    return label instanceof Date ? format(label, "MMM d, yyyy") : String(label);
  };

  const yAxisFormatter = (value: number) => {
    return type === "absolute"
      ? `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
      : `${value.toFixed(1)}%`;
  };

  // Handle legend click to toggle visibility
  const handleLegendClick = (dataKey: string) => {
    setVisibleLines((prev) => ({
      ...prev,
      [dataKey]: !prev[dataKey as keyof typeof visibleLines],
    }));
  };

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
            tickFormatter={yAxisFormatter}
            stroke="#6b7280"
            fontSize={12}
            width={60}
            domain={yDomain}
          />
          <ChartTooltip
            cursor={{ stroke: "#d1d5db", strokeDasharray: "3 3" }}
            content={
              <ChartTooltipContent
                formatter={tooltipFormatter}
                labelFormatter={labelFormatter}
                className="bg-white shadow-md rounded-md p-2 border border-gray-200"
              />
            }
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            onClick={(e) => handleLegendClick(e.dataKey)} // Toggle on click
            formatter={(value) => (
              <span
                style={{
                  color: visibleLines[value as keyof typeof visibleLines]
                    ? chartConfig[value as keyof PortfolioChartConfig]?.color
                    : "#999",
                  cursor: "pointer",
                }}
              >
                {chartConfig[value as keyof PortfolioChartConfig]?.label || value}
              </span>
            )}
          />
          {visibleLines.totalPortfolio && (
            <Line
              dataKey="totalPortfolio"
              type="monotone"
              stroke={chartConfig.totalPortfolio.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 1 }}
            />
          )}
          {visibleLines.portfolio && (
            <Line
              dataKey="portfolio"
              type="monotone"
              stroke={chartConfig.portfolio.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 1 }}
            />
          )}
          {visibleLines.cash && (
            <Area
              dataKey="cash"
              type="monotone"
              stroke={chartConfig.cash.color}
              fill={chartConfig.cash.color}
              fillOpacity={0.2}
              strokeWidth={2}
            />
          )}
          {visibleLines.costBasis && (
            <Line
              dataKey="costBasis"
              type="monotone"
              stroke={chartConfig.costBasis.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 1 }}
            />
          )}
        </LineChart>
      </ChartContainer>
    </div>
  );
}
