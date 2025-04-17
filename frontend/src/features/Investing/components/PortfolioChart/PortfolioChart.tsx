import ErrorState from "@/components/layout/components/ErrorState";
import LoadingState from "@/components/layout/components/LoadingState";
import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import useUser from "@/hooks/useUser";
import type { Timeframe } from "@my-dashboard/shared";
import { format } from "date-fns";
import {
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
import type { ChartDataKey } from "./types";

type chartConfigType = {
  totalPortfolio: { label: string; color: string };
  portfolio: { label: string; color: string };
  indexFund: { label: string; color: string };
};

interface PortfolioChartProps {
  timeframe: Timeframe;
  type: "absolute" | "percentual";
}

export default function PortfolioChart({
  timeframe,
  type,
}: PortfolioChartProps) {
  const chartConfig: chartConfigType = {
    totalPortfolio: { label: "Total Value", color: "#3b82f6" },
    portfolio: { label: "Portfolio %", color: "#10b981" },
    indexFund: { label: "Benchmark %", color: "#f97316" },
  };
  const { user } = useUser();
  const tickerId = user?.tracking_ticker_id;

  const { data: chartData, isLoading } = usePortfolioChartData(
    timeframe,
    type,
    tickerId || undefined,
  );

  // Calculate Y-axis domain based on data and visible lines
  const yDomain = calculateYDomain(chartData, type);

  // Format legend labels
  const formatLegendLabel = (value: string): React.ReactNode => {
    if (!(value in chartConfig)) return value;
    const key = value as ChartDataKey;
    const config = chartConfig[key];

    const shouldBeVisible =
      (type === "absolute" && key === "totalPortfolio") ||
      (type === "percentual" && (key === "portfolio" || key === "indexFund"));

    if (!shouldBeVisible) return null;

    return (
      <span className="select-none inline-flex items-center gap-1">
        <span
          className="inline-block w-2.5 h-2.5 rounded-sm mr-1"
          style={{ backgroundColor: config.color }}
        />
        <span className="text-foreground">{config.label}</span>
      </span>
    );
  };

  // Show loading state
  if (isLoading) return <LoadingState />;

  // Handle missing benchmark ticker for percentage view
  if (type === "percentual" && !tickerId) {
    return (
      <ErrorState message="Select a benchmark ticker in Profile settings." />
    );
  }

  // Handle insufficient data case
  if (!chartData || chartData.length < 2) {
    return (
      <ErrorState message="Not enough data available to draw chart for this period." />
    );
  }

  // Render normal chart with multiple data points
  return (
    <Card className="h-96 min-h-[384px] w-full p-1 sm:p-2 border">
      <ResponsiveContainer width="100%" height="100%">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
          >
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(val: Date) => format(val, "MMM d")}
              stroke="hsl(var(--muted-foreground, 215.4 16.3% 46.9%))"
              fontSize={12}
              interval="preserveStartEnd"
              padding={{ left: 10, right: 10 }}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => formatYAxis(value, type)}
              stroke="hsl(var(--muted-foreground, 215.4 16.3% 46.9%))"
              fontSize={12}
              width={Y_AXIS_WIDTH}
              domain={yDomain}
              allowDataOverflow={false}
              tickCount={5}
              type="number"
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
              verticalAlign="top"
              align="left"
              height={40}
              formatter={formatLegendLabel}
              wrapperStyle={{
                paddingLeft: `${Y_AXIS_WIDTH + 10}px`,
                paddingTop: "4px",
              }}
            />

            {type === "absolute" && (
              <Line
                key="line-totalPortfolio"
                name="totalPortfolio"
                dataKey="totalPortfolio"
                type="monotone"
                unit="$"
                stroke={chartConfig.totalPortfolio.color}
                strokeWidth={2}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
            )}

            {type === "percentual" && (
              <Line
                key="line-portfolio-pct"
                name="portfolio"
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

            {type === "percentual" && (
              <Line
                key="line-indexFund-pct"
                name="indexFund"
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
          </LineChart>
        </ChartContainer>
      </ResponsiveContainer>
    </Card>
  );
}
