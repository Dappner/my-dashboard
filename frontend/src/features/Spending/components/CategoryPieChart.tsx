import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PieChartIcon } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export const CategoryPieChart: React.FC<{
  categories: { name: string; amount: number }[];
  month: string;
}> = ({ categories, month }) => {
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82ca9d",
  ];

  return (
    <Card className="hover:shadow-md transition-shadow h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <PieChartIcon className="h-4 w-4 mr-2" />
          Spending by Category
        </CardTitle>
        <CardDescription>{month}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categories}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="amount"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {categories.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [
                  `$${value.toFixed(2)}`,
                  "Amount",
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-1 mt-2 justify-center">
          {categories.map((category, index) => (
            <Badge
              key={category.name}
              variant="outline"
              className="flex items-center gap-1 text-xs"
              style={{
                borderColor: COLORS[index % COLORS.length],
                color: COLORS[index % COLORS.length],
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              {category.name}: ${category.amount.toFixed(2)}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
