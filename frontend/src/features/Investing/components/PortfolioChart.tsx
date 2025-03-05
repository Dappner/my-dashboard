import { CartesianGrid, Line, LineChart, XAxis, Area, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { format } from "date-fns";
import { usePortfolioDailyMetrics } from "../hooks/usePortfolioDailyMetrics";

// Define the chart data type for type safety
interface ChartDataPoint {
  date: Date;
  total_portfolio_value: number;
  portfolio_value: number;
  cash_balance: number;
  cost_basis: number;
}

// Define chart configuration with proper typing
const chartConfig = {
  total_portfolio_value: {
    label: "Total Portfolio Value",
    color: "#2563eb", // Blue
  },
  portfolio_value: {
    label: "Investment Value",
    color: "#16a34a", // Green
  },
  cash_balance: {
    label: "Cash Balance",
    color: "#9333ea", // Purple
  },
  cost_basis: {
    label: "Cost Basis",
    color: "#6b7280", // Gray
  },
} as const;

type PortfolioChartConfig = typeof chartConfig;

export default function PortfolioChart() {
  const { dailyMetrics, isLoading, isError } = usePortfolioDailyMetrics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-80 bg-white rounded-lg shadow-sm border border-gray-100">
        <span className="text-muted-foreground">Loading chart...</span>
      </div>
    );
  }

  if (isError || !dailyMetrics) {
    return (
      <div className="flex items-center justify-center h-80 bg-white rounded-lg shadow-sm border border-gray-100">
        <span className="text-destructive">Error loading chart</span>
      </div>
    );
  }

  // Transform data and ensure all values are numbers
  const chartData: ChartDataPoint[] = dailyMetrics.map((val) => ({
    date: new Date(val.current_date || ''),
    total_portfolio_value: Number(val.total_portfolio_value || 0),
    portfolio_value: Number(val.portfolio_value || 0),
    cash_balance: Number(val.cash_balance || 0),
    cost_basis: Number(val.cost_basis || 0),
  }));

  // Tooltip formatter with proper typing
  const tooltipFormatter = (value, name) => {
    const formattedValue = isNaN(value)
      ? "$0.00"
      : `$${value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

    // Use type assertion to access the config safely
    const keyName = name as keyof PortfolioChartConfig;
    const label = chartConfig[keyName]?.label || name;

    return [formattedValue, label];
  };

  // Label formatter for dates
  const labelFormatter = (label: string | number | Date) => {
    if (label instanceof Date) {
      return format(label, "MMM d, yyyy");
    }
    if (typeof label === 'number') {
      return format(new Date(label), "MMM d, yyyy");
    }
    return label || "N/A";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm px-4 border border-gray-100">
      <ChartContainer
        config={chartConfig}
        className="h-96 w-full"
      >
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
            formatter={(value) => {
              const keyName = value as keyof PortfolioChartConfig;
              return chartConfig[keyName]?.label || value;
            }}
          />
          <Line
            dataKey="total_portfolio_value"
            type="monotone"
            stroke={chartConfig.total_portfolio_value.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 1 }}
          />
          <Line
            dataKey="portfolio_value"
            type="monotone"
            stroke={chartConfig.portfolio_value.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 1 }}
          />
          <Area
            dataKey="cash_balance"
            type="monotone"
            stroke={chartConfig.cash_balance.color}
            fill={chartConfig.cash_balance.color}
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Line
            dataKey="cost_basis"
            type="monotone"
            stroke={chartConfig.cost_basis.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 1 }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
