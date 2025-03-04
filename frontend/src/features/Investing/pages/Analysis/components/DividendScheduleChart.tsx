import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { holdingsApi, holdingsApiKeys } from "@/api/holdingsApi";
import { prepareDividendChartData } from "@/features/Investing/utils";
import { formatCurrency, getStockColors } from "../utils";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}
function DividendScheduleChart() {
  const { data: holdings, isLoading } = useQuery({
    queryFn: holdingsApi.getHoldings,
    queryKey: holdingsApiKeys.all
  });

  const chartData = React.useMemo(() => {
    return prepareDividendChartData(holdings);
  }, [holdings]);

  const stockColors = React.useMemo(() => getStockColors(holdings), [holdings]);

  // Get all unique ticker symbols from holdings
  const tickers = React.useMemo(() => {
    if (!holdings) return [];
    return [...new Set(holdings.map(holding => holding.symbol))];
  }, [holdings]);

  // Custom tooltip to show details
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded shadow">
          <p className="font-bold">{label}</p>
          {payload.filter(entry =>
            entry.dataKey !== "month" &&
            entry.dataKey !== "name" &&
            entry.dataKey !== "total"
          )
            .sort((a, b) => b.value - a.value)
            .map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span>{entry.dataKey}: {formatCurrency(entry.value)}</span>
              </div>
            ))}
          <div className="font-bold mt-2 pt-2 border-t">
            Total: {formatCurrency(payload[0]["payload"]["total"] || 0)}
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dividend Schedule</CardTitle>
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
        <h2 className="text-lg font-semibold text-gray-900">Dividend Schedule</h2>
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
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                  width={45}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {tickers.map((ticker) => (
                  <Bar
                    key={ticker}
                    dataKey={ticker!}
                    stackId="a"
                    fill={stockColors[ticker!]}
                    name={ticker!}
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
