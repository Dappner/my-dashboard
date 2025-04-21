import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHoldings } from "@/features/Investing/hooks/useHoldings";
import type { DividendMonthData } from "@/features/Investing/pages/Holdings/utils";
import { prepareDividendChartData } from "@/features/Investing/utils";
import { formatCurrency } from "@/lib/formatting";
import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { getStockColors } from "../utils";

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    color: string;
    payload: DividendMonthData;
  }>;
  label?: string;
}
function DividendScheduleChart() {
  const { holdings, isLoading } = useHoldings();

  const chartData = React.useMemo(() => {
    return prepareDividendChartData(holdings);
  }, [holdings]);

  const stockColors = React.useMemo(() => getStockColors(holdings), [holdings]);

  // Get all unique ticker symbols from holdings
  const tickers = React.useMemo(() => {
    if (!holdings) return [];
    return [
      ...new Set(holdings.map((holding) => holding.symbol).filter(Boolean)),
    ] as string[];
  }, [holdings]);

  const CustomTooltip: React.FC<CustomTooltipProps> = ({
    active,
    payload,
    label,
  }) => {
    if (!active || !payload || payload.length === 0 || !label) {
      return null;
    }

    const sortedPayload = payload
      .filter(
        (entry) =>
          entry.dataKey !== "month" &&
          entry.dataKey !== "name" &&
          entry.dataKey !== "total",
      )
      .sort((a, b) => b.value - a.value);

    return (
      <div className="bg-background p-4 border rounded shadow">
        <p className="font-bold">{label}</p>
        {sortedPayload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span>
              {entry.dataKey}: {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
        <div className="font-bold mt-2 pt-2 border-t">
          Total: {formatCurrency(payload[0].payload.total || 0)}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-muted-foreground">
            Dividend Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div>Loading dividend data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="flex flex-row items-center justify-between mb-2 h-8">
        <h2 className="text-lg font-semibold text-muted-foreground">
          Dividend Schedule
        </h2>
      </div>
      <Card>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis
                  tickFormatter={(value: number) => `$${value.toFixed(0)}`}
                  width={45}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {tickers.map((ticker) => (
                  <Bar
                    key={ticker}
                    dataKey={ticker}
                    stackId="a"
                    fill={stockColors[ticker] ?? "#000000"} // Fallback color
                    name={ticker}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default DividendScheduleChart;
