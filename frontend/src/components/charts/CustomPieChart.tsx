import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, TooltipProps } from "recharts";
import { chartColors } from "@/constants";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface DataItem {
  label: string;
  value: number;
}

interface CustomPieChartProps {
  data: DataItem[];
  title: string;
  inputType: "Percentage" | "Absolute";
  outputType: "Percentage" | "Absolute";
  colors?: string[];
  prefix?: string;
}

export default function CustomPieChart({
  data,
  title,
  inputType,
  outputType,
  prefix,
  colors
}: CustomPieChartProps) {
  const colorPalette = colors || chartColors;
  const processedData = data.map(item => ({
    ...item,
    value: Number(item.value) // Ensure value is a number
  }));

  const total = inputType === "Absolute"
    ? processedData.reduce((sum, item) => sum + item.value, 0)
    : 100;

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const value = data.value;
      const percentage = inputType === "Absolute"
        ? ((value / total) * 100).toFixed(1)
        : value.toFixed(1);

      return (
        <div className="bg-background border rounded p-2 shadow-md z-50 max-w-[200px] overflow-hidden">
          <p className="font-medium text-sm truncate">{data.label}</p>
          {(outputType === "Absolute" || inputType === "Absolute") && (
            <p className="text-sm">{prefix}{value.toLocaleString()}</p>
          )}
          {(outputType === "Percentage" || inputType === "Percentage") && (
            <p className="text-sm">{percentage}%</p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomLegend: React.FC<any> = (props) => {
    const { payload } = props;
    return (
      <ul className="text-xs space-y-1 mt-2 max-h-24 overflow-y-auto">
        {payload.map((entry: any, index: number) => {
          const itemValue = data.find((d: DataItem) => d.label === entry.value)?.value;
          return (
            <li key={`legend-${index}`} className="flex items-center">
              <div
                className="w-3 h-3 mr-2 flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="truncate">
                {entry.value}: {prefix}{itemValue?.toFixed(2)}
              </span>
            </li>
          )
        })}
      </ul>
    );
  };

  return (
    <>
      <div className="flex flex-row items-center justify-between mb-2 h-8">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      <Card className="w-full">
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={processedData}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {processedData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colorPalette[index % colorPalette.length]}
                      stroke={colorPalette[index % colorPalette.length]}
                    />
                  ))}
                </Pie>
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
