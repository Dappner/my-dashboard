import { HistoricalPrice } from "@/types/historicalPricesTypes";
import { Holding } from "@/types/holdingsTypes";
import { format } from "date-fns";
import {
  LineChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";

interface StockData {
  date: string;
  close_price: number;
}

interface StockPriceChartProps {
  data: HistoricalPrice[];
  holding: Holding;
}

export default function StockPriceChart({ data, holding }: StockPriceChartProps) {
  const chartData: StockData[] = data.map((item) => ({
    date: item.date,
    close_price: item.close_price,
  }));

  const openingPrice = chartData[0].close_price;
  const minPrice = openingPrice * 0.8; // 20% below opening price
  const maxPrice = openingPrice * 1.2; // 20% above opening price

  const formatYAxisTick = (value: number) => {
    return "$" + value.toFixed(2); // Format to 2 decimal places
  };
  console.log(holding)

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(value: Date) => format(value, "MMM d")}
          />
          <YAxis domain={[minPrice, maxPrice]} tickFormatter={formatYAxisTick} />
          <Tooltip
            formatter={(value: number) => ["$" + value.toFixed(2), "Price"]}
            labelFormatter={(label: Date) => format(label, "MMM d, yyyy")}
          />
          <Line
            type="monotone"
            dataKey="close_price"
            stroke="#8884d8"
            fill="#8884d8"
            name="Price"
          />

          {/* Add cost basis reference line when holding exists */}
          {holding && holding.average_cost_basis && (
            <ReferenceLine
              y={holding.average_cost_basis}
              stroke="#16a34a"
              strokeDasharray="3 3"
              label={{
                value: `Cost Basis: $${holding.average_cost_basis?.toFixed(2)}`,
                position: 'insideBottomRight',
                fill: '#16a34a',
                fontSize: 12
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
