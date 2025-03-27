import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { holdingsApi, holdingsApiKeys } from "@/api/holdingsApi";
import { prepareDividendPieData } from "../utils";

export type PieData = {
  name: string;
  value: number;
  color: string;
};

export default function DividendPieChart() {
  const { data: holdings, isLoading } = useQuery({
    queryFn: holdingsApi.getHoldings,
    queryKey: holdingsApiKeys.all,
  });
  const data = React.useMemo(() => prepareDividendPieData(holdings), [
    holdings,
  ]);

  const CustomTooltip: React.FC<any> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const entry = payload[0];
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="font-medium">{entry.name}</p>
          <p className="text-sm">
            ${entry.value.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">
            {((entry.value /
              data.reduce(
                (sum: number, item: PieData) => sum + item.value,
                0,
              )) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const CustomLegend: React.FC<any> = (props) => {
    const { payload } = props;
    return (
      <ul className="text-xs space-y-1 mt-2">
        {payload.map((entry: any, index: number) => (
          <li key={`legend-${index}`} className="flex items-center">
            <div
              className="w-3 h-3 mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span>
              {entry.value}: ${data.find((d: PieData) =>
                d.name === entry.value
              )?.value.toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  if (isLoading) {
    return (
      <>
        <div className="flex flex-row items-center justify-between mb-2 h-8">
          <h2 className="text-lg font-semibold text-gray-900">
            Dividend Sources
          </h2>
        </div>
        <Card>
          <CardContent className="h-72 flex items-center justify-center">
            <div>Loading dividend data...</div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-row items-center justify-between mb-2 h-8">
        <h2 className="text-lg font-semibold text-gray-900">
          Dividend Sources
        </h2>
      </div>
      <Card>
        <CardContent>
          <div className="h-72">
            {data.length === 0
              ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No dividend data available
                </div>
              )
              : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend content={<CustomLegend />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
