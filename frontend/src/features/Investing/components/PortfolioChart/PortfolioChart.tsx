import ErrorState from "@/components/layout/components/ErrorState";
import LoadingState from "@/components/layout/components/LoadingState";
import { Card } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import useUser from "@/hooks/useUser";
import type { Timeframe } from "@my-dashboard/shared";
import { format, isValid } from "date-fns";
import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { CustomPortfolioTooltip } from "./components/CustomPortfolioTooltip";
import { Y_AXIS_WIDTH } from "./constants";
import { usePortfolioChartData } from "./hooks/usePortfolioChartData";
import { calculateYDomain, formatYAxis } from "./utils";
import type { ChartConfig } from "@/components/ui/chart";

export const chartConfig: ChartConfig = {
  totalPortfolio: { label: "Total Value", color: "#3b82f6" },
  portfolio: { label: "Portfolio %", color: "#10b981" },
  indexFund: { label: "Benchmark %", color: "#f97316" },
};

export type ChartDataKey = keyof typeof chartConfig;

interface PortfolioChartProps {
  timeframe: Timeframe;
  type: "absolute" | "percentual";
}

export default function PortfolioChart({
  timeframe,
  type,
}: PortfolioChartProps) {
  const { user } = useUser();
  const tickerId = user?.tracking_ticker_id;
  const { data: chartData, isLoading } = usePortfolioChartData(
    timeframe,
    type,
    tickerId || undefined,
  );
  const visibleLines = useMemo(
    () => ({
      totalPortfolio: type === "absolute",
      portfolio: type === "percentual",
      indexFund: type === "percentual",
    }),
    [type],
  );

  const yDomain = calculateYDomain(chartData, visibleLines, type);

  const formatLegendLabel = (value: string): React.ReactNode => {
    if (!(value in chartConfig)) return value;
    const key = value as ChartDataKey;
    const config = chartConfig[key];

    const shouldBeVisible =
      (type === "absolute" && key === "totalPortfolio") ||
      (type === "percentual" && (key === "portfolio" || key === "indexFund"));

    if (!shouldBeVisible) return null;

    return (
      <span
        className="select-none"
        style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
      >
        <span
          style={{
            width: "10px",
            height: "10px",
            backgroundColor: config.color,
            display: "inline-block",
            marginRight: "4px",
            borderRadius: "2px",
          }}
        />
        <span style={{ color: "var(--foreground)" }}>{config.label}</span>
      </span>
    );
  };

  if (isLoading) return <LoadingState />;

  if (type === "percentual" && !tickerId) {
    return (
      <ErrorState message="Select a benchmark ticker in Profile settings." />
    );
  }

  if (!chartData || chartData.length < 2) {
    if (isLoading) return <LoadingState />;
    return (
      <ErrorState message="Not enough data available to draw chart for this period." />
    );
  }
  if (!chartData || chartData.length < 1) {
    // Allow chart with just one point (at 0%)
    // Special case: If only 1 data point exists after processing, show it at 0%
    if (type === "percentual" && chartData.length === 1 && chartData[0].date) {
      // Adjust domain slightly for visibility if only one point
      const singlePointDomain: [number, number] = [-5, 5];
      return (
        <div className="h-96 min-h-[384px] w-full bg-background rounded-lg shadow-sm p-1 sm:p-2 border">
          <ResponsiveContainer width="100%" height="100%">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <LineChart
                data={chartData}
                margin={{ top: 30, right: 15, left: 5, bottom: 5 }}
              >
                {/* Simplified axes/grid for single point */}
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border, 214.3 31.8% 91.4%) / 0.7)"
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(val) =>
                    isValid(val) ? format(val, "MMM d") : ""
                  }
                  stroke="hsl(var(--muted-foreground, 215.4 16.3% 46.9%))"
                  fontSize={12}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => formatYAxis(value, type)}
                  stroke="hsl(var(--muted-foreground, 215.4 16.3% 46.9%))"
                  fontSize={12}
                  width={Y_AXIS_WIDTH}
                  domain={singlePointDomain}
                />
                <ChartTooltip content={<ChartTooltipContent /* ... */ />} />
                <Legend
                  verticalAlign="top"
                  align="left"
                  height={40}
                  formatter={formatLegendLabel}
                  wrapperStyle={{
                    paddingLeft: `${Y_AXIS_WIDTH + 10}px`,
                    paddingTop: "4px",
                  }}
                />
                {/* Render lines even for one point, they won't draw but legend/tooltip work */}
                <Line
                  name="portfolio"
                  dataKey="portfolio"
                  stroke={chartConfig.portfolio.color}
                  dot={true}
                />
                <Line
                  name="indexFund"
                  dataKey="indexFund"
                  stroke={chartConfig.indexFund.color}
                  dot={true}
                />
              </LineChart>
            </ChartContainer>
          </ResponsiveContainer>
        </div>
      );
    }
    return (
      <ErrorState message="Not enough data available to draw chart for this period." />
    );
  }

  return (
    <Card className="h-96 min-h-[384px] w-full p-1 sm:p-2 border">
      <ResponsiveContainer width="100%" height="100%">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <LineChart
            data={chartData}
            margin={{ top: 30, right: 15, left: 5, bottom: 5 }} // Increased top margin for legend
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="hsl(var(--border, 214.3 31.8% 91.4%) / 0.7)"
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(val) =>
                isValid(val) ? format(val, "MMM d") : ""
              }
              // Use CSS variables if defined, otherwise fallback
              stroke="hsl(var(--muted-foreground, 215.4 16.3% 46.9%))"
              fontSize={12}
              interval="preserveStartEnd"
              padding={{ left: 10, right: 10 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatYAxis}
              // Use CSS variables if defined, otherwise fallback
              stroke="hsl(var(--muted-foreground, 215.4 16.3% 46.9%))"
              fontSize={12}
              width={Y_AXIS_WIDTH}
              domain={yDomain} // Use calculated domain
              allowDataOverflow={false}
              tickCount={5}
              type="number" // Explicitly set type
            />
            <ChartTooltip
              cursor={{
                stroke: "hsl(var(--foreground, 222.2 84% 4.9%))",
                strokeWidth: 1,
                strokeDasharray: "3 3",
              }}
              content={
                <CustomPortfolioTooltip
                  chartType={type}
                  chartConfig={chartConfig}
                />
              }
              isAnimationActive={false}
            />
            <Legend
              verticalAlign="top" // Recharts default layout properties
              align="left"
              height={40} // Allocate space for legend
              formatter={formatLegendLabel} // Use the formatter function
              wrapperStyle={{
                paddingLeft: `${Y_AXIS_WIDTH + 10}px`, // Position legend correctly
                paddingTop: "4px",
              }}
            />
            {type === "percentual" && (
              <Line
                key="line-portfolio-pct"
                name="portfolio" // Critical: Matches key in chartConfig
                dataKey="portfolio"
                type="monotone"
                unit="%"
                stroke={chartConfig.portfolio.color}
                strokeWidth={2}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
            )}
            {/* Benchmark % Change Line (Only renders if type is percentual) */}
            {type === "percentual" && (
              <Line
                key="line-indexFund-pct"
                name="indexFund" // Critical: Matches key in chartConfig
                dataKey="indexFund"
                type="monotone"
                unit="%"
                stroke={chartConfig.indexFund.color}
                strokeWidth={2}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
            )}
            {type === "absolute" && (
              <Line
                key="line-totalPortfolio"
                name="totalPortfolio" // Name must match key in chartConfig
                dataKey="totalPortfolio"
                type="monotone"
                unit="$"
                stroke={chartConfig.totalPortfolio.color} // Use hardcoded color
                strokeWidth={2}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ChartContainer>
      </ResponsiveContainer>
    </Card>
  );
}
