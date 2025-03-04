import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { Database } from "@/types/supabase";

const chartConfig = {
  portfolioValue: {
    label: "Portfolio Value",
    color: "hsl(var(--chart-1))",
  },
  costBasis: {
    label: "Cost Basis",
    color: "hsl(var(--muted-foreground))",
  },
} satisfies ChartConfig;

export function PortfolioChart() {
  const { data, isLoading, isError } = useQuery({
    queryFn: async () => {
      const { data } = await supabase.from("portfolio_daily_metrics").select();
      return data as Database["public"]["Views"]["portfolio_daily_metrics"]["Row"][];
    },
    queryKey: ["30Day"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[350px] bg-white rounded-lg shadow-sm border border-gray-100">
        <span className="text-muted-foreground">Loading chart...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-[350px] bg-white rounded-lg shadow-sm border border-gray-100">
        <span className="text-destructive">Error loading chart</span>
      </div>
    );
  }

  const chartData = data?.map((val) => ({
    date: new Date(val.current_date!),
    cost_basis: val.cost_basis,
    portfolio_value: val.portfolio_value,
  }));

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Performance</h2>
      <ChartContainer config={chartConfig} className="min-h-[200px] max-h-[350px] w-full">
        <LineChart
          accessibilityLayer
          data={chartData}
          margin={{
            left: 12,
            right: 12,
            top: 12,
            bottom: 12,
          }}
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
          <ChartTooltip
            cursor={{ stroke: "#d1d5db", strokeDasharray: "3 3" }}
            content={<ChartTooltipContent indicator="dot" hideLabel />}
          />
          <Line
            dataKey="cost_basis"
            type="monotone"
            strokeWidth={2}
            stroke="#6b7280" // Gray for cost basis
            dot={false}
          />
          <Line
            dataKey="portfolio_value"
            type="monotone"
            stroke="#2563eb" // Blue for portfolio value
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}

export default PortfolioChart;
