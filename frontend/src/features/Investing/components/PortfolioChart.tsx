import { useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { format } from "date-fns";
import { usePortfolioDailyMetrics } from "../hooks/usePortfolioDailyMetrics";
import { Timeframe } from "@/types/portfolioDailyMetricTypes";
import useUser from "@/hooks/useUser";
import { useTickerHistoricalPrices } from "../pages/Research/hooks/useTickerHistoricalPrices";

function extractDate(dateString: string): Date {
  const datePart = dateString.split("T")[0]; // Extracts "2025-02-07"
  return new Date(datePart); // Creates a Date object for "2025-02-07" at 00:00:00 local time
}

interface ChartDataPoint {
  date: Date;
  totalPortfolio?: number;
  portfolio?: number;
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

export default function PortfolioChart(
  { timeframe, type }: PortfolioChartProps,
) {
  const { user } = useUser();
  const { dailyMetrics, isLoading, isError } = usePortfolioDailyMetrics(
    timeframe,
  );
  const [visibleLines, setVisibleLines] = useState<VisibleLines>({
    totalPortfolio: true,
    portfolio: true,
    cash: false,
    costBasis: true,
    indexFund: true,
  });

  const { historicalPrices, historicalPricesLoading } =
    useTickerHistoricalPrices(user?.tracking_ticker_id || "", timeframe);

  if (isLoading || historicalPricesLoading) return <LoadingState />;
  if (
    isError || !dailyMetrics?.length ||
    (type === "percentual" && (!historicalPrices || !historicalPrices.length))
  ) {
    console.warn("Chart data issue:", {
      isError,
      dailyMetricsLength: dailyMetrics?.length,
      historicalPricesLength: historicalPrices?.length,
      ticker: user?.tracking_ticker_id,
    });
    return <ErrorState />;
  }

  // Create a map from date string to close_price for accurate matching
  const historicalPricesMap = new Map(
    historicalPrices?.map((hp) => [hp.date.split("T")[0], hp.close_price]) ||
      [],
  );

  const getChartData = (): ChartDataPoint[] => {
    // Sort dailyMetrics by date to ensure we get the earliest date first
    const sortedMetrics = [...dailyMetrics].sort((a, b) =>
      new Date(a.current_date).getTime() - new Date(b.current_date).getTime()
    );
    const firstDateString = sortedMetrics[0].current_date.split("T")[0];

    // Ensure we have valid baseline values
    const baselinePortfolio = Number(sortedMetrics[0].portfolio_value) || 1;

    // Find the earliest available index price that matches or precedes our first date
    const sortedHistoricalPrices = historicalPrices
      ? [...historicalPrices].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )
      : [];

    // Find the first valid baseline index price
    const firstValidIndexPrice = sortedHistoricalPrices.find((hp) => {
      const hpDate = hp.date.split("T")[0];
      return new Date(hpDate) <= new Date(firstDateString);
    });

    const baselineIndex = firstValidIndexPrice
      ? Number(firstValidIndexPrice.close_price)
      : sortedHistoricalPrices[0]?.close_price || 1;

    return sortedMetrics.map((val) => {
      const dateString = val.current_date?.split("T")[0];
      const date = extractDate(val.current_date);

      const totalValue = Number(val.total_portfolio_value) || 0;
      const portfolioValue = Number(val.portfolio_value) || 0;
      const cashValue = Number(val.cash_balance) || 0;
      const costValue = Number(val.cost_basis) || 0;
      const indexValue = historicalPricesMap.get(dateString) ?? baselineIndex;

      if (type === "percentual") {
        const portfolioPercent = baselinePortfolio !== 0
          ? ((portfolioValue - baselinePortfolio) / baselinePortfolio) * 100
          : 0;
        const indexPercent = baselineIndex !== 0
          ? ((indexValue - baselineIndex) / baselineIndex) * 100
          : 0;

        return {
          date,
          portfolio: Number.isFinite(portfolioPercent) ? portfolioPercent : 0,
          indexFund: Number.isFinite(indexPercent) ? indexPercent : 0,
        };
      }

      return {
        date,
        totalPortfolio: totalValue,
        portfolio: portfolioValue,
        cash: cashValue,
        costBasis: costValue,
      };
    });
  };

  const getYDomain = (data: ChartDataPoint[]) => {
    if (type === "percentual") {
      const yValues = data.flatMap((d) => [
        d.portfolio || 0,
        d.indexFund || 0,
      ]).filter((val) => Number.isFinite(val));

      if (yValues.length === 0) return [-100, 100];

      const minY = Math.min(...yValues);
      const maxY = Math.max(...yValues);
      const padding = Math.max((maxY - minY) * 0.1, 5); // Minimum padding of 5%
      return [minY - padding, maxY + padding];
    }

    const yValues = data.flatMap((d) => [
      d.totalPortfolio || 0,
      d.portfolio || 0,
      d.cash || 0,
      d.costBasis || 0,
    ]).filter((val) => Number.isFinite(val));

    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    const padding = (maxY - minY) * 0.1;
    return [Math.max(0, minY - padding), maxY + padding];
  };

  const formatTooltipValue = (value: number, name: string) => {
    const key = name as keyof ChartConfig;
    const formattedValue = type === "absolute"
      ? `$${
        value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      }`
      : `${value.toFixed(2)}%`;
    return [formattedValue + " ", chartConfig[key]?.label || name];
  };

  const formatYAxis = (value: number) =>
    type === "absolute"
      ? `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
      : `${value.toFixed(1)}%`;

  const formatDateLabel = (test, payload?: any): string => {
    if (payload?.[0]?.payload?.date) {
      const date = payload[0].payload.date;
      return date instanceof Date && !isNaN(date.getTime())
        ? format(date, "MMM d, yyyy")
        : "Invalid Date";
    }
    return "Invalid Date";
  };

  const toggleLineVisibility = (dataKey: string) => {
    setVisibleLines((prev) => ({
      ...prev,
      [dataKey]: !prev[dataKey as keyof VisibleLines],
    }));
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
          <CartesianGrid
            vertical={false}
            strokeDasharray="3 3"
            stroke="#e5e7eb"
          />
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
                  color: visibleLines[value as keyof VisibleLines]
                    ? chartConfig[value as keyof ChartConfig]?.color
                    : "#999",
                  cursor: "pointer",
                }}
              >
                {chartConfig[value as keyof ChartConfig]?.label || value}
              </span>
            )}
          />
          {type === "absolute" && visibleLines.totalPortfolio && (
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
          {type === "absolute" && visibleLines.cash && (
            <Line
              dataKey="cash"
              type="monotone"
              stroke={chartConfig.cash.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 1 }}
            />
          )}
          {type === "absolute" && visibleLines.costBasis && (
            <Line
              dataKey="costBasis"
              type="monotone"
              stroke={chartConfig.costBasis.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 1 }}
            />
          )}
          {type === "percentual" && visibleLines.indexFund && (
            <Line
              dataKey="indexFund"
              type="monotone"
              stroke={chartConfig.indexFund.color}
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
